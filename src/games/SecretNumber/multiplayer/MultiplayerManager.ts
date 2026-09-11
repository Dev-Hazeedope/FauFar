import { db, doc, setDoc, updateDoc, onSnapshot, runTransaction } from '../../../lib/firebase';

export interface Player {
  id: string;
  name: string;
  avatar: string;
}

export interface Guess {
  playerId: string;
  playerName: string;
  value: number;
  result: 'low' | 'high' | 'correct';
  timestamp: number;
}

export interface SNRoom {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    min: number;
    max: number;
  };
  state: 'waiting' | 'playing' | 'completed';
  hostLeft?: boolean;
  secret: number | null;
  guesses: Guess[];
  winnerId: string | null;
  endTime: number | null;
}

const getClientId = () => {
  let id = localStorage.getItem('sn_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sn_client_id', id);
  }
  return id;
};

export const clientId = getClientId();

export const createRoom = async (name: string, avatar: string, config: { min: number; max: number }): Promise<SNRoom> => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'sn_rooms', roomId);
  
  const room: SNRoom = {
    id: roomId,
    hostId: clientId,
    players: {
      [clientId]: { id: clientId, name, avatar }
    },
    config,
    state: 'waiting',
    secret: null,
    guesses: [],
    winnerId: null,
    endTime: null,
  };

  await setDoc(roomRef, room);
  return room;
};

export const joinRoom = async (roomId: string, name: string, avatar: string): Promise<SNRoom> => {
  const roomRef = doc(db, 'sn_rooms', roomId);
  
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) {
      throw new Error("Room not found");
    }
    
    const room = roomDoc.data() as SNRoom;
    if (room.state !== 'waiting') {
      throw new Error("Game already started");
    }
    
    const playerCount = Object.keys(room.players).length;
    if (playerCount >= 50 && !room.players[clientId]) {
      throw new Error("Room is full (max 50 players)");
    }

    const nameExists = Object.values(room.players).some(p => p.name.toLowerCase() === name.toLowerCase());
    if (nameExists && !room.players[clientId]) {
      throw new Error("Name already taken in this room");
    }

    room.players[clientId] = { id: clientId, name, avatar };
    transaction.update(roomRef, { players: room.players });
    return room;
  });
};

export const startGame = async (roomId: string) => {
  const roomRef = doc(db, 'sn_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as SNRoom;
    if (room.hostId !== clientId) return;

    const sec = Math.floor(Math.random() * (room.config.max - room.config.min + 1)) + room.config.min;

    transaction.update(roomRef, {
      state: 'playing',
      secret: sec,
      guesses: [],
      winnerId: null
    });
  });
};

export const submitGuess = async (roomId: string, guessValue: number) => {
  const roomRef = doc(db, 'sn_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as SNRoom;
    if (room.state !== 'playing' || room.secret === null) return;
    
    // Prevent duplicate guesses from the same player
    if (room.guesses.some(g => g.value === guessValue)) return;
    
    const player = room.players[clientId];
    if (!player) return;

    let result: 'low' | 'high' | 'correct' = 'correct';
    if (guessValue < room.secret) {
      result = 'low';
    } else if (guessValue > room.secret) {
      result = 'high';
    } else {
      result = 'correct';
    }

    const newGuess: Guess = {
      playerId: clientId,
      playerName: player.name,
      value: guessValue,
      result,
      timestamp: Date.now()
    };

    const newGuesses = [newGuess, ...room.guesses];
    
    if (result === 'correct') {
      transaction.update(roomRef, {
        guesses: newGuesses,
        state: 'completed',
        winnerId: clientId
      });
    } else {
      transaction.update(roomRef, {
        guesses: newGuesses
      });
    }
  });
};

export const restartGame = async (roomId: string) => {
  const roomRef = doc(db, 'sn_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    const room = roomDoc.data() as SNRoom;
    if (room.hostId === clientId) {
      transaction.update(roomRef, { state: 'waiting' });
    }
  });
};

export const leaveRoom = async (roomId: string) => {
  const roomRef = doc(db, 'sn_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as SNRoom;
    if (room.players[clientId]) {
      const updatedPlayers = { ...room.players };
      delete updatedPlayers[clientId];
      
      if (Object.keys(updatedPlayers).length === 0) {
        transaction.delete(roomRef);
      } else {
        // If host leaves, the game is terminated for everyone as per request
        if (room.hostId === clientId) {
          transaction.update(roomRef, { hostLeft: true, state: 'completed' }); // Special state
        } else {
          transaction.update(roomRef, { players: updatedPlayers });
        }
      }
    }
  });
};

export const subscribeToRoom = (roomId: string, onUpdate: (room: SNRoom | null) => void) => {
  const roomRef = doc(db, 'sn_rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data() as SNRoom);
    } else {
      onUpdate(null);
    }
  });
};
