import { db, doc, setDoc, updateDoc, onSnapshot, runTransaction } from '../../../lib/firebase';
import { shuffle } from '../../../lib/utils';
import { SHARED_ICONS } from '../../../lib/icons';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  number: 1 | 2;
}

export interface Card {
  id: string;
  iconIdx: number;
}

export interface MPRoom {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    timeLimit: number;
    pairsCount: 6 | 8 | 12;
  };
  state: 'waiting' | 'playing' | 'completed';
  
  // Game State
  cards: Card[];
  revealedIds: string[];
  matchedIds: string[];
  scores: { 1: number, 2: number };
  turn: 1 | 2;
  endTime: number | null;
  winner: string | null;
  isDraw: boolean;
}

const getClientId = () => {
  let id = localStorage.getItem('mp_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mp_client_id', id);
  }
  return id;
};

export const clientId = getClientId();

export const generateCards = (pairsCount: number) => {
  const iconIndices = shuffle(Array.from(SHARED_ICONS.keys())).slice(0, pairsCount);
  let newCards = iconIndices.map((idx, i) => ({ id: `c1-${i}`, iconIdx: idx }));
  newCards = newCards.concat(iconIndices.map((idx, i) => ({ id: `c2-${i}`, iconIdx: idx })));
  return shuffle(newCards);
};

export const createRoom = async (name: string, avatar: string, config: { timeLimit: number, pairsCount: 6 | 8 | 12 }): Promise<MPRoom> => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'mp_rooms', roomId);
  
  const room: MPRoom = {
    id: roomId,
    hostId: clientId,
    players: {
      [clientId]: { id: clientId, name, avatar, number: 1 }
    },
    config,
    state: 'waiting',
    cards: [],
    revealedIds: [],
    matchedIds: [],
    scores: { 1: 0, 2: 0 },
    turn: 1,
    endTime: null,
    winner: null,
    isDraw: false,
  };

  await setDoc(roomRef, room);
  return room;
};

export const joinRoom = async (roomId: string, name: string, avatar: string): Promise<MPRoom> => {
  const roomRef = doc(db, 'mp_rooms', roomId);
  
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error("Room not found");
    
    const room = roomDoc.data() as MPRoom;
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
  const roomRef = doc(db, 'mp_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as MPRoom;
    if (room.hostId !== clientId) return;

    transaction.update(roomRef, {
      state: 'playing',
      endTime: room.config.timeLimit > 0 ? Date.now() + room.config.timeLimit * 1000 : null,
      cards: generateCards(room.config.pairsCount),
      revealedIds: [],
      matchedIds: [],
      scores: { 1: 0, 2: 0 },
      turn: 1,
      winner: null,
      isDraw: false
    });
  });
};

export const makeMove = async (
  roomId: string, 
  revealedIds: string[], 
  matchedIds: string[], 
  scores: { 1: number, 2: number },
  nextTurn: 1 | 2,
  isCompleted: boolean
) => {
  const roomRef = doc(db, 'mp_rooms', roomId);
  
  let winner: string | null = null;
  let isDraw = false;

  await updateDoc(roomRef, {
    revealedIds,
    matchedIds,
    scores,
    turn: nextTurn,
    state: isCompleted ? 'completed' : 'playing'
  });
};

export const setGameCompleted = async (roomId: string, winnerId: string | null, isDraw: boolean) => {
  const roomRef = doc(db, 'mp_rooms', roomId);
  await updateDoc(roomRef, {
    state: 'completed',
    winner: winnerId,
    isDraw
  });
};

export const leaveRoom = async (roomId: string) => {
  const roomRef = doc(db, 'mp_rooms', roomId);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as MPRoom;
    
    if (room.hostId === clientId) {
      transaction.delete(roomRef);
    } else {
      const updatedPlayers = { ...room.players };
      delete updatedPlayers[clientId];
      transaction.update(roomRef, { players: updatedPlayers });
    }
  }).catch(e => console.error(e));
};

export const subscribeToRoom = (roomId: string, callback: (room: MPRoom | null) => void) => {
  const roomRef = doc(db, 'mp_rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as MPRoom);
    } else {
      callback(null);
    }
  });
};
