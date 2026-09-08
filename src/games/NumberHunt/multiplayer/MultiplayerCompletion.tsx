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
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-8">
        
        <div className="text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/20">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-500 mb-2">Winner</h2>
          <h1 className="text-4xl font-black text-slate-900">{winner?.name || 'Nobody'}</h1>
          <p className="text-indigo-600 font-bold mt-2 text-xl">{winner?.score || 0} pts</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">Leaderboard</h3>
          <div className="space-y-3">
            {players.map((p: any, idx: number) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-300 w-4">{idx + 1}</span>
                  <span className="font-bold text-slate-700">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                </div>
                <span className="font-black text-indigo-600">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleLeave}
            className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200"
          >
            <LogOut className="w-5 h-5" /> Leave Room
          </button>
          
          {isHost && (
            <button
              onClick={handleRestart}
              className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          )}
        </div>
        
        {!isHost && (
          <p className="text-center text-sm font-bold text-slate-500 mt-4">Waiting for host to restart...</p>
        )}
      </div>
    </div>
  );
}
