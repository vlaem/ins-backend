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
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    reporters: [['github-actions', { silent: false }], 'summary'],
  }
  return unitTestsConfig
}
