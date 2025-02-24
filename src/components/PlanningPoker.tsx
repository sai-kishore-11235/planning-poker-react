import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { JoinScreen } from './JoinScreen';
import { GameScreen } from './GameScreen';
import { GameState } from '../types';

export const PlanningPoker: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    revealed: false,
    story: '',
  });
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001', {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000
    });
    setSocket(newSocket);

    newSocket.on('gameState', (state: GameState) => {
      setGameState(state);
      if (!state.revealed) {
        setSelectedCard(null);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoin = (name: string) => {
    if (socket) {
      socket.emit('join', name);
      setJoined(true);
    }
  };

  const handleVote = (value: string) => {
    if (socket && !gameState.revealed) {
      setSelectedCard(value);
      socket.emit('vote', value);
    }
  };

  const handleReveal = () => {
    if (socket) {
      socket.emit('reveal');
    }
  };

  const handleNewRound = () => {
    if (socket) {
      setSelectedCard(null);
      socket.emit('newRound');
    }
  };

  if (!joined) {
    return <JoinScreen onJoin={handleJoin} />;
  }

  return (
    <GameScreen
      players={gameState.players}
      revealed={gameState.revealed}
      selectedCard={selectedCard}
      onVote={handleVote}
      onReveal={handleReveal}
      onNewRound={handleNewRound}
    />
  );
};
