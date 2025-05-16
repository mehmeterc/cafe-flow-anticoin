// Direct React context polyfill
if (typeof window !== 'undefined') {
  // Ensure React exists
  window.React = window.React || {};
  
  // Provide createContext if missing
  if (!window.React.createContext) {
    console.log('Polyfilling React.createContext');
    window.React.createContext = function(defaultValue) {
      return {
        Provider: function({ children }) { return children; },
        Consumer: function({ children }) { return typeof children === 'function' ? children(defaultValue) : children; },
        displayName: 'PolyfillContext'
      };
    };
  }

  // Ensure process exists
  window.process = window.process || {
    env: { NODE_ENV: process.env.NODE_ENV || 'production' },
    browser: true
  };
}

// Export a dummy value to ensure this module is not tree-shaken
export const POLYFILL_LOADED = true;
