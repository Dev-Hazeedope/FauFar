import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Users, Play, Copy, Check, Delete, X } from 'lucide-react';
import { subscribeToRoom, startGame, leaveRoom, incrementGuess, claimVictory, setGameCompleted, clientId, CTCRoom } from './MultiplayerManager';
import { TimerDisplay } from '../../../components/TimerDisplay';
import { audio } from '../../../lib/audio';
import { EmojiReactions } from '../../../components/EmojiReactions';

const SYMBOLS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Props {
  room: CTCRoom;
  onLeave: () => void;
  onGameEnded: (room: CTCRoom) => void;
}

export function MultiplayerGameplay({ room: initialRoom, onLeave, onGameEnded }: Props) {
  const [room, setRoom] = useState<CTCRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const prevRoomRef = useRef<CTCRoom>(initialRoom);
  
  const isHost = clientId === room.hostId;
  const isPlaying = room.state === 'playing';
  const myPlayer = room.players[clientId];
  
  const [timeLeft, setTimeLeft] = useState(room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0);
  
  // Local state
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<{ guess: number[]; rightPlace: number; wrongPlace: number }[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(room.id, (updatedRoom) => {
      if (!updatedRoom) {
        onLeave();
        return;
      }
      setRoom(updatedRoom);
      
      const prevRoom = prevRoomRef.current;

      if (prevRoom.state === 'waiting' && Object.keys(updatedRoom.players).length > Object.keys(prevRoom.players).length) {
        audio.playJoin();
      }

      if (prevRoom.state !== 'playing' && updatedRoom.state === 'playing') {
        audio.playStart();
        // Reset local state on start
        setCurrentGuess([]);
        setGuesses([]);
      }

      if (prevRoom.state === 'playing' && updatedRoom.state === 'completed') {
        audio.playComplete();
        setTimeout(() => onGameEnded(updatedRoom), 2000);
      }

      prevRoomRef.current = updatedRoom;
    });
    return () => unsubscribe();
  }, [room.id]);

  useEffect(() => {
    if (room.endTime) {
      setTimeLeft(Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)));
    }
  }, [room.endTime]);

  const handleStartGame = () => startGame(room.id);
  const handleLeave = () => { leaveRoom(room.id); onLeave(); };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const addSymbol = (sym: number) => {
    if (room.state !== 'playing') return;
    if (currentGuess.length >= 5) return;
    if (currentGuess.includes(sym)) return;
    setCurrentGuess([...currentGuess, sym]);
    audio.playTap();
  };

  const removeLast = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1));
      audio.playTap();
    }
  };

  const clearGuess = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess([]);
      audio.playTap();
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== 5) return;
    
    let rightPlace = 0;
    let wrongPlace = 0;
    
    currentGuess.forEach((sym, idx) => {
      if (room.secret[idx] === sym) {
        rightPlace++;
      } else if (room.secret.includes(sym)) {
        wrongPlace++;
      }
    });
    
    const newGuesses = [{ guess: [...currentGuess], rightPlace, wrongPlace }, ...guesses];
    setGuesses(newGuesses);
    setCurrentGuess([]);
    
    // Notify server of guess
    if (myPlayer) {
      incrementGuess(room.id, myPlayer.number, room.guesses);
    }
    
    if (rightPlace === 5) {
      audio.playComplete();
      // We cracked it! Tell the server we won
      if (myPlayer) {
          claimVictory(room.id, myPlayer.id);
      }
    } else {
      audio.playWrong();
    }
  };

  const checkTimeout = () => {
    if (isHost && room.state === 'playing') {
       setGameCompleted(room.id, null, true); // draw if time runs out
    }
  };

  if (!isPlaying) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset">
        <header className="flex items-center justify-between mb-8">
          <button onClick={handleLeave} className="p-3 text-red-500 hover:text-red-600 bg-red-50 rounded-full">
            <LogOut className="w-6 h-6" />
          </button>
          <div className="text-center relative">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-widest">{room.id}</h1>
              <button onClick={handleCopyCode} className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Copy room code">
                {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div className="w-12" />
        </header>

        <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Players
              </h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full text-sm">
                {Object.keys(room.players).length} / 2
              </span>
            </div>

            <div className="space-y-3">
              {Object.values(room.players).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="text-xl">{p.avatar}</span>
                    {p.name}
                    {p.id === room.hostId && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Host</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${p.number === 1 ? 'bg-indigo-600' : 'bg-rose-500'}`} />
                    {p.id === clientId && <span className="text-xs text-slate-400 font-bold">(You)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            {isHost ? (
              <button 
                onClick={handleStartGame}
                disabled={Object.keys(room.players).length < 2}
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
              >
                <Play className="w-6 h-6" /> Start Game
              </button>
            ) : (
              <div className="p-4 bg-slate-100 text-slate-500 text-center rounded-2xl font-bold">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Gameplay View
  const player1 = Object.values(room.players).find((p: any) => p.number === 1) as any;
  const player2 = Object.values(room.players).find((p: any) => p.number === 2) as any;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex flex-col p-4 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0 gap-4">
        <div className="flex items-center justify-between">
          <button onClick={handleLeave} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 rounded-full"><LogOut className="w-5 h-5" /></button>
          
          <TimerDisplay 
            timedMode={room.config.timeLimit > 0}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            isActive={room.state === 'playing'}
            onTimeUp={checkTimeout}
          />
          
          <div className="w-9" />
        </div>

        <div className="flex items-center justify-between px-2 text-sm font-bold">
          <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm">
            <span className="text-indigo-700">{player1?.avatar} {player1?.name}</span>
            <span className="text-indigo-900 text-lg">{room.guesses[1]} guesses</span>
          </div>
          
          <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 shadow-sm">
            <span className="text-rose-700">{player2?.avatar} {player2?.name}</span>
            <span className="text-rose-900 text-lg">{room.guesses[2]} guesses</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col max-w-lg mx-auto w-full gap-4">
        
        {/* Guesses List */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-slate-500 flex justify-between text-xs uppercase tracking-widest">
            <span>Your Guesses ({guesses.length})</span>
            <span>Right / Wrong</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {guesses.map((g, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-2">
                  {g.guess.map((num, idx) => (
                    <div key={idx} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg font-black text-slate-700 shadow-sm border border-slate-200">
                      {num}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 font-bold text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-500">{g.rightPlace}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-amber-500">{g.wrongPlace}</span>
                  </div>
                </div>
              </div>
            ))}
            {guesses.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-bold text-sm">
                No guesses yet
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex gap-2 justify-center mb-6">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl transition-all ${currentGuess[i] ? 'bg-indigo-600 text-white shadow-md scale-110' : 'bg-slate-100 text-slate-300'}`}>
                {currentGuess[i] || '-'}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => addSymbol(sym)}
                disabled={currentGuess.includes(sym) || currentGuess.length >= 5}
                className="h-12 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-black text-xl rounded-xl transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button onClick={clearGuess} disabled={currentGuess.length === 0} className="flex-1 h-12 bg-rose-100 hover:bg-rose-200 text-rose-600 disabled:opacity-50 font-bold rounded-xl flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
            <button onClick={removeLast} disabled={currentGuess.length === 0} className="flex-1 h-12 bg-amber-100 hover:bg-amber-200 text-amber-600 disabled:opacity-50 font-bold rounded-xl flex items-center justify-center transition-colors">
              <Delete className="w-5 h-5" />
            </button>
            <button onClick={submitGuess} disabled={currentGuess.length < 5} className="flex-[2] h-12 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:bg-slate-300 font-black rounded-xl transition-colors">
              SUBMIT
            </button>
          </div>
        </div>
      </main>
      
      <EmojiReactions roomId={room.id} collectionName="ctc_rooms" myPlayerId={clientId} lastReaction={(room as any).lastReaction} />
    </div>
  );
}
