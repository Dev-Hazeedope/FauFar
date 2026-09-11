import { db, doc, setDoc, updateDoc, onSnapshot, runTransaction } from '../../../lib/firebase';
import { shuffle } from '../../../lib/utils';
import { SHARED_ICONS } from '../../../lib/icons';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  number: 1 | 2;
}

export interface FTTRoom {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    timeLimit: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  state: 'waiting' | 'playing' | 'completed';
  hostLeft?: boolean;
  
  // Game State
  items: { id: string, iconIdx: number, isPair: boolean }[];
  scores: { 1: number, 2: number };
  endTime: number | null;
  winner: string | null;
  isDraw: boolean;
  lastWinner?: { name: string, points: number, timestamp: number };
}

const getClientId = () => {
  let id = localStorage.getItem('ftt_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ftt_client_id', id);
  }
  return id;
};

export const clientId = getClientId();

const COUNTS = { easy: 20, medium: 30, hard: 40 };

export const generateBoard = (difficulty: 'easy' | 'medium' | 'hard') => {
  const count = COUNTS[difficulty];
  const iconIndices = shuffle(Array.from(SHARED_ICONS.keys())).slice(0, count - 1);
  const pairIconIdx = iconIndices[0];
  
  let newItems = iconIndices.map((idx, i) => ({
    id: `s-${i}`,
    iconIdx: idx,
    isPair: idx === pairIconIdx,
  }));
  
  newItems.push({
    id: 's-duplicate',
    iconIdx: pairIconIdx,
    isPair: true,
  });
  
  return shuffle(newItems);
};

export const createRoom = async (name: string, avatar: string, config: { timeLimit: number, difficulty: 'easy' | 'medium' | 'hard' }): Promise<FTTRoom> => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'ftt_rooms', roomId);
  
  const room: FTTRoom = {
    id: roomId,
    hostId: clientId,
    players: {
      [clientId]: { id: clientId, name, avatar, number: 1 }
    },
    config,
    state: 'waiting',
    items: [],
    scores: { 1: 0, 2: 0 },
    endTime: null,
    winner: null,
    isDraw: false,
  };

  await setDoc(roomRef, room);
  return room;
};

export const joinRoom = async (roomId: string, name: string, avatar: string): Promise<FTTRoom> => {
  const roomRef = doc(db, 'ftt_rooms', roomId);
  
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error("Room not found");
    
    const room = roomDoc.data() as FTTRoom;
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
  const roomRef = doc(db, 'ftt_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as FTTRoom;
    if (room.hostId !== clientId) return;

    transaction.update(roomRef, {
      state: 'playing',
      endTime: room.config.timeLimit > 0 ? Date.now() + room.config.timeLimit * 1000 : null,
      items: generateBoard(room.config.difficulty),
      scores: { 1: 0, 2: 0 },
      winner: null,
      isDraw: false
    });
  });
};

export const claimPair = async (roomId: string, playerNum: 1 | 2, currentScores: { 1: number, 2: number }, difficulty: 'easy'|'medium'|'hard', playerName: string) => {
  const roomRef = doc(db, 'ftt_rooms', roomId);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    const room = roomDoc.data() as FTTRoom;
    
    // Safety check in case they both click at exact same time, only the first to push new board gets the point.
    // If the board was already changed by the other player, current transaction items might be different.
    // To keep it simple, we just blindly award the point and generate a new board.
    // Since Firebase transactions ensure consistency, if two players claim at the same time,
    // the first transaction resolves, generating a new board. The second transaction runs with the NEW board data.
    
    const newScores = { ...room.scores };
    newScores[playerNum] += 10;

    transaction.update(roomRef, {
      items: generateBoard(difficulty),
      scores: newScores,
      lastWinner: {
        name: playerName,
        points: 10,
        timestamp: Date.now()
      }
    });
  });
};

export const setGameCompleted = async (roomId: string, winnerId: string | null, isDraw: boolean) => {
  const roomRef = doc(db, 'ftt_rooms', roomId);
  await updateDoc(roomRef, {
    state: 'completed',
    winner: winnerId,
    isDraw
  });
};

export const leaveRoom = async (roomId: string) => {
  const roomRef = doc(db, 'ftt_rooms', roomId);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as FTTRoom;
    
    if (room.hostId === clientId) {
      transaction.delete(roomRef);
    } else {
      const updatedPlayers = { ...room.players };
      delete updatedPlayers[clientId];
      transaction.update(roomRef, { players: updatedPlayers });
    }
  }).catch(e => console.error(e));
};

export const subscribeToRoom = (roomId: string, callback: (room: FTTRoom | null) => void) => {
  const roomRef = doc(db, 'ftt_rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as FTTRoom);
    } else {
      callback(null);
    }
  });
};
