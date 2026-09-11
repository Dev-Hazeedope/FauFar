/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { games } from './games/registry';
import { Dices, Volume2, VolumeX, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Illustration } from './components/Illustration';
import { OfflineIndicator } from './components/OfflineIndicator';
import { audio } from './lib/audio';

export default function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(audio.muted);
  
  const toggleMute = () => {
    audio.toggleMute();
    setIsMuted(audio.muted);
  };
  
  const GameComponent = activeGame ? games.find(g => g.id === activeGame)?.component : null;

  return (
    <div className="game-screen overflow-hidden relative">
      <PWAInstallButton />
      <OfflineIndicator />

      <AnimatePresence mode="wait">
        {GameComponent ? (
          <motion.div
            key="game-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full flex flex-col flex-1"
          >
            <GameComponent onExit={() => setActiveGame(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-4 md:p-6 max-w-5xl mx-auto w-full flex-1"
          >
            <header className="flex items-center justify-between mb-12 mt-8 bg-white border-4 border-slate-900 rounded-[2rem] p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <div className="flex items-center gap-4 pl-2 md:pl-4">
                <div className="bg-[#FF5757] p-3 border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] -rotate-6">
                  <Dices className="w-8 h-8 text-white" />
                </div>
                <h1 className="game-title text-slate-900" style={{ WebkitTextStroke: '0px', textShadow: 'none', color: '#0f172a' }}>
                  FauFar Games
                </h1>
              </div>
              <button 
                onClick={toggleMute}
                className="game-avatar hover:bg-slate-100"
                title={isMuted ? "Unmute sound" : "Mute sound"}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </header>

            <div className="mb-8">
              <h2 className="game-title-sm mb-4">Choose a game!</h2>
            </div>

            <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {games.map((game, index) => {
                const colors = ['bg-[#FF5757]', 'bg-[#5CE1E6]', 'bg-[#C1FF72]', 'bg-[#FFDE59]', 'bg-[#FF914D]'];
                const cardColor = colors[index % colors.length];
                const hexColor = ['#FF5757', '#5CE1E6', '#C1FF72', '#FFDE59', '#FF914D'][index % colors.length];
                
                const gameIllustrations: Record<string, {emoji: string, shape: any}> = {
                  'memory-pairs': { emoji: '🧠', shape: 'square' },
                  'find-the-twins': { emoji: '👯‍♀️', shape: 'blob' },
                  'number-hunt': { emoji: '🎯', shape: 'circle' },
                  'crack-the-code': { emoji: '🔐', shape: 'star' },
                  'whats-missing': { emoji: '🕵️', shape: 'blob' },
                  'secret-number': { emoji: '🤫', shape: 'square' }
                };
                const illus = gameIllustrations[game.id] || { emoji: '🎲', shape: 'blob' };

                return (
                  <motion.button
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4, type: "spring", bounce: 0.5 }}
                    className="game-card flex flex-col text-left p-0 overflow-hidden group outline-none focus:ring-4 focus:ring-slate-900 h-full"
                  >
                    <div className={`${cardColor} p-8 border-b-4 border-slate-900 flex items-center justify-center relative overflow-hidden h-48`}>
                      <Illustration emoji={illus.emoji} shape={illus.shape} color="#ffffff" className="z-10 group-hover:scale-110 transition-transform duration-300" />
                      
                      <div className="absolute top-4 right-4 bg-white/90 border-4 border-slate-900 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] z-20">
                        <Play className="w-5 h-5 ml-1 text-slate-900" />
                      </div>
                    </div>
                    <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-fredoka font-bold text-2xl text-slate-900 mb-2">
                          {game.title}
                        </h3>
                        <p className="text-slate-700 font-bold leading-snug">
                          {game.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
