const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.VERCEL_URL ? [
      `https://${process.env.VERCEL_URL}`,
      'https://planning-poker-react-puce.vercel.app',
      'https://*.vercel.app'
    ] : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false
});

// Log socket.io events for debugging
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

io.engine.on("headers", (headers, req) => {
  console.log("Headers:", headers);
});

let gameState = {
  players: [],
  revealed: false,
  story: ''
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

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

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Only listen on port if not in Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = server;
