// mint-local.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

// --- Resolve __dirname in ESM (.mjs) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1) Load the compiled artifact for CompanyShares ---
const artifactPath = path.join(
  __dirname,
  "artifacts",
  "contracts",
  "CompanyShares.sol",
  "CompanyShares.json"
);

const artifactJson = fs.readFileSync(artifactPath, "utf8");
const artifact = JSON.parse(artifactJson);

console.log("Loaded artifact from:", artifactPath);

// --- 2) Setup provider (local Hardhat node) ---
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// --- 3) Configure keys & contract address ---
// IMPORTANT: use the SAME PRIVATE_KEY you used in deploy-local.mjs
// so that this account is the companyOwner and can call mintShare.
const PRIVATE_KEY =
  "0xPASTE_SAME_PRIVATE_KEY_YOU_USED_IN_DEPLOY_LOCAL_HERE"; // <- change this

// Paste the address that deploy-local.mjs printed for CompanyShares:
const CONTRACT_ADDRESS =
  "0xPASTE_DEPLOYED_COMPANY_SHARES_ADDRESS_HERE"; // <- change this

if (!PRIVATE_KEY || PRIVATE_KEY.length < 10) {
  throw new Error("Please set PRIVATE_KEY in mint-local.mjs");
}
if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.length < 10) {
  throw new Error("Please set CONTRACT_ADDRESS in mint-local.mjs");
}

// --- 4) Create wallet and contract instance ---
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

async function main() {
  const companyOwnerAddress = await wallet.getAddress();
  console.log("Company owner (minter):", companyOwnerAddress);

  // For now, mint to the same address as companyOwner.
  // Later you can replace this with any address from `npx hardhat node`.
  const to = companyOwnerAddress;

  // Example: mint tokenId = 1 with $15.50 => 1550 cents
  const tokenId = 1n;
  const acquisitionPriceCents = 1550n;

  console.log(
    `Minting share tokenId=${tokenId} to ${to} with acquisitionPriceCents=${acquisitionPriceCents}...`
  );

  const tx = await contract.mintShare(to, tokenId, acquisitionPriceCents);
  console.log("Mint tx hash:", tx.hash);
  await tx.wait();

  console.log("✅ Minted share successfully.");

  // --- 5) Read back ShareData for this tokenId ---
  const shareData = await contract.getShareData(tokenId);

  console.log(`ShareData for tokenId=${tokenId}:`);
  console.log({
    acquisitionPrice: shareData.acquisitionPrice.toString(), // "1550"
    mintedAt: shareData.mintedAt.toString(),
    lastTransferAt: shareData.lastTransferAt.toString(),
    previousOwner: shareData.previousOwner,
  });
}

main().catch((err) => {
  console.error("Error in mint-local.mjs:", err);
  process.exit(1);
});
