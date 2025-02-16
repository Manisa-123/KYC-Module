import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: "./",  // Set the correct root
  build: {
    outDir: "dist", // Ensure build output is correct
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
