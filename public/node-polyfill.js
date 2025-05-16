/**
 * Comprehensive Node.js & React polyfill for browser environments
 * This polyfill handles common Node.js built-ins as well as React context issues
 */
(function() {
  // Set up global namespace to prevent errors
  window.global = window;
  
  // Make sure process object is properly set up
  window.process = window.process || {
    env: { NODE_ENV: 'production' },
    browser: true,
    version: '',
    nextTick: function(fn, ...args) { setTimeout(() => fn(...args), 0); },
    cwd: function() { return '/'; },
    exit: function(code) { console.log('Process exited with code:', code); }
  };
  
  // Buffer polyfill (more comprehensive version)
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = {};
    window.Buffer.from = function(input, encoding) {
      if (typeof input === 'string') {
        if (encoding === 'base64') {
          const binary = atob(input);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          return bytes;
        }
        // Default to UTF-8
        const encoder = new TextEncoder();
        return encoder.encode(input);
      }
      return new Uint8Array(input);
    };

    window.Buffer.alloc = function(size) {
      return new Uint8Array(size);
    };

    window.Buffer.isBuffer = function(obj) {
      return obj instanceof Uint8Array || obj instanceof ArrayBuffer;
    };
    
    // Add toString method
    window.Buffer.prototype = {};
    window.Buffer.prototype.toString = function(encoding) {
      if (encoding === 'base64') {
        let binary = '';
        const bytes = new Uint8Array(this);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }
      return new TextDecoder().decode(this);
    };
  }
  
  // Expose React createContext if not available
  if (typeof window.React === 'undefined') {
    window.React = window.React || {};
    if (!window.React.createContext) {
      window.React.createContext = function(defaultValue) {
        console.warn('Using polyfilled React.createContext');
        return {
          Provider: function({ children }) { return children; },
          Consumer: function({ children }) { return children(defaultValue); }
        };
      };
    }
  }
  
  // Mock require function for Node.js modules
  window.require = window.require || function(modulePath) {
    console.warn('Module require called for:', modulePath);
    
    // Handle common module paths
    const moduleMap = {
      'process': window.process,
      'process/': window.process,
      'process/browser': window.process,
      'buffer': { Buffer: window.Buffer },
      'crypto': {},
      'crypto-browserify': {},
      'stream': {},
      'stream-browserify': {},
      'util': {},
      'path': {},
      'fs': {},
      'events': {
        EventEmitter: function() {
          this.listeners = {};
          this.on = function(event, listener) {
            if (!this.listeners[event]) this.listeners[event] = [];
            this.listeners[event].push(listener);
            return this;
          };
          this.emit = function(event, ...args) {
            if (!this.listeners[event]) return false;
            this.listeners[event].forEach(fn => fn(...args));
            return true;
          };
        }
      }
    };
    
    // Try to find the module in our mapping
    for (const key in moduleMap) {
      if (modulePath === key || modulePath.startsWith(key + '/')) {
        return moduleMap[key];
      }
    }
    
    // Return an empty object if module not found
    console.warn(`Module '${modulePath}' not found in polyfill, returning empty object`);
    return {};
  };
})();

// Log successful polyfill initialization
console.log('Node.js and React polyfills initialized');

