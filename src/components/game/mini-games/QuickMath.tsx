import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface QuickMathProps {
  onComplete: () => void;
}

export function QuickMath({ onComplete }: QuickMathProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const a = Math.floor(Math.random() * 15) + 3;
    const b = Math.floor(Math.random() * 15) + 3;
    setNum1(a);
    setNum2(b);
    
    const correct = a + b;
    const wrongAnswers = [
      correct + Math.floor(Math.random() * 5) + 1,
      correct - Math.floor(Math.random() * 5) - 1,
      correct + Math.floor(Math.random() * 10) - 5,
    ].filter(n => n !== correct && n > 0);
    
    const allOptions = [correct, ...wrongAnswers.slice(0, 3)];
    setOptions(allOptions.sort(() => Math.random() - 0.5));
  }, []);

  const handleAnswer = (answer: number) => {
    if (answer === num1 + num2) {
      onComplete();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        onComplete(); // Let them pass after 3 attempts
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <h2 className="text-2xl font-serif text-secondary">Quick Math</h2>
      <p className="text-muted-foreground">Solve this to continue</p>
      
      <div className="text-5xl font-bold text-foreground">
        {num1} + {num2} = ?
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswer(option)}
            variant="outline"
            className="py-8 text-2xl font-bold hover:bg-primary/20"
          >
            {option}
          </Button>
        ))}
      </div>
      
      {attempts > 0 && (
        <p className="text-primary text-sm">Try again! ({3 - attempts} attempts left)</p>
      )}
    </div>
  );
}
