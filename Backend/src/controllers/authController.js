const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * @desc    Generate a unique nonce challenge for wallet-based login
 * @route   POST /api/auth/nonce
 * @access  Public
 *
 * If the wallet address has never been seen, a new User record is created.
 * Returns a nonce string that the client must sign with their private key.
 */
const getNonce = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "walletAddress is required in the request body.",
      });
    }

    // Normalize to lowercase for consistent lookups
    const normalizedAddress = walletAddress.toLowerCase();

    // Validate that it's a proper Ethereum address format
    if (!ethers.isAddress(normalizedAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethereum wallet address format.",
      });
    }

    // Find existing user or create a new one (upsert)
    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      user = await User.create({ walletAddress: normalizedAddress });
      console.log(`[Auth] New user registered: ${normalizedAddress}`);
    } else {
      // Regenerate nonce for existing users to prevent replay attacks
      await user.regenerateNonce();
      console.log(`[Auth] Nonce refreshed for: ${normalizedAddress}`);
    }

    res.status(200).json({
      success: true,
      nonce: user.nonce,
      message: "Sign this nonce with your wallet to authenticate.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify the signed nonce and issue a JWT
 * @route   POST /api/auth/verify
 * @access  Public
 *
 * The client signs the nonce string with their private key (via MetaMask or Ethers).
 * This endpoint recovers the signer address from the signature and compares it
 * to the submitted wallet address. If they match, a JWT is issued.
 */
const verifySignature = async (req, res, next) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        message: "walletAddress and signature are both required.",
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // 1. Look up the user and their stored nonce
    const user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found. Please request a nonce first via /api/auth/nonce.",
      });
    }

    // 2. Recover the signer address from the signature
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(user.nonce, signature);
    } catch (sigError) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature format. Could not recover address.",
      });
    }

    // 3. Compare the recovered address to the claimed wallet address
    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({
        success: false,
        message:
          "Signature verification failed. The recovered address does not match.",
      });
    }

    // 4. Signature is valid — invalidate the nonce to prevent replay attacks
    await user.regenerateNonce();

    // 5. Issue a signed JWT token
    const token = jwt.sign(
      {
        id: user._id,
        walletAddress: user.walletAddress,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    console.log(`[Auth] User authenticated: ${normalizedAddress}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role,
        rating: user.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNonce, verifySignature };
