export type Role = 'Mafia' | 'Detective' | 'Doctor' | 'Villager';

export type GamePhase = 
  | 'setup'
  | 'role-distribution'
  | 'role-reveal'
  | 'night'
  | 'morning'
  | 'discussion'
  | 'voting'
  | 'endgame';

export type NarratorMode = 'PG' | 'ADULT' | 'UNHINGED';

export interface Player {
  id: string;
  name: string;
  details: string;
  rawDetails: string;
  detailsSource: 'registry' | 'custom' | 'none';
  role: Role | null;
  isAlive: boolean;
  hasRevealedRole: boolean;
}

export interface NightAction {
  mafiaTarget: string | null;
  detectiveTarget: string | null;
  doctorTarget: string | null;
}

export interface DetectiveResult {
  playerId: string;
  targetId: string;
  targetName: string;
  isMafia: boolean;
}

export interface Vote {
  voterId: string;
  targetId: string;
}

export interface GameEvent {
  phase: GamePhase;
  description: string;
  isPublic: boolean;
}

export interface VoiceSettings {
  voiceId: string;
  speed: number; // 0.7 to 1.2
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  nightActions: NightAction;
  votes: Vote[];
  detectiveResults: DetectiveResult[];
  currentRound: number;
  
  narratorMode: NarratorMode;
  discussionTimerEnabled: boolean;
  discussionTimeSeconds: number;
  narration: string;
  isNarrating: boolean;
  gameEvents: GameEvent[];
  winner: 'village' | 'mafia' | null;
  apiKey: string;
  revoteCount: number;
  lastKilledPlayer: Player | null;
  lastVotedOutPlayer: Player | null;
  doctorSelfHealUsed: boolean;
  lastSavedPlayer: Player | null;
  voiceSettings: VoiceSettings;
}

export interface RoleDistribution {
  mafia: number;
  detective: number;
  doctor: number;
  villager: number;
}

export const getRoleDistribution = (playerCount: number): RoleDistribution => {
  if (playerCount === 4) {
    // 4 players: 1 Mafia, 1 Doctor, 2 Villagers
    return { mafia: 1, detective: 0, doctor: 1, villager: 2 };
  } else if (playerCount === 5) {
    // 5 players: 1 Mafia, 1 Doctor, 3 Villagers
    return { mafia: 1, detective: 0, doctor: 1, villager: 3 };
  } else if (playerCount === 6) {
    // 6 players: 1 Mafia, 1 Detective, 4 Villagers
    return { mafia: 1, detective: 1, doctor: 0, villager: 4 };
  } else if (playerCount === 7) {
    // 7 players: 2 Mafia, 1 Detective, 1 Doctor, 3 Villagers
    return { mafia: 2, detective: 1, doctor: 1, villager: 3 };
  } else if (playerCount === 8) {
    // 8 players: 2 Mafia, 1 Detective, 1 Doctor, 4 Villagers
    return { mafia: 2, detective: 1, doctor: 1, villager: 4 };
  } else {
    // 9-12 players: 3 Mafia, 1 Detective, 1 Doctor, rest Villagers
    const mafia = 3;
    const detective = 1;
    const doctor = 1;
    const villager = playerCount - mafia - detective - doctor;
    return { mafia, detective, doctor, villager };
  }
};

export const assignRoles = (players: Player[]): Player[] => {
  const distribution = getRoleDistribution(players.length);
  const roles: Role[] = [];
  
  for (let i = 0; i < distribution.mafia; i++) roles.push('Mafia');
  for (let i = 0; i < distribution.detective; i++) roles.push('Detective');
  for (let i = 0; i < distribution.doctor; i++) roles.push('Doctor');
  for (let i = 0; i < distribution.villager; i++) roles.push('Villager');
  
  // Shuffle roles
  const shuffled = [...roles].sort(() => Math.random() - 0.5);
  
  return players.map((player, index) => ({
    ...player,
    role: shuffled[index],
  }));
};

export const checkWinCondition = (players: Player[]): 'village' | 'mafia' | null => {
  const alivePlayers = players.filter(p => p.isAlive);
  const aliveMafia = alivePlayers.filter(p => p.role === 'Mafia');
  const aliveVillagers = alivePlayers.filter(p => p.role !== 'Mafia');
  
  if (aliveMafia.length === 0) {
    return 'village';
  }
  
  if (aliveMafia.length >= aliveVillagers.length) {
    return 'mafia';
  }
  
  return null;
};
