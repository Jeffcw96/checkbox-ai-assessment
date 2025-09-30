import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  verbose: false,
  detectOpenHandles: true,
  setupFiles: ["<rootDir>/src/tests/setup-env.ts"],
};

export default config;
