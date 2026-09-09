import { db, doc, setDoc, updateDoc, onSnapshot, collection, getDoc, runTransaction } from '../../../lib/firebase';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  number: 1 | 2; // Player 1 or 2
}

export interface FIARoom {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    timeLimit: number;
  };
  state: 'waiting' | 'playing' | 'completed';
  
  // Game State
  board: (1 | 2 | null)[][];
  turn: 1 | 2;
  endTime: number | null;
  winner: string | null;
  winLine: {c: number, r: number}[];
  isDraw: boolean;
}

const getClientId = () => {
  let id = localStorage.getItem('fiar_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('fiar_client_id', id);
  }
  return id;
};

export const clientId = getClientId();

export const createRoom = async (name: string, avatar: string, config: { timeLimit: number }): Promise<FIARoom> => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'fiar_rooms', roomId);
  
  const COLS = 9;
  const ROWS = 7;
  const emptyBoard = Array.from({ length: COLS }, () => Array(ROWS).fill(null));

  const room: FIARoom = {
    id: roomId,
    hostId: clientId,
    players: {
      [clientId]: { id: clientId, name, avatar, number: 1 }
    },
    config,
    state: 'waiting',
    board: emptyBoard,
    turn: 1,
    endTime: null,
    winner: null,
    winLine: [],
    isDraw: false,
  };

  await setDoc(roomRef, room);
  return room;
};

export const joinRoom = async (roomId: string, name: string, avatar: string): Promise<FIARoom> => {
  const roomRef = doc(db, 'fiar_rooms', roomId);
  
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error("Room not found");
    
    const room = roomDoc.data() as FIARoom;
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
  const roomRef = doc(db, 'fiar_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as FIARoom;
    if (room.hostId !== clientId) return;

    const COLS = 9;
    const ROWS = 7;
    const emptyBoard = Array.from({ length: COLS }, () => Array(ROWS).fill(null));

    transaction.update(roomRef, {
      state: 'playing',
      endTime: room.config.timeLimit > 0 ? Date.now() + room.config.timeLimit * 1000 : null,
      board: emptyBoard,
      turn: 1,
      winner: null,
      winLine: [],
      isDraw: false
    });
  });
};

export const makeMove = async (roomId: string, col: number, newBoard: any, nextTurn: 1 | 2, winLine: any, winnerId: string | null, isDraw: boolean) => {
  const roomRef = doc(db, 'fiar_rooms', roomId);
  await updateDoc(roomRef, {
    board: newBoard,
    turn: nextTurn,
    winLine,
    winner: winnerId,
    isDraw,
    state: (winnerId || isDraw) ? 'completed' : 'playing'
  });
};

export const leaveRoom = async (roomId: string) => {
  const roomRef = doc(db, 'fiar_rooms', roomId);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as FIARoom;
    
    if (room.hostId === clientId) {
      transaction.delete(roomRef);
    } else {
      const updatedPlayers = { ...room.players };
      delete updatedPlayers[clientId];
      transaction.update(roomRef, { players: updatedPlayers });
    }
  }).catch(e => console.error(e));
};

export const subscribeToRoom = (roomId: string, callback: (room: FIARoom | null) => void) => {
  const roomRef = doc(db, 'fiar_rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as FIARoom);
    } else {
      callback(null);
    }
  });
};
