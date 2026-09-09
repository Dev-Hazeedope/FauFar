import React, { useState } from 'react';
import { Home, Users, ArrowLeft, Play } from 'lucide-react';
import { TimerSetup } from '../../../components/TimerSetup';
import { createRoom, joinRoom } from './MultiplayerManager';

interface Props {
  onBack: () => void;
  onJoinRoom: (room: any) => void;
}

const AVATARS = ['🦊', '🐰', '🐼', '🐯', '🐸', '🐶', '🐱', '🐮', '🐨', '🐷'];
type Difficulty = 'easy' | 'medium' | 'hard';
const COUNTS = { easy: 20, medium: 30, hard: 40 };

export function MultiplayerSetup({ onBack, onJoinRoom }: Props) {
  const [setupMode, setSetupMode] = useState<'SELECT' | 'HOST' | 'JOIN'>('SELECT');
  
  // Host state
  const [playerName, setPlayerName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [timedMode, setTimedMode] = useState(true);
  const [timeLimit, setTimeLimit] = useState('60'); // default 1 min
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  
  // Join state
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleHost = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    let parsedTime = 0;
    if (timedMode) {
      parsedTime = parseInt(timeLimit);
      if (isNaN(parsedTime) || parsedTime < 60) {
        setError("Please enter a valid time limit (minimum 1 minute).");
        return;
      }
    }

    setError('');
    setIsConnecting(true);
    
    try {
      const room = await createRoom(playerName.trim(), avatar, {
        timeLimit: parsedTime,
        difficulty
      });
      setIsConnecting(false);
      onJoinRoom(room);
    } catch (err: any) {
      setIsConnecting(false);
      setError(err.message || "Failed to host game");
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError("Please enter name and room code");
      return;
    }
    setError('');
    setIsConnecting(true);
    
    try {
      const room = await joinRoom(roomCode.trim().toUpperCase(), playerName.trim(), avatar);
      setIsConnecting(false);
      onJoinRoom(room);
    } catch (err: any) {
      setIsConnecting(false);
      setError(err.message || "Failed to join game");
    }
  };

  if (setupMode === 'SELECT') {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-slate-900">Multiplayer</h1>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-4">
          <button
            onClick={() => setSetupMode('HOST')}
            className="w-full p-6 bg-indigo-600 text-white rounded-3xl flex items-center gap-6 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-1">Host Game</h2>
              <p className="text-indigo-100 text-sm">Create a room and invite a friend</p>
            </div>
          </button>

          <button
            onClick={() => setSetupMode('JOIN')}
            className="w-full p-6 bg-emerald-500 text-white rounded-3xl flex items-center gap-6 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Play className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-1">Join Game</h2>
              <p className="text-emerald-100 text-sm">Enter a code to join</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => { setSetupMode('SELECT'); setError(''); }} className="p-3 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-black text-slate-900">
          {setupMode === 'HOST' ? 'Host Game' : 'Join Game'}
        </h1>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6 pb-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full p-4 rounded-xl border border-slate-200 bg-white font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            maxLength={15}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Choose Avatar</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl border-2 transition-all ${avatar === a ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {setupMode === 'JOIN' && (
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              className="w-full p-4 rounded-xl border border-slate-200 bg-white font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase tracking-widest"
              maxLength={6}
            />
          </div>
        )}

        {setupMode === 'HOST' && (
          <>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <h2 className="font-bold text-slate-800 mb-4">Difficulty</h2>
              <div className="flex flex-col gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button 
                    key={d}
                    onClick={() => setDifficulty(d)} 
                    className={`w-full py-3 rounded-xl border-2 font-bold transition-all capitalize ${difficulty === d ? 'border-indigo-600 bg-indigo-50 text-indigo-700 scale-105' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}
                  >
                    {d} ({COUNTS[d]} items)
                  </button>
                ))}
              </div>
            </div>

            <TimerSetup 
              timedMode={timedMode}
              setTimedMode={setTimedMode}
              timeLimit={timeLimit}
              setTimeLimit={setTimeLimit}
            />
          </>
        )}

        <button
          onClick={setupMode === 'HOST' ? handleHost : handleJoin}
          disabled={isConnecting}
          className="mt-8 w-full py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
        >
          {isConnecting ? (
            <span className="animate-pulse">Connecting...</span>
          ) : (
            <>
              {setupMode === 'HOST' ? 'Create Room' : 'Join Room'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
