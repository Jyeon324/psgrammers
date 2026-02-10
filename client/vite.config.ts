import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
      "zod": path.resolve(import.meta.dirname, "node_modules/zod"),
      "drizzle-orm": path.resolve(import.meta.dirname, "node_modules/drizzle-orm"),
      "drizzle-zod": path.resolve(import.meta.dirname, "node_modules/drizzle-zod"),
    },
  },
  server: {
    port: 5001,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
