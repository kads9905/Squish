import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The API is proxied so auth cookies stay same-origin in development
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
