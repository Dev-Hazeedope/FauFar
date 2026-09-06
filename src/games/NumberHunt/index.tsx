import React, { useState } from 'react';
import { GameState, GameConfig } from './types';
import { Setup } from './Setup';
import { Gameplay } from './Gameplay';
import { Completion } from './Completion';

interface Props {
  onExit: () => void;
}

export function NumberHunt({ onExit }: Props) {
  const [state, setState] = useState<GameState>('SETUP');
  // Default range 1-40. We could sniff viewport and make it 1-20 for very small screens,
  // but let's stick to the requirement: "Use 1-40 as the initial default where it fits".
  const [config, setConfig] = useState<GameConfig>({ start: 1, end: 40, timedMode: false });
  const [won, setWon] = useState(true);

  switch (state) {
    case 'SETUP':
      return (
        <Setup
          initialConfig={config}
          onStart={(c) => {
            setConfig(c);
            setState('PLAYING');
          }}
          onBack={onExit}
        />
      );
    case 'PLAYING':
      return (
        <Gameplay
          config={config}
          onChangeRange={() => setState('SETUP')}
          onHome={onExit}
          onComplete={(didWin) => {
            setWon(didWin);
            setState('COMPLETED');
          }}
        />
      );
    case 'COMPLETED':
      return (
        <Completion
          won={won}
          onPlayAgain={() => setState('PLAYING')}
          onChangeRange={() => setState('SETUP')}
        />
      );
    default:
      return null;
  }
}
