/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 10000,
  moduleNameMapper: {
    "^axios$": require.resolve("axios"),
  },
};
