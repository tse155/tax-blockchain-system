// deploy-local.mjs
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

// TODO: paste one of the private keys printed by `npx hardhat node` here:
const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; 

if (!PRIVATE_KEY || PRIVATE_KEY.length < 10) {
  throw new Error("Please set PRIVATE_KEY in deploy-local.mjs");
}

// --- 3) Create wallet and contract factory ---
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("Deploying from address:", await wallet.getAddress());

const factory = new ethers.ContractFactory(
  artifact.abi,
  artifact.bytecode,
  wallet
);

// --- 4) Deploy the contract ---
console.log("Sending deploy transaction...");

const contract = await factory.deploy(); // CompanyShares has no constructor args

console.log("Deployment tx hash:", contract.deploymentTransaction().hash);

console.log("Waiting for deployment confirmation...");
await contract.waitForDeployment();

const address = await contract.getAddress();
console.log("✅ CompanyShares deployed at:", address);
