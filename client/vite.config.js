import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at https://isavii.github.io/BoardGameCompanion/
  // so production assets need that path prefix; dev/preview stay at the root.
  base: command === 'build' ? '/BoardGameCompanion/' : '/',
  plugins: [react()],
  // Listen on all interfaces so phones/tablets on the same Wi-Fi can reach the
  // dev server at http://<your-lan-ip>:5173 (Vite prints the "Network:" URL).
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  test: {
    environment: 'jsdom',
    globals: true,
    // Tests exercise local mode; ignore any .env Supabase config.
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  },
}));
