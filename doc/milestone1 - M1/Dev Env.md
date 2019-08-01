# Some design considerations for PoC stage
As we have limited resources and limited time. We need to make some compromise to reach our goal on time. 
This is just a PoC. The goal is to demo to future investor how it should work in real life. This is not a performance test prototype. So as long as we can dev quick and dirty, we can compromise performance at this point. As long as the concept get approved by our potential clients. We can redo most modules using RUST or other high performance technologies.

So at this point, I am OK to use JS, TS, Python etc to build each modules individually. Use REST to connect each modules. Each modules can be running in different docker containers if needed. I know the performance won't be good, but I think it is OK for demoing the concept.

Additional benefits is that each small dev group can use whatever language or platform they are familar to build their module without concern too much about integration, since the REST will be supportted by almost everything. 

In the future, I would prefer to rewrite most of the modules in RUST and internal integration rather than REST to reduce the overhead.

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

MAP ( PeerID -> CreditScore)

When look up PeerID not existing in the data base. the result CreditScore is 0. It could be a non-trusted regular nodes or new join nodes without any credit yet.

## VRF verification

## Approval concensus

## Update Credit Score

## Distribution of bonus

## Inflation control

