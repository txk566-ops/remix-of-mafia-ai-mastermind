import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { generateNarration, getPhaseInstruction } from '@/services/narratorService';
import { Sun, MessageSquare, Vote, Skull, RefreshCw, ArrowRight, Clock, Users, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { NightTurnScreen } from './NightTurnScreen';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

export function GameDashboard() {
  const { state, dispatch } = useGame();
  const [timerSeconds, setTimerSeconds] = useState(state.discussionTimeSeconds);
  const { speak, stop, isPlaying, isLoading: isVoiceLoading } = useVoiceNarration();
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const alivePlayers = state.players.filter(p => p.isAlive);
  const deadPlayers = state.players.filter(p => !p.isAlive);

  // Fetch narration when phase changes (only for non-night phases now)
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
      
      // Auto-play voice narration if enabled
      if (voiceEnabled && narration) {
        speak(narration);
      }
    };

    if (state.phase !== 'setup' && state.phase !== 'role-reveal' && state.phase !== 'endgame' && state.phase !== 'night') {
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

  // Render the NightTurnScreen for the night phase (pass-the-phone mechanic)
  if (state.phase === 'night') {
    return <NightTurnScreen />;
  }

  const handleRerollNarration = async () => {
    stop(); // Stop any playing audio
    dispatch({ type: 'SET_IS_NARRATING', isNarrating: true });
    const { events, instruction } = getPhaseInstruction(state);
    const narration = await generateNarration({
      state,
      publicEvents: events,
      instruction,
    });
    dispatch({ type: 'SET_NARRATION', narration });
    dispatch({ type: 'SET_IS_NARRATING', isNarrating: false });
    
    // Auto-play voice narration if enabled
    if (voiceEnabled && narration) {
      speak(narration);
    }
  };

  const handlePlayNarration = () => {
    if (isPlaying) {
      stop();
    } else if (state.narration) {
      speak(state.narration);
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseIcon = () => {
    switch (state.phase) {
      case 'morning': return <Sun className="w-8 h-8" />;
      case 'discussion': return <MessageSquare className="w-8 h-8" />;
      case 'voting': return <Vote className="w-8 h-8" />;
      default: return null;
    }
  };

  const getPhaseColor = () => {
    switch (state.phase) {
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
            <div className="flex items-center gap-2">
              {/* Voice Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoice}
                className={`text-muted-foreground ${voiceEnabled ? 'hover:text-secondary' : 'hover:text-primary'}`}
                title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              {/* Play/Stop Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayNarration}
                disabled={isVoiceLoading || !state.narration || state.isNarrating}
                className="text-muted-foreground hover:text-secondary"
                title={isPlaying ? 'Stop narration' : 'Play narration'}
              >
                {isVoiceLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                {isPlaying ? 'Stop' : 'Play'}
              </Button>

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
                  className="px-3 py-2 rounded-lg bg-muted/30"
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
                    {player.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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
