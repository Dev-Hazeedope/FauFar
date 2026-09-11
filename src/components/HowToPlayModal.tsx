import React, { useEffect, useState } from 'react';
import { X, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  instructions: string[];
}

export function HowToPlayModal({ isOpen, onClose, title, instructions }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-slate-900 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="p-6 border-b-4 border-slate-900 flex items-center justify-between bg-[#C1FF72]">
          <h2 className="game-title-sm !text-slate-900 !stroke-none !shadow-none flex items-center gap-2">
            <Info className="w-8 h-8 text-slate-900" />
            How to Play
          </h2>
          <button 
            onClick={onClose}
            className="game-avatar w-10 h-10 hover:bg-[#FF5757] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6">
          <h3 className="font-outfit text-2xl font-black text-slate-900 mb-4">{title}</h3>
          <ul className="space-y-4">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-700 font-bold text-lg">
                <span className="flex-shrink-0 w-8 h-8 border-4 border-slate-900 rounded-full bg-[#FFDE59] text-slate-900 flex items-center justify-center text-sm font-black mt-0.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  {index + 1}
                </span>
                <span className="leading-snug">{instruction}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={onClose}
            className="w-full mt-8 py-4 text-xl game-button-primary"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
