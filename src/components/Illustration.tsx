import React from 'react';
import { motion } from 'motion/react';

interface Props {
  emoji: string;
  color: string;
  className?: string;
  shape?: 'blob' | 'circle' | 'square' | 'star';
}

export function Illustration({ emoji, color, className = '', shape = 'circle' }: Props) {
  const getShapeClasses = () => {
    switch (shape) {
      case 'blob':
        return 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]';
      case 'square':
        return 'rounded-3xl rotate-6';
      case 'star':
        return 'rounded-xl rotate-45';
      case 'circle':
      default:
        return 'rounded-full';
    }
  };

  return (
    <motion.div 
      className={`relative flex items-center justify-center w-32 h-32 border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] ${getShapeClasses()} ${className}`}
      style={{ backgroundColor: color }}
      whileHover={{ scale: 1.05, rotate: shape === 'square' ? 0 : 5 }}
      transition={{ type: 'spring', bounce: 0.5 }}
    >
      <span 
        className={`text-6xl drop-shadow-md ${shape === 'star' ? '-rotate-45' : ''}`}
        style={{ filter: 'drop-shadow(2px 4px 0px rgba(0,0,0,0.2))' }}
      >
        {emoji}
      </span>
    </motion.div>
  );
}
