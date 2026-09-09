import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Users, Play, Copy, Check } from 'lucide-react';
import { subscribeToRoom, startGame, leaveRoom, makeMove, clientId, FIARoom } from './MultiplayerManager';
import { TimerDisplay } from '../../../components/TimerDisplay';
import { audio } from '../../../lib/audio';
import { EmojiReactions } from '../../../components/EmojiReactions';

const COLS = 9;
const ROWS = 7;

interface Props {
  room: FIARoom;
  onLeave: () => void;
  onGameEnded: (room: FIARoom) => void;
}

export function MultiplayerGameplay({ room: initialRoom, onLeave, onGameEnded }: Props) {
  const [room, setRoom] = useState<FIARoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const prevRoomRef = useRef<FIARoom>(initialRoom);
  
  const isHost = clientId === room.hostId;
  const isPlaying = room.state === 'playing';
  const myPlayer = room.players[clientId];
  
  const [timeLeft, setTimeLeft] = useState(room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0);

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

  const checkWin = (b: (1|2|null)[][], c: number, r: number, p: 1|2) => {
    const dirs = [[1,0], [0,1], [1,1], [1,-1]];
    for (const [dc, dr] of dirs) {
      let count = 1;
      const line = [{c, r}];
      let nc = c + dc; let nr = r + dr;
      while (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && b[nc][nr] === p) {
        count++; line.push({c:nc, r:nr}); nc += dc; nr += dr;
      }
      nc = c - dc; nr = r - dr;
      while (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && b[nc][nr] === p) {
        count++; line.push({c:nc, r:nr}); nc -= dc; nr -= dr;
      }
      if (count >= 4) return line;
    }
    return null;
  };

  const dropPiece = (col: number) => {
    if (room.state !== 'playing' || room.turn !== myPlayer?.number) return;
    
    let r = 0;
    while (r < ROWS && room.board[col][r] !== null) r++;
    if (r >= ROWS) return; // Column full
    
    const newBoard = room.board.map(c => [...c]);
    newBoard[col][r] = myPlayer.number;
    
    const winLine = checkWin(newBoard, col, r, myPlayer.number);
    let isDraw = false;
    
    if (!winLine) {
      isDraw = newBoard.every(c => c[ROWS - 1] !== null);
    }
    
    audio.playTap();
    makeMove(
      room.id, 
      col, 
      newBoard, 
      myPlayer.number === 1 ? 2 : 1, 
      winLine || [], 
      winLine ? clientId : null, 
      isDraw
    );
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
            onTimeUp={() => {
              if (isHost && room.state === 'playing') {
                makeMove(room.id, 0, room.board, room.turn, [], null, true); // draw by timeout
              }
            }}
          />
          
          <div className="w-9" />
        </div>

        <div className="flex items-center justify-between px-2">
          <div className={`flex items-center gap-2 font-bold px-4 py-1.5 rounded-full ${room.turn === 1 ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}`}>
            <span>{player1?.avatar}</span> {player1?.name}
          </div>
          <div className={`flex items-center gap-2 font-bold px-4 py-1.5 rounded-full ${room.turn === 2 ? 'bg-rose-500 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}`}>
            <span>{player2?.avatar}</span> {player2?.name}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="flex bg-blue-100 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-inner gap-1 sm:gap-2">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={c}
              onClick={() => dropPiece(c)}
              disabled={room.state !== 'playing' || room.board[c][ROWS - 1] !== null || room.turn !== myPlayer?.number}
              className="flex flex-col-reverse gap-1 sm:gap-2 outline-none group"
            >
              {Array.from({ length: ROWS }).map((_, r) => {
                const cell = room.board[c][r];
                const isWin = room.winLine.some(loc => loc.c === c && loc.r === r);
                return (
                  <div 
                    key={r}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shadow-inner transition-all duration-300 ${
                      cell === 1 ? 'bg-indigo-600' :
                      cell === 2 ? 'bg-rose-500' :
                      'bg-[#fdfbf7]'
                    } ${isWin ? 'ring-4 ring-white scale-110 z-10 shadow-lg' : ''}`}
                  />
                );
              })}
            </button>
          ))}
        </div>
      </main>
      
      <EmojiReactions roomId={room.id} collectionName="fiar_rooms" myPlayerId={clientId} lastReaction={(room as any).lastReaction} />
    </div>
  );
}
