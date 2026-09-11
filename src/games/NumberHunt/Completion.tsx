import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { audio } from '../../lib/audio';
import { PartyPopper, Timer } from 'lucide-react';

interface Props {
  won: boolean;
  onPlayAgain: () => void;
  onChangeRange: () => void;
}

export function Completion({ won, onPlayAgain, onChangeRange }: Props) {
  useEffect(() => {
    if (won) {
      audio.playComplete();
    } else {
      audio.playWrong();
    }
  }, [won]);

  return (
    <div className="game-screen items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md game-panel text-center"
      >
        <motion.div 
          initial={{ rotate: won ? -15 : 0 }}
          animate={{ rotate: won ? 15 : 0 }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.5 }}
          className={`inline-block mb-4 ${won ? 'text-indigo-500' : 'text-red-500'}`}
        >
          {won ? (
            <PartyPopper className="w-16 h-16 mx-auto" />
          ) : (
            <Timer className="w-16 h-16 mx-auto" />
          )}
        </motion.div>
        
        <h1 className="game-title-sm !text-slate-900 !stroke-none !shadow-none mb-2">
          {won ? 'All numbers found!' : "Time's up!"}
        </h1>
        <p className="text-slate-600 mb-8 text-lg">
          {won ? 'Great job clearing the board.' : 'You ran out of time before clearing the board.'}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onPlayAgain}
            className="w-full py-4 game-button-primary"
          >
            Play Again
          </button>
          <button 
            onClick={onChangeRange}
            className="w-full py-4 game-button-secondary"
          >
            Change Range
          </button>
        </div>
      </motion.div>
    </div>
  );
}
