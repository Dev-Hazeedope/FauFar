import React, { useState } from 'react';
import { Home, Users, User, ArrowLeft, Play } from 'lucide-react';
import { createRoom, joinRoom } from './MultiplayerManager';

interface Props {
  onBack: () => void;
  onJoinRoom: (room: any) => void;
}

const AVATARS = ['🦊', '🐰', '🐼', '🐯', '🐸', '🐶', '🐱', '🐮', 'Ko', '🐷'];

export function MultiplayerSetup({ onBack, onJoinRoom }: Props) {
  const [setupMode, setSetupMode] = useState<'SELECT' | 'HOST' | 'JOIN'>('SELECT');
  
  // Host state
  const [playerName, setPlayerName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(1000);
  
  // Join state
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleHost = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (minNum >= maxNum) {
      setError("Max must be greater than Min");
      return;
    }
    
    if (minNum < 0 || maxNum > 9999) {
      setError("Range must be between 0 and 9999");
      return;
    }

    setError('');
    setIsConnecting(true);
    
    try {
      const room = await createRoom(playerName.trim(), avatar, {
        min: minNum,
        max: maxNum
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
      <div className="game-screen">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none">Multiplayer</h1>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-4">
          <button
            onClick={() => setSetupMode('HOST')}
            className="game-card bg-[#5CE1E6] p-8 flex items-center gap-6 w-full cursor-pointer"
          >
            <div className="w-16 h-16 bg-white shadow-[2px_2px_0_0_#0f172a] border-4 border-slate-900 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-1">Host Game</h2>
              <p className="text-slate-800 text-sm">Create a room and invite friends</p>
            </div>
          </button>

          <button
            onClick={() => setSetupMode('JOIN')}
            className="game-card bg-[#C1FF72] p-8 flex items-center gap-6 w-full cursor-pointer"
          >
            <div className="w-16 h-16 bg-white shadow-[2px_2px_0_0_#0f172a] border-4 border-slate-900 rounded-2xl flex items-center justify-center shrink-0">
              <Play className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-1">Join Game</h2>
              <p className="text-slate-800 text-sm">Enter a code to join</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => { setSetupMode('SELECT'); setError(''); }} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none">
          {setupMode === 'HOST' ? 'Host Game' : 'Join Game'}
        </h1>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6">
        {error && (
          <div className="p-4 bg-[#FF5757] text-white border-4 border-slate-900 font-bold rounded-2xl shadow-[4px_4px_0_0_#0f172a]">
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
            className="w-full game-input"
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
                className={`w-12 h-12 text-2xl flex items-center justify-center rounded-2xl border-4 transition-all shadow-[2px_2px_0_0_#0f172a] ${avatar === a ? 'border-slate-900 bg-[#FFDE59] scale-110' : 'border-slate-900 bg-white hover:bg-slate-100 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#0f172a]'}`}
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
              className="w-full game-input uppercase tracking-widest"
              maxLength={6}
            />
          </div>
        )}

        {setupMode === 'HOST' && (
          <div className="space-y-6">
            <div className="game-panel">
              <h2 className="font-bold text-slate-800 mb-4">Number Range</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Min (0+)</label>
                  <input
                    type="number"
                    value={minNum}
                    onChange={(e) => setMinNum(parseInt(e.target.value) || 0)}
                    className="w-full game-input text-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Max (up to 9999)</label>
                  <input
                    type="number"
                    value={maxNum}
                    onChange={(e) => setMaxNum(parseInt(e.target.value) || 1000)}
                    className="w-full game-input text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <button
            onClick={setupMode === 'HOST' ? handleHost : handleJoin}
            disabled={isConnecting}
            className="w-full py-4 text-xl game-button-primary disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : (setupMode === 'HOST' ? 'Create Room' : 'Join Room')}
          </button>
        </div>
      </div>
    </div>
  );
}
