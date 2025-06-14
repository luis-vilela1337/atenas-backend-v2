module.exports = {
  roots: ['<rootDir>/test'],
  modulePathIgnorePatterns: ['<rootDir>/test/mocks'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!**/providers/**',
    '!**/dto/**',
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/di/**',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  transform: {
    '.+\\.ts$': 'ts-jest',
  },

  moduleNameMapper: {
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infra/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@di/(.*)$': '<rootDir>/src/di/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  watchPathIgnorePatterns: ['globalConfig'],
  preset: 'ts-jest',
  moduleDirectories: ['node_modules'],
};
