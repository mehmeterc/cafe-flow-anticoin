// Critical shim for React, require, and Node.js built-ins
// Using a self-executing function to avoid processing issues with Vite's define

// Skip processing this file with Vite's define
// @ts-nocheck

declare global {
  interface Window {
    process: any;
    global: Window;
    Buffer: any;
  }
}

// Only run in browser environment
if (typeof window !== 'undefined') {
  // Set up global object
  window.global = window;
  
  // Ensure globalThis is defined
  if (typeof globalThis === 'undefined') {
    (window as any).globalThis = window;
  }

  // Minimal process polyfill
  window.process = window.process || {
    env: { NODE_ENV: process.env.NODE_ENV || 'production' },
    browser: true,
    version: '',
    versions: { node: false },
    nextTick: (fn: Function) => setTimeout(fn, 0),
    cwd: () => '/'
  };
  
  // Minimal Buffer polyfill
  if (!window.Buffer) {
    const BufferImpl = function(arg: any, encodingOrOffset?: string | number, length?: number) {
      return arg instanceof Uint8Array ? arg : new Uint8Array(typeof arg === 'number' ? arg : 0);
    } as any;
    
    BufferImpl.from = function(data: any, encoding?: string) {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      } else if (Array.isArray(data)) {
        return new Uint8Array(data);
      }
      return new Uint8Array(data || 0);
    };
    
    BufferImpl.alloc = function(size: number) {
      return new Uint8Array(size);
    };
    
    BufferImpl.isBuffer = function(obj: any) {
      return obj instanceof Uint8Array;
    };
    
    window.Buffer = BufferImpl;
  }
  
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
export const POLYFILL_LOADED = true;
