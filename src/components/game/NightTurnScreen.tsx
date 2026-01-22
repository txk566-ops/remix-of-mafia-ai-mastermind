import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Player, DetectiveResult } from '@/types/game';
import { Moon, ArrowRight, Eye, EyeOff, XCircle } from 'lucide-react';
import { NightActionScreen } from './NightActionScreen';
import { MiniGameSelector } from './mini-games/MiniGameSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type TurnState = 'waiting' | 'ready' | 'action' | 'complete';

export function NightTurnScreen() {
  const { state, dispatch } = useGame();
  const [turnOrder, setTurnOrder] = useState<Player[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [turnState, setTurnState] = useState<TurnState>('waiting');
  const [completedActions, setCompletedActions] = useState<Record<string, { targetId?: string; result?: DetectiveResult }>>({});

  // Initialize turn order (shuffle alive players)
  useEffect(() => {
    const alivePlayers = state.players.filter(p => p.isAlive);
    const shuffled = [...alivePlayers].sort(() => Math.random() - 0.5);
    setTurnOrder(shuffled);
    setCurrentTurnIndex(0);
    setTurnState('waiting');
    setCompletedActions({});
  }, [state.currentRound]);

  const currentPlayer = turnOrder[currentTurnIndex];
  const alivePlayers = state.players.filter(p => p.isAlive);
  const isLastPlayer = currentTurnIndex === turnOrder.length - 1;

  const handleEndGame = () => {
    dispatch({ type: 'FULL_RESET' });
  };

  const handleReady = () => {
    setTurnState('action');
  };

  const handleActionComplete = useCallback((action?: { targetId?: string; result?: DetectiveResult }) => {
    if (!currentPlayer) return;

    // Store the action
    if (action?.targetId) {
      setCompletedActions(prev => ({
        ...prev,
        [currentPlayer.id]: action,
      }));

      // Dispatch to game state based on role
      if (currentPlayer.role === 'Mafia') {
        dispatch({ type: 'SET_MAFIA_TARGET', targetId: action.targetId });
      } else if (currentPlayer.role === 'Detective' && action.result) {
        dispatch({ type: 'SET_DETECTIVE_TARGET', targetId: action.targetId });
        dispatch({ type: 'ADD_DETECTIVE_RESULT', result: action.result });
      } else if (currentPlayer.role === 'Doctor') {
        dispatch({ type: 'SET_DOCTOR_TARGET', targetId: action.targetId });
      }
    }

    setTurnState('complete');
  }, [currentPlayer, dispatch]);

  const handleNextPlayer = () => {
    if (isLastPlayer) {
      // All players done - resolve night
      dispatch({ type: 'RESOLVE_NIGHT' });
    } else {
      setCurrentTurnIndex(prev => prev + 1);
      setTurnState('waiting');
    }
  };

  // End Game Button component
  const EndGameButton = () => (
    <div className="absolute top-4 right-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <XCircle className="w-5 h-5 mr-1" />
            End Game
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end the game? This will return everyone to the setup screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndGame} className="bg-primary hover:bg-primary/90">
              End Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  // Waiting screen - "Pass phone to [Name]"
  if (turnState === 'waiting' && currentPlayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night p-6 space-y-8 relative">
        <EndGameButton />
        <Moon className="w-16 h-16 text-mafia-purple animate-pulse" />
        
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">Night falls upon the village...</p>
          <h1 className="text-4xl font-serif text-foreground">
            Pass the phone to
          </h1>
          <p className="text-5xl font-bold text-secondary">
            {currentPlayer.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <EyeOff className="w-5 h-5" />
          <span className="text-sm">Make sure no one else can see the screen</span>
        </div>
        
        <Button
          onClick={handleReady}
          className="py-6 px-12 text-xl bg-gradient-mystery hover:opacity-90"
        >
          <Eye className="w-6 h-6 mr-3" />
          I'm {currentPlayer.name} - Show My Role
        </Button>
        
        <div className="flex gap-2 mt-8">
          {turnOrder.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index < currentTurnIndex 
                  ? 'bg-mafia-safe' 
                  : index === currentTurnIndex 
                  ? 'bg-secondary w-6' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Action screen - Role-specific action or mini-game
  if (turnState === 'action' && currentPlayer) {
    const isSpecialRole = ['Mafia', 'Detective', 'Doctor'].includes(currentPlayer.role || '');
    
    if (isSpecialRole) {
      return (
        <NightActionScreen
          player={currentPlayer}
          alivePlayers={alivePlayers}
          allPlayers={state.players}
          existingMafiaTarget={state.nightActions.mafiaTarget}
          onComplete={handleActionComplete}
        />
      );
    } else {
      // Villager gets a mini-game
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night">
          <div className="absolute top-6 left-0 right-0 text-center">
            <p className="text-muted-foreground">Your role:</p>
            <p className="text-xl font-serif text-foreground">Villager</p>
            <p className="text-sm text-muted-foreground mt-1">Complete this task while others take their actions</p>
          </div>
          
          <MiniGameSelector onComplete={() => handleActionComplete()} />
        </div>
      );
    }
  }

  // Complete screen - "Done, pass to next player"
  if (turnState === 'complete' && currentPlayer) {
    const nextPlayer = turnOrder[currentTurnIndex + 1];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night p-6 space-y-8 relative">
        <EndGameButton />
        <div className="text-mafia-safe text-6xl animate-scale-in">✓</div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-foreground">
            {currentPlayer.name}'s turn complete
          </h2>
          {isLastPlayer ? (
            <p className="text-muted-foreground">All players have acted. The night ends...</p>
          ) : (
            <p className="text-muted-foreground">
              Pass the phone to <span className="text-secondary font-bold">{nextPlayer?.name}</span>
            </p>
          )}
        </div>
        
        <Button
          onClick={handleNextPlayer}
          className="py-6 px-12 text-xl bg-gradient-gold text-secondary-foreground hover:opacity-90"
        >
          <ArrowRight className="w-6 h-6 mr-3" />
          {isLastPlayer ? 'End Night' : 'Next Player'}
        </Button>
        
        <div className="flex gap-2 mt-8">
          {turnOrder.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index <= currentTurnIndex 
                  ? 'bg-mafia-safe' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
