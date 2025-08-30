/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["<rootDir>/src/**/__tests__/**/*.ts", "<rootDir>/src/**/?(*.)+(spec|test).ts"],
};