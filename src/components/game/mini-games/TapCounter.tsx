import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TapCounterProps {
  onComplete: () => void;
}

export function TapCounter({ onComplete }: TapCounterProps) {
  const [taps, setTaps] = useState(0);
  const targetTaps = 10;

  const handleTap = () => {
    const newTaps = taps + 1;
    setTaps(newTaps);
    if (newTaps >= targetTaps) {
      setTimeout(onComplete, 300);
    }
  };

  const progress = (taps / targetTaps) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <h2 className="text-2xl font-serif text-secondary">Tap Fast!</h2>
      <p className="text-muted-foreground">Tap the button {targetTaps} times</p>
      
      <div className="relative w-48 h-48">
        <Button
          onClick={handleTap}
          className="w-full h-full rounded-full bg-gradient-danger hover:scale-105 transition-transform text-3xl font-bold"
        >
          {taps}/{targetTaps}
        </Button>
        
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="96"
            cy="96"
            r="90"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="4"
            strokeDasharray={`${progress * 5.65} 565`}
          />
        </svg>
      </div>
      
      {taps >= targetTaps && (
        <p className="text-mafia-safe text-xl font-bold animate-scale-in">Complete!</p>
      )}
    </div>
  );
}
