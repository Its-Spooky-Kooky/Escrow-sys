const express = require("express");
const router = express.Router();
const { getNonce, verifySignature } = require("../controllers/authController");

/**
 * Auth Routes (Web3 Wallet-Based Authentication)
 *
 * POST /api/auth/nonce   — Request a unique nonce challenge for a wallet address
 * POST /api/auth/verify  — Submit a signed nonce to receive a JWT session token
 */

// Step 1: Client requests a nonce to sign
router.post("/nonce", getNonce);

// Step 2: Client submits the signed nonce for verification
router.post("/verify", verifySignature);

module.exports = router;
