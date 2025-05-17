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
  
  // Expose React and ReactDOM if not available
  window.React = window.React || {};
  window.ReactDOM = window.ReactDOM || {};

  // Set up complete React context API
  if (!window.React.createContext) {
    console.warn('Applying comprehensive React.createContext polyfill');
    
    window.React.createContext = function(defaultValue) {
      const contextProp = Symbol('react.context');
      
      const context = {
        $$typeof: contextProp,
        Provider: function(props) { return props.children; },
        Consumer: function(props) { 
          if (typeof props.children === 'function') {
            return props.children(defaultValue);
          } 
          return props.children; 
        },
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        _defaultValue: defaultValue,
        displayName: 'PolyfillContext',
        _currentRenderer: null,
        _currentRenderer2: null
      };
      
      return context;
    };
  }
  
  // Ensure other essential React methods
  if (!window.React.createElement) {
    window.React.createElement = function(type, props, ...children) {
      return { 
        type, 
        props: props || {}, 
        children: children.length === 0 ? null : children.length === 1 ? children[0] : children 
      };
    };
  }
  
  if (!window.React.Fragment) {
    window.React.Fragment = Symbol('react.fragment');
  }
  
  // Ensure hooks for components that might use them
  if (!window.React.useState) {
    window.React.useState = function(initialState) {
      return [initialState, function() {}];
    };
  }
  
  if (!window.React.useEffect) {
    window.React.useEffect = function() {};
  }
  
  if (!window.React.useContext) {
    window.React.useContext = function(context) {
      return context._defaultValue;
    };
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

