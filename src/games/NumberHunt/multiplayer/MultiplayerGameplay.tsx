import React, { useEffect, useState, useMemo } from 'react';
import { LogOut, Users, Play, Trophy } from 'lucide-react';
import { Board } from '../Board';
import { PlacedNumber } from '../types';
import { generateLayout } from '../layout';
import { audio } from '../../../lib/audio';
import { TimerDisplay } from '../../../components/TimerDisplay';
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
      
      onRoomUpdated(updatedRoom);
      
      const prevRoom = prevRoomRef.current;

      // Detect game start
      if (prevRoom.state !== 'playing' && updatedRoom.state === 'playing') {
        audio.playCorrect();
      }

      // Detect game end
      if (prevRoom.state === 'playing' && updatedRoom.state === 'completed') {
        onGameEnded(updatedRoom);
      }

      // Detect number found
      if (updatedRoom.lastWinner && updatedRoom.lastWinner.timestamp > (prevRoom.lastWinner?.timestamp || 0)) {
        setWinnerAlert({ name: updatedRoom.lastWinner.name, points: updatedRoom.lastWinner.points });
        audio.playCorrect();
        setTimeout(() => setWinnerAlert(null), 2000);
      }

      prevRoomRef.current = updatedRoom;
    });

    return () => unsubscribe();
  }, [room.id]);

  useEffect(() => {
    if (isPlaying) {
      if (boardContainerRef.current) {
        setLayout(generateLayout(room.config.start, room.config.end, boardContainerRef.current.clientWidth, boardContainerRef.current.clientHeight));
      }
    }
  }, [isPlaying, room.currentNumber, room.config]);

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
    } else {
      audio.playWrong();
    }
  };

  if (!isPlaying) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset">
        <header className="flex items-center justify-between mb-8">
          <button onClick={handleLeave} className="p-3 text-red-500 hover:text-red-600 bg-red-50 rounded-full">
            <LogOut className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Room Code</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-widest">{room.id}</h1>
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
                {Object.keys(room.players).length}
              </span>
            </div>

            <div className="space-y-3">
              {Object.values(room.players).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
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
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
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
    <div className="flex flex-col h-[100dvh] bg-[#fdfbf7] overflow-hidden safe-area-inset">
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
            timeLeft={room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0}
            setTimeLeft={() => {}}
            isActive={true}
            onTimeUp={() => {
              if (isHost) {
                endGame(room.id);
              }
            }} 
          />
        </div>
      </header>

      <div ref={boardContainerRef} className="flex-1 relative overflow-hidden bg-[#fdfbf7] p-2">
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
      </div>
    </div>
  );
}
