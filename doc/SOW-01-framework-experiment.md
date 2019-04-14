

# System Management Mode Agent feasible experiment
## Find a bois programming tools such as CoreBoot
Find a toosl such as coreboot https://www.coreboot.org/developers.html, try to get familiar about how the SMM work on a PC.

Inject a hello world and make sure it works

## Agent communicate with TPM
Send command to TPM and get response.
## Agent communicate with Agent Services on PC
Agent services is running on PC after system boot from PXE.
It will respond to RPI's agent server's request, then generate a command to Agent inside SMM

This experiment will test the Agent Service can request an interupt to lunch the Agent handler inside SMM. A simple hello world would be fine.

## Agent communicate with RPi Agent server on RPi
When Agent handler execute, try to send a message to RPi. a hello world would be fine.

The dataflow will be something like this:
RPI Agent Server -- trigger --> HPC's Agent Service -- trigger --> HPC's Agent in SMM -- execute commmand (with TPM likely) and send result to --> RPI Agent server. 

As far as I know the SMM handler is passive, it could not active create an event. Please correct me if I am wrong.

## Test SMM Agent will coexist with exsiting BIOS and run without problem when HPC boot

We can send this test to GMU lab to make sure it works.

# HPC TPM

## TPM 2.0 command test
Try to use TPM2.0 TSS APi to communicate with HPC's TPM, make sure the response is correct

## Log correct PCR and response when Agent request
When system boot, record PCR. 
when Agent request, generate signed PCR back to agent.

# PXE Booting experiment
Setup DHCP server as a docker container in RPi.
Install PXE server as a docker container in RPi. 
Set HPC boot from LAN. 
Physically connect RPi to HPC using Ethernet
Expect HPC can get IP address from RPi's DHCP. 
Expect HPC to boot from RPi's PXE server.

# USB Booting experiment
RPI Zero Single Board Computer to put into a USB thumb drive interface.
HPC can boot from this USB thumb drive.
RPI Zero can dynamically create the content in the volumn in the USB drive. 

In this case, the HPC can boot everytime from USB drive with different hash of OS image. "Nonce"
This Hash is supposed to be recorded into HPC's PCR, and then be send to RPi remote attestor upon request

# Carrier P2P network between RPis
Run Elastos Carrier (or other platform which can offer similiar features) in docker container.
they can send receive messages, add/remove friends.

# Carrier P2P network with placeholder Proof of Trust
Add a placeholder in Carrier. Only handshake when new join node can provide some kind of proof of trust.
Do not consensus yet, just a placeholder. The place holder could be check the blockchain and allow connect if the node is registered as "good node". 

# Expandable Proof of Trust evaluation function
A score system based on the information coming from TPM and Agent to determine if a node is trustable.

This function should be easy to upgrade. Sounce code should be in IPFS and update easily with replacement new hash.

In the experiment stage, we can starts simple and stupid. Exhance in the future.

# PBFT consensus between Carrier nodes and smart contract
Selected nodes (in the future using VRF) to run PBFT to decide is a node is trustable. If yes, sign and call layer-1 smart contract to set the new node "trust" property and allow to join the network.

