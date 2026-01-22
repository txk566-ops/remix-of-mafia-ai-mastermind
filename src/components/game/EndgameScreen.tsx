import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { generateNarration, getPhaseInstruction } from '@/services/narratorService';
import { Trophy, Skull, RotateCcw, Crown, Users, Shield, Search, RefreshCw } from 'lucide-react';
import { Role } from '@/types/game';

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  Mafia: <Skull className="w-6 h-6" />,
  Detective: <Search className="w-6 h-6" />,
  Doctor: <Shield className="w-6 h-6" />,
  Villager: <Users className="w-6 h-6" />,
};

export function EndgameScreen() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    const fetchFinalNarration = async () => {
      dispatch({ type: 'SET_IS_NARRATING', isNarrating: true });
      const { events, instruction } = getPhaseInstruction(state);
      const narration = await generateNarration({
        state,
        publicEvents: [...events, `${state.winner === 'village' ? 'The village' : 'The Mafia'} has won!`],
        instruction: 'Announce the winner dramatically and reveal all roles.',
      });
      dispatch({ type: 'SET_NARRATION', narration });
      dispatch({ type: 'SET_IS_NARRATING', isNarrating: false });
    };

    fetchFinalNarration();
  }, []);

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const handleNewGame = () => {
    dispatch({ type: 'FULL_RESET' });
  };

  const villageWon = state.winner === 'village';

  return (
    <div className="min-h-screen bg-gradient-night p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Winner Announcement */}
        <div className="text-center space-y-4">
          <div className={`flex items-center justify-center gap-4 ${villageWon ? 'text-secondary' : 'text-primary'}`}>
            {villageWon ? (
              <Crown className="w-16 h-16 animate-pulse-slow" />
            ) : (
              <Skull className="w-16 h-16 animate-pulse-slow" />
            )}
          </div>
          <h1 className={`text-5xl font-serif font-bold ${villageWon ? 'text-gradient-gold' : 'text-gradient-danger'}`}>
            {villageWon ? 'Village Wins!' : 'Mafia Wins!'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {villageWon
              ? 'Justice prevailed. The Mafia has been eliminated!'
              : 'Darkness descends. The Mafia has taken control!'}
          </p>
        </div>

        {/* Narrator Final Words */}
        <div className="mafia-card">
          <h2 className="text-xl font-serif text-secondary mb-4">The Narrator's Finale</h2>
          <div className="bg-muted/50 rounded-lg p-4 min-h-[100px]">
            {state.isNarrating ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-pulse">●</div>
                <span>The narrator speaks one last time...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                {state.narration}
              </p>
            )}
          </div>
        </div>

        {/* Role Reveal */}
        <div className="mafia-card">
          <h2 className="text-xl font-serif text-secondary mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            All Roles Revealed
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {state.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 ${
                  player.role === 'Mafia'
                    ? 'border-primary bg-primary/10'
                    : player.role === 'Detective'
                    ? 'border-accent bg-accent/10'
                    : player.role === 'Doctor'
                    ? 'border-mafia-safe bg-mafia-safe/10'
                    : 'border-secondary bg-secondary/10'
                } ${!player.isAlive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={
                    player.role === 'Mafia'
                      ? 'text-primary'
                      : player.role === 'Detective'
                      ? 'text-accent'
                      : player.role === 'Doctor'
                      ? 'text-mafia-safe'
                      : 'text-secondary'
                  }>
                    {ROLE_ICONS[player.role!]}
                  </span>
                  <span className="font-medium truncate">{player.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-serif">{player.role}</span>
                  {!player.isAlive && (
                    <span className="text-xs text-muted-foreground">☠️</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="mafia-card">
          <h2 className="text-xl font-serif text-secondary mb-4">Game Statistics</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold text-foreground">{state.currentRound}</p>
              <p className="text-sm text-muted-foreground">Rounds Played</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold text-foreground">
                {state.players.filter(p => !p.isAlive).length}
              </p>
              <p className="text-sm text-muted-foreground">Eliminated</p>
            </div>
          </div>
        </div>

        {/* Play Again Options */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handlePlayAgain}
            className="flex-1 py-6 text-lg font-serif bg-gradient-gold text-secondary-foreground hover:opacity-90 mafia-glow-gold"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again (Same Players)
          </Button>
          <Button
            onClick={handleNewGame}
            variant="outline"
            className="flex-1 py-6 text-lg font-serif border-2 hover:bg-muted"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
