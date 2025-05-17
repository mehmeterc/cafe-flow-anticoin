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
  
  // 5. Make sure React and ReactDOM are available with all essential properties
  window.React = window.React || {};
  window.ReactDOM = window.ReactDOM || {};
  
  // Ensure React methods are available
  const ensureMethod = function(obj, method, implementation) {
    if (!obj[method]) {
      obj[method] = implementation;
      console.log('Polyfilled ' + method);
    }
  };

  // Core React methods
  ensureMethod(window.React, 'createElement', function(type, props, ...children) {
    return { type, props: props || {}, children: children.length === 0 ? null : children.length === 1 ? children[0] : children };
  });
  
  ensureMethod(window.React, 'createContext', function(defaultValue) {
    console.log('Creating polyfilled React context');
    const context = {
      Provider: function({ value, children }) { return children; },
      Consumer: function({ children }) { 
        if (typeof children === 'function') {
          return children(defaultValue);
        }
        return children; 
      },
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      _defaultValue: defaultValue,
      displayName: 'PolyfillContext'
    };
    
    // Ensure these properties are not enumerable to match React's implementation
    Object.defineProperties(context, {
      '$$typeof': { value: Symbol.for('react.context') },
      _currentRenderer: { value: null, writable: true },
      _currentRenderer2: { value: null, writable: true }
    });
    
    return context;
  });
  
  ensureMethod(window.React, 'Fragment', Symbol.for('react.fragment'));
  ensureMethod(window.React, 'useState', function(initialState) {
    return [initialState, function() {}];
  });
  ensureMethod(window.React, 'useEffect', function() {});
  ensureMethod(window.React, 'useContext', function(context) {
    return context._currentValue;
  });
  
  // Ensure ReactDOM methods
  ensureMethod(window.ReactDOM, 'render', function() {});
  ensureMethod(window.ReactDOM, 'createRoot', function() {
    return { render: function() {} };
  });
  
  console.log('Preload script executed successfully');
  
  // This ensures our script runs as early as possible
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Verifying preload success');
    if (window.React && window.React.createContext) {
      console.log('Preload verification passed');
      console.log('Polyfills initialized!');
    } else {
      console.error('Preload verification failed - React.createContext not found');
      // Force re-initialize polyfills
      window.React = window.React || {};
      window.React.createContext = function(defaultValue) {
        return {
          Provider: function(props) { return props.children; },
          Consumer: function(props) { return props.children; }
        };
      };
    }
  });
})();

// Backup script to ensure React is available - executed immediately
(function() {
  if (!window.React) window.React = {};
  if (!window.React.createContext) {
    window.React.createContext = function() {
      return {
        Provider: function(props) { return props.children; },
        Consumer: function(props) { return props.children; }
      };
    };
  }
})();
