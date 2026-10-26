import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    alias: {
      "@source": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@models": fileURLToPath(new URL("./src/models", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
    },
  },
});
