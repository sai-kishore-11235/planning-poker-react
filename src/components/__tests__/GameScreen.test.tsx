import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameScreen } from '../../components/GameScreen';
import { Player } from '../../types';

describe('GameScreen', () => {
  const mockOnVote = jest.fn();
  const mockOnReveal = jest.fn();
  const mockOnNewRound = jest.fn();

  const defaultProps = {
    players: [
      { id: '1', name: 'Player 1', vote: null },
      { id: '2', name: 'Player 2', vote: '5' }
    ] as Player[],
    revealed: false,
    selectedCard: null as string | null,
    onVote: mockOnVote,
    onReveal: mockOnReveal,
    onNewRound: mockOnNewRound
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render players and their status', () => {
    render(<GameScreen {...defaultProps} />);
    
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    
    // When not revealed, show voting status
    const playerStatuses = screen.getAllByTestId('player-vote');
    expect(playerStatuses[0]).toHaveTextContent('...');
    expect(playerStatuses[1]).toHaveTextContent('✓');
  });

  it('should render voting cards', () => {
    render(<GameScreen {...defaultProps} />);
    
    const cards = ['0', '1', '2', '3', '5', '8', '13', '21', '?'];
    cards.forEach(card => {
      expect(screen.getByRole('button', { name: card })).toBeInTheDocument();
    });
  });

  it('should handle card selection', () => {
    render(<GameScreen {...defaultProps} />);
    
    const card = screen.getByRole('button', { name: '5' });
    fireEvent.click(card);
    
    expect(mockOnVote).toHaveBeenCalledWith('5');
  });

  it('should show selected card state', () => {
    render(<GameScreen {...defaultProps} selectedCard="5" />);
    
    const selectedCard = screen.getByRole('button', { name: '5' });
    expect(selectedCard).toHaveClass('selected');
  });

  it('should handle reveal and new round', () => {
    const { rerender } = render(<GameScreen {...defaultProps} />);
    
    // Initial state - Reveal button
    const revealButton = screen.getByRole('button', { name: 'Reveal Cards' });
    fireEvent.click(revealButton);
    expect(mockOnReveal).toHaveBeenCalled();
    
    // After reveal - New Round button
    rerender(<GameScreen {...defaultProps} revealed={true} />);
    const newRoundButton = screen.getByRole('button', { name: 'New Round' });
    fireEvent.click(newRoundButton);
    expect(mockOnNewRound).toHaveBeenCalled();
  });

  it('should show votes when revealed', () => {
    render(<GameScreen {...defaultProps} revealed={true} />);
    
    const playerVotes = screen.getAllByTestId('player-vote');
    expect(playerVotes[0]).toHaveTextContent('?'); // null vote shows as ?
    expect(playerVotes[1]).toHaveTextContent('5'); // actual vote
  });

  it('should disable voting cards when revealed', () => {
    render(<GameScreen {...defaultProps} revealed={true} />);
    
    const cards = ['0', '1', '2', '3', '5', '8', '13', '21', '?'];
    cards.forEach(card => {
      expect(screen.getByRole('button', { name: card })).toBeDisabled();
    });
  });

  it('should not show average before reveal', () => {
    render(<GameScreen {...defaultProps} />);
    expect(screen.queryByTestId('vote-average')).not.toBeInTheDocument();
  });

  it('should show average of numeric votes when revealed', () => {
    const players = [
      { id: '1', name: 'Player 1', vote: '3' },
      { id: '2', name: 'Player 2', vote: '5' },
      { id: '3', name: 'Player 3', vote: '8' }
    ];
    render(<GameScreen {...defaultProps} players={players} revealed={true} />);
    
    const average = screen.getByTestId('vote-average');
    expect(average).toHaveTextContent('Average: 5.3');
  });

  it('should handle non-numeric votes in average calculation', () => {
    const players = [
      { id: '1', name: 'Player 1', vote: '3' },
      { id: '2', name: 'Player 2', vote: '?' },
      { id: '3', name: 'Player 3', vote: '8' }
    ];
    render(<GameScreen {...defaultProps} players={players} revealed={true} />);
    
    const average = screen.getByTestId('vote-average');
    expect(average).toHaveTextContent('Average: 5.5');
  });

  it('should show N/A when no numeric votes are available', () => {
    const players = [
      { id: '1', name: 'Player 1', vote: '?' },
      { id: '2', name: 'Player 2', vote: null },
      { id: '3', name: 'Player 3', vote: '?' }
    ];
    render(<GameScreen {...defaultProps} players={players} revealed={true} />);
    
    const average = screen.getByTestId('vote-average');
    expect(average).toHaveTextContent('Average: N/A');
  });
});
