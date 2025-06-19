import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  try {
    // Load env file based on `mode` in the current directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    // Get host and port from environment variables or use defaults
    const host = process.env.VITE_HOST || "0.0.0.0";
    const port = parseInt(process.env.VITE_PORT || "8080", 10);

    return {
      server: {
        host,
        port,
        strictPort: false, // Allow Vite to find another port if this one is in use
        allowedHosts: ['.clackypaas.com', 'localhost'], // Allow Clacky environment
        https: mode === 'development' ? {
          // Use self-signed certificates for development
          cert: fs.existsSync("./cert.pem") ? "./cert.pem" : undefined,
          key: fs.existsSync("./key.pem") ? "./key.pem" : undefined,
        } : false,
        cors: true, // Enable CORS for development
      },
      plugins: [
        react(),
      ].filter(Boolean),
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      // Make env variables available to the app
      define: {
        'process.env': env
      },
      // Better error handling
      build: {
        rollupOptions: {
          onwarn(warning, warn) {
            // Skip certain warnings
            if (warning.code === 'MISSING_EXPORT') return;
            warn(warning);
          }
        }
      },
      // Improved error logging
      logLevel: mode === 'development' ? 'info' : 'warn',
    };
  } catch (error) {
    console.error("Error in Vite configuration:", error);
    throw error;
  }
});