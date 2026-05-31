/**
 * Navbar — Top navigation bar with branding and wallet connection.
 *
 * Features:
 * - ChainEscrow branding with logo
 * - Navigation links (Dashboard, Create Gig)
 * - Connect Wallet / Connected address display
 * - Network indicator
 * - Mobile responsive hamburger menu
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wallet,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  Shield,
  Zap,
} from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';
import { truncateAddress } from '../../utils/formatters';
import Button from '../ui/Button';
import logoDark from '../../assets/logo-dark.svg';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/create', label: 'Create Gig', icon: PlusCircle },
];

export default function Navbar() {
  const { account, isConnecting, isCorrectChain, connectWallet, disconnectWallet } = useWeb3();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass glass-border" id="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo & Brand ── */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            id="nav-brand"
          >
            <img
              src={logoDark}
              alt="ChainEscrow"
              className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground tracking-tight">
                Chain
              </span>
              <span className="text-lg font-bold gradient-text tracking-tight">
                Escrow
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  id={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
                  className={[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent-glow text-accent'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-card-hover',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Right Section: Network + Wallet ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Network Indicator */}
            {account && (
              <div
                className={[
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono',
                  'border transition-colors',
                  isCorrectChain
                    ? 'border-success/20 text-success bg-success-bg'
                    : 'border-warning/20 text-warning bg-warning-bg',
                ].join(' ')}
                id="network-indicator"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCorrectChain ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                {isCorrectChain ? 'Amoy' : 'Wrong Network'}
              </div>
            )}

            {/* Wallet Button */}
            {account ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-mono text-foreground-secondary"
                  id="wallet-address"
                >
                  <Shield className="h-3.5 w-3.5 text-accent" />
                  {truncateAddress(account)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-bg transition-all duration-200 cursor-pointer"
                  title="Disconnect Wallet"
                  id="disconnect-btn"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                isLoading={isConnecting}
                icon={Wallet}
                size="md"
                id="connect-wallet-btn"
              >
                Connect Wallet
              </Button>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
            id="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-accent-glow text-accent'
                      : 'text-foreground-secondary hover:bg-card-hover hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-border">
              {account ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2 text-sm font-mono text-foreground-secondary">
                      <Shield className="h-3.5 w-3.5 text-accent" />
                      {truncateAddress(account)}
                    </div>
                    <div
                      className={[
                        'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono',
                        isCorrectChain ? 'text-success' : 'text-warning',
                      ].join(' ')}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isCorrectChain ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                      {isCorrectChain ? 'Amoy' : 'Wrong'}
                    </div>
                  </div>
                  <Button
                    onClick={() => { disconnectWallet(); setMobileMenuOpen(false); }}
                    variant="danger"
                    size="sm"
                    icon={LogOut}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => { connectWallet(); setMobileMenuOpen(false); }}
                  isLoading={isConnecting}
                  icon={Wallet}
                  className="w-full"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
