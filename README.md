# 🏹 Sherwood DEX

> "Take from the whales, give to the people"

A modern decentralized exchange (DEX) built for Robinhood Chain testnet, inspired by Uniswap V2 architecture.

## Features

- **Swap**: Trade tokens with automatic routing through liquidity pools
- **Liquidity**: Provide liquidity and earn fees from trades
- **Analytics**: View TVL, volume, and LP token prices
- **TWAP Oracle**: Built-in price oracle for trading pairs

## Architecture

### Smart Contracts (Solidity ^0.8.20)

- **SherwoodFactory**: Creates and manages liquidity pools
- **SherwoodPair**: AMM pair contract with ERC20 LP tokens
- **SherwoodRouter02**: Router for swaps and liquidity management
- **WETH**: Wrapped ETH for native token support
- **TREES**: Governance token with minting/burning

### Frontend (React + TypeScript)

- **wagmi + viem**: Web3 interactions
- **RainbowKit**: Wallet connection
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **Recharts**: Analytics visualization

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (for frontend)
- A wallet with RH Chain testnet tokens

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/sherwood-dex.git
cd sherwood-dex

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
bun install
```

### Deploy Contracts

```bash
cd contracts

# Compile
npx hardhat compile

# Deploy to Robinhood Chain testnet
npx hardhat run scripts/deploy.js --network robinhood
```

### Run Frontend

```bash
cd frontend

# Development
bun dev

# Build for production
bun run build
```

## Robinhood Chain Testnet

| Parameter | Value |
|-----------|-------|
| Chain ID | 46630 |
| RPC URL | https://rpc.testnet.chain.robinhood.com |
| Explorer | https://explorer.testnet.chain.robinhood.com |

## Contract Addresses (Testnet)

Update `frontend/src/config/contracts.json` after deployment.

## Security

- Reentrancy protection with mutex locks
- SafeMath for arithmetic operations
- Deadline protection for swaps
- Slippage tolerance settings

## License

MIT License

## Credits

Inspired by Uniswap V2 architecture.
