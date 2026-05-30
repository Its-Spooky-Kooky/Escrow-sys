/**
 * Web3Context — Global wallet connection state provider.
 *
 * Provides: account, provider, signer, chainId, isConnecting,
 *           connectWallet(), disconnectWallet()
 *
 * Handles MetaMask events: accountsChanged, chainChanged
 * Handles nonce-based auth flow with the backend.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import toast from 'react-hot-toast';
import { requestNonce, verifySignature, logout } from '../services/api';
import { truncateAddress } from '../utils/formatters';

const Web3Context = createContext(null);

const TARGET_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '80002');
const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || 'Polygon Amoy Testnet';

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Authenticate with backend via signed nonce.
   */
  const authenticateWithBackend = useCallback(async (signerInstance, address) => {
    try {
      // 1. Request nonce
      const { nonce } = await requestNonce(address);

      // 2. Sign nonce with MetaMask
      const signature = await signerInstance.signMessage(nonce);

      // 3. Verify signature, receive JWT
      await verifySignature(address, signature);

      setIsAuthenticated(true);
      toast.success(`Authenticated as ${truncateAddress(address)}`);
    } catch (error) {
      console.error('Auth failed:', error);
      // Don't block connection if backend is unreachable
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Signature rejected by user');
        throw error;
      }
      // Backend may not be running — still allow wallet connection
      toast('Backend auth skipped — connect backend for full features', {
        icon: '⚠️',
        duration: 4000,
      });
    }
  }, []);

  /**
   * Switch to the target chain.
   */
  const switchChain = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${TARGET_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // Chain not added — try adding it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
              chainName: CHAIN_NAME,
              rpcUrls: [import.meta.env.VITE_RPC_URL],
              blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER],
              nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            }],
          });
        } catch (addError) {
          console.error('Failed to add chain:', addError);
          toast.error(`Please add ${CHAIN_NAME} to MetaMask manually`);
        }
      }
    }
  }, []);

  /**
   * Connect wallet.
   */
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected. Please install it to continue.', {
        duration: 5000,
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      // 1. Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      // 2. Create provider & signer
      const browserProvider = new BrowserProvider(window.ethereum);
      const browserSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(browserSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // 3. Check chain
      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        toast(`Please switch to ${CHAIN_NAME}`, { icon: '🔗', duration: 4000 });
        await switchChain();
      }

      // 4. Authenticate with backend
      await authenticateWithBackend(browserSigner, accounts[0]);

    } catch (error) {
      console.error('Connection failed:', error);
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
      setAccount(null);
      setProvider(null);
      setSigner(null);
    } finally {
      setIsConnecting(false);
    }
  }, [authenticateWithBackend, switchChain]);

  /**
   * Disconnect wallet.
   */
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsAuthenticated(false);
    logout();
    toast.success('Wallet disconnected');
  }, []);

  /**
   * Listen for MetaMask events.
   */
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        // Re-authenticate with new account
        const browserProvider = new BrowserProvider(window.ethereum);
        browserProvider.getSigner().then((s) => {
          setSigner(s);
          setProvider(browserProvider);
          authenticateWithBackend(s, accounts[0]);
        });
      }
    };

    const handleChainChanged = (newChainId) => {
      const numericChainId = parseInt(newChainId, 16);
      setChainId(numericChainId);
      if (numericChainId !== TARGET_CHAIN_ID) {
        toast(`Wrong network. Please switch to ${CHAIN_NAME}`, {
          icon: '⚠️',
          duration: 5000,
        });
      }
      // Refresh provider
      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      browserProvider.getSigner().then(setSigner).catch(console.error);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, disconnectWallet, authenticateWithBackend]);

  /**
   * Auto-reconnect if previously connected.
   */
  useEffect(() => {
    const token = localStorage.getItem('chainescrow_token');
    if (token && window.ethereum) {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            const browserProvider = new BrowserProvider(window.ethereum);
            browserProvider.getSigner().then((s) => {
              setProvider(browserProvider);
              setSigner(s);
              setAccount(accounts[0]);
              setIsAuthenticated(true);
              browserProvider.getNetwork().then((n) => setChainId(Number(n.chainId)));
            });
          }
        })
        .catch(console.error);
    }
  }, []);

  /**
   * Listen for auth expiry events from the API interceptor.
   */
  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      toast.error('Session expired. Please reconnect your wallet.');
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isAuthenticated,
    isCorrectChain: chainId === TARGET_CHAIN_ID,
    connectWallet,
    disconnectWallet,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

/**
 * Hook to consume the Web3 context.
 */
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;
