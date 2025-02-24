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
    // Get Socket.IO server URL from environment variables with fallback
    const socketUrl = window.location.hostname === 'localhost' 
      ? process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080'
      : window.location.origin;
    
    console.log('Hostname:', window.location.hostname);
    console.log('Connecting to Socket.IO server at:', socketUrl);
    const newSocket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true
    });
    setSocket(newSocket);

    // Connection status monitoring
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('connect_timeout', () => {
      console.error('Socket connection timeout');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    newSocket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
    });

    newSocket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
      if (!state.revealed) {
        setSelectedCard(null);
      }
    });

    return () => {
      console.log('Cleaning up socket connection');
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
