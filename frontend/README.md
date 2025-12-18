# Frontend - React Application

Modern React interface for share management and blockchain integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

3. Add smart contract artifacts:
```bash
# Copy CompanyShares.json to src/contracts/
cp ../contracts/artifacts/contracts/CompanyShares.sol/CompanyShares.json src/contracts/
```

4. Run development server:
```bash
npm run dev
```

## Features

- 🏢 Company creation and management
- 📊 Share portfolio visualization
- 🔄 Share transfer with tax calculations
- 🔗 MetaMask integration
- ⛓️ Blockchain transaction tracking

## Key Components

- `DeployContract.jsx` - Deploy smart contracts
- `MintShares.jsx` - Mint shares as NFTs
- `BlockchainTransfer.jsx` - Transfer shares on-chain
- `SharesOwned.jsx` - Portfolio view
- `CompanyLedger.jsx` - Audit trail
