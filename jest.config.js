const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

/**
 * 
 * @returns {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = function () {
  const unitTestsConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    resetMocks: true,
    roots: ['<rootDir>/src'],
    modulePaths: [compilerOptions.baseUrl],
    setupFiles: ['<rootDir>/tests/unit/setup.ts'],
    setupFilesAfterEnv: ['@relmify/jest-fp-ts'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  }
  return unitTestsConfig
}
