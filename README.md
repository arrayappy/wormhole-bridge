# Cross-Chain Native Token Transfer with Wormhole CLI

A command-line interface for transferring native tokens across different blockchain networks using Wormhole.

## Supported Chains

- Ethereum (Sepolia Testnet)
- Solana (Devnet)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Add your private keys to the .env file:

```
ETH_PRIVATE_KEY=your_ethereum_private_key
SOL_PRIVATE_KEY=your_solana_private_key
```

## Usage

Basic native token transfer:

```bash
npm start Sepolia Solana 0.1
```

Automatic transfer with native gas:

```bash
npm start Sepolia Solana 0.1 --automatic --native-gas 0.01
```

### Command Structure

```bash
npm start <sourceChain> <destinationChain> <amount> [--automatic] [--native-gas <amount>]
```

- `sourceChain`: The chain to send from (Sepolia, Solana)
- `destinationChain`: The chain to send to (Sepolia, Solana)
- `amount`: Amount of native tokens to transfer
- `--automatic`: (Optional) Enable automatic transfer
- `--native-gas <amount>`: (Optional) Amount of native gas to provide for automatic transfers

## Examples

1. Transfer 0.1 native tokens from Ethereum to Solana:

```bash
npm start Sepolia Solana 0.1
```

2. Automatic transfer with native gas:

```bash
npm start Sepolia Solana 0.1 --automatic --native-gas 0.01
```

3. Transfer native tokens from Solana to Ethereum:

```bash
npm start Solana Sepolia 0.1
```

## Notes

- This CLI is configured to use native tokens by default
- For Ethereum, it uses the Sepolia testnet
- For Solana, it uses Devnet
- All amounts should be specified in the native token denomination of the source chain
