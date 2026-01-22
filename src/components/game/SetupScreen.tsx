import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Skull, Plus, Users, Sparkles, Play, Volume2, Loader2, Key } from 'lucide-react';
import { NarratorMode } from '@/types/game';
import { VOICE_OPTIONS } from '@/data/voiceOptions';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { PlayerDetailsInput } from './PlayerDetailsInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const THEME_SUGGESTIONS = [
  'Noir detective in a smoky 1940s city',
  'Medieval court intrigue',
  'Space station horror',
  'Miami nightclub in the 80s',
  'Corporate boardroom thriller',
  'Reality TV elimination show',
  'Wild West frontier town',
  'Ancient Rome senate',
];

export function SetupScreen() {
  const { state, dispatch } = useGame();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isFormattingBios, setIsFormattingBios] = useState(false);
  const { speak, stop, isPlaying, isLoading: isVoiceLoading } = useVoiceNarration({
    voiceId: state.voiceSettings.voiceId,
    speed: state.voiceSettings.speed,
  });

  const selectedVoice = VOICE_OPTIONS.find(v => v.id === state.voiceSettings.voiceId);

  const handlePreviewVoice = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(`Greetings, citizens. Tonight, danger lurks in the shadows. The game of deception begins now.`);
    }
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && state.players.length < 12) {
      dispatch({ type: 'ADD_PLAYER', name: newPlayerName.trim() });
      setNewPlayerName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  const canStartGame = state.players.length >= 4;
  const hasApiKey = state.apiKey.trim().length > 0;

  // Check if there are players with raw details that need formatting
  const playersNeedingFormat = state.players.filter(
    p => p.detailsSource !== 'registry' && p.rawDetails.trim().length > 0
  );

  const handleStartGame = async () => {
    // Format bios automatically if there are players with raw details
    if (playersNeedingFormat.length > 0 && hasApiKey) {
      setIsFormattingBios(true);
      try {
        const { data, error } = await supabase.functions.invoke('format-player-bios', {
          body: {
            players: playersNeedingFormat.map(p => ({ name: p.name, rawDetails: p.rawDetails })),
            mode: state.narratorMode,
            apiKey: state.apiKey,
          },
        });

        if (error) throw error;

        if (data.players) {
          dispatch({ type: 'SET_ALL_FORMATTED_DETAILS', players: data.players });
        }
      } catch (error) {
        console.error('Failed to format bios:', error);
        toast.error('Failed to format bios, starting without custom details');
      } finally {
        setIsFormattingBios(false);
      }
    }
    
    dispatch({ type: 'START_GAME' });
  };

  const scrollToApiKey = () => {
    document.getElementById('api-key')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('api-key')?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-night p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Skull className="w-12 h-12 text-primary animate-pulse-slow" />
            <h1 className="text-5xl font-serif font-bold text-gradient-danger tracking-wider">
              MAFIA AI
            </h1>
            <Skull className="w-12 h-12 text-primary animate-pulse-slow" />
          </div>
          <p className="text-muted-foreground text-lg">
            The AI-powered social deduction game
          </p>
        </div>

        {/* Players Section */}
        <div className="mafia-card space-y-4">
          <div className="flex items-center gap-2 text-secondary">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-serif">Players ({state.players.length}/12)</h2>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter player name..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-muted border-border"
            />
            <Button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim() || state.players.length >= 12}
              className="bg-gradient-danger hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {state.players.length < 4 && (
            <p className="text-sm text-muted-foreground">
              Add at least {4 - state.players.length} more player{4 - state.players.length > 1 ? 's' : ''} to start
            </p>
          )}

          <div className="space-y-2">
            {state.players.map((player, index) => (
              <PlayerDetailsInput
                key={player.id}
                player={player}
                onUpdateRawDetails={(rawDetails) => 
                  dispatch({ type: 'SET_PLAYER_RAW_DETAILS', playerId: player.id, rawDetails })
                }
                onRemove={() => dispatch({ type: 'REMOVE_PLAYER', id: player.id })}
              />
            ))}
          </div>

          {/* Show hint if new players need API key for bios */}
          {playersNeedingFormat.length > 0 && !hasApiKey && (
            <Button
              onClick={scrollToApiKey}
              variant="outline"
              className="w-full border-secondary text-secondary hover:bg-secondary/10"
            >
              <Key className="w-4 h-4 mr-2" />
              Add Grok API Key for Custom Bios
            </Button>
          )}
        </div>

        {/* Theme Section */}
        <div className="mafia-card space-y-4">
          <div className="flex items-center gap-2 text-secondary">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-serif">Theme</h2>
          </div>

          <Input
            placeholder="Enter your theme..."
            value={state.theme}
            onChange={(e) => dispatch({ type: 'SET_THEME', theme: e.target.value })}
            className="bg-muted border-border"
          />

          <div className="flex flex-wrap gap-2">
            {THEME_SUGGESTIONS.slice(0, 4).map((theme) => (
              <button
                key={theme}
                onClick={() => dispatch({ type: 'SET_THEME', theme })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  state.theme === theme
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Narrator Mode */}
        <div className="mafia-card space-y-4">
          <h2 className="text-xl font-serif text-secondary">Narrator Mode</h2>
          
          <div className="grid grid-cols-3 gap-2">
            {(['PG', 'ADULT', 'UNHINGED'] as NarratorMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => dispatch({ type: 'SET_NARRATOR_MODE', mode })}
                className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                  state.narratorMode === mode
                    ? mode === 'UNHINGED'
                      ? 'bg-gradient-danger border-primary text-primary-foreground mafia-glow-red'
                      : mode === 'ADULT'
                      ? 'bg-gradient-gold border-secondary text-secondary-foreground mafia-glow-gold'
                      : 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {state.narratorMode === 'PG' && 'Family-friendly narration'}
            {state.narratorMode === 'ADULT' && 'Mild profanity allowed'}
            {state.narratorMode === 'UNHINGED' && 'Chaotic, savage humor (but still safe)'}
          </p>
        </div>

        {/* Voice Settings */}
        <div className="mafia-card space-y-4">
          <div className="flex items-center gap-2 text-secondary">
            <Volume2 className="w-5 h-5" />
            <h2 className="text-xl font-serif">Narrator Voice</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VOICE_OPTIONS.map((voice) => (
              <button
                key={voice.id}
                onClick={() => dispatch({ type: 'SET_VOICE_ID', voiceId: voice.id })}
                className={`px-3 py-2 rounded-lg border-2 transition-all text-left ${
                  state.voiceSettings.voiceId === voice.id
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs opacity-75">{voice.description}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Speed: {state.voiceSettings.speed.toFixed(1)}x</Label>
              <span className="text-xs text-muted-foreground">
                {state.voiceSettings.speed < 0.9 ? 'Slow' : state.voiceSettings.speed > 1.1 ? 'Fast' : 'Normal'}
              </span>
            </div>
            <Slider
              value={[state.voiceSettings.speed]}
              onValueChange={([value]) => dispatch({ type: 'SET_VOICE_SPEED', speed: value })}
              min={0.7}
              max={1.2}
              step={0.1}
              className="w-full"
            />
          </div>

          <Button
            variant="outline"
            onClick={handlePreviewVoice}
            disabled={isVoiceLoading}
            className="w-full"
          >
            {isVoiceLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 mr-2" />
            )}
            {isPlaying ? 'Stop Preview' : 'Preview Voice'}
          </Button>
        </div>

        {/* Settings */}
        <div className="mafia-card space-y-4">
          <h2 className="text-xl font-serif text-secondary">Settings</h2>

          <div className="flex items-center justify-between">
            <Label htmlFor="timer-toggle">Discussion Timer</Label>
            <Switch
              id="timer-toggle"
              checked={state.discussionTimerEnabled}
              onCheckedChange={(checked) => 
                dispatch({ type: 'SET_DISCUSSION_TIMER', enabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">Grok API Key (stored locally only)</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Grok API key..."
              value={state.apiKey}
              onChange={(e) => dispatch({ type: 'SET_API_KEY', key: e.target.value })}
              className="bg-muted border-border"
            />
            <p className="text-xs text-muted-foreground">
              {state.apiKey ? '✓ API key set' : 'Without API key, fallback narration will be used'}
            </p>
          </div>
        </div>

        {/* Start Game */}
        <Button
          onClick={handleStartGame}
          disabled={!canStartGame || isFormattingBios}
          className="w-full py-6 text-xl font-serif bg-gradient-danger hover:opacity-90 transition-all mafia-glow-red disabled:opacity-50 disabled:shadow-none"
        >
          {isFormattingBios ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Preparing Bios...
            </>
          ) : (
            <>
              <Play className="w-6 h-6 mr-2" />
              Start Game
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
