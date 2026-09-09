import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Users, Play, Copy, Check } from 'lucide-react';
import { subscribeToRoom, startGame, leaveRoom, makeMove, setGameCompleted, clientId, DABRoom } from './MultiplayerManager';
import { TimerDisplay } from '../../../components/TimerDisplay';
import { audio } from '../../../lib/audio';
import { EmojiReactions } from '../../../components/EmojiReactions';

interface Props {
  room: DABRoom;
  onLeave: () => void;
  onGameEnded: (room: DABRoom) => void;
}

export function MultiplayerGameplay({ room: initialRoom, onLeave, onGameEnded }: Props) {
  const [room, setRoom] = useState<DABRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const prevRoomRef = useRef<DABRoom>(initialRoom);
  
  const isHost = clientId === room.hostId;
  const isPlaying = room.state === 'playing';
  const myPlayer = room.players[clientId];
  
  const [timeLeft, setTimeLeft] = useState(room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0);
  const [hoverEdge, setHoverEdge] = useState<{type: 'h'|'v', r: number, c: number} | null>(null);

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

      // Check for opponent move
      if (prevRoom.turn !== updatedRoom.turn && updatedRoom.turn === myPlayer?.number && updatedRoom.state === 'playing') {
        audio.playTap();
      }
      
      // Found a box logic could go here by comparing prevRoom.boxes with updatedRoom.boxes
      if (Object.keys(updatedRoom.boxes).length > Object.keys(prevRoom.boxes).length) {
        audio.playFound();
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

  const handleEdgeClick = (type: 'h' | 'v', r: number, c: number) => {
    if (room.state !== 'playing' || room.turn !== myPlayer?.number) return;
    
    const edges = type === 'h' ? room.hEdges : room.vEdges;
    const key = `${r},${c}`;
    if (edges[key]) return; // already claimed
    
    const newHEdges = { ...room.hEdges };
    const newVEdges = { ...room.vEdges };
    if (type === 'h') newHEdges[key] = myPlayer.number;
    else newVEdges[key] = myPlayer.number;
    
    let boxesCompleted = 0;
    const newBoxes = { ...room.boxes };
    const size = room.config.boardSize;
    
    if (type === 'h') {
      if (r > 0 && newHEdges[`${r-1},${c}`] && newVEdges[`${r-1},${c}`] && newVEdges[`${r-1},${c+1}`]) {
        newBoxes[`${r-1},${c}`] = myPlayer.number;
        boxesCompleted++;
      }
      if (r < size && newHEdges[`${r+1},${c}`] && newVEdges[`${r},${c}`] && newVEdges[`${r},${c+1}`]) {
        newBoxes[`${r},${c}`] = myPlayer.number;
        boxesCompleted++;
      }
    } else {
      if (c > 0 && newVEdges[`${r},${c-1}`] && newHEdges[`${r},${c-1}`] && newHEdges[`${r+1},${c-1}`]) {
        newBoxes[`${r},${c-1}`] = myPlayer.number;
        boxesCompleted++;
      }
      if (c < size && newVEdges[`${r},${c+1}`] && newHEdges[`${r},${c}`] && newHEdges[`${r+1},${c}`]) {
        newBoxes[`${r},${c}`] = myPlayer.number;
        boxesCompleted++;
      }
    }
    
    const newScores = { ...room.scores };
    if (boxesCompleted > 0) {
      newScores[myPlayer.number] += boxesCompleted;
      audio.playFound();
    } else {
      audio.playTap();
    }
    
    const nextTurn = boxesCompleted > 0 ? myPlayer.number : (myPlayer.number === 1 ? 2 : 1);
    
    // Check if game over
    const totalBoxes = size * size;
    const isCompleted = Object.keys(newBoxes).length === totalBoxes;

    makeMove(
      room.id,
      newHEdges,
      newVEdges,
      newBoxes,
      newScores,
      nextTurn,
      isCompleted
    );
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
  const player1 = Object.values(room.players).find(p => p.number === 1);
  const player2 = Object.values(room.players).find(p => p.number === 2);
  const size = room.config.boardSize;

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
          <div className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all ${room.turn === 1 ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-500'}`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <span className="text-sm">{player1?.avatar}</span> {player1?.name}
            </div>
            <div className="text-2xl font-black">{room.scores[1]}</div>
          </div>
          
          <div className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all ${room.turn === 2 ? 'bg-rose-500 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-500'}`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <span className="text-sm">{player2?.avatar}</span> {player2?.name}
            </div>
            <div className="text-2xl font-black">{room.scores[2]}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden touch-none">
        <div 
          className="relative mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
          onMouseLeave={() => setHoverEdge(null)}
        >
          {/* Render Boxes */}
          {Array.from({ length: size }).map((_, r) => (
            <div key={`row-${r}`} className="flex">
              {Array.from({ length: size }).map((_, c) => {
                const owner = room.boxes[`${r},${c}`];
                return (
                  <div 
                    key={`box-${r}-${c}`} 
                    className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-colors ${
                      owner === 1 ? 'bg-indigo-100' :
                      owner === 2 ? 'bg-rose-100' : 'bg-transparent'
                    }`}
                  >
                    {owner && (
                      <div className={`w-8 h-8 rounded-full ${owner === 1 ? 'bg-indigo-500' : 'bg-rose-500'} animate-in zoom-in`} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Render Grid Dots and Edges overlay */}
          <div className="absolute top-8 left-8 bottom-8 right-8 pointer-events-none flex flex-col justify-between">
            {Array.from({ length: size + 1 }).map((_, r) => (
              <div key={`dot-row-${r}`} className="flex justify-between relative h-0">
                {/* Horizontal Edges */}
                {Array.from({ length: size }).map((_, c) => {
                  const owner = room.hEdges[`${r},${c}`];
                  const isHovered = hoverEdge?.type === 'h' && hoverEdge?.r === r && hoverEdge?.c === c;
                  const isInteractive = !owner && room.state === 'playing' && room.turn === myPlayer?.number;
                  
                  return (
                    <div 
                      key={`h-${r}-${c}`}
                      className="absolute h-12 sm:h-16 -translate-y-1/2 pointer-events-auto cursor-pointer flex items-center justify-center"
                      style={{ left: `${c * (100 / size)}%`, width: `${100 / size}%` }}
                      onClick={() => handleEdgeClick('h', r, c)}
                      onMouseEnter={() => isInteractive && setHoverEdge({type:'h', r, c})}
                    >
                      <div className={`h-2 sm:h-3 rounded-full transition-all duration-200 ${
                        owner === 1 ? 'bg-indigo-500 shadow-md w-[110%]' : 
                        owner === 2 ? 'bg-rose-500 shadow-md w-[110%]' : 
                        isHovered ? 'bg-slate-300 w-[110%]' : 'bg-slate-100/0 hover:bg-slate-200 w-full'
                      }`} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="absolute top-8 left-8 bottom-8 right-8 pointer-events-none flex justify-between">
            {Array.from({ length: size + 1 }).map((_, c) => (
              <div key={`dot-col-${c}`} className="relative w-0">
                {/* Vertical Edges */}
                {Array.from({ length: size }).map((_, r) => {
                  const owner = room.vEdges[`${r},${c}`];
                  const isHovered = hoverEdge?.type === 'v' && hoverEdge?.r === r && hoverEdge?.c === c;
                  const isInteractive = !owner && room.state === 'playing' && room.turn === myPlayer?.number;

                  return (
                    <div 
                      key={`v-${r}-${c}`}
                      className="absolute w-12 sm:w-16 -translate-x-1/2 pointer-events-auto cursor-pointer flex items-center justify-center"
                      style={{ top: `${r * (100 / size)}%`, height: `${100 / size}%` }}
                      onClick={() => handleEdgeClick('v', r, c)}
                      onMouseEnter={() => isInteractive && setHoverEdge({type:'v', r, c})}
                    >
                      <div className={`w-2 sm:w-3 rounded-full transition-all duration-200 ${
                        owner === 1 ? 'bg-indigo-500 shadow-md h-[110%]' : 
                        owner === 2 ? 'bg-rose-500 shadow-md h-[110%]' : 
                        isHovered ? 'bg-slate-300 h-[110%]' : 'bg-slate-100/0 hover:bg-slate-200 h-full'
                      }`} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Render Actual Dots */}
          <div className="absolute top-8 left-8 bottom-8 right-8 pointer-events-none flex flex-col justify-between z-10">
            {Array.from({ length: size + 1 }).map((_, r) => (
              <div key={`drow-${r}`} className="flex justify-between">
                {Array.from({ length: size + 1 }).map((_, c) => (
                  <div key={`dot-${r}-${c}`} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-800 -m-1.5 sm:-m-2 shadow-sm" />
                ))}
              </div>
            ))}
          </div>

        </div>
      </main>
      
      <EmojiReactions roomId={room.id} collectionName="dab_rooms" myPlayerId={clientId} lastReaction={(room as any).lastReaction} />
    </div>
  );
}
