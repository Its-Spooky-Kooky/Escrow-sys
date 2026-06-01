/**
 * Dashboard — Main view displaying the user's gigs in a grid layout.
 *
 * Features:
 * - Hero section with stats overview
 * - Filter tabs: All, Active, Completed, Disputed
 * - Grid of EscrowCards
 * - Empty state with CTA to create first gig
 * - Demo data when backend is offline
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Filter,
  LayoutGrid,
  TrendingUp,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { fetchGigs } from '../services/api';
import { weiToEth } from '../utils/formatters';
import EscrowCard from '../components/escrow/EscrowCard';
import Button from '../components/ui/Button';

const FILTER_TABS = [
  { key: 'all', label: 'All Gigs', icon: LayoutGrid },
  { key: 'active', label: 'Active', icon: Zap },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'disputed', label: 'Disputed', icon: AlertTriangle },
];

// Demo data for showcase when backend is offline
const DEMO_GIGS = [
  {
    _id: 'demo-1',
    title: 'Smart Contract Audit — DeFi Lending Protocol',
    description: 'Full security audit of Solidity contracts',
    amount: '500000000000000000',
    status: 'funded',
    client: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
    freelancer: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    _id: 'demo-2',
    title: 'NFT Marketplace Frontend — React + ethers.js',
    description: 'Build a responsive marketplace UI',
    amount: '1200000000000000000',
    status: 'submitted',
    client: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
    freelancer: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    _id: 'demo-3',
    title: 'Token Vesting Dashboard — Full Stack',
    description: 'ERC20 vesting schedule visualization',
    amount: '800000000000000000',
    status: 'released',
    client: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
    freelancer: '0x583031D1113aD414F02576BD6afaBfb302140225',
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    _id: 'demo-4',
    title: 'Cross-Chain Bridge Integration',
    description: 'Integrate LayerZero bridging for ERC-20 tokens',
    amount: '2000000000000000000',
    status: 'funded',
    client: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    freelancer: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
    createdAt: Date.now() - 86400000,
  },
  {
    _id: 'demo-5',
    title: 'DAO Governance Module — Snapshot Integration',
    description: 'Off-chain voting with on-chain execution',
    amount: '350000000000000000',
    status: 'disputed',
    client: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148',
    freelancer: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
    createdAt: Date.now() - 86400000 * 8,
  },
  {
    _id: 'demo-6',
    title: 'Gas Optimization — Storage Packing Review',
    description: 'Optimize storage layout for 40% gas reduction',
    amount: '150000000000000000',
    status: 'released',
    client: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
    freelancer: '0x583031D1113aD414F02576BD6afaBfb302140225',
    createdAt: Date.now() - 86400000 * 20,
  },
];

export default function Dashboard() {
  const { account } = useWeb3();
  const [gigs, setGigs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Fetch gigs from backend
  useEffect(() => {
    async function loadGigs() {
      setIsLoading(true);
      try {
        const data = await fetchGigs();
        // The backend returns { success: true, data: [...] }
        const gigList = data.data || data.gigs || (Array.isArray(data) ? data : []);
        setGigs(gigList);
        setIsDemo(false);
      } catch (error) {
        console.warn('Backend unreachable, loading demo data:', error.message);
        setGigs(DEMO_GIGS);
        setIsDemo(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadGigs();
  }, [account]);

  // Filter gigs
  const filteredGigs = useMemo(() => {
    if (activeFilter === 'all') return gigs;
    if (activeFilter === 'active') {
      return gigs.filter((g) => ['funded', 'submitted', 'draft'].includes(g.status));
    }
    if (activeFilter === 'completed') {
      return gigs.filter((g) => ['released', 'refunded'].includes(g.status));
    }
    if (activeFilter === 'disputed') {
      return gigs.filter((g) => g.status === 'disputed');
    }
    return gigs;
  }, [gigs, activeFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = gigs.reduce((sum, g) => sum + Number(g.amount || 0), 0);
    const active = gigs.filter((g) => ['funded', 'submitted'].includes(g.status)).length;
    const completed = gigs.filter((g) => g.status === 'released').length;
    return { total: gigs.length, active, completed, totalValue };
  }, [gigs]);

  return (
    <div className="min-h-screen" id="dashboard-page">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          {/* Demo badge */}
          {isDemo && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-bg border border-warning/20 text-warning text-sm animate-fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Demo mode — Backend not connected. Showing sample data.</span>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight animate-fade-in">
                Your <span className="gradient-text">Escrow</span> Dashboard
              </h1>
              <p className="mt-2 text-foreground-secondary text-sm sm:text-base animate-fade-in">
                Track, manage, and release funds for your active gigs
              </p>
            </div>
            <Link to="/create">
              <Button icon={PlusCircle} size="lg" id="create-gig-cta">
                Create Gig
              </Button>
            </Link>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              {
                label: 'Total Gigs',
                value: stats.total,
                icon: LayoutGrid,
                color: 'text-accent',
                bg: 'bg-accent-glow',
              },
              {
                label: 'Active',
                value: stats.active,
                icon: Zap,
                color: 'text-warning',
                bg: 'bg-warning-bg',
              },
              {
                label: 'Completed',
                value: stats.completed,
                icon: CheckCircle2,
                color: 'text-success',
                bg: 'bg-success-bg',
              },
              {
                label: 'Total Value',
                value: `${weiToEth(stats.totalValue.toString(), 2)} ETH`,
                icon: Coins,
                color: 'text-accent',
                bg: 'bg-accent-glow',
                mono: true,
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={[
                  'bg-card border border-border rounded-xl p-4 sm:p-5',
                  'transition-all duration-300 hover:border-border-highlight',
                  'animate-slide-up opacity-0',
                  `stagger-${i + 1}`,
                ].join(' ')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-muted font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <p className={`text-2xl font-bold text-foreground ${stat.mono ? 'font-mono' : ''}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Tabs + Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {FILTER_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              id={`filter-${key}`}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap',
                'transition-all duration-200 cursor-pointer',
                activeFilter === key
                  ? 'bg-accent-glow text-accent border border-accent/20'
                  : 'text-muted hover:text-foreground-secondary hover:bg-card border border-transparent',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {key !== 'all' && (
                <span className={[
                  'ml-1 px-1.5 py-0.5 rounded text-xs font-mono',
                  activeFilter === key ? 'bg-accent/20' : 'bg-card',
                ].join(' ')}>
                  {key === 'active' ? stats.active
                    : key === 'completed' ? stats.completed
                    : gigs.filter((g) => g.status === 'disputed').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 animate-pulse"
              >
                <div className="flex justify-between mb-4">
                  <div className="h-5 bg-border rounded w-2/3" />
                  <div className="h-5 bg-border rounded w-16" />
                </div>
                <div className="h-8 bg-border rounded w-1/3 mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-border rounded w-full" />
                  <div className="h-3 bg-border rounded w-3/4" />
                </div>
                <div className="h-px bg-border mb-3" />
                <div className="flex justify-between">
                  <div className="h-3 bg-border rounded w-20" />
                  <div className="h-3 bg-border rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gig Grid */}
        {!isLoading && filteredGigs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredGigs.map((gig, index) => (
              <EscrowCard
                key={gig._id}
                gig={gig}
                userRole={
                  account?.toLowerCase() === gig.client?.toLowerCase()
                    ? 'client'
                    : 'freelancer'
                }
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredGigs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
              <Wallet className="h-8 w-8 text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {activeFilter === 'all'
                ? 'No gigs yet'
                : `No ${activeFilter} gigs`}
            </h3>
            <p className="text-foreground-secondary text-sm mb-6 text-center max-w-sm">
              {activeFilter === 'all'
                ? 'Create your first gig and lock funds in a trustless smart contract.'
                : `You don't have any ${activeFilter} gigs at the moment.`}
            </p>
            {activeFilter === 'all' && (
              <Link to="/create">
                <Button icon={PlusCircle} id="empty-create-cta">
                  Create Your First Gig
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
