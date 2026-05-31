/**
 * CreateGig — Form page for creating a new escrow gig.
 *
 * Flow:
 * 1. Fill form (title, description, freelancer address, amount)
 * 2. Submit → create draft in backend
 * 3. Trigger smart contract depositFunds()
 * 4. On confirmation → redirect to GigDetail
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Coins,
  Send,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useWeb3 } from '../context/Web3Context';
import { useEscrow } from '../hooks/useEscrow';
import { createGig, updateGigStatus } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const INITIAL_FORM = {
  title: '',
  description: '',
  freelancerAddress: '',
  amount: '',
};

export default function CreateGig() {
  const navigate = useNavigate();
  const { account, isAuthenticated } = useWeb3();
  const { depositFunds, isLoading: isTxLoading } = useEscrow();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Form, 2: Review, 3: Processing
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form field
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on edit
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Gig title is required';
    } else if (form.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!form.freelancerAddress.trim()) {
      newErrors.freelancerAddress = 'Freelancer address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(form.freelancerAddress)) {
      newErrors.freelancerAddress = 'Invalid Ethereum address format';
    } else if (form.freelancerAddress.toLowerCase() === account?.toLowerCase()) {
      newErrors.freelancerAddress = 'Cannot escrow to your own address';
    }

    if (!form.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (Number(form.amount) < 0.001) {
      newErrors.amount = 'Minimum amount is 0.001 ETH';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, account]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (step === 1) {
      setStep(2);
      return;
    }

    // Step 2: Submit to backend + blockchain
    setIsSubmitting(true);
    setStep(3);

    try {
      // 1. Create draft in backend
      let gigId;
      try {
        const gigData = await createGig({
          title: form.title,
          description: form.description,
          freelancerAddress: form.freelancerAddress,
          amount: form.amount,
        });
        gigId = gigData._id || gigData.gigId || 'demo-new';
      } catch (apiError) {
        console.warn('Backend unavailable, using demo gig ID:', apiError.message);
        gigId = `local-${Date.now()}`;
        toast('Backend offline — transaction will still execute on-chain', {
          icon: '⚠️',
        });
      }

      // 2. Execute on-chain deposit
      const receipt = await depositFunds(form.freelancerAddress, gigId, form.amount);

      if (receipt) {
        // 3. Update backend status
        try {
          await updateGigStatus(gigId, 'funded', receipt.hash);
        } catch {
          // Non-critical — on-chain is the source of truth
        }

        toast.success('Gig created and funds locked! 🎉', { duration: 5000 });
        navigate(`/gig/${gigId}`);
      } else {
        // User rejected or tx failed
        setStep(2);
      }
    } catch (error) {
      console.error('Create gig error:', error);
      toast.error('Something went wrong. Please try again.');
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" id="create-gig-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Back Link ── */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors mb-8"
          id="back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* ── Page Header ── */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Create New <span className="gradient-text">Gig</span>
          </h1>
          <p className="mt-2 text-foreground-secondary text-sm">
            Define the scope, set the price, and lock funds in a trustless smart contract.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Review' },
            { num: 3, label: 'On-Chain' },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={[
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300',
                  step >= num
                    ? 'gradient-accent text-white'
                    : 'bg-card border border-border text-muted',
                ].join(' ')}
              >
                {step > num ? <CheckCircle2 className="h-4 w-4" /> : num}
              </div>
              <span className={`text-xs font-medium ${step >= num ? 'text-foreground' : 'text-muted'}`}>
                {label}
              </span>
              {num < 3 && (
                <div className={`w-8 sm:w-12 h-px ${step > num ? 'bg-accent' : 'bg-border'} transition-colors`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              {/* Title */}
              <Input
                id="gig-title"
                label="Gig Title"
                placeholder="e.g., Smart Contract Audit — DeFi Protocol"
                icon={FileText}
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                error={errors.title}
                maxLength={120}
              />

              {/* Description */}
              <Input
                id="gig-description"
                label="Scope of Work"
                type="textarea"
                placeholder="Describe the deliverables, milestones, and acceptance criteria..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                error={errors.description}
                helperText={`${form.description.length}/500 characters`}
                maxLength={500}
              />

              {/* Freelancer Address */}
              <Input
                id="gig-freelancer"
                label="Freelancer Wallet Address"
                placeholder="0x..."
                icon={User}
                value={form.freelancerAddress}
                onChange={(e) => updateField('freelancerAddress', e.target.value)}
                error={errors.freelancerAddress}
                helperText="The Ethereum address that will receive payment upon release"
              />

              {/* Amount */}
              <Input
                id="gig-amount"
                label="Escrow Amount"
                type="number"
                placeholder="0.5"
                icon={Coins}
                suffix="ETH"
                value={form.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                error={errors.amount}
                helperText="This amount will be locked in the smart contract"
                min="0.001"
                step="0.001"
              />

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-info-bg border border-info/10 text-sm">
                <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
                <p className="text-foreground-secondary">
                  Creating a gig will prompt MetaMask to deposit funds into the escrow smart contract.
                  You will need to pay gas fees on the Polygon Amoy network.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" id="review-btn">
                Review & Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Review Card */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Review Your Gig
                </h3>

                <div className="space-y-4">
                  <ReviewRow label="Title" value={form.title} />
                  <ReviewRow label="Description" value={form.description} multiline />
                  <ReviewRow label="Freelancer" value={form.freelancerAddress} mono />
                  <ReviewRow label="Amount" value={`${form.amount} ETH`} highlight />
                </div>

                <div className="p-3 rounded-xl bg-warning-bg border border-warning/10 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground-secondary">
                    Once you confirm, {form.amount} ETH will be deposited into the escrow contract.
                    This action is irreversible until you choose to release or dispute.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  id="back-to-form-btn"
                >
                  Edit Details
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  icon={Send}
                  isLoading={isSubmitting || isTxLoading}
                  id="confirm-create-btn"
                >
                  Confirm & Deposit
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mb-6 animate-pulse-glow">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Processing Transaction
              </h3>
              <p className="text-foreground-secondary text-sm text-center max-w-sm mb-4">
                Confirm the transaction in MetaMask. Your funds are being securely locked on-chain.
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs text-muted font-mono">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Waiting for blockchain confirmation...
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/** Small sub-component for the review step */
function ReviewRow({ label, value, mono = false, multiline = false, highlight = false }) {
  return (
    <div className={`flex ${multiline ? 'flex-col gap-1' : 'items-center justify-between'}`}>
      <span className="text-sm text-muted">{label}</span>
      <span
        className={[
          'text-sm',
          highlight ? 'text-accent font-bold text-lg font-mono' : 'text-foreground',
          mono ? 'font-mono text-xs' : '',
          multiline ? 'text-foreground-secondary' : '',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}
