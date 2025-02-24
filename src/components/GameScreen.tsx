import React from 'react';
import { Player } from '../types';

interface GameScreenProps {
  players: Player[];
  revealed: boolean;
  selectedCard: string | null;
  onVote: (value: string) => void;
  onReveal: () => void;
  onNewRound: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  players,
  revealed,
  selectedCard,
  onVote,
  onReveal,
  onNewRound
}) => {
  const cards = ['0', '1', '2', '3', '5', '8', '13', '21', '?'];

  const renderPlayerVote = (player: Player) => {
    if (revealed) {
      return player.vote || '?';
    }
    return player.vote ? '✓' : '...';
  };

  const calculateAverage = () => {
    const numericVotes = players
      .map(player => player.vote)
      .filter((vote): vote is string => vote !== null && vote !== '?')
      .map(vote => parseInt(vote, 10))
      .filter(vote => !isNaN(vote));

    if (numericVotes.length === 0) return null;

    const sum = numericVotes.reduce((acc, curr) => acc + curr, 0);
    return (sum / numericVotes.length).toFixed(1);
  };

  return (
    <div className="game-screen">
      <div className="header">
        <h1>Planning Poker</h1>
        <div className="controls">
          {revealed ? (
            <button onClick={onNewRound}>New Round</button>
          ) : (
            <button onClick={onReveal}>Reveal Cards</button>
          )}
        </div>
      </div>

      <div className="players">
        {players.map((player) => (
          <div key={player.id} className="player">
            <div className="player-name">{player.name}</div>
            <div className="player-card" data-testid="player-vote">
              {renderPlayerVote(player)}
            </div>
          </div>
        ))}
      </div>

      {revealed && (
        <div className="average" data-testid="vote-average">
          Average: {calculateAverage() || 'N/A'}
        </div>
      )}

      <div className="cards">
        {cards.map((card) => (
          <button
            key={card}
            className={`card ${selectedCard === card ? 'selected' : ''}`}
            onClick={() => onVote(card)}
            disabled={revealed}
            data-testid={`card-${card}`}
          >
            {card}
          </button>
        ))}
      </div>
    </div>
  );
};
