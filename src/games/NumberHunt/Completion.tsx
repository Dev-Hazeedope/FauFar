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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-[#fdfbf7] text-slate-800">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center"
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
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {won ? 'All numbers found!' : "Time's up!"}
        </h1>
        <p className="text-slate-600 mb-8 text-lg">
          {won ? 'Great job clearing the board.' : 'You ran out of time before clearing the board.'}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onPlayAgain}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-lg transition-colors shadow-sm"
          >
            Play Again
          </button>
          <button 
            onClick={onChangeRange}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-lg transition-colors"
          >
            Change Range
          </button>
        </div>
      </motion.div>
    </div>
  );
}
