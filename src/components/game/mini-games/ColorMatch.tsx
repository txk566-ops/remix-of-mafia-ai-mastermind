import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ColorMatchProps {
  onComplete: () => void;
}

const COLORS = [
  { name: 'RED', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'BLUE', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'GREEN', bg: 'bg-green-500', text: 'text-green-500' },
  { name: 'YELLOW', bg: 'bg-yellow-500', text: 'text-yellow-500' },
];

export function ColorMatch({ onComplete }: ColorMatchProps) {
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [shuffledColors, setShuffledColors] = useState(COLORS);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(target);
    setShuffledColors([...COLORS].sort(() => Math.random() - 0.5));
  }, []);

  const handleColorClick = (colorName: string) => {
    if (colorName === targetColor.name) {
      onComplete();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        onComplete();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <h2 className="text-2xl font-serif text-secondary">Color Match</h2>
      
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">Tap the</p>
        <p className={`text-4xl font-bold ${targetColor.text}`}>{targetColor.name}</p>
        <p className="text-muted-foreground">button</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {shuffledColors.map((color, index) => (
          <Button
            key={index}
            onClick={() => handleColorClick(color.name)}
            className={`py-12 ${color.bg} hover:opacity-80 transition-opacity`}
          />
        ))}
      </div>
      
      {attempts > 0 && (
        <p className="text-primary text-sm">Wrong color! Try again</p>
      )}
    </div>
  );
}
