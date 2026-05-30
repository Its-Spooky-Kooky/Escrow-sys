/**
 * main.jsx — Application entrypoint.
 *
 * Mounts React with:
 * - Web3Provider (global wallet state)
 * - StrictMode (dev warnings)
 * - CSS imports
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Web3Provider } from './context/Web3Context';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </StrictMode>
);
