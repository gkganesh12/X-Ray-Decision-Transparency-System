/**
 * Jest configuration for Server package
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/index.ts",
  ],
  moduleNameMapper: {
    "^@xray/sdk$": "<rootDir>/../sdk/src",
    "^@xray/server$": "<rootDir>/src",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
};

