module.exports = {
  projects: ["<rootDir>/packages/*/jest.config.js"],
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage/",
  collectCoverageFrom: ["<rootDir>/src/*.ts"],
};
