module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  testMatch: ['**/__test__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
};
