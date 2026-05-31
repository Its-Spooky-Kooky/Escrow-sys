/**
 * Utility formatters for the ChainEscrow frontend.
 * Handles wallet address display, ETH conversions, timestamps, and status mapping.
 */

import { formatEther, parseEther } from 'ethers';

/**
 * Truncate an Ethereum address for display.
 * "0x1234567890abcdef..." → "0x1234...cdef"
 */
export function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return '';
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Convert wei (BigInt or string) to ETH string with fixed decimal places.
 */
export function weiToEth(wei, decimals = 4) {
  if (!wei) return '0';
  try {
    const eth = formatEther(wei);
    return parseFloat(eth).toFixed(decimals);
  } catch {
    return '0';
  }
}

/**
 * Convert ETH string to wei BigInt for contract calls.
 */
export function ethToWei(eth) {
  if (!eth) return 0n;
  try {
    return parseEther(eth.toString());
  } catch {
    return 0n;
  }
}

/**
 * Format a timestamp (seconds or ms) into a human-readable date.
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const ms = typeof timestamp === 'number' && timestamp < 1e12
    ? timestamp * 1000
    : Number(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const ms = typeof timestamp === 'number' && timestamp < 1e12
    ? timestamp * 1000
    : Number(timestamp);
  const seconds = Math.floor((Date.now() - ms) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/**
 * Escrow status mapping for display.
 */
export const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'text-subtle',
    bg: 'bg-card',
    dot: 'bg-subtle',
  },
  funded: {
    label: 'Funded',
    color: 'text-accent',
    bg: 'bg-accent-glow',
    dot: 'bg-accent',
  },
  submitted: {
    label: 'Work Submitted',
    color: 'text-warning',
    bg: 'bg-warning-bg',
    dot: 'bg-warning',
  },
  released: {
    label: 'Released',
    color: 'text-success',
    bg: 'bg-success-bg',
    dot: 'bg-success',
  },
  disputed: {
    label: 'Disputed',
    color: 'text-danger',
    bg: 'bg-danger-bg',
    dot: 'bg-danger',
  },
  refunded: {
    label: 'Refunded',
    color: 'text-info',
    bg: 'bg-info-bg',
    dot: 'bg-info',
  },
};

/**
 * Get status config with safe fallback.
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.draft;
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}
