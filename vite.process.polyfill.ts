import { Plugin } from 'vite';

export function processPolyfill(): Plugin {
  return {
    name: 'process-polyfill',
    config() {
      return {
        define: {
          'process.env.NODE_ENV': JSON.stringify('production'),
          'process.env': {},
          'process.browser': true,
          'process.version': JSON.stringify('18.0.0'),
          global: 'window',
        },
        resolve: {
          alias: [
            {
              find: /^process$/,
              replacement: 'process/browser',
            },
            {
              find: /^process\/(.*)$/,
              replacement: 'process/browser',
            },
          ],
        },
      };
    },
    resolveId(source) {
      if (source === 'process' || source.startsWith('process/')) {
        return { id: 'process/browser', external: true };
      }
      return null;
    },
  };
}
