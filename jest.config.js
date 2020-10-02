module.exports = {
  transform: {
    '\\.m?js?$': 'jest-esm-transformer',
  },
  testEnvironment: 'node',
  testMatch: ['**/__test__/**/*.test.js'],
};
