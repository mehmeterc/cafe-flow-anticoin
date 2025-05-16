import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { bufferPolyfill } from './vite.buffer.polyfill';
import { processPolyfill } from './vite.process.polyfill';

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
  
  // Add plugins
  plugins: [
    {
      name: 'inject-polyfills',
      enforce: 'pre',
      transformIndexHtml(html) {
        // Inject critical polyfills at the beginning of head
        return html.replace('<head>', `<head>
    <script>window.global=window;window.process={env:{NODE_ENV:"${mode}"},browser:true};window.React=window.React||{createContext:function(defaultValue){return{Provider:function(props){return props.children},Consumer:function(props){return typeof props.children==='function'?props.children(defaultValue):props.children}}}};window.require=function(mod){if(mod==='process')return window.process;if(mod==='react')return window.React;return{}};</script>`);
      },
    },
    react(),
    mode === 'development' && componentTagger(),
    bufferPolyfill(),
    processPolyfill(),
  ].filter(Boolean),
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'buffer',
      'crypto-browserify',
      'stream-browserify',
      'util'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve(
              { filter: /_virtual-process-polyfill_./ },
              (args) => ({
                path: args.path,
                external: true,
              })
            );
          },
        },
      ],
    },
  },
  
  // Resolve aliases
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: 'buffer',
        replacement: 'buffer',
      },
      {
        find: 'crypto',
        replacement: 'crypto-browserify',
      },
      {
        find: 'stream',
        replacement: 'stream-browserify',
      },
      {
        find: 'util',
        replacement: 'util',
      },
      {
        find: 'process',
        replacement: 'process/browser.js',
      },
      {
        find: 'process/browser',
        replacement: 'process/browser.js',
      },
    ],
  },
  
  // Define global constants
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.browser': true,
    global: 'window',
    'Buffer.isBuffer': 'function() { return false; }',
  },
  define: {
    'process.env': {},
    'process.browser': true,
    global: 'window',
    'Buffer.isBuffer': 'function() { return false; }',
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
  }
}));
