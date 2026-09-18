import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      SESSION_SECRET: "test-session-secret-that-is-at-least-32-characters-long",
      CRON_SECRET: "test-cron-secret",
      RATE_LIMIT_SALT: "test-salt",
    },
  },
});
