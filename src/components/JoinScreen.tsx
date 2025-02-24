import React, { useState, FormEvent } from 'react';

interface JoinScreenProps {
  onJoin: (name: string) => void;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({ onJoin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onJoin(trimmedName);
    }
  };

  return (
    <div className="join-screen">
      <form onSubmit={handleSubmit} role="form">
        <h1>Planning Poker</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Join Game</button>
      </form>
    </div>
  );
};
