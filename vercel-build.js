
// Post-build script for Vercel deployment
const fs = require('fs');
const path = require('path');

// Paths
const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');
const manifestPath = path.join(distDir, 'manifest.json');

console.log('Running Vercel post-build script...');

// Fix 1: Ensure index.html contains necessary polyfills
try {
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    
    // Add polyfill script before any other scripts
    if (!indexHtml.includes('window.require =')) {
      indexHtml = indexHtml.replace('<head>', `<head>
  <script>
    // Critical polyfills for Vercel deployment
    window.global = window;
    window.process = { env: { NODE_ENV: 'production' }, browser: true };
    window.Buffer = window.Buffer || { from: function() { return {} }, isBuffer: function() { return false } };
    
    // Ensure require is defined
    window.require = function(mod) {
      console.log('require polyfill called with:', mod);
      if (mod === 'process') return window.process;
      if (mod === 'buffer') return { Buffer: window.Buffer };
      if (mod === 'react') return window.React || {};
      return {};
    };
    
    // Ensure React.createContext exists
    window.React = window.React || {};
    window.React.createContext = window.React.createContext || function(defaultValue) {
      return {
        Provider: function(props) { return props.children; },
        Consumer: function(props) { 
          return typeof props.children === 'function' ? props.children(defaultValue) : props.children; 
        }
      };
    };
    
    console.log('Vercel polyfills initialized');
  </script>`);
      
      fs.writeFileSync(indexPath, indexHtml);
      console.log('✅ Added polyfills to index.html');
    } else {
      console.log('⚠️ Polyfills already exist in index.html');
    }
  } else {
    console.error('❌ index.html not found in build output');
  }
} catch (error) {
  console.error('❌ Error updating index.html:', error);
}

// Fix 2: Ensure manifest.json is valid
try {
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // Ensure manifest is valid by re-stringifying it
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Validated manifest.json');
  } else {
    console.error('❌ manifest.json not found in build output');
  }
} catch (error) {
  console.error('❌ Error validating manifest.json:', error);
}

console.log('Vercel post-build script completed!');
