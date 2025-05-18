// Critical shim for React, require, and Node.js built-ins
(function() {
  if (typeof window !== 'undefined') {
    // 1. Set up the global object
    window.global = window;
    
    // 2. Polyfill for process
    window.process = window.process || {
      env: { NODE_ENV: 'production' },
      browser: true,
      nextTick: function(fn) { setTimeout(fn, 0); },
      cwd: function() { return '/'; }
    };
    
    // 3. Polyfill for Buffer
    window.Buffer = window.Buffer || {
      from: function(data) { return typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(); },
      isBuffer: function() { return false; },
      alloc: function(size) { return new Uint8Array(size); }
    };
    
    // 4. Polyfill for require
    window.require = window.require || function(mod) {
      console.log('require polyfill called with:', mod);
      if (mod === 'process') return window.process;
      if (mod === 'buffer') return { Buffer: window.Buffer };
      if (mod === 'react') return window.React;
      return {};
    };
    
    // 5. Ensure React exists with createContext
    window.React = window.React || {};
    
    // Attach createContext if it doesn't exist
    if (!window.React.createContext) {
      console.log('Polyfilling React.createContext');
      window.React.createContext = function(defaultValue) {
        return {
          Provider: function(props) { return props.children; },
          Consumer: function(props) { 
            return typeof props.children === 'function' ? props.children(defaultValue) : props.children; 
          },
          _currentValue: defaultValue,
          displayName: 'PolyfillContext'
        };
      };
    }
    
    console.log('Shims initialized successfully');
  }
})();

// Export a dummy value to ensure this module is not tree-shaken
export const POLYFILL_LOADED = true;
