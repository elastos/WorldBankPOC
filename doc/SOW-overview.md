# Gist
I separated SOW (Statement of Work) into several smaller files.

## [01 framework experiement](SOW-01-framework-experiment.md)
Not directly related to World Bank's business. Mainly technical research, feasible evaluation etc. In most cases, just a "hello world" type experiment make sure the idea can actually work.

## [02 workflow experiment](SOW-02-workflow-experiment.md)
Based on above 01, add workflow between each components, make sure the communication works between them. Mostly "hello world" type experiment.

## [03 demo](SOW-03-demo.md)
Replace the helloworld type placeholder with a demo business workflow defined by World Bank. Of course, not real business but for demo purpose. 
The goal is to have a digital capsule running with basic security. We would like GMU test lab to evaluate the security. 

## [04 PoET](SOW-04-PoET.md)
Build PoET on top of existing demo framework. 

## [05 trusted smart contract runtime](SOW-05-trusted-smart-contract.md)
While PoET can bring faster and eco-friendly consensus. Build a smart contract runtime upon PoET. It doesn't have to be (althought will compatible with) Solidity, we are going to support major functional language. As long as it support Lambda function. 

On top of the smart contract runtime, we can also build a programming framework, such as CQRS type developer friendly framework. the goal is to make most cloud-based developer can easily adapt to decentralized programming model without big learning curve. 

## [06 security test](SOW-06-security-test.md)
This is an ongoing task not the last task. We have GMU test lab and any opensource community to try out and try to break the system. We can get their feedback to improve our system.
One thing needs to mention, this system is not intent to be 100% hacker proof. It leverage blockchain philosophy that hacker needs to pay huge cost to break while get less benefit. So the economy design is very important, not only the technical design.
