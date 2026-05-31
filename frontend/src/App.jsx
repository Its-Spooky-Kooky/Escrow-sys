/**
 * App.jsx — Application shell with React Router and layout.
 *
 * Routes:
 *   /         → Dashboard
 *   /create   → CreateGig
 *   /gig/:id  → GigDetail
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import CreateGig from './pages/CreateGig';
import GigDetail from './pages/GigDetail';

export default function App() {
  return (
    <Router>
      {/* Toast notifications — dark themed */}
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111111',
            color: '#fafafa',
            border: '1px solid #1e1e1e',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#111111' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#111111' },
          },
          loading: {
            iconTheme: { primary: '#8b5cf6', secondary: '#111111' },
          },
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Main Content — offset by navbar height */}
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateGig />} />
          <Route path="/gig/:id" element={<GigDetail />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} ChainEscrow — Trustless Freelance Payments
          </p>
          <div className="flex items-center gap-4">
            <a
              href={import.meta.env.VITE_BLOCK_EXPLORER || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-foreground-secondary transition-colors"
            >
              Block Explorer ↗
            </a>
            <span className="text-xs text-border">•</span>
            <span className="text-xs text-muted font-mono">
              Polygon Amoy Testnet
            </span>
          </div>
        </div>
      </footer>
    </Router>
  );
}
