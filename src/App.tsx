/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { games } from './games/registry';
import { Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  
  const GameComponent = activeGame ? games.find(g => g.id === activeGame)?.component : null;

  return (
    <div className="min-h-[100dvh] bg-[#fdfbf7] text-slate-800 font-sans safe-area-inset overflow-hidden relative">
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
            className="w-full h-full"
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
            className="p-6 max-w-4xl mx-auto min-h-[100dvh]"
          >
            <header className="flex items-center justify-between mb-10 mt-8">
              <div className="flex items-center gap-3">
                <Dices className="w-10 h-10 text-indigo-600" />
                <h1 className="text-4xl font-black tracking-tight text-slate-900">FauFar Games</h1>
              </div>
            </header>

            <p className="text-lg text-slate-600 mb-8 max-w-2xl">
              A collection of unhurried, browser-based visual games. 
              Share the screen, play at your own pace, and enjoy.
            </p>

            <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game, index) => (
                <motion.button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col text-left p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:-translate-y-1 hover:shadow-md transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <game.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {game.description}
                  </p>
                </motion.button>
              ))}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
