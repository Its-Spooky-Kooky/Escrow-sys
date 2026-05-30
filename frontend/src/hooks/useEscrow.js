/**
 * useEscrow — Custom hook abstracting all smart contract interactions.
 *
 * Provides: depositFunds, releaseFunds, raiseDispute, getEscrowDetails
 * Uses ethers.js v6 Contract interface with the connected signer.
 */

import { useState, useCallback, useMemo } from 'react';
import { Contract } from 'ethers';
import toast from 'react-hot-toast';
import { useWeb3 } from '../context/Web3Context';
import { ethToWei } from '../utils/formatters';

// ── Minimal ABI for the Escrow Contract ──
// This covers the core functions. Expand as contract evolves.
const ESCROW_ABI = [
  'function depositFunds(address freelancer, string gigId) payable',
  'function releaseFunds(string gigId)',
  'function raiseDispute(string gigId)',
  'function refund(string gigId)',
  'function getEscrow(string gigId) view returns (address client, address freelancer, uint256 amount, uint8 status)',
  'event FundsDeposited(string indexed gigId, address client, address freelancer, uint256 amount)',
  'event FundsReleased(string indexed gigId, address freelancer, uint256 amount)',
  'event DisputeRaised(string indexed gigId, address raisedBy)',
  'event Refunded(string indexed gigId, address client, uint256 amount)',
];

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function useEscrow() {
  const { signer, isCorrectChain } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  /**
   * Get a Contract instance connected to the signer.
   */
  const contract = useMemo(() => {
    if (!signer || !CONTRACT_ADDRESS) return null;
    return new Contract(CONTRACT_ADDRESS, ESCROW_ABI, signer);
  }, [signer]);

  /**
   * Guard: ensure wallet is connected and on correct chain.
   */
  const ensureReady = useCallback(() => {
    if (!signer) {
      toast.error('Please connect your wallet first');
      return false;
    }
    if (!isCorrectChain) {
      toast.error('Please switch to the correct network');
      return false;
    }
    if (!contract) {
      toast.error('Contract not configured. Check your .env file.');
      return false;
    }
    return true;
  }, [signer, isCorrectChain, contract]);

  /**
   * Deposit funds into escrow for a gig.
   * @param {string} freelancerAddress - Freelancer's wallet address
   * @param {string} gigId - Backend gig ID
   * @param {string} amountEth - Amount in ETH
   * @returns {object} Transaction receipt
   */
  const depositFunds = useCallback(async (freelancerAddress, gigId, amountEth) => {
    if (!ensureReady()) return null;

    setIsLoading(true);
    setTxHash(null);

    const toastId = toast.loading('Confirm transaction in MetaMask...');

    try {
      const value = ethToWei(amountEth);

      const tx = await contract.depositFunds(freelancerAddress, gigId, { value });

      setTxHash(tx.hash);
      toast.loading('Transaction pending... Waiting for confirmation', { id: toastId });

      const receipt = await tx.wait();

      toast.success('Funds locked securely! 🔒', { id: toastId, duration: 5000 });
      return receipt;

    } catch (error) {
      handleTxError(error, toastId);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, ensureReady]);

  /**
   * Release funds to freelancer.
   * @param {string} gigId - Backend gig ID
   * @returns {object} Transaction receipt
   */
  const releaseFunds = useCallback(async (gigId) => {
    if (!ensureReady()) return null;

    setIsLoading(true);
    setTxHash(null);

    const toastId = toast.loading('Confirm release in MetaMask...');

    try {
      const tx = await contract.releaseFunds(gigId);
      setTxHash(tx.hash);
      toast.loading('Releasing funds... Waiting for confirmation', { id: toastId });

      const receipt = await tx.wait();

      toast.success('Funds released to freelancer! 💸', { id: toastId, duration: 5000 });
      return receipt;

    } catch (error) {
      handleTxError(error, toastId);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, ensureReady]);

  /**
   * Raise a dispute on a gig.
   * @param {string} gigId - Backend gig ID
   * @returns {object} Transaction receipt
   */
  const raiseDispute = useCallback(async (gigId) => {
    if (!ensureReady()) return null;

    setIsLoading(true);
    setTxHash(null);

    const toastId = toast.loading('Confirm dispute in MetaMask...');

    try {
      const tx = await contract.raiseDispute(gigId);
      setTxHash(tx.hash);
      toast.loading('Raising dispute... Waiting for confirmation', { id: toastId });

      const receipt = await tx.wait();

      toast.success('Dispute raised successfully', { id: toastId, duration: 5000 });
      return receipt;

    } catch (error) {
      handleTxError(error, toastId);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, ensureReady]);

  /**
   * Get on-chain escrow details.
   * @param {string} gigId - Backend gig ID
   * @returns {object} { client, freelancer, amount, status }
   */
  const getEscrowDetails = useCallback(async (gigId) => {
    if (!contract) return null;

    try {
      const [client, freelancer, amount, status] = await contract.getEscrow(gigId);
      return { client, freelancer, amount, status };
    } catch (error) {
      console.error('Failed to fetch escrow details:', error);
      return null;
    }
  }, [contract]);

  return {
    depositFunds,
    releaseFunds,
    raiseDispute,
    getEscrowDetails,
    isLoading,
    txHash,
    contract,
  };
}

/**
 * Centralized transaction error handler.
 */
function handleTxError(error, toastId) {
  console.error('Transaction error:', error);

  if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
    toast.error('Transaction cancelled by user', { id: toastId });
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    toast.error('Insufficient funds for this transaction', { id: toastId });
  } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    toast.error('Transaction would fail — check contract conditions', { id: toastId });
  } else {
    const reason = error.reason || error.message || 'Transaction failed';
    toast.error(reason.length > 80 ? reason.slice(0, 80) + '...' : reason, { id: toastId });
  }
}

export default useEscrow;
