import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Vote, Check, AlertTriangle } from 'lucide-react';

export function VotingScreen() {
  const { state, dispatch } = useGame();
  const [votes, setVotes] = useState<Record<string, string>>({});
  
  const alivePlayers = state.players.filter(p => p.isAlive);
  const allVoted = alivePlayers.every(p => votes[p.id]);

  const handleVote = (voterId: string, targetId: string) => {
    setVotes(prev => ({ ...prev, [voterId]: targetId }));
    dispatch({ type: 'CAST_VOTE', voterId, targetId });
  };

  const handleResolveVotes = () => {
    dispatch({ type: 'RESOLVE_VOTES' });
  };

  // Count votes for display
  const voteCounts: Record<string, number> = {};
  Object.values(votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-gradient-night p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 text-primary">
            <Vote className="w-8 h-8" />
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Voting</h1>
          </div>
          {state.revoteCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-secondary">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">REVOTE - Previous vote was tied!</p>
            </div>
          )}
          <p className="text-muted-foreground">
            Each player must vote for who to eliminate
          </p>
        </div>

        {/* Voting Grid */}
        <div className="space-y-6">
          {alivePlayers.map(voter => (
            <div key={voter.id} className="mafia-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif">
                  {voter.name}'s Vote
                </h3>
                {votes[voter.id] && (
                  <div className="flex items-center gap-2 text-mafia-safe">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Voted</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {alivePlayers
                  .filter(target => target.id !== voter.id)
                  .map(target => (
                    <button
                      key={target.id}
                      onClick={() => handleVote(voter.id, target.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        votes[voter.id] === target.id
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-border hover:border-primary/50 text-foreground'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-medium truncate">{target.name}</p>
                        {voteCounts[target.id] > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {voteCounts[target.id]} vote{voteCounts[target.id] !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vote Summary */}
        <div className="mafia-card">
          <h3 className="text-lg font-serif text-secondary mb-4">Vote Tally</h3>
          <div className="space-y-2">
            {alivePlayers.map(player => (
              <div key={player.id} className="flex items-center gap-4">
                <span className="w-32 truncate">{player.name}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-danger transition-all duration-300"
                    style={{
                      width: `${((voteCounts[player.id] || 0) / alivePlayers.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">
                  {voteCounts[player.id] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolve Button */}
        <Button
          onClick={handleResolveVotes}
          disabled={!allVoted}
          className="w-full py-6 text-xl font-serif bg-gradient-danger hover:opacity-90 mafia-glow-red disabled:opacity-50"
        >
          {allVoted ? 'Resolve Votes' : `Waiting for ${alivePlayers.filter(p => !votes[p.id]).length} more vote(s)`}
        </Button>
      </div>
    </div>
  );
}
