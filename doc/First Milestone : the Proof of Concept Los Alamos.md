# Timeline
Aug 1st 2019 to Dec 22nd 2019

# Goal

## Use
With the basic PoC demo we can easily and clearly explain the concept of trusted computing to potential investors or clients. Without this demo, we just have a slidesware on paper, and the concept is too new to explain to non-technical investors. This is the goal of this milestone

## Limitation
Due to limited budget and time constrains. We are not possible to complete a "solid" demo. I am OK with the following conpromise
- Placeholders are allowed for those key components which cannot completed. Such as SMM, VRF, PoET etc
- Developers can build their demo on any lanauge or platform they are familiar with, as long as keeping the communication protocol to work with other modules. 
- It is OK the demo modules not compatible with existing Elastos platform, as long as technically it can be compatible with Elastos platform.
- A simple UI is OK as long as it explains the concept under the hood
- Bugs even crashes are torleranced as long as they can be handled gracefully and not happening every seconds

# Demo Tasks

## Permissioned P2P network
* We start with 5+ RPi P2P network running our node software. Prior to the demo, they have been set up and running nodes. They are considered the "Genesis Nodes".
* the 4th RPi want to join the network. The 4th RPi need to prepare security information (Can be placeholder during development) to VRF selected verifier and waiting for approval
* VRF algorithm running as part of the protocol selects 4 notes as verifier. The randomness and fairness can be verified by any node afterwards using VRF function
* Verifier verify new node's security information, and sign on blockchain if the new node meet the security standard. The function to determine can be a placeholder at the time of demo.


## RaspberryPi and TPM
* Install TPM on Raspberry Pi (eg. Zymbit on RPi)
* RPi secure boot and log PCR into TPM
* TPM Agent service waiting for remote attestator's request and provide PCR information
* All the communication is encrypted using TPM's private key  (AES Key encrypted by private key for example)

## Demo Portal
This is a UI simply for demo purpose. Real application won't have such an UI.
* UI shows the existing running nodes
* Every node shows its public ID and current status (eg: Trusted, New node waiting for remote attestation, Untrusted node which has been rejected)
* Click a node can show it's historical events (verifying other nodes, be verified, PCR value)

## SMM Bios Guard
Early stage experiement
* Find a test PC support BIOS programming
* Edit the BIOS and inject "hello world" to the bios. make sure the PC still working well
* Request SMM interrupt from internal services, and the interrupt will triger our injected code
* Remote attestation can request a SMM interrupt
* Replace the "hello world" placeholder with code to get trusted TPM data from PC's TPM

## Smart contract on ETH or Eth sidechain of ELA
Credit score system will be in our next or next 2 milestones. In the Alamos milestone we just record events to ETH. No need to implement any logic.

# Demo workflow
* Start network with 5+ nodes (Genesis nodes)
* Check the web UI portal for network status
* Add new nodes to the network, watch the status change
* Check the log for the remote attestation process
* Make sure a "good" trusted node can pass the verification and join the network
* Modify the "Good" nodes into a "bad" nodes. Do it again, check the log and status on web UI portal. make sure it is rejected
* check ETH to make sure the information has been recorded
* (Advanced) Remote attestation node can receive TPM information remotely from a RPi connected PC with SMM interruption. 

if we could complete 100% of the demo tasks by the end of Dec, we are awesome!
