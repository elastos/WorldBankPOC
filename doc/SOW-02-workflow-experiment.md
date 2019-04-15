# RPI Boot
## Luks and dm-crypt the root using Zymbit

## Boot RPi with PCR ready

## Starts docker containers after booting

### Agent Server after booting

The agent server will communicate with the Agent service in HPC. 

Agent server also respond to remote attestation. Verify the remote attestator is VRF selected. 

Agent server talks to RPi TPM Zymbit or Letstrust TPM, get PCR data and send to remote attestators upon request

### PXE and DHCP server
Add a nonce to the HPC OS image.
Everytime HPC boot, the nonce will change. so that everytime the hash won't be the same. to prevent replay attack.



# HPC Boot
## Boot from USB or PXE
Record OS hash to PCR
## Agent working 
Agent respond to RPi's request. 

## Start docker engine waiting for task
docker engine starts after boot

## Digital capsule engine
This runs outside of docker container at HPC's service level.
When new digital capsule comes from RPi, it start a new docker container based on the description of the digital capsule.

At experiment stage, a hello world digital capsule is fine.

# Minimized version of OS for HPC
Minimized Linux, remove all unused drivers unrelated to digital capsule work. 

# Docker engine enhancement, load image from IPFS
Original docker engine will load docker image from docker hub.
we should redirect to IPFS
also we will need RPi to check every image to be verfiied before downloading

# VRF in P2P network
Choose a practical VRF algorithm.
Make this VRF a whole network consensus. Easy to verify, even at low power IoT CPU

## Use VRF on selecting new node join verifier nodes
Before the credit score system is completed, we can use "flat" weight PBFT instead of "weighted" PBFT
## Use VRF on slelecting digital capsule execution nodes and verifier nodes

# Credit Score smart contract
First version on Solidity. future can be move to any modern languages.

Create a rule and implement using Solidity. 

