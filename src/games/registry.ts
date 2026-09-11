import { ComponentType } from 'react';
import { 
  Dices, Target, Copy, LayoutGrid, PackageOpen, 
  Eye, Lock, Shapes, Coins, MousePointerClick 
} from 'lucide-react';
import { NumberHunt } from './NumberHunt';

import { FindTheTwins } from './FindTheTwins';
import { MemoryPairs } from './MemoryPairs';
import { WhatsMissing } from './WhatsMissing';
import { SecretNumber } from './SecretNumber';
import { CrackTheCode } from './CrackTheCode';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType<{ onExit: () => void }>;
}

export const games: GameDefinition[] = [
  {
    id: 'number-hunt',
    title: 'Number Hunt',
    description: 'Find scattered numbers in the correct order. Play at your own pace.',
    icon: Target,
    component: NumberHunt,
  },
  {
    id: 'find-the-twins',
    title: 'Find the Twins',
    description: 'Exactly two symbols are identical. Find the matching pair.',
    icon: Copy,
    component: FindTheTwins,
  },
  {
    id: 'memory-pairs',
    title: 'Memory Pairs',
    description: 'Find matching pairs. Play solo or with a friend.',
    icon: LayoutGrid,
    component: MemoryPairs,
  },
  {
    id: 'whats-missing',
    title: 'What\'s Missing?',
    description: 'Study a group of objects and identify what disappeared.',
    icon: PackageOpen,
    component: WhatsMissing,
  },
  {
    id: 'secret-number',
    title: 'Secret Number',
    description: 'Guess a hidden number based on higher/lower clues.',
    icon: Dices,
    component: SecretNumber,
  },
  {
    id: 'crack-the-code',
    title: 'Crack the Code',
    description: 'Deduce the secret 4-digit code using logic clues.',
    icon: Lock,
    component: CrackTheCode,
  },
];
