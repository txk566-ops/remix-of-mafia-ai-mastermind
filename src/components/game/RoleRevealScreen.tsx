import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Check, ArrowRight, Skull, Shield, Search, Users } from 'lucide-react';
import { Role } from '@/types/game';

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  Mafia: <Skull className="w-16 h-16" />,
  Detective: <Search className="w-16 h-16" />,
  Doctor: <Shield className="w-16 h-16" />,
  Villager: <Users className="w-16 h-16" />,
};

const ROLE_COLORS: Record<Role, string> = {
  Mafia: 'text-primary-foreground bg-gradient-danger',
  Detective: 'text-accent-foreground bg-gradient-mystery',
  Doctor: 'text-primary-foreground bg-mafia-safe',
  Villager: 'text-secondary-foreground bg-gradient-gold',
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Mafia: 'Eliminate the villagers without getting caught. Vote with the Mafia at night.',
  Detective: 'Investigate one player each night to learn if they are Mafia.',
  Doctor: 'Protect one player each night from the Mafia\'s attack.',
  Villager: 'Find and eliminate the Mafia through discussion and voting.',
};

export function RoleRevealScreen() {
  const { state, dispatch } = useGame();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isRoleVisible, setIsRoleVisible] = useState(false);

  const selectedPlayer = state.players.find(p => p.id === selectedPlayerId);
  const allRevealed = state.players.every(p => p.hasRevealedRole);

  const handlePlayerSelect = (playerId: string) => {
    const player = state.players.find(p => p.id === playerId);
    if (player && !player.hasRevealedRole) {
      setSelectedPlayerId(playerId);
      setIsRoleVisible(false);
    }
  };

  const handleRevealRole = () => {
    setIsRoleVisible(true);
  };

  const handleDone = () => {
    if (selectedPlayerId) {
      dispatch({ type: 'REVEAL_ROLE', playerId: selectedPlayerId });
      setSelectedPlayerId(null);
      setIsRoleVisible(false);
    }
  };

  const handleContinue = () => {
    dispatch({ type: 'ALL_ROLES_REVEALED' });
  };

  // Show role reveal card
  if (selectedPlayer && !selectedPlayer.hasRevealedRole) {
    return (
      <div className="min-h-screen bg-gradient-night p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-8 animate-scale-in">
          <div className="text-center">
            <h2 className="text-3xl font-serif text-secondary mb-2">{selectedPlayer.name}</h2>
            <p className="text-muted-foreground">
              {isRoleVisible ? 'Remember your role!' : 'Tap to reveal your role'}
            </p>
          </div>

          <div 
            className={`relative aspect-[3/4] rounded-2xl border-2 border-border overflow-hidden cursor-pointer transition-all duration-500 ${
              isRoleVisible ? 'mafia-glow-red' : 'hover:border-primary/50'
            }`}
            onClick={!isRoleVisible ? handleRevealRole : undefined}
          >
            {!isRoleVisible ? (
              <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-danger flex items-center justify-center animate-pulse-slow">
                  <Eye className="w-12 h-12 text-primary-foreground" />
                </div>
                <p className="text-lg font-serif text-muted-foreground">Tap to Reveal</p>
              </div>
            ) : (
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 ${ROLE_COLORS[selectedPlayer.role!]}`}>
                <div className="text-primary-foreground opacity-90">
                  {ROLE_ICONS[selectedPlayer.role!]}
                </div>
                <h3 className="text-4xl font-serif font-bold text-primary-foreground">
                  {selectedPlayer.role}
                </h3>
                <p className="text-center text-primary-foreground/80 text-sm">
                  {ROLE_DESCRIPTIONS[selectedPlayer.role!]}
                </p>
                {selectedPlayer.role === 'Mafia' && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-primary-foreground/60 mb-2">Other Mafia members:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {state.players
                        .filter(p => p.role === 'Mafia' && p.id !== selectedPlayer.id)
                        .map(p => (
                          <span key={p.id} className="text-sm bg-black/30 px-3 py-1 rounded-full">
                            {p.name}
                          </span>
                        ))}
                      {state.players.filter(p => p.role === 'Mafia').length === 1 && (
                        <span className="text-sm text-primary-foreground/60">You work alone</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isRoleVisible && (
            <Button
              onClick={handleDone}
              className="w-full py-4 text-lg font-serif bg-gradient-gold text-secondary-foreground hover:opacity-90"
            >
              <EyeOff className="w-5 h-5 mr-2" />
              Hide & Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show player selection grid
  return (
    <div className="min-h-screen bg-gradient-night p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold text-gradient-danger">
            Role Reveal
          </h1>
          <p className="text-muted-foreground">
            Each player tap your name to see your secret role
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {state.players.map((player, index) => (
            <button
              key={player.id}
              onClick={() => handlePlayerSelect(player.id)}
              disabled={player.hasRevealedRole}
              className={`p-4 rounded-xl border-2 transition-all animate-slide-up ${
                player.hasRevealedRole
                  ? 'border-mafia-safe/50 bg-mafia-safe/10 opacity-60'
                  : 'border-border bg-card hover:border-primary hover:mafia-glow-red cursor-pointer'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center gap-2">
                {player.hasRevealedRole ? (
                  <Check className="w-8 h-8 text-mafia-safe" />
                ) : (
                  <Eye className="w-8 h-8 text-primary" />
                )}
                <span className="font-medium truncate max-w-full">{player.name}</span>
                <span className="text-xs text-muted-foreground">
                  {player.hasRevealedRole ? 'Revealed' : 'Tap to reveal'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {allRevealed && (
          <Button
            onClick={handleContinue}
            className="w-full py-6 text-xl font-serif bg-gradient-danger hover:opacity-90 mafia-glow-red animate-scale-in"
          >
            <ArrowRight className="w-6 h-6 mr-2" />
            Begin the Night
          </Button>
        )}

        {!allRevealed && (
          <p className="text-center text-muted-foreground">
            {state.players.filter(p => !p.hasRevealedRole).length} player(s) remaining
          </p>
        )}
      </div>
    </div>
  );
}
