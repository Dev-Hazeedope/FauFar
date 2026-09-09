import { db, doc, setDoc, updateDoc, onSnapshot, runTransaction } from '../../../lib/firebase';
import { shuffle } from '../../../lib/utils';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  number: 1 | 2;
}

export interface Guess {
  guess: number[];
  rightPlace: number;
  wrongPlace: number;
}

export interface CTCRoom {
  id: string;
  hostId: string;
  players: Record<string, Player>;
  config: {
    timeLimit: number;
  };
  state: 'waiting' | 'playing' | 'completed';
  
  // Game State
  secret: number[];
  guesses: { 1: number, 2: number }; // Just storing the count of guesses for opponent UI
  endTime: number | null;
  winner: string | null;
  isDraw: boolean;
}

const getClientId = () => {
  let id = localStorage.getItem('ctc_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ctc_client_id', id);
  }
  return id;
};

export const clientId = getClientId();

export const createRoom = async (name: string, avatar: string, config: { timeLimit: number }): Promise<CTCRoom> => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = doc(db, 'ctc_rooms', roomId);
  
  const room: CTCRoom = {
    id: roomId,
    hostId: clientId,
    players: {
      [clientId]: { id: clientId, name, avatar, number: 1 }
    },
    config,
    state: 'waiting',
    secret: [],
    guesses: { 1: 0, 2: 0 },
    endTime: null,
    winner: null,
    isDraw: false,
  };

  await setDoc(roomRef, room);
  return room;
};

export const joinRoom = async (roomId: string, name: string, avatar: string): Promise<CTCRoom> => {
  const roomRef = doc(db, 'ctc_rooms', roomId);
  
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error("Room not found");
    
    const room = roomDoc.data() as CTCRoom;
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
  const roomRef = doc(db, 'ctc_rooms', roomId);
  return await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as CTCRoom;
    if (room.hostId !== clientId) return;

    transaction.update(roomRef, {
      state: 'playing',
      endTime: room.config.timeLimit > 0 ? Date.now() + room.config.timeLimit * 1000 : null,
      secret: shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5),
      guesses: { 1: 0, 2: 0 },
      winner: null,
      isDraw: false
    });
  });
};

export const incrementGuess = async (roomId: string, playerNum: 1 | 2, currentGuesses: {1: number, 2: number}) => {
    const roomRef = doc(db, 'ctc_rooms', roomId);
    await updateDoc(roomRef, {
      [`guesses.${playerNum}`]: currentGuesses[playerNum] + 1
    });
};

export const claimVictory = async (roomId: string, winnerId: string) => {
    const roomRef = doc(db, 'ctc_rooms', roomId);
    
    await runTransaction(db, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) return;
      const room = roomDoc.data() as CTCRoom;
      
      if (room.state === 'playing') {
          transaction.update(roomRef, {
            state: 'completed',
            winner: winnerId,
            isDraw: false
          });
      }
    });
};

export const setGameCompleted = async (roomId: string, winnerId: string | null, isDraw: boolean) => {
  const roomRef = doc(db, 'ctc_rooms', roomId);
  await updateDoc(roomRef, {
    state: 'completed',
    winner: winnerId,
    isDraw
  });
};

export const leaveRoom = async (roomId: string) => {
  const roomRef = doc(db, 'ctc_rooms', roomId);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) return;
    
    const room = roomDoc.data() as CTCRoom;
    
    if (room.hostId === clientId) {
      transaction.delete(roomRef);
    } else {
      const updatedPlayers = { ...room.players };
      delete updatedPlayers[clientId];
      transaction.update(roomRef, { players: updatedPlayers });
    }
  }).catch(e => console.error(e));
};

export const subscribeToRoom = (roomId: string, callback: (room: CTCRoom | null) => void) => {
  const roomRef = doc(db, 'ctc_rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as CTCRoom);
    } else {
      callback(null);
    }
  });
};
