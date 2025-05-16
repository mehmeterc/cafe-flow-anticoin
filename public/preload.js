// This must be loaded before any other scripts
(function() {
  // 1. Set up global
  window.global = window;
  
  // 2. Define process with all commonly used properties
  window.process = window.process || {
    env: { 
      NODE_ENV: 'production',
      // Add any other needed env variables
    },
    browser: true,
    version: '',
    nextTick: function(fn, ...args) { setTimeout(() => fn(...args), 0); },
    cwd: function() { return '/'; }
  };
  
  // 3. Define Buffer with comprehensive implementation
  window.Buffer = window.Buffer || {
    from: function(data, encoding) {
      if (typeof data === 'string') {
        if (encoding === 'base64') {
          try {
            const binary = atob(data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
          } catch (e) {
            console.error('Base64 decode error:', e);
            return new Uint8Array(0);
          }
        }
        return new TextEncoder().encode(data);
      }
      return new Uint8Array(Array.isArray(data) ? data : 0);
    },
    isBuffer: function(obj) { return obj instanceof Uint8Array; },
    alloc: function(size) { return new Uint8Array(size); }
  };
  
  // 4. Define require function
  window.require = window.require || function(id) {
    console.log('Polyfill require called for:', id);
    if (id === 'process') return window.process;
    if (id === 'buffer') return { Buffer: window.Buffer };
    if (id === 'stream') return {};
    if (id === 'util') return {};
    if (id === 'crypto') return {};
    if (id === 'events') return { EventEmitter: function() {} };
    if (id === 'path') return {};
    return {};
  };
  
  // 5. Make sure React and ReactDOM are available
  window.React = window.React || {};
  window.ReactDOM = window.ReactDOM || {};
  
  // 6. Define React.createContext if it doesn't exist
  if (!window.React.createContext) {
    console.log('Polyfilling React.createContext');
    window.React.createContext = function(defaultValue) {
      return {
        Provider: function(props) { return props.children; },
        Consumer: function(props) { 
          if (typeof props.children === 'function') {
            return props.children(defaultValue);
          }
          return props.children; 
        },
        displayName: 'PolyfillContext'
      };
    };
  }
  
  console.log('Preload script executed successfully');
})();
