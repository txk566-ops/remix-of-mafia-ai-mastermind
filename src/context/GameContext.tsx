import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  GameState, 
  GamePhase, 
  Player, 
  NarratorMode, 
  Vote,
  NightAction,
  DetectiveResult,
  assignRoles,
  checkWinCondition,
  GameEvent
} from '@/types/game';
import { getPlayerDetails } from '@/data/playerDetails';

type GameAction =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SET_NARRATOR_MODE'; mode: NarratorMode }
  | { type: 'SET_DISCUSSION_TIMER'; enabled: boolean }
  | { type: 'SET_API_KEY'; key: string }
  | { type: 'START_GAME' }
  | { type: 'REVEAL_ROLE'; playerId: string }
  | { type: 'ALL_ROLES_REVEALED' }
  | { type: 'SET_MAFIA_TARGET'; targetId: string }
  | { type: 'SET_DETECTIVE_TARGET'; targetId: string }
  | { type: 'SET_DOCTOR_TARGET'; targetId: string }
  | { type: 'RESOLVE_NIGHT' }
  | { type: 'END_MORNING' }
  | { type: 'END_DISCUSSION' }
  | { type: 'CAST_VOTE'; voterId: string; targetId: string }
  | { type: 'RESOLVE_VOTES' }
  | { type: 'SET_NARRATION'; narration: string }
  | { type: 'SET_IS_NARRATING'; isNarrating: boolean }
  | { type: 'ADD_DETECTIVE_RESULT'; result: DetectiveResult }
  | { type: 'RESET_GAME' }
  | { type: 'SET_PHASE'; phase: GamePhase };

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialState: GameState = {
  phase: 'setup',
  players: [],
  nightActions: {
    mafiaTarget: null,
    detectiveTarget: null,
    doctorTarget: null,
  },
  votes: [],
  detectiveResults: [],
  currentRound: 1,
  theme: 'Noir detective in a smoky 1940s city',
  narratorMode: 'ADULT',
  discussionTimerEnabled: false,
  discussionTimeSeconds: 120,
  narration: '',
  isNarrating: false,
  gameEvents: [],
  winner: null,
  apiKey: '',
  revoteCount: 0,
  lastKilledPlayer: null,
  lastVotedOutPlayer: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_PLAYER':
      if (state.players.length >= 12) return state;
      const playerDetails = getPlayerDetails(action.name);
      return {
        ...state,
        players: [
          ...state.players,
          {
            id: generateId(),
            name: action.name,
            details: playerDetails,
            role: null,
            isAlive: true,
            hasRevealedRole: false,
          },
        ],
      };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.id),
      };

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'SET_NARRATOR_MODE':
      return { ...state, narratorMode: action.mode };

    case 'SET_DISCUSSION_TIMER':
      return { ...state, discussionTimerEnabled: action.enabled };

    case 'SET_API_KEY':
      return { ...state, apiKey: action.key };

    case 'START_GAME':
      const playersWithRoles = assignRoles(state.players);
      return {
        ...state,
        players: playersWithRoles,
        phase: 'role-reveal',
        gameEvents: [{
          phase: 'setup',
          description: 'The game has begun. Roles have been assigned.',
          isPublic: true,
        }],
      };

    case 'REVEAL_ROLE':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.playerId ? { ...p, hasRevealedRole: true } : p
        ),
      };

    case 'ALL_ROLES_REVEALED':
      return {
        ...state,
        phase: 'night',
        narration: '',
      };

    case 'SET_MAFIA_TARGET':
      return {
        ...state,
        nightActions: { ...state.nightActions, mafiaTarget: action.targetId },
      };

    case 'SET_DETECTIVE_TARGET':
      return {
        ...state,
        nightActions: { ...state.nightActions, detectiveTarget: action.targetId },
      };

    case 'SET_DOCTOR_TARGET':
      return {
        ...state,
        nightActions: { ...state.nightActions, doctorTarget: action.targetId },
      };

    case 'RESOLVE_NIGHT': {
      const { mafiaTarget, doctorTarget, detectiveTarget } = state.nightActions;
      let updatedPlayers = [...state.players];
      let killedPlayer: Player | null = null;
      const newEvents: GameEvent[] = [];

      // Resolve mafia kill
      if (mafiaTarget && mafiaTarget !== doctorTarget) {
        updatedPlayers = updatedPlayers.map(p =>
          p.id === mafiaTarget ? { ...p, isAlive: false } : p
        );
        killedPlayer = state.players.find(p => p.id === mafiaTarget) || null;
        newEvents.push({
          phase: 'night',
          description: `${killedPlayer?.name} was killed by the Mafia. They were a ${killedPlayer?.role}.`,
          isPublic: true,
        });
      } else if (mafiaTarget && mafiaTarget === doctorTarget) {
        newEvents.push({
          phase: 'night',
          description: 'The Doctor saved someone from death tonight!',
          isPublic: true,
        });
      } else {
        newEvents.push({
          phase: 'night',
          description: 'Nobody died during the night.',
          isPublic: true,
        });
      }

      // Check win condition
      const winner = checkWinCondition(updatedPlayers);

      return {
        ...state,
        players: updatedPlayers,
        phase: winner ? 'endgame' : 'morning',
        nightActions: { mafiaTarget: null, detectiveTarget: null, doctorTarget: null },
        gameEvents: [...state.gameEvents, ...newEvents],
        winner,
        lastKilledPlayer: killedPlayer,
      };
    }

    case 'ADD_DETECTIVE_RESULT':
      return {
        ...state,
        detectiveResults: [...state.detectiveResults, action.result],
      };

    case 'END_MORNING':
      return {
        ...state,
        phase: 'discussion',
      };

    case 'END_DISCUSSION':
      return {
        ...state,
        phase: 'voting',
        votes: [],
        revoteCount: 0,
      };

    case 'CAST_VOTE':
      // Replace existing vote from this voter
      const filteredVotes = state.votes.filter(v => v.voterId !== action.voterId);
      return {
        ...state,
        votes: [...filteredVotes, { voterId: action.voterId, targetId: action.targetId }],
      };

    case 'RESOLVE_VOTES': {
      const alivePlayers = state.players.filter(p => p.isAlive);
      const voteCounts: Record<string, number> = {};
      
      state.votes.forEach(vote => {
        voteCounts[vote.targetId] = (voteCounts[vote.targetId] || 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(voteCounts), 0);
      const playersWithMaxVotes = Object.entries(voteCounts)
        .filter(([_, count]) => count === maxVotes)
        .map(([id]) => id);

      // Check for tie
      if (playersWithMaxVotes.length > 1) {
        if (state.revoteCount < 1) {
          // First tie - revote
          return {
            ...state,
            votes: [],
            revoteCount: state.revoteCount + 1,
            narration: 'A tie vote! The village must vote again.',
          };
        } else {
          // Second tie - no elimination
          return {
            ...state,
            phase: 'night',
            currentRound: state.currentRound + 1,
            votes: [],
            revoteCount: 0,
            lastVotedOutPlayer: null,
            gameEvents: [...state.gameEvents, {
              phase: 'voting',
              description: 'The vote ended in a tie again. No one was eliminated.',
              isPublic: true,
            }],
          };
        }
      }

      // Majority elimination
      const eliminatedId = playersWithMaxVotes[0];
      const majority = Math.floor(alivePlayers.length / 2) + 1;

      if (maxVotes >= majority && eliminatedId) {
        const eliminatedPlayer = state.players.find(p => p.id === eliminatedId);
        const updatedPlayers = state.players.map(p =>
          p.id === eliminatedId ? { ...p, isAlive: false } : p
        );
        const winner = checkWinCondition(updatedPlayers);

        return {
          ...state,
          players: updatedPlayers,
          phase: winner ? 'endgame' : 'night',
          currentRound: winner ? state.currentRound : state.currentRound + 1,
          votes: [],
          revoteCount: 0,
          winner,
          lastVotedOutPlayer: eliminatedPlayer || null,
          gameEvents: [...state.gameEvents, {
            phase: 'voting',
            description: `${eliminatedPlayer?.name} was voted out. They were a ${eliminatedPlayer?.role}.`,
            isPublic: true,
          }],
        };
      }

      // No majority - go to night
      return {
        ...state,
        phase: 'night',
        currentRound: state.currentRound + 1,
        votes: [],
        revoteCount: 0,
        lastVotedOutPlayer: null,
        gameEvents: [...state.gameEvents, {
          phase: 'voting',
          description: 'No majority was reached. No one was eliminated.',
          isPublic: true,
        }],
      };
    }

    case 'SET_NARRATION':
      return { ...state, narration: action.narration };

    case 'SET_IS_NARRATING':
      return { ...state, isNarrating: action.isNarrating };

    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'RESET_GAME':
      return {
        ...initialState,
        apiKey: state.apiKey,
        theme: state.theme,
        narratorMode: state.narratorMode,
      };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
