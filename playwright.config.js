const path = require("path");
const { defineConfig } = require("@playwright/test");

const storageState = process.env.GITHUB_STORAGE_STATE
  ? path.resolve(process.env.GITHUB_STORAGE_STATE)
  : undefined;

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  fullyParallel: true,
  use: {
    storageState,
    baseURL: "https://github.com",
    viewport: { width: 1280, height: 720 },
  },
  reporter: [["list"]],
});
