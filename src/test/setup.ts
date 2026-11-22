/// <reference types="vitest/jsdom" />

// Use the simulated browser's origin-scoped storage even when Node exposes its own global.
Object.defineProperty(window, "localStorage", {
  configurable: true,
  get: () => jsdom.window.localStorage,
});
