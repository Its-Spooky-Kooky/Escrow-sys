/**
 * GigDetail — The "Room" for a specific gig.
 *
 * Shows full gig details and conditional action buttons based on:
 * - User role (client vs freelancer)
 * - Gig status (draft, funded, submitted, released, disputed, refunded)
 *
 * Actions: Release Funds, Submit Work, Raise Dispute
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Coins,
  User,
  Briefcase,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useWeb3 } from '../context/Web3Context';
import { useEscrow } from '../hooks/useEscrow';
import { fetchGigById, updateGigStatus, submitWork } from '../services/api';
import {
  truncateAddress,
  weiToEth,
  getStatusConfig,
  formatDate,
  copyToClipboard,
} from '../utils/formatters';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// Demo gig for showcase
const DEMO_GIG = {
  _id: 'demo-1',
  title: 'Smart Contract Audit — DeFi Lending Protocol',
  description:
    'Comprehensive security audit of the Solidity smart contracts powering the lending and borrowing protocol. Deliverables include:\n\n• Line-by-line code review of all contracts\n• Automated testing with Slither and Mythril\n• Gas optimization recommendations\n• Final audit report with severity classifications (Critical, High, Medium, Low, Informational)\n• Re-audit after fixes are applied',
  amount: '500000000000000000',
  status: 'funded',
  client: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
  freelancer: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  createdAt: Date.now() - 86400000 * 2,
  txHash: '0x3a4e7f8c9d2b1a5e6f7c8d9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
};

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useWeb3();
  const { releaseFunds, raiseDispute, isLoading: isTxLoading, txHash } = useEscrow();

  const [gig, setGig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submission, setSubmission] = useState('');

  // Fetch gig
  useEffect(() => {
    async function loadGig() {
      setIsLoading(true);
      try {
        const data = await fetchGigById(id);
        setGig(data);
      } catch (error) {
        console.warn('Backend unreachable, using demo gig:', error.message);
        setGig(DEMO_GIG);
      } finally {
        setIsLoading(false);
      }
    }
    loadGig();
  }, [id]);

  // Determine user role
  const userRole = account?.toLowerCase() === gig?.client?.toLowerCase()
    ? 'client'
    : account?.toLowerCase() === gig?.freelancer?.toLowerCase()
      ? 'freelancer'
      : 'viewer';

  // Copy handler
  const handleCopy = async (text, field) => {
    await copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  // Release funds handler
  const handleRelease = useCallback(async () => {
    if (!gig) return;
    const receipt = await releaseFunds(gig._id);
    if (receipt) {
      try {
        await updateGigStatus(gig._id, 'released', receipt.hash);
      } catch { /* non-critical */ }
      setGig((prev) => ({ ...prev, status: 'released' }));
    }
  }, [gig, releaseFunds]);

  // Dispute handler
  const handleDispute = useCallback(async () => {
    if (!gig) return;
    const receipt = await raiseDispute(gig._id);
    if (receipt) {
      try {
        await updateGigStatus(gig._id, 'disputed', receipt.hash);
      } catch { /* non-critical */ }
      setGig((prev) => ({ ...prev, status: 'disputed' }));
    }
  }, [gig, raiseDispute]);

  // Submit work handler
  const handleSubmitWork = async () => {
    if (!submission.trim()) {
      toast.error('Please describe your deliverables');
      return;
    }
    try {
      await submitWork(gig._id, { deliverables: submission });
      setGig((prev) => ({ ...prev, status: 'submitted' }));
      setShowSubmitModal(false);
      toast.success('Work submitted! Waiting for client review.');
    } catch (error) {
      console.warn('Backend offline, updating locally');
      setGig((prev) => ({ ...prev, status: 'submitted' }));
      setShowSubmitModal(false);
      toast.success('Work submitted! (Demo mode)');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-5 bg-border rounded w-32" />
          <div className="h-10 bg-border rounded w-2/3" />
          <div className="h-64 bg-card border border-border rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Gig Not Found</h2>
          <p className="text-muted mb-4">This gig doesn't exist or has been removed.</p>
          <Link to="/"><Button variant="outline">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const status = getStatusConfig(gig.status);

  return (
    <div className="min-h-screen" id="gig-detail-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Back Link ── */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors mb-6"
          id="back-link"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium',
                  status.bg,
                  status.color,
                ].join(' ')}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {userRole !== 'viewer' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-card border border-border text-muted">
                  You are the {userRole === 'client' ? 'Client' : 'Freelancer'}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {gig.title}
            </h1>
          </div>

          {/* Amount Badge */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border gradient-border">
            <div className="w-10 h-10 rounded-xl bg-accent-glow flex items-center justify-center">
              <Coins className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Escrow Amount</p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {weiToEth(gig.amount)} <span className="text-sm text-muted">ETH</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-6 animate-slide-up opacity-0 stagger-1">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-accent" />
                Scope of Work
              </h2>
              <p className="text-foreground-secondary text-sm leading-relaxed whitespace-pre-line">
                {gig.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="bg-card border border-border rounded-2xl p-6 animate-slide-up opacity-0 stagger-2">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-accent" />
                Actions
              </h2>

              {/* Client Actions */}
              {userRole === 'client' && gig.status === 'funded' && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground-secondary mb-3">
                    Funds are locked. Once the freelancer delivers, release the payment.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleRelease}
                      isLoading={isTxLoading}
                      icon={CheckCircle2}
                      variant="success"
                      size="lg"
                      id="release-funds-btn"
                    >
                      Release Funds
                    </Button>
                    <Button
                      onClick={handleDispute}
                      isLoading={isTxLoading}
                      icon={AlertTriangle}
                      variant="danger"
                      size="lg"
                      id="raise-dispute-btn"
                    >
                      Raise Dispute
                    </Button>
                  </div>
                </div>
              )}

              {userRole === 'client' && gig.status === 'submitted' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-warning-bg border border-warning/10">
                    <p className="text-sm text-foreground-secondary">
                      The freelancer has submitted their work. Review and release funds, or raise a dispute.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleRelease}
                      isLoading={isTxLoading}
                      icon={CheckCircle2}
                      variant="success"
                      size="lg"
                      id="release-funds-btn"
                    >
                      Approve & Release
                    </Button>
                    <Button
                      onClick={handleDispute}
                      isLoading={isTxLoading}
                      icon={AlertTriangle}
                      variant="danger"
                      id="raise-dispute-btn"
                    >
                      Raise Dispute
                    </Button>
                  </div>
                </div>
              )}

              {/* Freelancer Actions */}
              {userRole === 'freelancer' && gig.status === 'funded' && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground-secondary mb-3">
                    Funds are secured in escrow. Submit your deliverables when ready.
                  </p>
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    icon={Send}
                    size="lg"
                    id="submit-work-btn"
                  >
                    Submit Work
                  </Button>
                </div>
              )}

              {userRole === 'freelancer' && gig.status === 'submitted' && (
                <div className="p-4 rounded-xl bg-info-bg border border-info/10">
                  <p className="text-sm text-foreground-secondary flex items-center gap-2">
                    <Clock className="h-4 w-4 text-info" />
                    Your work has been submitted. Waiting for client review.
                  </p>
                </div>
              )}

              {/* Completed States */}
              {gig.status === 'released' && (
                <div className="p-4 rounded-xl bg-success-bg border border-success/10 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-success">Funds Released</p>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      Payment has been sent to the freelancer's wallet.
                    </p>
                  </div>
                </div>
              )}

              {gig.status === 'disputed' && (
                <div className="p-4 rounded-xl bg-danger-bg border border-danger/10 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-danger">Dispute Active</p>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      This gig is under dispute. Resolution is pending.
                    </p>
                  </div>
                </div>
              )}

              {gig.status === 'refunded' && (
                <div className="p-4 rounded-xl bg-info-bg border border-info/10 flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-info shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-info">Funds Refunded</p>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      Escrow has been refunded to the client.
                    </p>
                  </div>
                </div>
              )}

              {/* Viewer / No wallet */}
              {userRole === 'viewer' && (
                <p className="text-sm text-muted">
                  Connect your wallet to interact with this gig.
                </p>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Parties Card */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-slide-up opacity-0 stagger-3">
              <h3 className="text-sm font-semibold text-foreground">Parties</h3>
              <AddressRow
                label="Client"
                address={gig.client}
                icon={Briefcase}
                isSelf={account?.toLowerCase() === gig.client?.toLowerCase()}
                onCopy={(addr) => handleCopy(addr, 'client')}
                copied={copiedField === 'client'}
              />
              <AddressRow
                label="Freelancer"
                address={gig.freelancer}
                icon={User}
                isSelf={account?.toLowerCase() === gig.freelancer?.toLowerCase()}
                onCopy={(addr) => handleCopy(addr, 'freelancer')}
                copied={copiedField === 'freelancer'}
              />
            </div>

            {/* Timeline Card */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-slide-up opacity-0 stagger-4">
              <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
              <TimelineItem
                label="Created"
                value={formatDate(gig.createdAt)}
                icon={Clock}
              />
              {gig.txHash && (
                <TimelineItem
                  label="Tx Hash"
                  value={truncateAddress(gig.txHash, 8, 6)}
                  icon={ExternalLink}
                  href={`${import.meta.env.VITE_BLOCK_EXPLORER || 'https://amoy.polygonscan.com'}/tx/${gig.txHash}`}
                />
              )}
              {txHash && (
                <TimelineItem
                  label="Latest Tx"
                  value={truncateAddress(txHash, 8, 6)}
                  icon={ExternalLink}
                  href={`${import.meta.env.VITE_BLOCK_EXPLORER || 'https://amoy.polygonscan.com'}/tx/${txHash}`}
                />
              )}
            </div>

            {/* On-Chain Status Card */}
            <div className="bg-card border border-border rounded-2xl p-5 animate-slide-up opacity-0 stagger-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">On-Chain</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Contract</span>
                  <span className="font-mono text-foreground-secondary">
                    {truncateAddress(import.meta.env.VITE_CONTRACT_ADDRESS)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Network</span>
                  <span className="text-foreground-secondary">
                    {import.meta.env.VITE_CHAIN_NAME || 'Polygon Amoy'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Status</span>
                  <span className={`font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit Work Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Send className="h-5 w-5 text-accent" />
              Submit Your Work
            </h3>
            <Input
              id="submission-text"
              type="textarea"
              label="Deliverables"
              placeholder="Describe your completed work, link to repositories, documents, etc."
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
            />
            <div className="flex gap-3 mt-5">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSubmitModal(false)}
                id="cancel-submit-btn"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                icon={Send}
                onClick={handleSubmitWork}
                id="confirm-submit-btn"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Address row component */
function AddressRow({ label, address, icon: Icon, isSelf, onCopy, copied }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted" />
        <span className="text-xs text-muted">{label}</span>
        {isSelf && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-glow text-accent">
            You
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono text-foreground-secondary">
          {truncateAddress(address)}
        </span>
        <button
          onClick={() => onCopy(address)}
          className="p-1 rounded text-muted hover:text-foreground-secondary transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

/** Timeline item component */
function TimelineItem({ label, value, icon: Icon, href }) {
  const content = (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className={`font-mono ${href ? 'text-accent hover:underline' : 'text-foreground-secondary'}`}>
        {value}
        {href && <ArrowUpRight className="inline h-3 w-3 ml-0.5" />}
      </span>
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    content
  );
}
