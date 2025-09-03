import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'dist/assets/[name].[hash].js',
        chunkFileNames: 'dist/assets/[name].[hash].js',
        assetFileNames: 'dist/assets/[name].[hash].[ext]'
      }
    }
  },
}));