import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Skull, Plus, Users, Play, Volume2, Loader2, Key, BookOpen } from 'lucide-react';
import { NarratorMode } from '@/types/game';
import { VOICE_OPTIONS } from '@/data/voiceOptions';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { PlayerDetailsInput } from './PlayerDetailsInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


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
          
          {/* Rules Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-4 border-secondary text-secondary hover:bg-secondary/10">
                <BookOpen className="w-4 h-4 mr-2" />
                Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-gradient-danger">Game Rules</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6 text-sm">
                  {/* Overview */}
                  <section>
                    <h3 className="font-serif text-lg text-secondary mb-2">Overview</h3>
                    <p className="text-muted-foreground">
                      Mafia is a social deduction game where players are secretly assigned roles. 
                      The Village team tries to identify and eliminate the Mafia, while the Mafia 
                      tries to kill villagers without being caught.
                    </p>
                  </section>

                  {/* Roles */}
                  <section>
                    <h3 className="font-serif text-lg text-secondary mb-2">Roles</h3>
                    <div className="space-y-3">
                      <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                        <span className="font-bold text-primary">Mafia</span>
                        <p className="text-muted-foreground mt-1">
                          Knows who the other Mafia members are. Each night, chooses a player to eliminate. 
                          Wins when Mafia equals or outnumbers Villagers.
                        </p>
                      </div>
                      <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                        <span className="font-bold text-secondary">Detective</span>
                        <p className="text-muted-foreground mt-1">
                          Each night, can investigate one player to learn if they are Mafia.
                        </p>
                      </div>
                      <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                        <span className="font-bold text-accent">Doctor</span>
                        <span className="text-xs text-muted-foreground ml-2">(5+ players only)</span>
                        <p className="text-muted-foreground mt-1">
                          Each night, can protect one player from being killed. Can only self-heal once per game.
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <span className="font-bold">Villager</span>
                        <p className="text-muted-foreground mt-1">
                          Has no special abilities but votes during the day to eliminate suspicious players.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Phases */}
                  <section>
                    <h3 className="font-serif text-lg text-secondary mb-2">Game Phases</h3>
                    <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                      <li><span className="text-foreground font-medium">Night:</span> Special roles perform their actions secretly</li>
                      <li><span className="text-foreground font-medium">Morning:</span> The narrator reveals what happened during the night</li>
                      <li><span className="text-foreground font-medium">Discussion:</span> Players debate who they think is Mafia</li>
                      <li><span className="text-foreground font-medium">Voting:</span> Players vote to eliminate a suspect</li>
                    </ol>
                  </section>

                  {/* Win Conditions */}
                  <section>
                    <h3 className="font-serif text-lg text-secondary mb-2">Win Conditions</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><span className="text-secondary font-medium">Village Wins:</span> All Mafia members are eliminated</p>
                      <p><span className="text-primary font-medium">Mafia Wins:</span> Mafia members equal or outnumber the remaining Villagers</p>
                    </div>
                  </section>

                  {/* Role Distribution */}
                  <section>
                    <h3 className="font-serif text-lg text-secondary mb-2">Role Distribution</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-foreground">Players</th>
                            <th className="text-center py-2 text-primary">Mafia</th>
                            <th className="text-center py-2 text-secondary">Detective</th>
                            <th className="text-center py-2 text-accent">Doctor</th>
                            <th className="text-center py-2">Villagers</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border/50"><td className="py-1.5">4</td><td className="text-center">1</td><td className="text-center">0</td><td className="text-center">0</td><td className="text-center">3</td></tr>
                          <tr className="border-b border-border/50"><td className="py-1.5">5</td><td className="text-center">1</td><td className="text-center">0</td><td className="text-center">1</td><td className="text-center">3</td></tr>
                          <tr className="border-b border-border/50"><td className="py-1.5">6</td><td className="text-center">1</td><td className="text-center">1</td><td className="text-center">0</td><td className="text-center">4</td></tr>
                          <tr className="border-b border-border/50"><td className="py-1.5">7</td><td className="text-center">2</td><td className="text-center">1</td><td className="text-center">1</td><td className="text-center">3</td></tr>
                          <tr className="border-b border-border/50"><td className="py-1.5">8</td><td className="text-center">2</td><td className="text-center">1</td><td className="text-center">1</td><td className="text-center">4</td></tr>
                          <tr><td className="py-1.5">9-12</td><td className="text-center">3</td><td className="text-center">1</td><td className="text-center">1</td><td className="text-center">Rest</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
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


        {/* Narrator Mode */}
        <div className="mafia-card space-y-4">
          <h2 className="text-xl font-serif text-secondary">Narrator Mode</h2>
          
          <div className="grid grid-cols-3 gap-2">
            {(['PG', 'ADULT', 'UNHINGED'] as NarratorMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => dispatch({ type: 'SET_NARRATOR_MODE', mode })}
                className={`px-2 py-3 rounded-lg border-2 transition-all font-medium text-sm whitespace-nowrap ${
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
