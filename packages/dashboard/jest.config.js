/**
 * Jest configuration for Dashboard package
 */
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  testMatch: ["**/__tests__/**/*.test.tsx", "**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  moduleNameMapper: {
    "^@xray/sdk$": "<rootDir>/../sdk/src",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: "commonjs",
        moduleResolution: "node",
        target: "ES2020",
      },
    }],
  },
};

