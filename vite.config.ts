import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// Simple type declarations
declare global {
  interface Window {
    process: any;
    global: any;
  }
}

export default defineConfig(({ mode }) => {
  // Define environment variables to be replaced during build
  const env = {
    NODE_ENV: JSON.stringify(mode),
    BROWSER: 'true'
  };

  const define = {
    'process.env': JSON.stringify(env),
    'process.browser': 'true',
    'global': 'window',
    'globalThis.process': '{}',
    'globalThis.Buffer': '{}',
    'Buffer.isBuffer': 'false'
  };

  const plugins: PluginOption[] = [
    // Inject polyfills as the first plugin
    {
      name: 'inject-polyfills',
      enforce: 'pre',
      transformIndexHtml(html: string) {
        return html.replace(
          '<head>',
          `<head>
            <script>
              window.global = window;
              window.process = { 
                env: { NODE_ENV: ${JSON.stringify(mode)} },
                browser: true 
              };

              // Simple Buffer polyfill
              if (typeof window.Buffer === 'undefined') {
                window.Buffer = {
                  isBuffer: function() { return false; },
                  from: function(data) { 
                    return typeof data === 'string' 
                      ? new TextEncoder().encode(data).buffer 
                      : new Uint8Array(data || 0); 
                  },
                  alloc: function(size) { 
                    return new Uint8Array(size); 
                  }
                };
              }
            </script>`
        );
      },
    },
    
    // Core plugins
    react(),
    
    // Development-only plugins
    mode === 'development' && componentTagger(),
  ].filter(Boolean) as PluginOption[];

  return {
    // Base public path when served in production
    base: "./",
    
    // Development server configuration
    server: {
      host: "::",
      port: 8080,
      hmr: true,
      cors: true,
    },
    
    // Preview server configuration
    preview: {
      port: 8080,
      open: true,
    },
    
    // Define global constants
    define,
    
    // Configure esbuild for better JSX handling
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
    
    // Resolve aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    // Plugins
    plugins,
    
    // Build configuration
    build: {
      // Enable chunk size optimization
      chunkSizeWarningLimit: 800,
      
      // Improved CSS processing
      cssCodeSplit: true,
      
      // Minify better for production
      minify: 'terser',
      
      // Terser options for better minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      
      // Configure esbuild for production
      esbuildOptions: {
        // Enable source maps in production if needed
        sourcemap: mode === 'production',
        
        // Define global constants for production
        define: {
          'process.env.NODE_ENV': 'production',
        },
        
        // Target modern browsers
        target: 'es2020',
        
        // Enable tree-shaking
        treeShaking: true,
      },
      
      // Rollup options
      rollupOptions: {
        output: {
          // Generate separate chunks for vendor code
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              // Create separate chunks for large dependencies
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
          
          // Configure chunk file names
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  };
});
