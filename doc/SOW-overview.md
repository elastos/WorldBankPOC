# Main Ideas and Design Goals
The  SOW (Statement of Work) is split into several sections that try to explain the different parts of the entire architecture below.

## [01 Initial Prototype - Framework Experiments](SOW-01-framework-experiment.md)
Initial prototype to illustrate the overall architecture and detail (but not demonstrate) the protection it can offer against simple attacks and adversaries when used in simple scenarios.
Not directly related to World Bank's business. Mainly technical research, feasible evaluation etc. In most cases, just a "hello world" type experiment make sure the idea can actually work.

## [02 Extended Prototype - Workflow Experiment](SOW-02-workflow-experiment.md)
Using the initial prototype (i.e. based on above 01), extend the code to add a functional workflow between each components, make sure the communication and APIs works between them. 
Mostly "hello world" type experiment but able to showcase the protection that the different components can offer against simple attacks and adversaries when used in simple scenarios.

## [03 Demo Prototype](SOW-03-demo.md)
Implement a real and a demo business workflow defined by World Bank. At this stage, we replace the helloworld placeholder with a demonstrable World Bank use-case for demo purposes.
The goal is to have a digital capsule running with basic security. We would like GMU test lab to evaluate the security and prepare videos demonstrating the resilience of the different architectural
components against basic attacks in a realistic setting.

## [04 PoET](SOW-04-PoET.md)
Build PoET on top of existing demo framework. 

## [05 Enable Trusted Smart Contracts Runtime](SOW-05-trusted-smart-contract.md)
PoET can bring faster and eco-friendly consensus but the power of smart contracts is important to support more complex business scenarios. 
At this stage, we plan to build a smart contract runtime upon PoET. It doesn't have to be (althought will compatible with) Solidity, we are going to support major functional language. As long as it supports Lambda function. 
On top of the smart contract runtime, we can also build a programming framework, such as CQRS type developer friendly framework. the goal is to make most cloud-based developer can easily adapt to decentralized programming model without big learning curve. 

## [06 Extended Security Experiments and Validation](SOW-06-security-test.md)
This is an ongoing task which will evolve from simple to complex experiments and adversaries. We plan to use the GMU test lab and potentially the NIST conformance Lab along with any opensource community to attempt to breach the security of the system.
The goal is to validate our security assumptions, system design, and code implementation against a wide-range of attacks that can happen in real-time. The feedback from the experiments will be used to improve the overall design and implementation as needed. 
In addition, we will be able to map our limitations and potential weaknesses against different attack scenarios. The proposed system is not intent to be 100% hacker proof but to elevate security to a very high level making it too risky or expensive for an adversary to attempt the breach. Thus, we will leverage th blockchain philosophy that the hacker will have to pay a disproportionate large cost to breach the system while achieving little benefits. So being cost-effective and scalable is a design tenet of our overall approach. Cost and scalability are very important and have to be weighted against the technical resilience and attack strength of the overall system.
