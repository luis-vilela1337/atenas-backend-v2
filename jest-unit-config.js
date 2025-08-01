module.exports = {
  displayName: 'unit',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!**/dto/**',
    '!**/*.module.ts',
    '!<rootDir>/src/di/**',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/**/*.interface.ts',
  ],
  coverageDirectory: 'coverage/unit',
  testEnvironment: 'node',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infra/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@di/(.*)$': '<rootDir>/src/di/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testTimeout: 10000,
};
