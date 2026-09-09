import { db, doc, setDoc, updateDoc, onSnapshot, runTransaction } from '../../../lib/firebase';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  number: 1 | 2;
}

export interface DABRoom {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    timeLimit: number;
    boardSize: number;
  };
  state: 'waiting' | 'playing' | 'completed';
  
  // Game State
  hEdges: Record<string, number>;
  vEdges: Record<string, number>;
  boxes: Record<string, number>;
  scores: { 1: number, 2: number };
  turn: 1 | 2;
  endTime: number | null;
  winner: string | null;
  isDraw: boolean;
}

const getClientId = () => {
  let id = localStorage.getItem('dab_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dab_client_id', id);
  }
  return id;
};

export const clientId = getClientId();

export const createRoom = async (name: string, avatar: string, config: { timeLimit: number, boardSize: number }): Promise<DABRoom> => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'dab_rooms', roomId);
  
  const room: DABRoom = {
    id: roomId,
    hostId: clientId,
    players: {
      [clientId]: { id: clientId, name, avatar, number: 1 }
    },
    config,
    state: 'waiting',
    hEdges: {},
    vEdges: {},
    boxes: {},
    scores: { 1: 0, 2: 0 },
    turn: 1,
    endTime: null,
    winner: null,
    isDraw: false,
  };

  await setDoc(roomRef, room);
  return room;
};

export const joinRoom = async (roomId: string, name: string, avatar: string): Promise<DABRoom> => {
  const roomRef = doc(db, 'dab_rooms', roomId);
  
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error("Room not found");
    
    const room = roomDoc.data() as DABRoom;
    if (room.state !== 'waiting') throw new Error("Game already started");
    
    const playerCount = Object.keys(room.players).length;
    if (playerCount >= 2 && !room.players[clientId]) {
      throw new Error("Room is full");
    }

    if (!room.players[clientId]) {
      room.players[clientId] = { id: clientId, name, avatar, number: 2 };
      transaction.update(roomRef, { players: room.players });
    }
    
    return room;
  });
};

export const startGame = async (roomId: string) => {
  const roomRef = doc(db, 'dab_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as DABRoom;
    if (room.hostId !== clientId) return;

    transaction.update(roomRef, {
      state: 'playing',
      endTime: room.config.timeLimit > 0 ? Date.now() + room.config.timeLimit * 1000 : null,
      hEdges: {},
      vEdges: {},
      boxes: {},
      scores: { 1: 0, 2: 0 },
      turn: 1,
      winner: null,
      isDraw: false
    });
  });
};

export const makeMove = async (
  roomId: string, 
  hEdges: Record<string, number>, 
  vEdges: Record<string, number>, 
  boxes: Record<string, number>, 
  scores: { 1: number, 2: number }, 
  nextTurn: 1 | 2, 
  isCompleted: boolean
) => {
  const roomRef = doc(db, 'dab_rooms', roomId);
  
  let winner: string | null = null;
  let isDraw = false;

  if (isCompleted) {
    if (scores[1] > scores[2]) winner = Object.keys(roomRef).find(id => true) /* to be computed correctly by client and passed, or here */;
    // Actually, pass winner and draw from client is easier.
  }

  await updateDoc(roomRef, {
    hEdges,
    vEdges,
    boxes,
    scores,
    turn: nextTurn,
    state: isCompleted ? 'completed' : 'playing'
  });
};

export const setGameCompleted = async (roomId: string, winnerId: string | null, isDraw: boolean) => {
  const roomRef = doc(db, 'dab_rooms', roomId);
  await updateDoc(roomRef, {
    state: 'completed',
    winner: winnerId,
    isDraw
  });
};

export const leaveRoom = async (roomId: string) => {
  const roomRef = doc(db, 'dab_rooms', roomId);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as DABRoom;
    
    if (room.hostId === clientId) {
      transaction.delete(roomRef);
    } else {
      const updatedPlayers = { ...room.players };
      delete updatedPlayers[clientId];
      transaction.update(roomRef, { players: updatedPlayers });
    }
  }).catch(e => console.error(e));
};

export const subscribeToRoom = (roomId: string, callback: (room: DABRoom | null) => void) => {
  const roomRef = doc(db, 'dab_rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as DABRoom);
    } else {
      callback(null);
    }
  });
};
