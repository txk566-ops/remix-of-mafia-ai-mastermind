import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface MemoryMatchProps {
  onComplete: () => void;
}

const SYMBOLS = ['★', '♦', '♠', '♣', '♥', '●', '▲', '■'];

export function MemoryMatch({ onComplete }: MemoryMatchProps) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [targetPosition, setTargetPosition] = useState(0);
  const [targetSymbol, setTargetSymbol] = useState('');
  const [showingSymbols, setShowingSymbols] = useState(true);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Pick 4 random symbols
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, 4);
    setSymbols(shuffled);
    
    // Pick a random position to ask about
    const pos = Math.floor(Math.random() * 4);
    setTargetPosition(pos);
    setTargetSymbol(shuffled[pos]);
    
    // Show symbols for 3 seconds
    const timer = setTimeout(() => {
      setShowingSymbols(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGuess = (symbol: string) => {
    if (symbol === targetSymbol) {
      onComplete();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 1) {
        onComplete();
      }
    }
  };

  const positionLabel = ['first', 'second', 'third', 'fourth'][targetPosition];

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <h2 className="text-2xl font-serif text-secondary">Memory Match</h2>
      
      {showingSymbols ? (
        <>
          <p className="text-muted-foreground">Memorize these symbols!</p>
          <div className="flex gap-4">
            {symbols.map((symbol, index) => (
              <div
                key={index}
                className="w-16 h-16 flex items-center justify-center bg-muted/50 rounded-lg text-4xl"
              >
                {symbol}
              </div>
            ))}
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2 max-w-xs">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-[3000ms] ease-linear"
              style={{ width: '0%' }}
              ref={(el) => {
                if (el) setTimeout(() => el.style.width = '100%', 50);
              }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            What was the <span className="text-secondary font-bold">{positionLabel}</span> symbol?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, 4).concat(symbols).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).map((symbol, index) => (
              <Button
                key={index}
                onClick={() => handleGuess(symbol)}
                variant="outline"
                className="w-20 h-20 text-4xl hover:bg-primary/20"
              >
                {symbol}
              </Button>
            ))}
          </div>
          {attempts > 0 && (
            <p className="text-primary text-sm">Not quite! One more try...</p>
          )}
        </>
      )}
    </div>
  );
}
