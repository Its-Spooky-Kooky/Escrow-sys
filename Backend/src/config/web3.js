const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

let provider = null;
let escrowFactoryContract = null;

/**
 * Initializes the Ethers.js JSON-RPC provider and, if available,
 * loads the EscrowFactory contract instance.
 *
 * Designed for graceful degradation:
 * - If RPC_URL is missing, the provider is skipped (offline mode).
 * - If ESCROW_FACTORY_ADDRESS or ABI file is missing, the contract
 *   instance is skipped but the provider still works for signature verification.
 */
const initWeb3 = () => {
  // --- Step 1: Initialize the RPC Provider ---
  const rpcUrl = process.env.RPC_URL;

  if (!rpcUrl) {
    console.warn(
      "[Web3] WARNING: RPC_URL not set in .env. Blockchain listener is disabled. " +
        "Off-chain APIs and Web3 Auth will still work."
    );
    return { provider: null, escrowFactoryContract: null };
  }

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log(`[Web3] JSON-RPC Provider connected: ${rpcUrl}`);
  } catch (error) {
    console.error(`[Web3] Failed to connect RPC Provider: ${error.message}`);
    return { provider: null, escrowFactoryContract: null };
  }

  // --- Step 2: Load the EscrowFactory Contract (if address & ABI exist) ---
  const factoryAddress = process.env.ESCROW_FACTORY_ADDRESS;

  if (!factoryAddress) {
    console.warn(
      "[Web3] WARNING: ESCROW_FACTORY_ADDRESS not set in .env. " +
        "Contract event listener is disabled."
    );
    return { provider, escrowFactoryContract: null };
  }

  // Attempt to load the ABI from src/config/abis/EscrowFactory.json
  const abiPath = path.join(__dirname, "abis", "EscrowFactory.json");

  if (!fs.existsSync(abiPath)) {
    console.warn(
      `[Web3] WARNING: ABI file not found at ${abiPath}. ` +
        "Contract event listener is disabled. " +
        "Place the compiled EscrowFactory ABI there to enable it."
    );
    return { provider, escrowFactoryContract: null };
  }

  try {
    const abiFile = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
    // Support both raw ABI arrays and Hardhat artifact objects ({ abi: [...] })
    const abi = Array.isArray(abiFile) ? abiFile : abiFile.abi;

    escrowFactoryContract = new ethers.Contract(factoryAddress, abi, provider);
    console.log(
      `[Web3] EscrowFactory contract loaded at: ${factoryAddress}`
    );
  } catch (error) {
    console.error(
      `[Web3] Failed to load EscrowFactory contract: ${error.message}`
    );
  }

  return { provider, escrowFactoryContract };
};

module.exports = { initWeb3, getProvider: () => provider, getEscrowFactoryContract: () => escrowFactoryContract };
