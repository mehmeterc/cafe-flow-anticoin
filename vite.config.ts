import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { bufferPolyfill } from './vite.buffer.polyfill';
import { processPolyfill } from './vite.process.polyfill';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Create a single plugins array
  const plugins: (PluginOption | false)[] = [
    // Inject polyfills as the first plugin
    {
      name: 'inject-polyfills',
      enforce: 'pre' as const,
      transformIndexHtml: (html: string) => {
        return html.replace(
          '<head>',
          `<head>
            <script>
              window.global = window;
              window.process = { 
                env: { NODE_ENV: "${mode}" },
                browser: true 
              };
              
              // Simple React context polyfill
              window.React = window.React || {
                createContext: function(defaultValue) {
                  return {
                    Provider: function(props) { return props.children; },
                    Consumer: function(props) { 
                      return typeof props.children === 'function' 
                        ? props.children(defaultValue) 
                        : props.children; 
                    }
                  };
                }
              };
              
              // Simple require polyfill
              window.require = function(mod) {
                if (mod === 'process') return window.process;
                if (mod === 'react') return window.React;
                return {};
              };
            </script>`
        );
      },
    },
    
    // Core plugins
    react(),
    
    // Development-only plugins
    mode === 'development' && componentTagger(),
    
    // Polyfills
    bufferPolyfill(),
    processPolyfill(),
  ].filter(Boolean);

  return {
    // Base public path when served in production
    base: "./",
    
    server: {
      host: "::",
      port: 8080,
    },
    
    // Plugins configuration
    plugins,
    
    // Resolve configuration
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
      'process.env': {},
      'process.browser': true,
      global: 'window',
      'Buffer.isBuffer': 'function() { return false; }',
    },
    
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
    
    // Build configuration
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
          manualChunks: (id: string) => {
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
            return null;
          },
        },
      },
    },
  };
});
