import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Player, Role, DetectiveResult } from '@/types/game';
import { Skull, Search, Shield, Check, Users } from 'lucide-react';

interface NightActionScreenProps {
  player: Player;
  alivePlayers: Player[];
  allPlayers: Player[];
  existingMafiaTarget: string | null;
  onComplete: (action?: { targetId: string; result?: DetectiveResult }) => void;
}

export function NightActionScreen({ player, alivePlayers, allPlayers, existingMafiaTarget, onComplete }: NightActionScreenProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [detectiveResult, setDetectiveResult] = useState<DetectiveResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Get other mafia members for mafia players
  const otherMafia = allPlayers.filter(p => 
    p.role === 'Mafia' && p.id !== player.id && p.isAlive
  );

  // Get the target name if already set by another mafia
  const existingTargetPlayer = existingMafiaTarget 
    ? alivePlayers.find(p => p.id === existingMafiaTarget)
    : null;

  // Filter out self for targeting (except doctor can protect self)
  const validTargets = alivePlayers.filter(p => {
    if (player.role === 'Doctor') return true; // Doctor can protect anyone including self
    return p.id !== player.id;
  });

  const handleConfirm = () => {
    if (!selectedTarget) return;
    
    if (player.role === 'Detective') {
      // Show investigation result
      const target = alivePlayers.find(p => p.id === selectedTarget);
      if (target) {
        const result: DetectiveResult = {
          playerId: player.id,
          targetId: target.id,
          targetName: target.name,
          isMafia: target.role === 'Mafia',
        };
        setDetectiveResult(result);
        setConfirmed(true);
      }
    } else {
      // Mafia or Doctor - just confirm and complete
      setConfirmed(true);
      setTimeout(() => {
        onComplete({ targetId: selectedTarget });
      }, 500);
    }
  };

  const handleDismissResult = () => {
    if (detectiveResult) {
      onComplete({ targetId: selectedTarget!, result: detectiveResult });
    }
  };

  const handleMafiaAcknowledge = () => {
    // Second mafia acknowledges the target without changing it
    setConfirmed(true);
    setTimeout(() => {
      onComplete(); // Complete without setting a new target
    }, 500);
  };

  const getRoleIcon = () => {
    switch (player.role) {
      case 'Mafia': return <Skull className="w-8 h-8 text-primary" />;
      case 'Detective': return <Search className="w-8 h-8 text-accent" />;
      case 'Doctor': return <Shield className="w-8 h-8 text-mafia-safe" />;
      default: return null;
    }
  };

  const getRoleColor = () => {
    switch (player.role) {
      case 'Mafia': return 'text-primary';
      case 'Detective': return 'text-accent';
      case 'Doctor': return 'text-mafia-safe';
      default: return 'text-foreground';
    }
  };

  const getActionText = () => {
    switch (player.role) {
      case 'Mafia': return 'Choose your victim';
      case 'Detective': return 'Choose who to investigate';
      case 'Doctor': return 'Choose who to protect';
      default: return 'Select a player';
    }
  };

  const getConfirmText = () => {
    switch (player.role) {
      case 'Mafia': return 'Confirm Kill';
      case 'Detective': return 'Investigate';
      case 'Doctor': return 'Protect';
      default: return 'Confirm';
    }
  };

  // Mafia info screen when target already picked by partner
  if (player.role === 'Mafia' && existingTargetPlayer) {
    if (confirmed) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night p-6 space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <Skull className="w-8 h-8" />
            <h2 className="text-2xl font-serif">Acknowledged</h2>
          </div>
          <div className="animate-scale-in">
            <Check className="w-16 h-16 text-mafia-safe" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night p-6 space-y-8">
        <div className="flex items-center gap-3 text-primary">
          <Skull className="w-8 h-8" />
          <h2 className="text-2xl font-serif">Mafia</h2>
        </div>
        
        {otherMafia.length > 0 && (
          <div className="mafia-card text-center space-y-2 max-w-sm">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">Your fellow Mafia:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {otherMafia.map(m => (
                <span key={m.id} className="text-primary font-bold">{m.name}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mafia-card text-center space-y-4 max-w-sm">
          <p className="text-muted-foreground">Your partner has marked for death:</p>
          <p className="text-4xl font-bold text-primary">{existingTargetPlayer.name}</p>
          <p className="text-sm text-muted-foreground">🔪 The deed is done.</p>
        </div>
        
        <Button
          onClick={handleMafiaAcknowledge}
          className="py-4 px-8 bg-gradient-danger"
        >
          <Check className="w-5 h-5 mr-2" />
          Got It
        </Button>
      </div>
    );
  }

  // Show detective result
  if (detectiveResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night p-6 space-y-8">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-accent" />
          <h2 className="text-2xl font-serif text-accent">Investigation Result</h2>
        </div>
        
        <div className="mafia-card text-center space-y-4 max-w-sm">
          <p className="text-xl text-foreground">
            <strong>{detectiveResult.targetName}</strong>
          </p>
          <p className="text-3xl font-bold">
            {detectiveResult.isMafia ? (
              <span className="text-primary">MAFIA! 🔪</span>
            ) : (
              <span className="text-mafia-safe">NOT MAFIA ✓</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Remember this information! It will not be shown again.
          </p>
        </div>
        
        <Button
          onClick={handleDismissResult}
          className="py-4 px-8 bg-accent hover:bg-accent/80 text-accent-foreground"
        >
          <Check className="w-5 h-5 mr-2" />
          I'll Remember - Continue
        </Button>
      </div>
    );
  }

  // Show confirmation state
  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night p-6 space-y-8">
        <div className={`flex items-center gap-3 ${getRoleColor()}`}>
          {getRoleIcon()}
          <h2 className="text-2xl font-serif">Action Confirmed</h2>
        </div>
        <div className="animate-scale-in">
          <Check className="w-16 h-16 text-mafia-safe" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-night p-6 space-y-8">
      <div className={`flex items-center gap-3 ${getRoleColor()}`}>
        {getRoleIcon()}
        <h2 className="text-2xl font-serif">{player.role}</h2>
      </div>
      
      {/* Show other mafia members to mafia player */}
      {player.role === 'Mafia' && otherMafia.length > 0 && (
        <div className="mafia-card text-center space-y-2 max-w-sm py-3">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">Your fellow Mafia:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {otherMafia.map(m => (
              <span key={m.id} className="text-primary font-bold">{m.name}</span>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-muted-foreground text-lg">{getActionText()}</p>
      
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {validTargets.map(target => (
          <Button
            key={target.id}
            onClick={() => setSelectedTarget(target.id)}
            variant={selectedTarget === target.id ? 'default' : 'outline'}
            className={`py-6 text-lg transition-all ${
              selectedTarget === target.id 
                ? 'bg-primary/30 border-2 border-primary scale-105' 
                : 'hover:bg-muted/50'
            }`}
          >
            {target.name}
            {target.id === player.id && (
              <span className="text-xs text-muted-foreground ml-1">(you)</span>
            )}
          </Button>
        ))}
      </div>
      
      <Button
        onClick={handleConfirm}
        disabled={!selectedTarget}
        className={`py-4 px-8 ${
          player.role === 'Mafia' 
            ? 'bg-gradient-danger' 
            : player.role === 'Detective'
            ? 'bg-accent text-accent-foreground'
            : 'bg-mafia-safe text-primary-foreground'
        }`}
      >
        {getConfirmText()}
      </Button>
    </div>
  );
}
