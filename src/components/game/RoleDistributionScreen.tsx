import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { getRoleDistribution } from '@/types/game';
import { Skull, Shield, Search, Users, ArrowRight, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function RoleDistributionScreen() {
  const { state, dispatch } = useGame();
  const distribution = getRoleDistribution(state.players.length);

  const handleContinue = () => {
    dispatch({ type: 'CONTINUE_TO_ROLE_REVEAL' });
  };

  const handleEndGame = () => {
    dispatch({ type: 'FULL_RESET' });
  };

  const roles = [
    { name: 'Mafia', count: distribution.mafia, icon: Skull, color: 'text-primary', bg: 'bg-primary/20' },
    { name: 'Detective', count: distribution.detective, icon: Search, color: 'text-accent', bg: 'bg-accent/20' },
    { name: 'Doctor', count: distribution.doctor, icon: Shield, color: 'text-mafia-safe', bg: 'bg-mafia-safe/20' },
    { name: 'Villager', count: distribution.villager, icon: Users, color: 'text-secondary', bg: 'bg-secondary/20' },
  ].filter(role => role.count > 0);

  return (
    <div className="min-h-screen bg-gradient-night p-6 flex flex-col items-center justify-center relative">
      {/* End Game Button */}
      <div className="absolute top-4 right-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <XCircle className="w-5 h-5 mr-1" />
              End Game
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Game?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end the game? This will return everyone to the setup screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEndGame} className="bg-primary hover:bg-primary/90">
                End Game
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold text-gradient-danger">
            Roles in This Game
          </h1>
          <p className="text-muted-foreground">
            {state.players.length} players
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role, index) => (
            <div
              key={role.name}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 border-border ${role.bg} animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-3 rounded-full bg-card ${role.color}`}>
                <role.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className={`text-xl font-serif font-bold ${role.color}`}>{role.name}</p>
              </div>
              <div className={`text-4xl font-bold ${role.color}`}>
                {role.count}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          className="w-full py-6 text-xl font-serif bg-gradient-danger hover:opacity-90 mafia-glow-red"
        >
          <ArrowRight className="w-6 h-6 mr-2" />
          Continue to Role Reveal
        </Button>
      </div>
    </div>
  );
}
