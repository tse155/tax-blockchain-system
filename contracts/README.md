# Smart Contracts - Solidity

ERC-721 NFT contracts for tokenized share ownership.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```

3. Compile contracts:
```bash
npx hardhat compile
```

4. Run tests:
```bash
npx hardhat test
```

5. Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Contract: CompanyShares.sol

ERC-721 token representing company shares with:
- Acquisition price tracking
- Transfer history
- Company owner restrictions
- Maximum 20 shares per contract

### Key Functions

- `mintShare(address to, uint256 tokenId, uint256 priceCents)` - Mint new share
- `transferWithPrice(address to, uint256 tokenId, uint256 priceCents)` - Transfer with price
- `getShareData(uint256 tokenId)` - Retrieve share metadata
