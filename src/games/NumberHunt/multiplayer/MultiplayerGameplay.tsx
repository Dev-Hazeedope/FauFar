import React, { useEffect, useState, useMemo, useRef } from 'react';
import { LogOut, Users, Play, Trophy, Copy, Check } from 'lucide-react';
import { Board } from '../Board';
import { PlacedNumber } from '../types';
import { generateLayout } from '../layout';
import { audio } from '../../../lib/audio';
import { haptics } from '../../../lib/haptics';
import { TimerDisplay } from '../../../components/TimerDisplay';
import { EmojiReactions } from '../../../components/EmojiReactions';
import { subscribeToRoom, startGame, leaveRoom, foundNumber, endGame, clientId } from './MultiplayerManager';

interface Props {
  room: any;
  onLeave: () => void;
  onGameEnded: (room: any) => void;
  onRoomUpdated: (room: any) => void;
}

export function MultiplayerGameplay({ room, onLeave, onGameEnded, onRoomUpdated }: Props) {
  const [layout, setLayout] = useState<PlacedNumber[] | null>(null);
  const boardContainerRef = React.useRef<HTMLDivElement>(null);
  const [winnerAlert, setWinnerAlert] = useState<{name: string, points: number} | null>(null);
  const [copied, setCopied] = useState(false);
  
  const initialTimeLeft = room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0;
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  
  const isHost = clientId === room.hostId;
  const isPlaying = room.state === 'playing';

  const callbacksRef = React.useRef({ onLeave, onGameEnded, onRoomUpdated });
  useEffect(() => {
    callbacksRef.current = { onLeave, onGameEnded, onRoomUpdated };
  });

  const prevRoomRef = React.useRef(room);

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

      // Detect game end
      if (prevRoom.state === 'playing' && updatedRoom.state === 'completed') {
        audio.playComplete();
        onGameEnded(updatedRoom);
      }

      // Detect number found
      if (updatedRoom.lastWinner && updatedRoom.lastWinner.timestamp > (prevRoom.lastWinner?.timestamp || 0)) {
        setWinnerAlert({ name: updatedRoom.lastWinner.name, points: updatedRoom.lastWinner.points });
        audio.playFound();
        setTimeout(() => setWinnerAlert(null), 2000);
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

  useEffect(() => {
    if (!isPlaying || !boardContainerRef.current) return;
    
    let currentLayoutGenerated = false;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      // Subtract 8px for the border-4 on the Board component
      const innerW = w - 8;
      const innerH = h - 8;
      
      if (innerW > 100 && innerH > 100 && !currentLayoutGenerated) {
        setLayout(generateLayout(room.config.start, room.config.end, innerW, innerH));
        currentLayoutGenerated = true;
      }
    });
    
    observer.observe(boardContainerRef.current);
    return () => observer.disconnect();
  }, [isPlaying, room.config.start, room.config.end]);

  const handleStartGame = () => {
    startGame(room.id);
  };

  const handleLeave = () => {
    leaveRoom(room.id);
    onLeave();
  };

  const handleNumberClick = (num: number) => {
    if (num === room.currentNumber) {
      foundNumber(room.id, num);
      haptics.vibrateSuccess();
    } else {
      audio.playWrong();
      haptics.vibrateError();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Find</span>
            <span className="text-3xl font-black text-indigo-600 leading-none">{room.currentNumber}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Score</span>
            <span className="text-xl font-black text-slate-700 leading-none">{room.players[clientId]?.score || 0}</span>
          </div>
          
          <TimerDisplay 
            timedMode={true}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            isActive={true}
            onTimeUp={() => {
              if (isHost) {
                endGame(room.id);
              }
            }} 
          />
        </div>
      </header>

      <div ref={boardContainerRef} className="flex-1 relative overflow-hidden bg-transparent p-2 flex flex-col">
        {layout && (
          <Board
            layout={layout}
            found={new Set()}
            currentTarget={room.currentNumber}
            onTap={handleNumberClick}
          />
        )}
        
        {winnerAlert && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/90 text-white px-8 py-6 rounded-3xl animate-in zoom-in slide-in-from-bottom-8 flex flex-col items-center gap-2 shadow-2xl">
              <Trophy className="w-12 h-12 text-yellow-400 mb-2" />
              <div className="text-xl font-medium text-slate-300">Found by</div>
              <div className="text-3xl font-black">{winnerAlert.name}</div>
              <div className="text-yellow-400 font-bold mt-2">+{winnerAlert.points} points</div>
            </div>
          </div>
        )}
        
        <EmojiReactions roomId={room.id} collectionName="rooms" myPlayerId={clientId} lastReaction={(room as any).lastReaction} />
      </div>
    </div>
  );
}
