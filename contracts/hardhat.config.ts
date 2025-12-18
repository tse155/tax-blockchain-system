import { defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: "0.8.20",
  networks: {
    // Local Hardhat node (npx hardhat node → http://127.0.0.1:8545)
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      // optional: chainId: 31337,
    },

    // We'll add sepolia later, but just so you see the pattern:
    /*
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
    */
  },
});
