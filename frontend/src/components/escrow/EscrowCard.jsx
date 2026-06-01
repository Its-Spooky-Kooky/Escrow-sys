/**
 * EscrowCard — Grid item displaying a gig's key info.
 *
 * Shows: title, amount (ETH), status badge, client/freelancer address,
 *        creation date, and a hover-reveal action area.
 */

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Coins,
  User,
  Briefcase,
} from 'lucide-react';
import { truncateAddress, weiToEth, getStatusConfig, timeAgo } from '../../utils/formatters';

export default function EscrowCard({ gig, userRole, index = 0 }) {
  const status = getStatusConfig(gig.status);
  const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

  return (
    <Link
      to={`/gig/${gig._id}`}
      id={`escrow-card-${gig._id}`}
      className={[
        'group relative block',
        'bg-card border border-border rounded-2xl',
        'p-5 sm:p-6',
        'transition-all duration-300 ease-out',
        'hover:border-border-highlight hover:bg-card-hover hover:shadow-card-hover',
        'hover:-translate-y-1',
        'animate-slide-up opacity-0',
        staggerClass,
      ].join(' ')}
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-border pointer-events-none" />

      {/* ── Header: Title + Status ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {gig.title || 'Untitled Gig'}
        </h3>
        <span
          className={[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap',
            status.bg,
            status.color,
          ].join(' ')}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* ── Amount ── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-glow">
          <Coins className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground font-mono tracking-tight">
            {weiToEth(gig.amount)} <span className="text-sm font-normal text-muted">ETH</span>
          </p>
        </div>
      </div>

      {/* ── Parties ── */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <Briefcase className="h-3.5 w-3.5 text-muted shrink-0" />
          <span className="text-muted">Client:</span>
          <span className="font-mono">{truncateAddress(gig.client)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <User className="h-3.5 w-3.5 text-muted shrink-0" />
          <span className="text-muted">Freelancer:</span>
          <span className="font-mono">{truncateAddress(gig.freelancer)}</span>
        </div>
      </div>

      {/* ── Footer: Date + Arrow ── */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3 w-3" />
          {gig.createdAt ? timeAgo(gig.createdAt) : 'Just now'}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted group-hover:text-accent transition-colors duration-200">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
