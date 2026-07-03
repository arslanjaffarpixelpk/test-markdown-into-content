import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Side-effect imports:
import './renderers'; // registers all rich renderers into the registry
import './index.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

async function enableMocking() {
  // Mock the "AI backend" with MSW. Remove this block when wiring the real API.
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
