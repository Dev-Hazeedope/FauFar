import React, { useEffect } from 'react';
import { Trophy, LogOut, RotateCcw } from 'lucide-react';
import { subscribeToRoom, startGame, leaveRoom, clientId, MPRoom } from './MultiplayerManager';

interface Props {
  room: MPRoom;
  onLeave: () => void;
  onRoomUpdated: (room: MPRoom) => void;
}

export function MultiplayerCompletion({ room, onLeave, onRoomUpdated }: Props) {
  const isHost = clientId === room.hostId;

  const callbacksRef = React.useRef({ onLeave, onRoomUpdated });
  useEffect(() => {
    callbacksRef.current = { onLeave, onRoomUpdated };
  });

  useEffect(() => {
    const unsubscribe = subscribeToRoom(room.id, (updatedRoom) => {
      const { onLeave, onRoomUpdated } = callbacksRef.current;
      if (!updatedRoom) {
        onLeave();
        return;
      }
      onRoomUpdated(updatedRoom);
    });
    return () => unsubscribe();
  }, [room.id]);

  const handleRestart = () => {
    startGame(room.id);
  };

  const handleLeave = () => {
    leaveRoom(room.id);
    onLeave();
  };

  const winnerPlayer = room.winner ? room.players[room.winner] : null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-8">
        
        <div className="text-center flex flex-col items-center">
          <div className={`w-24 h-24 ${room.isDraw ? 'bg-slate-100 shadow-slate-500/20' : 'bg-yellow-100 shadow-yellow-500/20'} rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl`}>
            {winnerPlayer ? winnerPlayer.avatar : <Trophy className={`w-12 h-12 ${room.isDraw ? 'text-slate-400' : 'text-yellow-500'}`} />}
          </div>
          <h2 className="text-xl font-bold text-slate-500 mb-2">
            {room.isDraw ? 'Result' : 'Winner'}
          </h2>
          <h1 className="text-4xl font-black text-slate-900">
            {room.isDraw ? 'It\'s a Draw!' : (winnerPlayer?.name || 'Nobody')}
          </h1>
          {!room.isDraw && winnerPlayer && (
            <p className="text-indigo-600 font-bold mt-2 text-xl">{room.scores[winnerPlayer.number]} pairs matched</p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">Players</h3>
          <div className="space-y-3">
            {Object.values(room.players).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.avatar}</span>
                  <span className="font-bold text-slate-700">{p.name} {p.id === clientId ? '(You)' : ''}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-slate-900">{room.scores[p.number]}</span>
                  <div className={`w-4 h-4 rounded-full ${p.number === 1 ? 'bg-indigo-600' : 'bg-rose-500'}`} />
                </div>
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
