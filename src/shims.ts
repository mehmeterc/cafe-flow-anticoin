// Critical shim for React, require, and Node.js built-ins
// Using a self-executing function to avoid processing issues with Vite's define

// Skip processing this file with Vite's define
// @ts-nocheck

// Only run in browser environment
if (typeof window !== 'undefined') {
  // Set up global object
  window.global = window;
  
  // Minimal process polyfill
  window.process = {
    env: { NODE_ENV: 'production' },
    browser: true,
    nextTick: (fn) => setTimeout(fn, 0),
    cwd: () => '/'
  };
  
  // Minimal Buffer polyfill
  window.Buffer = {
    from: (data) => 
      typeof data === 'string' 
        ? new TextEncoder().encode(data) 
        : new Uint8Array(data),
    isBuffer: (obj) => 
      obj !== null && 
      typeof obj === 'object' && 
      obj.constructor === Uint8Array,
    alloc: (size) => new Uint8Array(size)
  };
  
  // Minimal require polyfill
  window.require = (mod) => {
    if (mod === 'process') return window.process;
    if (mod === 'buffer') return { Buffer: window.Buffer };
    if (mod === 'events') return { EventEmitter: class {} };
    if (mod === 'stream') return {};
    if (mod === 'crypto') return {};
    if (mod === 'path') return {
      join: (...args) => args.join('/'),
      dirname: () => '',
      basename: () => ''
    };
    return {};
  };
  
  console.log('Shims initialized successfully');
}

// Export a dummy value to ensure this module is not tree-shaken
export {};const POLYFILL_LOADED = true;
