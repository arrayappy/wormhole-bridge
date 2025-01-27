import {
  Wormhole,
  amount,
  wormhole,
  TokenTransfer,
} from '@wormhole-foundation/sdk';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { 
  parseArgs, 
  validateChain, 
  getChainName, 
  SignerStuff, 
  getSigner, 
  getTokenDecimals 
} from './utils';

async function setupTransfer(wh: Wormhole<any>, sourceChain: string, destChain: string) {
  const sendChain = wh.getChain(sourceChain as any);
  const rcvChain = wh.getChain(destChain as any);

  const source = await getSigner(sendChain);
  const destination = await getSigner(rcvChain);

  const token = Wormhole.tokenId(sendChain.chain, 'native');
  console.log('Using native token:', token);

  return { sendChain, rcvChain, source, destination, token };
}

async function executeTransfer(
  wh: Wormhole<any>,
  params: ReturnType<typeof parseArgs>,
  setup: Awaited<ReturnType<typeof setupTransfer>>
) {
  const { token, source, destination } = setup;
  const { amount: transferAmount, automatic, nativeGas } = params;

  const decimals = await getTokenDecimals(wh, token, setup.sendChain);
  const transferAmountNative = amount.units(amount.parse(transferAmount, decimals));
  const nativeGasAmount = nativeGas ? amount.units(amount.parse(nativeGas, decimals)) : undefined;

  const xfer = await wh.tokenTransfer(
    token,
    transferAmountNative,
    source.address,
    destination.address,
    automatic,
    undefined,
    nativeGasAmount
  );

  // Get and validate quote
  const quote = await TokenTransfer.quoteTransfer(wh, source.chain, destination.chain, xfer.transfer);
  if (automatic && quote.destinationToken.amount < 0) {
    throw new Error('Amount too low to cover fees and requested native gas');
  }

  // Execute transfer
  console.log('\nInitiating transfer...');
  const srcTxids = await xfer.initiateTransfer(source.signer);
  console.log(`Source TX: ${srcTxids[0]}`);
  console.log(`Wormhole TX: ${srcTxids[1] ?? srcTxids[0]}`);

  if (!automatic) {
    console.log('\nWaiting for attestation...');
    await xfer.fetchAttestation(120_000);
    
    console.log('Completing transfer...');
    const destTxids = await xfer.completeTransfer(destination.signer);
    console.log('Destination TX:', destTxids);
  }

  return xfer;
}

async function main() {
  try {
    const params = parseArgs();
    
    // Validate and normalize chain names
    const sourceChain = getChainName(params.sourceChain);
    const destChain = getChainName(params.destChain);
    
    if (!validateChain(sourceChain) || !validateChain(destChain)) {
      throw new Error('Invalid chain specified. Supported: Sepolia, Solana');
    }

    // Initialize and execute transfer
    const wh = await wormhole('Testnet', [evm, solana]);
    const setup = await setupTransfer(wh, sourceChain, destChain);
    await executeTransfer(wh, params, setup);

    console.log('\nTransfer completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('\nTransfer failed:', error.message || error);
    process.exit(1);
  }
}

main();
