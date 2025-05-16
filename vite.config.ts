import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base public path when served in production
  base: "./",
  
  server: {
    host: "::",
    port: 8080,
  },
  
  // Define global constant replacements
  define: {
    'process.env': {},
    global: 'window',
  },
  
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Polyfills for Node.js built-ins
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
    },
  },
  
  // Polyfill for Node.js built-ins
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        // Add Node.js globals and Buffer polyfill
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve({ filter: /_virtual-process-polyfill_./ }, args => ({
              path: args.path,
              external: true
            }))
          },
        },
      ],
    },
  },
  build: {
    // Enable chunk size optimization
    chunkSizeWarningLimit: 800,
    // Improved CSS processing
    cssCodeSplit: true,
    // Minify better for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Split code into smaller chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create separate chunks for large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            return 'vendor'; // all other node_modules
          }
        },
      },
    },
  },
  // Enable caching for faster reloads
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: [],
  },
}));
