import React, { useState, useRef, useEffect } from 'react';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, ChevronDown, ChevronUp, X, UserCheck, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerDetailsInputProps {
  player: Player;
  onUpdateRawDetails: (rawDetails: string) => void;
  onRemove: () => void;
}

// Extend Window interface for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function PlayerDetailsInput({ player, onUpdateRawDetails, onRemove }: PlayerDetailsInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);

  const hasRegistryDetails = player.detailsSource === 'registry';
  const hasCustomDetails = player.detailsSource === 'custom';
  const hasAnyDetails = player.rawDetails.length > 0 || player.details.length > 0;

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onUpdateRawDetails(player.rawDetails + ' ' + finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event);
        // Don't stop on errors, try to restart if we should be recording
        if (shouldRestartRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore - might already be started
          }
        }
      };

      // Auto-restart when it ends (browser stops after silence)
      recognitionRef.current.onend = () => {
        if (shouldRestartRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore - might already be started
          }
        } else {
          setIsRecording(false);
        }
      };
    }

    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [player.rawDetails, onUpdateRawDetails]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      // Stop recording
      shouldRestartRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Start recording - keep going until manually stopped
      shouldRestartRef.current = true;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const hasSpeechRecognition = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="bg-muted/50 rounded-lg border border-border animate-scale-in overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="truncate font-medium">{player.name}</span>
          {hasRegistryDetails && (
            <Badge variant="secondary" className="bg-secondary/20 text-secondary text-xs shrink-0">
              <UserCheck className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
          {hasCustomDetails && (
            <Badge variant="outline" className="bg-primary/20 text-primary text-xs shrink-0">
              <UserPlus className="w-3 h-3 mr-1" />
              Custom
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!hasRegistryDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <>
                  <span className="text-xs mr-1">{hasAnyDetails ? 'Edit' : 'Add Bio'}</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded input section (only for non-registry players) */}
      {isExpanded && !hasRegistryDetails && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
          <div className="relative">
            <Textarea
              placeholder="Type details about this player... (interests, quirks, inside jokes)"
              value={player.rawDetails}
              onChange={(e) => onUpdateRawDetails(e.target.value)}
              className="bg-background/50 border-border min-h-[80px] pr-12 resize-none"
            />
            {hasSpeechRecognition && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                className={cn(
                  "absolute right-2 top-2 h-8 w-8",
                  isRecording && "bg-destructive/20 text-destructive animate-pulse"
                )}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          {isRecording && (
            <p className="text-xs text-destructive animate-pulse">
              🎤 Recording... Tap mic to stop
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Tip: Max 6 traits (interests, quirks, inside jokes). AI will format on game start.
          </p>
        </div>
      )}
    </div>
  );
}