import { db, doc, setDoc, updateDoc, onSnapshot, collection, getDoc, runTransaction } from '../../../lib/firebase';

export interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

export interface Room {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    start: number;
    end: number;
    timeLimit: number; // in seconds
  };
  state: 'waiting' | 'playing' | 'completed';
  currentNumber: number | null;
  targetGeneratedAt: number | null;
  endTime: number | null;
  lastWinner?: {
    name: string;
    points: number;
    timestamp: number;
  };
}

function generateRandomTarget(start: number, end: number): number {
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

// Simple local client ID since we aren't using Firebase Auth for players
const getClientId = () => {
  let id = localStorage.getItem('nh_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nh_client_id', id);
  }
  return id;
};

export const clientId = getClientId();

export const createRoom = async (name: string, avatar: string, config: { start: number; end: number; timeLimit: number }): Promise<Room> => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'rooms', roomId);
  
  const room: Room = {
    id: roomId,
    hostId: clientId,
    players: {
      [clientId]: { id: clientId, name, avatar, score: 0 }
    },
    config,
    state: 'waiting',
    currentNumber: null,
    targetGeneratedAt: null,
    endTime: null,
  };

  await setDoc(roomRef, room);
  return room;
};

export const joinRoom = async (roomId: string, name: string, avatar: string): Promise<Room> => {
  const roomRef = doc(db, 'rooms', roomId);
  
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) {
      throw new Error("Room not found");
    }
    
    const room = roomDoc.data() as Room;
    if (room.state !== 'waiting') {
      throw new Error("Game already started");
    }
    
    const nameExists = Object.values(room.players).some(p => p.name.toLowerCase() === name.toLowerCase());
    if (nameExists && !room.players[clientId]) {
      throw new Error("Name already taken in this room");
    }

    room.players[clientId] = { id: clientId, name, avatar, score: 0 };
    transaction.update(roomRef, { players: room.players });
    return room;
  });
};

export const startGame = async (roomId: string) => {
  const roomRef = doc(db, 'rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as Room;
    if (room.hostId !== clientId) return;

    // Reset scores
    const updatedPlayers = { ...room.players };
    Object.keys(updatedPlayers).forEach(k => updatedPlayers[k].score = 0);

    transaction.update(roomRef, {
      state: 'playing',
      endTime: Date.now() + room.config.timeLimit * 1000,
      currentNumber: generateRandomTarget(room.config.start, room.config.end),
      targetGeneratedAt: Date.now(),
      players: updatedPlayers
    });
  });
};

export const foundNumber = async (roomId: string, number: number) => {
  const roomRef = doc(db, 'rooms', roomId);
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as Room;
    if (room.state !== 'playing') return;
    
    if (room.currentNumber === number) {
      const now = Date.now();
      const elapsedSeconds = (now - (room.targetGeneratedAt || now)) / 1000;
      let points = 10;
      if (elapsedSeconds < 2) points = 30;
      else if (elapsedSeconds < 5) points = 20;

      const updatedPlayers = { ...room.players };
      if (updatedPlayers[clientId]) {
        updatedPlayers[clientId].score += points;
      }
      
      const winnerName = updatedPlayers[clientId]?.name || "Someone";

      transaction.update(roomRef, {
        currentNumber: generateRandomTarget(room.config.start, room.config.end),
        targetGeneratedAt: now,
        players: updatedPlayers,
        lastWinner: {
          name: winnerName,
          points,
          timestamp: now
        }
      });
    }
  });
};

export const endGame = async (roomId: string) => {
  const roomRef = doc(db, 'rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    const room = roomDoc.data() as Room;
    if (room.state === 'playing') {
      transaction.update(roomRef, { state: 'completed' });
    }
  });
};

export const restartGame = async (roomId: string) => {
  const roomRef = doc(db, 'rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    const room = roomDoc.data() as Room;
    if (room.hostId === clientId) {
      const updatedPlayers = { ...room.players };
      Object.keys(updatedPlayers).forEach(k => updatedPlayers[k].score = 0);
      transaction.update(roomRef, { state: 'waiting', players: updatedPlayers });
    }
  });
};

export const leaveRoom = async (roomId: string) => {
  const roomRef = doc(db, 'rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as Room;
    if (room.players[clientId]) {
      const updatedPlayers = { ...room.players };
      delete updatedPlayers[clientId];
      
      if (Object.keys(updatedPlayers).length === 0) {
        transaction.delete(roomRef);
      } else {
        let newHostId = room.hostId;
        if (room.hostId === clientId) {
          newHostId = Object.keys(updatedPlayers)[0];
        }
        transaction.update(roomRef, { players: updatedPlayers, hostId: newHostId });
      }
    }
  });
};

export const subscribeToRoom = (roomId: string, onUpdate: (room: Room | null) => void) => {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data() as Room);
    } else {
      onUpdate(null);
    }
  });
};
