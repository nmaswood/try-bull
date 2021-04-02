module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: [".d.ts", ".js"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
