import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanningPoker } from '../../components/PlanningPoker';
import { mockSocket } from '../../setupTests';
import { io } from 'socket.io-client';

jest.mock('socket.io-client');

describe('PlanningPoker', () => {
  beforeEach(() => {
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  it('should render join screen initially', () => {
    render(<PlanningPoker />);
    expect(screen.getByText('Planning Poker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join Game' })).toBeInTheDocument();
  });

  it('should connect to socket server and listen for game state', () => {
    render(<PlanningPoker />);
    expect(io).toHaveBeenCalledWith('http://localhost:3001');
    expect(mockSocket.on).toHaveBeenCalledWith('gameState', expect.any(Function));
  });

  it('should emit join event with player name', () => {
    render(<PlanningPoker />);
    
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByRole('button', { name: 'Join Game' });
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('join', 'Test Player');
  });

  it('should show game screen after joining', () => {
    render(<PlanningPoker />);
    
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByRole('button', { name: 'Join Game' });
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Get the gameState callback and call it with mock data
    const gameStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameState')[1];
    gameStateCallback({
      players: [{ id: '1', name: 'Test Player', vote: null }],
      revealed: false,
      story: ''
    });
    
    expect(screen.getByRole('button', { name: 'Reveal Cards' })).toBeInTheDocument();
  });

  it('should handle voting', () => {
    render(<PlanningPoker />);
    
    // Join game first
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByRole('button', { name: 'Join Game' });
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Get the gameState callback and call it with mock data
    const gameStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameState')[1];
    gameStateCallback({
      players: [{ id: '1', name: 'Test Player', vote: null }],
      revealed: false,
      story: ''
    });

    // Vote
    const card = screen.getByRole('button', { name: '5' });
    fireEvent.click(card);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('vote', '5');
  });

  it('should handle reveal and new round', () => {
    render(<PlanningPoker />);
    
    // Join game first
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByRole('button', { name: 'Join Game' });
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Get the gameState callback and call it with mock data
    const gameStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameState')[1];
    
    // Initial state
    gameStateCallback({
      players: [{ id: '1', name: 'Test Player', vote: '5' }],
      revealed: false,
      story: ''
    });

    // Reveal cards
    const revealButton = screen.getByRole('button', { name: 'Reveal Cards' });
    fireEvent.click(revealButton);
    expect(mockSocket.emit).toHaveBeenCalledWith('reveal');

    // Update to revealed state
    gameStateCallback({
      players: [{ id: '1', name: 'Test Player', vote: '5' }],
      revealed: true,
      story: ''
    });

    // Start new round
    const newRoundButton = screen.getByRole('button', { name: 'New Round' });
    fireEvent.click(newRoundButton);
    expect(mockSocket.emit).toHaveBeenCalledWith('newRound');
  });
});
