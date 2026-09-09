import React, { useState, useEffect, useRef } from 'react';
import { Smile } from 'lucide-react';
import { sendReaction } from '../lib/reactions';

export interface ReactionData {
  emoji: string;
  senderId: string;
  timestamp: number;
}

interface Props {
  roomId: string;
  collectionName: string;
  myPlayerId: string;
  lastReaction?: ReactionData | null;
}

const EMOJIS = ['👏', '😂', '🤯', '😭', '🎉', '😡'];

export function EmojiReactions({ roomId, collectionName, myPlayerId, lastReaction }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string, emoji: string, isMe: boolean }[]>([]);
  
  const lastProcessedRef = useRef<number>(0);

  useEffect(() => {
    if (!lastReaction) return;
    if (lastReaction.timestamp > lastProcessedRef.current) {
      lastProcessedRef.current = lastReaction.timestamp;
      
      const isMe = lastReaction.senderId === myPlayerId;
      const id = `${lastReaction.timestamp}-${Math.random()}`;
      
      setFloatingEmojis(prev => [...prev, { id, emoji: lastReaction.emoji, isMe }]);
      
      // Remove after animation (2s)
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== id));
      }, 2000);
    }
  }, [lastReaction, myPlayerId]);

  const handleSend = (emoji: string) => {
    setIsOpen(false);
    sendReaction(collectionName, roomId, myPlayerId, emoji);
  };

  return (
    <>
      {/* Floating animations container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((anim) => (
          <div
            key={anim.id}
            className={`absolute bottom-20 text-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000 slide-out-to-top-20 fade-out fill-mode-forwards ${anim.isMe ? 'right-10' : 'left-10'}`}
            style={{
              animation: `floatUpAndFade 2s ease-out forwards`
            }}
          >
            {anim.emoji}
          </div>
        ))}
      </div>

      {/* Emoji Picker Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex gap-2 animate-in zoom-in-95 origin-bottom-right">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => handleSend(e)}
                className="w-10 h-10 text-2xl flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors active:scale-90"
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${isOpen ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Smile className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        @keyframes floatUpAndFade {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-150px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
