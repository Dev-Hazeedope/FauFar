import React, { useState } from 'react';
import { getSocket } from './SocketClient';
import { Home, Users, User, ArrowLeft, Play } from 'lucide-react';
import { TimerSetup } from '../../../components/TimerSetup';

interface Props {
  onBack: () => void;
  onJoinRoom: (room: any) => void;
}

export function MultiplayerSetup({ onBack, onJoinRoom }: Props) {
  const [setupMode, setSetupMode] = useState<'SELECT' | 'HOST' | 'JOIN'>('SELECT');
  
  // Host state
  const [playerName, setPlayerName] = useState('');
  const [startNum, setStartNum] = useState(1);
  const [endNum, setEndNum] = useState(100);
  const [timeLimit, setTimeLimit] = useState(5); // in minutes
  
  // Join state
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleHost = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    const range = endNum - startNum + 1;
    if (range < 100) {
      setError("Number range must be at least 100 numbers");
      return;
    }
    if (range > 250) {
      setError("Number range cannot exceed 250 numbers");
      return;
    }
    if (timeLimit <= 0 || timeLimit > 10) {
      setError("Time limit must be between 1 and 10 minutes");
      return;
    }

    setError('');
    setIsConnecting(true);
    const socket = getSocket();
    socket.emit('create_room', {
      name: playerName.trim(),
      config: { start: startNum, end: endNum, timeLimit: timeLimit * 60 }
    }, (res: any) => {
      setIsConnecting(false);
      if (res.success) {
        onJoinRoom(res.room);
      } else {
        setError(res.error || "Failed to host game");
      }
    });
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError("Please enter name and room code");
      return;
    }
    setError('');
    setIsConnecting(true);
    const socket = getSocket();
    socket.emit('join_room', {
      roomId: roomCode.trim().toUpperCase(),
      name: playerName.trim()
    }, (res: any) => {
      setIsConnecting(false);
      if (res.success) {
        onJoinRoom(res.room);
      } else {
        setError(res.error || "Failed to join game");
      }
    });
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
              <p className="text-indigo-100 text-sm">Create a room and invite friends</p>
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

      <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6">
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
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <h2 className="font-bold text-slate-800 mb-4">Number Range</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Start</label>
                  <input
                    type="number"
                    value={startNum}
                    onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">End</label>
                  <input
                    type="number"
                    value={endNum}
                    onChange={(e) => setEndNum(parseInt(e.target.value) || 100)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <h2 className="font-bold text-slate-800 mb-4">Time Limit (Minutes)</h2>
              <div>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <button
            onClick={setupMode === 'HOST' ? handleHost : handleJoin}
            disabled={isConnecting}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            {isConnecting ? 'Connecting...' : (setupMode === 'HOST' ? 'Create Room' : 'Join Room')}
          </button>
        </div>
      </div>
    </div>
  );
}
