import React from 'react';
import { useGame } from '@/context/GameContext';
import { SetupScreen } from './SetupScreen';
import { RoleDistributionScreen } from './RoleDistributionScreen';
import { RoleRevealScreen } from './RoleRevealScreen';
import { GameDashboard } from './GameDashboard';
import { VotingScreen } from './VotingScreen';
import { EndgameScreen } from './EndgameScreen';

export function GameController() {
  const { state } = useGame();

  switch (state.phase) {
    case 'setup':
      return <SetupScreen />;
    case 'role-distribution':
      return <RoleDistributionScreen />;
    case 'role-reveal':
      return <RoleRevealScreen />;
    case 'night':
    case 'morning':
    case 'discussion':
      return <GameDashboard />;
    case 'voting':
      return <VotingScreen />;
    case 'endgame':
      return <EndgameScreen />;
    default:
      return <SetupScreen />;
  }
}
