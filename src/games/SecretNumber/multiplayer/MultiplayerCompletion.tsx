import React, { useEffect, useRef } from 'react';
import { Trophy, LogOut, RotateCcw } from 'lucide-react';
import { restartGame, leaveRoom, clientId, subscribeToRoom } from './MultiplayerManager';

interface Props {
  room: any;
  onLeave: () => void;
  onRoomUpdated?: (room: any) => void;
}

export function MultiplayerCompletion({ room, onLeave, onRoomUpdated }: Props) {
  const isHost = clientId === room.hostId;
  const winnerPlayer = room.winnerId ? room.players[room.winnerId] : null;
  const isWinner = clientId === room.winnerId;

  const callbacksRef = useRef({ onLeave, onRoomUpdated });
  useEffect(() => { callbacksRef.current = { onLeave, onRoomUpdated }; }, [onLeave, onRoomUpdated]);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(room.id, (updatedRoom) => {
      const { onLeave, onRoomUpdated } = callbacksRef.current;
      if (!updatedRoom) {
        onLeave();
        return;
      }
      if (updatedRoom.hostLeft) {
        alert("The host has left the game.");
        onLeave();
        return;
      }
      if (onRoomUpdated) {
        onRoomUpdated(updatedRoom);
      }
    });
    return () => unsubscribe();
  }, [room.id]);

  const handleLeave = () => {
    leaveRoom(room.id);
    onLeave();
  };

  const handlePlayAgain = () => {
    restartGame(room.id);
  };

  return (
    <div className="game-screen">
      <div className="w-full max-w-md">
        <div className="game-panel flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          
          <div className="w-24 h-24 bg-yellow-100 shadow-yellow-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl">
            {winnerPlayer ? winnerPlayer.avatar : <Trophy className="w-12 h-12 text-yellow-500" />}
          </div>

          <h2 className="text-xl font-bold text-slate-500 mb-2">
            {isWinner ? 'You won!' : 'Winner'}
          </h2>
          <h1 className="game-title text-center mb-6 !text-slate-900 !stroke-none !shadow-none">
            {winnerPlayer?.name || 'Someone'}
          </h1>
          
          <div className="mt-6 text-center text-slate-500 font-bold mb-8">
            The secret number was:
            <br/>
            <span className="text-slate-800 text-5xl font-black">{room.secret}</span>
          </div>

          <div className="w-full text-left bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-8">
            <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">Players</h3>
            <div className="space-y-2">
              {Object.values(room.players).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="font-bold text-slate-700">{p.name} {p.id === clientId ? '(You)' : ''}</span>
                  </div>
                  {p.id === room.winnerId && <Trophy className="w-5 h-5 text-yellow-500" />}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex gap-4">
            <button
              onClick={handleLeave}
              className="flex-1 py-4 game-button-secondary"
            >
              <LogOut className="w-5 h-5" /> Leave
            </button>
            
            {isHost && (
              <button
                onClick={handlePlayAgain}
                className="flex-1 py-4 game-button-primary py-4"
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
    </div>
  );
}
