module.exports = function () {
  const unitTestsConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    resetMocks: true,
    roots: ['<rootDir>/src'],
    reporters: [['github-actions', { silent: false }], 'summary'],
  }
  return unitTestsConfig
}
