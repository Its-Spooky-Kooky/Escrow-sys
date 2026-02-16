let provider, signer, contract;

const contractAddress = "YOUR_CONTRACT_ADDRESS";
const abi = [
  "function releaseFunds() public"
];

async function connectWallet() {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);
  alert("Wallet connected");
}

async function release() {
  const tx = await contract.releaseFunds();
  await tx.wait();
  alert("Funds released");
}
