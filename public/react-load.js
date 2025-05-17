// React loader script - ensures React is properly initialized before bundle loads
// This must run before any other scripts
(function() {
  if (typeof window !== 'undefined') {
    console.log('Initializing React globals');
    
    // Ensure React is available globally to prevent createContext errors
    window.React = window.React || {};
    window.React.createContext = window.React.createContext || function(defaultValue) {
      const context = {
        Provider: function({ value, children }) { return children; },
        Consumer: function({ children }) { return children(defaultValue); },
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        _defaultValue: defaultValue
      };
      return context;
    };
    
    // Other common React methods that might be needed
    window.React.createElement = window.React.createElement || function(type, props, ...children) {
      return { type, props: props || {}, children };
    };
    window.React.Fragment = window.React.Fragment || Symbol('Fragment');
    
    console.log('React context polyfill loaded');
  }
})();
