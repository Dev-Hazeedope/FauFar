import { ComponentType } from 'react';
import { NumberHunt } from './NumberHunt';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType<{ onExit: () => void }>;
}

export const games: GameDefinition[] = [
  {
    id: 'number-hunt',
    title: 'Number Hunt',
    description: 'Find scattered numbers in the correct order. Play at your own pace.',
    component: NumberHunt,
  },
];
