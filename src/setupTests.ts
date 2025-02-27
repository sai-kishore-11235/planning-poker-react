import '@testing-library/jest-dom';

// Mock socket.io-client
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
  connect: jest.fn(() => mockSocket),
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

export { mockSocket };
