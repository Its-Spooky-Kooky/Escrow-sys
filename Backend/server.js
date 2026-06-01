const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST, before anything else reads them
dotenv.config();

const connectDB = require("./src/config/db");
const { initWeb3, getEscrowFactoryContract } = require("./src/config/web3");
const authRoutes = require("./src/routes/authRoutes");
const gigRoutes = require("./src/routes/gigRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const Gig = require("./src/models/Gig");

// ============================================================================
// Initialize Express Application
// ============================================================================
const app = express();

// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend
app.use(express.json()); // Parse incoming JSON request bodies

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Escrow Backend API is running.",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      gigs: "/api/gigs",
    },
  });
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);

// --- 404 Handler (for undefined routes) ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --- Centralized Error Handler (must be last middleware) ---
app.use(errorHandler);

// ============================================================================
// Blockchain Event Listener (Graceful — only runs if contract is configured)
// ============================================================================
/**
 * Listens for on-chain events emitted by the EscrowFactory contract
 * and updates the corresponding Gig records in MongoDB automatically.
 *
 * This ensures the off-chain database stays perfectly in sync with
 * the blockchain state, without trusting any client-side updates.
 */
const startBlockchainListener = (contract) => {
  if (!contract) return;

  console.log("[Blockchain Listener] Starting on-chain event listener...");

  // --- EscrowFunded Event ---
  try {
    contract.on("EscrowFunded", async (gigId, client, freelancer, amount, event) => {
      try {
        console.log(`[Event: EscrowFunded] Gig ID: ${gigId}, Amount: ${amount}`);
        await Gig.findByIdAndUpdate(gigId.toString(), {
          status: "funded",
          txHash: event.log.transactionHash,
          contractAddress: event.log.address,
          blockchainEscrowId: gigId.toString(),
        });
        console.log(`[Event: EscrowFunded] Database updated for gig: ${gigId}`);
      } catch (err) {
        console.error(`[Event: EscrowFunded] Failed to update DB: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`[Blockchain Listener] EscrowFunded event not found in ABI, skipping.`);
  }

  // --- EscrowReleased Event ---
  try {
    contract.on("EscrowReleased", async (gigId, event) => {
      try {
        console.log(`[Event: EscrowReleased] Gig ID: ${gigId}`);
        await Gig.findByIdAndUpdate(gigId.toString(), { status: "released" });
        console.log(`[Event: EscrowReleased] Database updated for gig: ${gigId}`);
      } catch (err) {
        console.error(`[Event: EscrowReleased] Failed to update DB: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`[Blockchain Listener] EscrowReleased event not found in ABI, skipping.`);
  }

  // --- DisputeRaised Event ---
  try {
    contract.on("DisputeRaised", async (gigId, initiator, event) => {
      try {
        console.log(`[Event: DisputeRaised] Gig ID: ${gigId}, By: ${initiator}`);
        await Gig.findByIdAndUpdate(gigId.toString(), { status: "disputed" });
        console.log(`[Event: DisputeRaised] Database updated for gig: ${gigId}`);
      } catch (err) {
        console.error(`[Event: DisputeRaised] Failed to update DB: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`[Blockchain Listener] DisputeRaised event not found in ABI, skipping.`);
  }

  // --- EscrowRefunded Event ---
  try {
    contract.on("EscrowRefunded", async (gigId, event) => {
      try {
        console.log(`[Event: EscrowRefunded] Gig ID: ${gigId}`);
        await Gig.findByIdAndUpdate(gigId.toString(), { status: "refunded" });
        console.log(`[Event: EscrowRefunded] Database updated for gig: ${gigId}`);
      } catch (err) {
        console.error(`[Event: EscrowRefunded] Failed to update DB: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`[Blockchain Listener] EscrowRefunded event not found in ABI, skipping.`);
  }

  console.log("[Blockchain Listener] Listening for on-chain events.");
};

// ============================================================================
// Start the Server
// ============================================================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize Web3 (graceful — won't crash if unconfigured)
    const { escrowFactoryContract } = initWeb3();

    // 3. Start blockchain event listener (only if contract is loaded)
    startBlockchainListener(escrowFactoryContract);

    // 4. Start Express HTTP server
    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`  Escrow Backend API`);
      console.log(`  Running on: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error(`[Server] Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
