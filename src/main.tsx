// Import polyfills and shims first - must be before any other imports
import './shims';

// React imports
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import './index.css';

console.log('Starting application...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Add error boundary for the entire app
const AppWithErrorBoundary = () => (
  <StrictMode>
    <App />
  </StrictMode>
);

// Render the app
try {
  const root = createRoot(rootElement);
  root.render(<AppWithErrorBoundary />);
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to render application:', error);
  
  // Show error UI if rendering fails
  rootElement.innerHTML = `
    <div style="
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
    ">
      <h1>Application Error</h1>
      <p>Sorry, something went wrong while loading the application.</p>
      <p>Please try refreshing the page. If the problem persists, contact support.</p>
      <pre style="
        margin-top: 1rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
      ">
        ${error instanceof Error ? error.message : 'Unknown error occurred'}
      </pre>
    </div>
  `;
  
  throw error;
}
