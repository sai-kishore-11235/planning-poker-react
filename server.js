const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let gameState = {
  players: [],
  revealed: false,
  story: ''
};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send current game state to newly connected user
  socket.emit('gameState', gameState);

  socket.on('join', (name) => {
    const player = {
      id: socket.id,
      name: name,
      vote: null
    };
    gameState.players.push(player);
    io.emit('gameState', gameState);
  });

  socket.on('vote', (value) => {
    if (!gameState.revealed) {
      const player = gameState.players.find(p => p.id === socket.id);
      if (player) {
        player.vote = value;
        io.emit('gameState', gameState);
      }
    }
  });

  socket.on('reveal', () => {
    gameState.revealed = true;
    io.emit('gameState', gameState);
  });

  socket.on('newRound', () => {
    gameState.revealed = false;
    gameState.players = gameState.players.map(player => ({
      ...player,
      vote: null
    }));
    io.emit('gameState', gameState);
  });

  socket.on('disconnect', () => {
    gameState.players = gameState.players.filter(p => p.id !== socket.id);
    io.emit('gameState', gameState);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
