# 🔗 Tax Blockchain System

A full-stack blockchain application for transparent share ownership and Ecuadorian tax compliance.

## 🎯 Features

- **Share Tokenization**: Companies can tokenize shares as ERC-721 NFTs
- **Ecuadorian Tax Compliance**: Automatic capital gains tax calculations
- **Blockchain Audit Trail**: Immutable record of all share transfers
- **Multi-Role System**: Authority, Incorporator, and Shareholder roles
- **Smart Contract Integration**: Deployed on Ethereum Sepolia testnet

## 🏗️ Tech Stack

**Backend:**
- Django REST Framework
- PostgreSQL
- Python 3.x

**Frontend:**
- React 18
- Vite
- ethers.js

**Blockchain:**
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Sepolia Testnet

## 📁 Project Structure
```
tax-blockchain-system/
├── backend/           # Django REST API
├── frontend/          # React application
├── contracts/         # Solidity smart contracts
└── docs/              # Documentation & screenshots
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- MetaMask wallet

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Smart Contracts Setup
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

## 📝 Environment Variables

See individual README files in each folder for specific environment variables needed.

## 🎓 Demo

[Add screenshots/GIFs here]

## 📄 License

MIT

## 👤 Author

[Your Name]
- GitHub: [@yourusername]
- LinkedIn: [Your LinkedIn]

## 🙏 Acknowledgments

Built for [Conference Name] presentation on blockchain-based tax compliance.
