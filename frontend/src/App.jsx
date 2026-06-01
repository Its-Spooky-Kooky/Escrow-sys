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
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
          },
          loading: {
            iconTheme: { primary: '#059669', secondary: '#ffffff' },
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
