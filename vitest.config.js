const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    testTimeout: 15000,
    hookTimeout: 15000,
    fileParallelism: false,
    setupFiles: ["./tests/setup.js"]
  }
});