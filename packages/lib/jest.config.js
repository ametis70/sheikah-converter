/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: ".",
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "node_modules",
    "__tests__/data",
    "__tests__/utils.ts",
  ],
};
