import '@testing-library/jest-dom';

// Mock socket.io-client
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

// Make mockSocket available globally for tests
global.__mockSocket = mockSocket;

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockSocket.emit.mockClear();
  mockSocket.on.mockClear();
  mockSocket.close.mockClear();
});
