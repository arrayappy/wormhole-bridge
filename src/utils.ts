import { Chain, Network, TokenId, Wormhole, ChainContext, Signer, ChainAddress, isTokenId } from '@wormhole-foundation/sdk';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { config } from 'dotenv';
config();

// Types
export interface SignerStuff<N extends Network, C extends Chain> {
  chain: ChainContext<N, C>;
  signer: Signer<N, C>;
  address: ChainAddress<C>;
}

export interface TransferParams {
  sourceChain: string;
  destChain: string;
  amount: string;
  automatic: boolean;
  nativeGas?: string;
}

// Environment and Configuration
function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
}

const SUPPORTED_CHAINS = ['Sepolia', 'Solana'] as const;
const CHAIN_ALIASES = {
  'Ethereum': 'Sepolia',
  'ETH': 'Sepolia',
  'Sepolia': 'Sepolia',
  'Solana': 'Solana',
  'SOL': 'Solana',
} as const;

// CLI Arguments Parser
export function parseArgs(): TransferParams {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      'Usage: npm start <sourceChain> <destinationChain> <amount> [--automatic] [--native-gas <amount>]'
    );
    process.exit(1);
  }

  return {
    sourceChain: args[0],
    destChain: args[1],
    amount: args[2],
    automatic: args.includes('--automatic'),
    nativeGas: args.indexOf('--native-gas') !== -1 ? args[args.indexOf('--native-gas') + 1] : undefined,
  };
}

// Chain Validation and Normalization
export function validateChain(chain: string): boolean {
  return SUPPORTED_CHAINS.includes(chain as any);
}

export function getChainName(chain: string): string {
  const normalizedChain = chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase();
  return CHAIN_ALIASES[normalizedChain as keyof typeof CHAIN_ALIASES] || normalizedChain;
}

// Blockchain Interactions
export async function getSigner<N extends Network, C extends Chain>(
  chain: ChainContext<N, C>
): Promise<SignerStuff<N, C>> {
  const platform = chain.platform.utils()._platform;
  let signer: Signer;

  switch (platform) {
    case 'Solana':
      signer = await (await solana()).getSigner(await chain.getRpc(), getEnv('SOL_PRIVATE_KEY'));
      break;
    case 'Evm':
      signer = await (await evm()).getSigner(await chain.getRpc(), getEnv('ETH_PRIVATE_KEY'));
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return {
    chain,
    signer: signer as Signer<N, C>,
    address: Wormhole.chainAddress(chain.chain, signer.address()),
  };
}

export async function getTokenDecimals<N extends 'Mainnet' | 'Testnet' | 'Devnet'>(
  wh: Wormhole<N>,
  token: TokenId,
  sendChain: ChainContext<N, any>
): Promise<number> {
  return isTokenId(token)
    ? Number(await wh.getDecimals(token.chain, token.address))
    : sendChain.config.nativeTokenDecimals;
}