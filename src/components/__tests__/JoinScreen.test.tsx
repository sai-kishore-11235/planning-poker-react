import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JoinScreen } from '../../components/JoinScreen';

describe('JoinScreen', () => {
  const mockOnJoin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render join form', () => {
    render(<JoinScreen onJoin={mockOnJoin} />);
    
    expect(screen.getByText('Planning Poker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join Game' })).toBeInTheDocument();
  });

  it('should not call onJoin when name is empty', () => {
    render(<JoinScreen onJoin={mockOnJoin} />);
    
    const joinButton = screen.getByRole('button', { name: 'Join Game' });
    fireEvent.click(joinButton);
    
    expect(mockOnJoin).not.toHaveBeenCalled();
  });

  it('should call onJoin with name when form is submitted', () => {
    render(<JoinScreen onJoin={mockOnJoin} />);
    
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByRole('button', { name: 'Join Game' });
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);
    
    expect(mockOnJoin).toHaveBeenCalledWith('Test Player');
  });

  it('should trim whitespace from name before submitting', () => {
    render(<JoinScreen onJoin={mockOnJoin} />);
    
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByRole('button', { name: 'Join Game' });
    
    fireEvent.change(nameInput, { target: { value: '  Test Player  ' } });
    fireEvent.click(joinButton);
    
    expect(mockOnJoin).toHaveBeenCalledWith('Test Player');
  });

  it('should prevent form submission with empty name', () => {
    render(<JoinScreen onJoin={mockOnJoin} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockOnJoin).not.toHaveBeenCalled();
  });
});
