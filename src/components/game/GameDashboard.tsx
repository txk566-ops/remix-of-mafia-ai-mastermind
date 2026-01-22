import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { generateNarration, getPhaseInstruction } from '@/services/narratorService';
import { Moon, Sun, MessageSquare, Vote, Skull, Shield, Search, RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { Player, DetectiveResult } from '@/types/game';

export function GameDashboard() {
  const { state, dispatch } = useGame();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [pendingDetectiveResult, setPendingDetectiveResult] = useState<DetectiveResult | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(state.discussionTimeSeconds);

  const alivePlayers = state.players.filter(p => p.isAlive);
  const deadPlayers = state.players.filter(p => !p.isAlive);
  const detectivePlayer = state.players.find(p => p.role === 'Detective');
  const doctorPlayer = state.players.find(p => p.role === 'Doctor');
  const hasDoctor = doctorPlayer && doctorPlayer.isAlive;
  const hasDetective = detectivePlayer && detectivePlayer.isAlive;

  // Fetch narration when phase changes
  useEffect(() => {
    const fetchNarration = async () => {
      dispatch({ type: 'SET_IS_NARRATING', isNarrating: true });
      const { events, instruction } = getPhaseInstruction(state);
      const narration = await generateNarration({
        state,
        publicEvents: events,
        instruction,
      });
      dispatch({ type: 'SET_NARRATION', narration });
      dispatch({ type: 'SET_IS_NARRATING', isNarrating: false });
    };

    if (state.phase !== 'setup' && state.phase !== 'role-reveal' && state.phase !== 'endgame') {
      fetchNarration();
    }
  }, [state.phase, state.currentRound]);

  // Discussion timer
  useEffect(() => {
    if (state.phase === 'discussion' && state.discussionTimerEnabled) {
      setTimerSeconds(state.discussionTimeSeconds);
      const interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.phase, state.discussionTimerEnabled]);

  const handleRerollNarration = async () => {
    dispatch({ type: 'SET_IS_NARRATING', isNarrating: true });
    const { events, instruction } = getPhaseInstruction(state);
    const narration = await generateNarration({
      state,
      publicEvents: events,
      instruction,
    });
    dispatch({ type: 'SET_NARRATION', narration });
    dispatch({ type: 'SET_IS_NARRATING', isNarrating: false });
  };

  const handleNightAction = (role: 'Mafia' | 'Detective' | 'Doctor') => {
    if (!selectedTarget) return;

    if (role === 'Mafia') {
      dispatch({ type: 'SET_MAFIA_TARGET', targetId: selectedTarget });
    } else if (role === 'Detective') {
      dispatch({ type: 'SET_DETECTIVE_TARGET', targetId: selectedTarget });
      const target = state.players.find(p => p.id === selectedTarget);
      if (target && detectivePlayer) {
        const result: DetectiveResult = {
          playerId: detectivePlayer.id,
          targetId: target.id,
          targetName: target.name,
          isMafia: target.role === 'Mafia',
        };
        dispatch({ type: 'ADD_DETECTIVE_RESULT', result });
        setPendingDetectiveResult(result);
      }
    } else if (role === 'Doctor') {
      dispatch({ type: 'SET_DOCTOR_TARGET', targetId: selectedTarget });
    }
    setSelectedTarget(null);
  };

  const canResolveNight = () => {
    const mafiaSelected = state.nightActions.mafiaTarget !== null;
    const detectiveSelected = !hasDetective || state.nightActions.detectiveTarget !== null;
    const doctorSelected = !hasDoctor || state.nightActions.doctorTarget !== null;
    return mafiaSelected && detectiveSelected && doctorSelected;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseIcon = () => {
    switch (state.phase) {
      case 'night': return <Moon className="w-8 h-8" />;
      case 'morning': return <Sun className="w-8 h-8" />;
      case 'discussion': return <MessageSquare className="w-8 h-8" />;
      case 'voting': return <Vote className="w-8 h-8" />;
      default: return null;
    }
  };

  const getPhaseColor = () => {
    switch (state.phase) {
      case 'night': return 'text-mafia-purple';
      case 'morning': return 'text-secondary';
      case 'discussion': return 'text-blue-400';
      case 'voting': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-night p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Phase Header */}
        <div className={`flex items-center justify-center gap-3 ${getPhaseColor()}`}>
          {getPhaseIcon()}
          <h1 className="text-3xl sm:text-4xl font-serif font-bold capitalize">
            {state.phase.replace('-', ' ')}
          </h1>
          <span className="text-muted-foreground text-lg">Round {state.currentRound}</span>
        </div>

        {/* Narrator Feed */}
        <div className="mafia-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-secondary">Narrator</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRerollNarration}
              disabled={state.isNarrating}
              className="text-muted-foreground hover:text-secondary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${state.isNarrating ? 'animate-spin' : ''}`} />
              Re-roll
            </Button>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 min-h-[120px]">
            {state.isNarrating ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-pulse">●</div>
                <span>The narrator speaks...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                {state.narration || 'The narrator awaits...'}
              </p>
            )}
          </div>
        </div>

        {/* Detective Result (Private) */}
        {pendingDetectiveResult && state.phase === 'night' && (
          <div className="mafia-card border-accent/50 animate-scale-in">
            <div className="flex items-center gap-3 text-accent-foreground mb-2">
              <Search className="w-5 h-5" />
              <h3 className="font-serif">Detective's Investigation (PRIVATE)</h3>
            </div>
            <p className="text-foreground">
              <strong>{pendingDetectiveResult.targetName}</strong> is{' '}
              <span className={pendingDetectiveResult.isMafia ? 'text-primary font-bold' : 'text-mafia-safe'}>
                {pendingDetectiveResult.isMafia ? 'MAFIA!' : 'Not Mafia'}
              </span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPendingDetectiveResult(null)}
              className="mt-2 text-muted-foreground"
            >
              Dismiss (remember this!)
            </Button>
          </div>
        )}

        {/* Player Lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Alive Players */}
          <div className="mafia-card">
            <h3 className="text-lg font-serif text-mafia-safe mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Alive ({alivePlayers.length})
            </h3>
            <div className="space-y-2">
              {alivePlayers.map(player => (
                <div
                  key={player.id}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    selectedTarget === player.id
                      ? 'bg-primary/30 border border-primary'
                      : 'bg-muted/30 hover:bg-muted/50'
                  } ${state.phase === 'night' || state.phase === 'voting' ? 'cursor-pointer' : ''}`}
                  onClick={() => (state.phase === 'night' || state.phase === 'voting') && setSelectedTarget(player.id)}
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          {/* Dead Players */}
          <div className="mafia-card opacity-75">
            <h3 className="text-lg font-serif text-muted-foreground mb-3 flex items-center gap-2">
              <Skull className="w-5 h-5" />
              Eliminated ({deadPlayers.length})
            </h3>
            <div className="space-y-2">
              {deadPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No casualties yet...</p>
              ) : (
                deadPlayers.map(player => (
                  <div key={player.id} className="px-3 py-2 rounded-lg bg-muted/20 text-muted-foreground">
                    {player.name} <span className="text-xs opacity-60">({player.role})</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Night Actions */}
        {state.phase === 'night' && (
          <div className="mafia-card space-y-4">
            <h3 className="text-xl font-serif text-mafia-purple">Night Actions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Mafia */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Skull className="w-5 h-5" />
                  <span className="font-medium">Mafia</span>
                </div>
                <Button
                  onClick={() => handleNightAction('Mafia')}
                  disabled={!selectedTarget || state.nightActions.mafiaTarget !== null}
                  className="w-full bg-gradient-danger hover:opacity-90"
                >
                  {state.nightActions.mafiaTarget 
                    ? `Target: ${state.players.find(p => p.id === state.nightActions.mafiaTarget)?.name}`
                    : 'Select Target'}
                </Button>
              </div>

              {/* Detective */}
              {hasDetective && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Detective</span>
                  </div>
                  <Button
                    onClick={() => handleNightAction('Detective')}
                    disabled={!selectedTarget || state.nightActions.detectiveTarget !== null}
                    className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
                  >
                    {state.nightActions.detectiveTarget
                      ? `Investigated: ${state.players.find(p => p.id === state.nightActions.detectiveTarget)?.name}`
                      : 'Select Target'}
                  </Button>
                </div>
              )}

              {/* Doctor */}
              {hasDoctor && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-mafia-safe">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Doctor</span>
                  </div>
                  <Button
                    onClick={() => handleNightAction('Doctor')}
                    disabled={!selectedTarget || state.nightActions.doctorTarget !== null}
                    className="w-full bg-mafia-safe hover:bg-mafia-safe/80 text-primary-foreground"
                  >
                    {state.nightActions.doctorTarget
                      ? `Protecting: ${state.players.find(p => p.id === state.nightActions.doctorTarget)?.name}`
                      : 'Select Target'}
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={() => dispatch({ type: 'RESOLVE_NIGHT' })}
              disabled={!canResolveNight()}
              className="w-full py-4 bg-gradient-mystery hover:opacity-90"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              End Night
            </Button>
          </div>
        )}

        {/* Morning Actions */}
        {state.phase === 'morning' && (
          <div className="flex justify-center">
            <Button
              onClick={() => dispatch({ type: 'END_MORNING' })}
              className="py-4 px-8 bg-gradient-gold text-secondary-foreground hover:opacity-90"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Begin Discussion
            </Button>
          </div>
        )}

        {/* Discussion Timer */}
        {state.phase === 'discussion' && state.discussionTimerEnabled && (
          <div className="flex items-center justify-center gap-3 text-2xl font-mono">
            <Clock className="w-6 h-6 text-muted-foreground" />
            <span className={timerSeconds < 30 ? 'text-primary animate-pulse' : 'text-foreground'}>
              {formatTime(timerSeconds)}
            </span>
          </div>
        )}

        {/* Discussion Actions */}
        {state.phase === 'discussion' && (
          <div className="flex justify-center">
            <Button
              onClick={() => dispatch({ type: 'END_DISCUSSION' })}
              className="py-4 px-8 bg-gradient-danger hover:opacity-90"
            >
              <Vote className="w-5 h-5 mr-2" />
              Begin Voting
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
