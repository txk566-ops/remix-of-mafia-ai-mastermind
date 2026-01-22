import React, { useState, useEffect } from 'react';
import { QuickMath } from './QuickMath';
import { TapCounter } from './TapCounter';
import { ColorMatch } from './ColorMatch';
import { MemoryMatch } from './MemoryMatch';

interface MiniGameSelectorProps {
  onComplete: () => void;
}

type MiniGameType = 'math' | 'tap' | 'color' | 'memory';

const MINI_GAMES: MiniGameType[] = ['math', 'tap', 'color', 'memory'];

export function MiniGameSelector({ onComplete }: MiniGameSelectorProps) {
  const [selectedGame, setSelectedGame] = useState<MiniGameType | null>(null);

  useEffect(() => {
    // Randomly select a mini-game
    const randomGame = MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)];
    setSelectedGame(randomGame);
  }, []);

  if (!selectedGame) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  switch (selectedGame) {
    case 'math':
      return <QuickMath onComplete={onComplete} />;
    case 'tap':
      return <TapCounter onComplete={onComplete} />;
    case 'color':
      return <ColorMatch onComplete={onComplete} />;
    case 'memory':
      return <MemoryMatch onComplete={onComplete} />;
    default:
      return <QuickMath onComplete={onComplete} />;
  }
}
