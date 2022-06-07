export default {
  verbose: true, // show test status
  preset: 'ts-jest', // use ts compiler
  forceExit: true,
  clearMocks: true, // clear any previous cashing for mocks like timeOfCalls
  resetMocks: true, // reset mock if you wanna change its behaviour like reject after resolve
  restoreMocks: true, // restore mocking module to its original state
  modulePathIgnorePatterns: ['/config'],
};
