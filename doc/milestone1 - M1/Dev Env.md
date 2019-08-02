

# Respberry Pi Single Node
Developer can choose either run each process in one docker container or separate each process in different docker container. 
I think we can try without separate docker container at first. since we do not have complex configurations. It would be easier to run each process from command line and open Tcp ports to communicate with other modules in a single container. We can try this way until we find it is necessary to separate different modules into different containers. 

## Ports
I will list a few ports I think we may need to communicate. Then write in each modules detail spec on the communication protocol

### Commander Hub Port 7801

### LibP2P Port 7802

The standard P2P network node. Suggest to be written useing Node.js and Libp2p. It will be replaced with Elastos Carrier interface later. The design need to be interchangable with Elastos Carrier and other P2P network (such as TOP Network, NKN etc). So the lower level communication should be decoupled with the main logic.

Interface between main logic layer and communication layer(replaceable) is here < TBD >


### VRF Port 7803

Suggest to be written in Rust.
Using https://medium.com/witnet/announcing-our-verifiable-random-function-vrf-rust-library-2e042c29a4f7
Library: https://github.com/witnet/vrf-rs

It will be compatible with the Solidify implementation   https://github.com/witnet/vrf-solidity  which will be used in our smart contract to verify VRF.

### Ethereum Bridge (AKA EthBridge) 7804
In charge of communication between the RPi node and Ethereum blockchain (Testnet during poc).
It should run a cache of our smart contract account's latest state of Etherium state machine. All inquery can be done from the cache without remote call to outside Ethereium nodes.

The cache will be incharge of sync up with the outside Ethereunm state

This module is also in charge of submitting transaction (web3) to Etherium smart contract and handle response for the results

Suggest to be written in Node.js

### Remote Attestation (RA) Port 7805

When this node is selected to be an RA to other nodes, this module will receive other nodes's Proof of Trust (PoT) and verify using the logic in this module. If approve, pass the result to EthBridge to sign

### TPM-Bridge Port 7806
Communication between REST interface and TPM.

Upon Request from other modules, ask the TPM to get PoT information (signed by TPM first) and return to requestors

# Ethereum Smart Contract

The smart contract will be running in Elastos Eth side chain (test net in PoC stage)

## Data structure
We use Ethereum state machine as an immutable database to store every node's credit score. The score can only be modified by smart contract based on VRF selected nodes' input. The business logic is the most important part of the whole project. 

The data structure is simply a key-value pair

MAP ( PeerID -> CreditScore)

When look up PeerID not existing in the data base. the result CreditScore is 0. It could be a non-trusted regular nodes or new join nodes without any credit yet.

## VRF verification
During the PoC stage, we can use
https://github.com/witnet/vrf-solidity
to verify VRF to make sure the node who provide RA result or task result is actually VRF selected node. If not, a penalty will be applied (such as reduce credit score). If yes, then continue the logic to either issue reward or penalty.

## New Joined Node Approval concensus
1. A node want to earn the reward as being a RA node, it can listen to pub/sub channel of "RemoteAttestators"
2. In this channel, as long as there is a new joined node, the new node's req tx (inc. peer ID) will be broadcast to this channel. All subscribers will receive its "new join req". The New Join Req is a structure including new node's peer ID and time stamp and placeholder (this placeholder will be replaced by the next Elastos mainchain block hash).

struct{
  PeerId: hash64,
  NextElastosBlockHash: hash256,
  RA_Node_PeerId: hash64,
  Timestamp: DateTime,
  etc...
}

3. When next block is mined, The next elastos main chain block hash takes place the placeholder in "New Join Req" tx. The hash of this tx is a "non predictable hash" at the time of new node send this tx.
4. RA node will replace the placeholder RA_Node_PeerId with it's own Peer ID. For every RA node, this value would be different
5. 


## Update Credit Score

## Distribution of bonus

## Inflation control

