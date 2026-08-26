module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/test/setup-env.cjs'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
};
