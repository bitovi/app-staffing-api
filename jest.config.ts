export default {
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  transform: { '.+\\.ts$': 'ts-jest' },
  setupFilesAfterEnv: ['./tests/setup.ts']
}
