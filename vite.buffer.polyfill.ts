import { Plugin } from 'vite';

export function bufferPolyfill(): Plugin {
  return {
    name: 'buffer-polyfill',
    config() {
      return {
        define: {
          global: 'window',
          'process.env': {},
          'process.browser': true,
          'Buffer.isBuffer': 'function() { return false; }',
        },
        resolve: {
          alias: {
            buffer: 'buffer/',
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            util: 'util/',
            process: 'process/browser',
          },
        },
        build: {
          rollupOptions: {
            plugins: [
              {
                name: 'buffer-polyfill',
                resolveId(source) {
                  if (source === 'buffer') {
                    return { id: 'buffer/', external: true };
                  }
                  return null;
                },
              },
            ],
          },
        },
      };
    },
  };
}
