const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { setupGameServer } = require('./server');

describe('Planning Poker Server', () => {
  let io, serverSocket, clientSocket, httpServer;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    setupGameServer(io);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  test('should handle player joining', (done) => {
    clientSocket.emit('join', 'Player 1');

    clientSocket.on('gameState', (state) => {
      expect(state.players).toHaveLength(1);
      expect(state.players[0].name).toBe('Player 1');
      expect(state.players[0].vote).toBeNull();
      done();
    });
  });

  test('should handle player voting', (done) => {
    clientSocket.emit('vote', '5');

    clientSocket.on('gameState', (state) => {
      const player = state.players.find(p => p.id === clientSocket.id);
      expect(player.vote).toBe('5');
      done();
    });
  });

  test('should handle card reveal', (done) => {
    clientSocket.emit('reveal');

    clientSocket.on('gameState', (state) => {
      expect(state.revealed).toBe(true);
      done();
    });
  });

  test('should handle new round', (done) => {
    clientSocket.emit('newRound');

    clientSocket.on('gameState', (state) => {
      expect(state.revealed).toBe(false);
      expect(state.players.every(p => p.vote === null)).toBe(true);
      done();
    });
  });

  test('should handle player disconnection', (done) => {
    // First add a player
    clientSocket.emit('join', 'Player 1');

    // Create a second client
    const client2 = Client(`http://localhost:${httpServer.address().port}`);
    client2.emit('join', 'Player 2');

    // Wait for both players to be added
    setTimeout(() => {
      // Disconnect second client
      client2.close();

      // Check if player was removed
      clientSocket.on('gameState', (state) => {
        expect(state.players).toHaveLength(1);
        expect(state.players[0].name).toBe('Player 1');
        done();
      });
    }, 100);
  });
});
