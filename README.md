# simple wormhole cli

A simple cli for transferring native tokens across different blockchain networks using wormhole (currently supports ethereum and solana)

**how wormhole core contract works**
- message submission: create tx on source chain and package tx into msg payload and submit it to guardian network for verification
- guardians verification: guardins observe and sign the message independently and VAA(verified action approvals) is produced from collections of signatures with message and metadata
- message reception and execution: on the target chain, executes actions such as minting tokens, updating states or calling specific contract functions

VAAs: verified action approvals are wormhole's core messaging primitive. they are packets of cross-chain data emitted whenever a cross-chain application contract interacts with the core contract.

guardians: wormhole relies on a set of distributed nodes that monitor the state on several blockchains. in wormhole, these nodes are referred to as guardians.

spies: spies are similar to guardians but their primary purpose is to subscribe to the gossiped messages across the guardian network

relayers: relayers are processes that deliver VAAs to their destination, they can't compromise security, only availability, and act as delivery mechanisms for VAAs without the capacity to tamper with the outcome.


**setup**

1. clone the repository
2. install dependencies
3. set up environment variables in .env file

**usage**

basic native token transfer: `npm start Sepolia Solana 0.1`