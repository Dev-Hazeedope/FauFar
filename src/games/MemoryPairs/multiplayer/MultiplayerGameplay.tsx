import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Users, Play, Copy, Check, Trophy } from 'lucide-react';
import { subscribeToRoom, startGame, leaveRoom, claimPair, setGameCompleted, clientId, MPRoom } from './MultiplayerManager';
import { TimerDisplay } from '../../../components/TimerDisplay';
import { audio } from '../../../lib/audio';
import { haptics } from '../../../lib/haptics';
import { SHARED_ICONS } from '../../../lib/icons';
import { EmojiReactions } from '../../../components/EmojiReactions';

interface Props {
  room: MPRoom;
  onLeave: () => void;
  onGameEnded: (room: MPRoom) => void;
}

export function MultiplayerGameplay({ room: initialRoom, onLeave, onGameEnded }: Props) {
  const [room, setRoom] = useState<MPRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const prevRoomRef = useRef<MPRoom>(initialRoom);
  
  const isHost = clientId === room.hostId;
  const isPlaying = room.state === 'playing';
  const myPlayer = room.players[clientId];
  
  const [timeLeft, setTimeLeft] = useState(room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0);
  
  const [localRevealedIds, setLocalRevealedIds] = useState<string[]>([]);
  const [winnerAlert, setWinnerAlert] = useState<{name: string, points: number} | null>(null);

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
      }

      if (prevRoom.state === 'playing' && updatedRoom.state === 'completed') {
        audio.playComplete();
        setTimeout(() => onGameEnded(updatedRoom), 2000);
      }
      
      // Play match if matchedIds increased
      if (prevRoom.matchedIds.length < updatedRoom.matchedIds.length) {
        audio.playFound();
      }
      
      if (updatedRoom.lastWinner && updatedRoom.lastWinner.timestamp > (prevRoom.lastWinner?.timestamp || 0)) {
        setWinnerAlert({ name: updatedRoom.lastWinner.name, points: updatedRoom.lastWinner.points });
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

  const handleStartGame = () => startGame(room.id);
  const handleLeave = () => { leaveRoom(room.id); onLeave(); };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = (id: string) => {
    if (room.state !== 'playing' || !myPlayer) return;
    if (room.matchedIds.includes(id)) return;
    if (localRevealedIds.length === 2) return; // Wait for manual continue
    if (localRevealedIds.includes(id)) return;
    
    const newRevealed = [...localRevealedIds, id];
    setLocalRevealedIds(newRevealed);
    
    if (newRevealed.length === 1) {
      // Just revealing the first card
      audio.playTap();
      return;
    }
    
    // Revealing the second card
    const c1 = room.cards.find(c => c.id === newRevealed[0]);
    const c2 = room.cards.find(c => c.id === newRevealed[1]);
    
    if (c1 && c2 && c1.iconIdx === c2.iconIdx) {
      // Match
      audio.playComplete();
      haptics.vibrateSuccess();
      claimPair(room.id, myPlayer.number, c1.id, c2.id, myPlayer.name);
      
      setTimeout(() => setLocalRevealedIds([]), 500);
    } else {
      // No match
      audio.playWrong();
      haptics.vibrateError();
      setTimeout(() => setLocalRevealedIds([]), 1000);
    }
  };

  const checkTimeout = () => {
    if (isHost && room.state === 'playing') {
       let winnerId: string | null = null;
       let isDraw = false;
       if (room.scores[1] > room.scores[2]) winnerId = Object.keys(room.players).find(id => room.players[id].number === 1) || null;
       else if (room.scores[2] > room.scores[1]) winnerId = Object.keys(room.players).find(id => room.players[id].number === 2) || null;
       else isDraw = true;
       setGameCompleted(room.id, winnerId, isDraw);
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

        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 font-bold mb-1 text-indigo-700">
              <span className="text-sm">{player1?.avatar}</span> {player1?.name}
            </div>
            <div className="text-2xl font-black text-indigo-900">{room.scores[1]}</div>
          </div>
          
          <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 font-bold mb-1 text-rose-700">
              <span className="text-sm">{player2?.avatar}</span> {player2?.name}
            </div>
            <div className="text-2xl font-black text-rose-900">{room.scores[2]}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl flex-1 flex flex-wrap justify-center content-center gap-3 pb-8">
          {room.cards.map((card, i) => {
            const isRevealed = localRevealedIds.includes(card.id) || room.matchedIds.includes(card.id);
            const Icon = Array.from(SHARED_ICONS.values())[card.iconIdx];
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`flex items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-xl transition-all shadow-sm border ${isRevealed ? 'bg-white border-slate-200 text-slate-800 scale-100' : 'bg-indigo-100 border-indigo-200 text-transparent scale-95 hover:scale-100 hover:bg-indigo-200'}`}
              >
                {isRevealed && <Icon className="w-10 h-10 sm:w-12 sm:h-12 animate-in zoom-in" />}
              </button>
            )
          })}
        </div>
        
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
      </main>
      
      <EmojiReactions roomId={room.id} collectionName="mp_rooms" myPlayerId={clientId} lastReaction={(room as any).lastReaction} />
    </div>
  );
}
