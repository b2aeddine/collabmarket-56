import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { securityHeaders } from "./vite-plugin-security-headers";

// https://vitejs.dev/config/
export default defineConfig(({ mode: _mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    securityHeaders(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
