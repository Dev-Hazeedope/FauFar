/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { games } from './games/registry';
import { Dices } from 'lucide-react';

export default function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame) {
    const GameComponent = games.find(g => g.id === activeGame)?.component;
    if (GameComponent) {
      return <GameComponent onExit={() => setActiveGame(null)} />;
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800 font-sans safe-area-inset">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-3 mb-10 mt-8">
          <Dices className="w-10 h-10 text-indigo-600" />
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Scatter</h1>
        </header>

        <p className="text-lg text-slate-600 mb-8 max-w-2xl">
          A collection of unhurried, browser-based visual games. 
          Share the screen, play at your own pace, and enjoy.
        </p>

        <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className="flex flex-col text-left p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group active:scale-95"
            >
              <h2 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                {game.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {game.description}
              </p>
            </button>
          ))}
        </main>
      </div>
    </div>
  );
}
