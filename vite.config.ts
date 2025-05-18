import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// Remove the lovable-tagger import if it's not installed
// import { componentTagger } from 'lovable-tagger';

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
    // Commented out as lovable-tagger is not available
    // mode === 'development' && componentTagger(),
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
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
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
      chunkSizeWarningLimit: 1000, // Increased for lovable.dev compatibility
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : []
        }
      },
      
      // Speed up build by setting these options
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // 4kb
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      
      // Configure esbuild for production
      esbuildOptions: {
        // Target modern browsers
        target: 'es2020',
        
        // Enable tree-shaking
        treeShaking: true,
        
        // Define globals
        define: {
          'process.env.NODE_ENV': JSON.stringify(mode)
        }
      },
      
      // Rollup options - consolidated into one section
      rollupOptions: {
        output: {
          // Generate separate chunks for vendor code
          manualChunks: (id) => {
            // Group related node_modules into chunks to optimize loading
            
            // React and related packages
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router')) {
              return 'vendor-react';
            }
            
            // UI components
            if (id.includes('node_modules/@radix-ui')) {
              return 'vendor-radix';
            }
            
            // Data fetching
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'vendor-query';
            }
            
            // Utilities 
            if (id.includes('node_modules/lodash') || 
                id.includes('node_modules/date-fns')) {
              return 'vendor-utils';
            }
            
            // Crypto and blockchain libraries
            if (id.includes('node_modules/crypto-') || 
                id.includes('node_modules/bn.js') || 
                id.includes('node_modules/elliptic') ||
                id.includes('node_modules/web3') ||
                id.includes('node_modules/ethers')) {
              return 'vendor-crypto';
            }
            
            // Return null for everything else to let Rollup handle it
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
