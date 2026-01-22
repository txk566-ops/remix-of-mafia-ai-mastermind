import React from 'react';
import { QuickMath } from './QuickMath';

interface MiniGameSelectorProps {
  onComplete: () => void;
}

export function MiniGameSelector({ onComplete }: MiniGameSelectorProps) {
  return <QuickMath onComplete={onComplete} />;
}
