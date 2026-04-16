import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { syncFromUrl } from './store/uiSlice';
import App from './App';
import './index.css';

// ── Browser back/forward support ──────────────────────────────────────────────
// When the user presses back/forward, sync Redux state from the new URL
window.addEventListener('popstate', () => {
  store.dispatch(syncFromUrl());
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
