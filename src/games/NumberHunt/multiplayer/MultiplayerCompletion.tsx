import React, { useEffect } from 'react';
import { Trophy, LogOut, RotateCcw } from 'lucide-react';
import { getSocket } from './SocketClient';

interface Props {
  room: any;
  onLeave: () => void;
  onRoomUpdated: (room: any) => void;
}

export function MultiplayerCompletion({ room, onLeave, onRoomUpdated }: Props) {
  const socket = getSocket();
  const isHost = socket.id === room.hostId;

  useEffect(() => {
    const handleRoomUpdated = (r: any) => onRoomUpdated(r);
    socket.on('room_updated', handleRoomUpdated);
    return () => {
      socket.off('room_updated', handleRoomUpdated);
    };
  }, [socket, onRoomUpdated]);

  const handleRestart = () => {
    socket.emit('restart_game', room.id);
  };

  const handleLeave = () => {
    socket.emit('leave_room', room.id);
    onLeave();
  };

  const players = Object.values(room.players).sort((a: any, b: any) => b.score - a.score);
  const winner = players[0] as any;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal Container */}
      <div className="relative bg-white rounded-[2rem] p-8 max-w-sm mx-auto w-full shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 fade-in duration-200">
        
        <div className="text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-yellow-500/20">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Round Summary</h2>
          <h1 className="text-3xl font-black text-slate-900 leading-none">{winner?.name || 'Nobody'}</h1>
          <p className="text-indigo-600 font-bold mt-2 text-lg">Winner • {winner?.score || 0} pts</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-48 overflow-y-auto">
          <h3 className="font-bold text-slate-400 mb-3 uppercase tracking-wider text-xs">Leaderboard</h3>
          <div className="space-y-2">
            {players.map((p: any, idx: number) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-300 w-4 text-sm">{idx + 1}</span>
                  <span className="font-bold text-slate-700">{p.name} {p.id === socket.id ? <span className="text-slate-400 font-normal text-sm ml-1">(You)</span> : ''}</span>
                </div>
                <span className="font-black text-indigo-600">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={handleLeave}
            className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-transform"
          >
            <LogOut className="w-5 h-5" /> Leave
          </button>
          
          {isHost && (
            <button
              onClick={handleRestart}
              className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          )}
        </div>
        
        {!isHost && (
          <p className="text-center text-sm font-bold text-slate-400">Waiting for host to restart...</p>
        )}
      </div>
    </div>
  );
}
