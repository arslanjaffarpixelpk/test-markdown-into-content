import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Side-effect import: registers all rich renderers into the registry.
import './renderers';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
