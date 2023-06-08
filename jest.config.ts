export default {
  roots: ["<rootDir>"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["html", "text", "text-summary"],
  testEnvironment: "node",
  transform: { ".+\\.ts$": "ts-jest" },
  setupFilesAfterEnv: ["./tests/setup.ts"],
}
