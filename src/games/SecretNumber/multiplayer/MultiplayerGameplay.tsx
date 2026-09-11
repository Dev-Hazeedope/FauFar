import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Users, Play, Trophy, Copy, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { audio } from '../../../lib/audio';
import { haptics } from '../../../lib/haptics';
import { EmojiReactions } from '../../../components/EmojiReactions';
import { subscribeToRoom, startGame, leaveRoom, submitGuess, clientId } from './MultiplayerManager';

interface Props {
  room: any;
  onLeave: () => void;
  onGameEnded: (room: any) => void;
  onRoomUpdated: (room: any) => void;
}

export function MultiplayerGameplay({ room, onLeave, onGameEnded, onRoomUpdated }: Props) {
  const [copied, setCopied] = useState(false);
  const [currentGuess, setCurrentGuess] = useState('');
  
  const isHost = clientId === room.hostId;
  const isPlaying = room.state === 'playing';

  const callbacksRef = useRef({ onLeave, onGameEnded, onRoomUpdated });
  useEffect(() => {
    callbacksRef.current = { onLeave, onGameEnded, onRoomUpdated };
  });

  const prevRoomRef = useRef(room);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(room.id, (updatedRoom) => {
      const { onLeave, onGameEnded, onRoomUpdated } = callbacksRef.current;
      
      if (!updatedRoom) {
        onLeave();
        return;
      }

      if (updatedRoom.hostLeft) {
        alert("The host has left the game.");
        onLeave();
        return;
      }
      
      onRoomUpdated(updatedRoom);
      
      const prevRoom = prevRoomRef.current;

      // Detect new player joined
      if (prevRoom.state === 'waiting' && Object.keys(updatedRoom.players).length > Object.keys(prevRoom.players).length) {
        audio.playJoin();
      }

      // Detect game start
      if (prevRoom.state !== 'playing' && updatedRoom.state === 'playing') {
        audio.playStart();
      }

      // Detect new guess
      if (prevRoom.guesses.length < updatedRoom.guesses.length) {
        const latestGuess = updatedRoom.guesses[0];
        if (latestGuess.playerId !== clientId) {
          audio.playTap();
        }
      }

      // Detect game end
      if (prevRoom.state === 'playing' && updatedRoom.state === 'completed') {
        audio.playComplete();
        onGameEnded(updatedRoom);
      }

      prevRoomRef.current = updatedRoom;
    });

    return () => unsubscribe();
  }, [room.id]);

  const handleStartGame = () => {
    startGame(room.id);
  };

  const handleLeave = () => {
    leaveRoom(room.id);
    onLeave();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(currentGuess);
    if (!isNaN(val)) {
      submitGuess(room.id, val);
      setCurrentGuess('');
      haptics.vibrateSuccess();
    }
  };

  if (!isPlaying) {
    return (
      <div className="game-screen">
        <header className="flex items-center justify-between mb-8">
          <button onClick={handleLeave} className="game-avatar text-[#FF5757] hover:bg-[#FF5757] hover:text-white">
            <LogOut className="w-6 h-6" />
          </button>
          <div className="text-center relative">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <h1 className="game-title text-center mb-6 !text-slate-900 !stroke-none !shadow-none tracking-widest">{room.id}</h1>
              <button 
                onClick={handleCopyCode}
                className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Copy room code"
              >
                {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div className="w-12" />
        </header>

        <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6">
          <div className="game-panel flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Players
              </h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full text-sm">
                {Object.keys(room.players).length}
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
                  {p.id === clientId && <span className="text-xs text-slate-400 font-bold">(You)</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            {isHost ? (
              <button 
                onClick={handleStartGame}
                disabled={Object.keys(room.players).length < 2}
                className="w-full py-4 text-xl game-button-primary disabled:opacity-50"
              >
                <Play className="w-6 h-6" /> Start Game
              </button>
            ) : (
              <div className="p-4 bg-slate-100 text-slate-500 text-center rounded-2xl font-bold">
                Waiting for host to start...
              </div>
            )}
            {isHost && Object.keys(room.players).length < 2 && (
              <p className="text-center text-sm font-bold text-amber-600 mt-3">Waiting for others to join...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen relative">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-slate-200 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={handleLeave} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secret Number Range</span>
            <span className="text-xl font-black text-indigo-600 leading-none">{room.config.min} - {room.config.max}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center max-w-xl mx-auto w-full relative">
        <div className="w-full game-panel text-center mb-6 z-10 relative">
          <form onSubmit={handleGuessSubmit} className="flex gap-2">
            <input
              type="number"
              value={currentGuess}
              onChange={e => setCurrentGuess(e.target.value)}
              placeholder="Enter guess..."
              className="flex-1 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold focus:ring-2 focus:ring-indigo-500 text-center"
            />
            <button type="submit" disabled={!currentGuess} className="px-6 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50">Guess</button>
          </form>
        </div>

        <div className="w-full space-y-3 flex-1 overflow-y-auto pb-20">
          {room.guesses.map((g: any, i: number) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${g.playerId === clientId ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col w-24">
                <span className="text-xl font-bold text-slate-700">{g.value}</span>
                <span className="text-xs text-slate-400 font-bold truncate">{g.playerName}</span>
              </div>
              
              <div className="flex-1 text-center">
                {g.result === 'low' && <span className="flex items-center justify-center gap-2 font-bold text-blue-600"><ArrowUp className="w-5 h-5" /> Higher</span>}
                {g.result === 'high' && <span className="flex items-center justify-center gap-2 font-bold text-amber-600"><ArrowDown className="w-5 h-5" /> Lower</span>}
                {g.result === 'correct' && <span className="flex items-center justify-center gap-2 font-bold text-green-600"><Check className="w-5 h-5" /> Correct</span>}
              </div>
            </div>
          ))}
        </div>
        
        <EmojiReactions roomId={room.id} collectionName="sn_rooms" myPlayerId={clientId} lastReaction={(room as any).lastReaction} />
      </main>
    </div>
  );
}
