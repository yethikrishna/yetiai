
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    allowedHosts: ['.clackypaas.com', '.lovable.app', 'localhost'],
    cors: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MISSING_EXPORT') return;
        warn(warning);
      }
    },
    sourcemap: true,
  },
  logLevel: 'info',
  optimizeDeps: {
    include: ['react', 'react-dom', '@clerk/clerk-react'],
  },
});
