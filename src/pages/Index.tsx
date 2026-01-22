import { GameProvider } from '@/context/GameContext';
import { GameController } from '@/components/game/GameController';

const Index = () => {
  return (
    <GameProvider>
      <GameController />
    </GameProvider>
  );
};

export default Index;
