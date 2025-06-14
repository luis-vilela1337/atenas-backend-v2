import 'reflect-metadata';

jest.setTimeout(10000);

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};