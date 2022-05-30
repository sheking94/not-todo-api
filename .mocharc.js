"use strict";

module.exports = {
  exit: true,
  bail: true,
  slow: 1000,
  recursive: true,
  watch: true,
  timeout: 2000,
  watchFiles: ["__tests__/**/*.test.ts"],
  spec: ["__tests__/**/*.test.ts"],
};
