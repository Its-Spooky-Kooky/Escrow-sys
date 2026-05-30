/**
 * API Service — Axios instance configured for the ChainEscrow backend.
 * Handles JWT auth headers, request/response interceptors, and API calls.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chainescrow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle auth errors ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chainescrow_token');
      // Optionally redirect to connect wallet
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════

/**
 * Request a nonce for wallet signature authentication.
 */
export async function requestNonce(address) {
  const { data } = await api.post('/auth/nonce', { address });
  return data;
}

/**
 * Verify signed nonce and receive JWT.
 */
export async function verifySignature(address, signature) {
  const { data } = await api.post('/auth/verify', { address, signature });
  if (data.token) {
    localStorage.setItem('chainescrow_token', data.token);
  }
  return data;
}

/**
 * Clear auth state.
 */
export function logout() {
  localStorage.removeItem('chainescrow_token');
}

// ═══════════════════════════════════════════════
// GIG ENDPOINTS
// ═══════════════════════════════════════════════

/**
 * Fetch all gigs for the authenticated user.
 */
export async function fetchGigs(params = {}) {
  const { data } = await api.get('/gigs', { params });
  return data;
}

/**
 * Fetch a single gig by ID.
 */
export async function fetchGigById(gigId) {
  const { data } = await api.get(`/gigs/${gigId}`);
  return data;
}

/**
 * Create a new gig (draft state, before on-chain funding).
 */
export async function createGig(gigData) {
  const { data } = await api.post('/gigs', gigData);
  return data;
}

/**
 * Update gig status (called after on-chain tx confirmation).
 */
export async function updateGigStatus(gigId, status, txHash) {
  const { data } = await api.patch(`/gigs/${gigId}/status`, { status, txHash });
  return data;
}

/**
 * Submit work for a gig (freelancer action).
 */
export async function submitWork(gigId, submissionData) {
  const { data } = await api.post(`/gigs/${gigId}/submit`, submissionData);
  return data;
}

export default api;
