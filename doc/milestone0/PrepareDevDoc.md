# Some design considerations for PoC stage
As we have limited resources and limited time. We need to make some compromise to reach our goal on time. 
This is just a PoC. The goal is to demo to future investor how it should work in real life. This is not a performance test prototype. So as long as we can dev quick and dirty, we can compromise performance at this point. As long as the concept get approved by our potential clients. We can redo most modules using RUST or other high performance technologies.

So at this point, I am OK to use JS, TS, Python etc to build each modules individually. Use REST to connect each modules. Each modules can be running in different docker containers if needed. I know the performance won't be good, but I think it is OK for demoing the concept.

Additional benefits is that each small dev group can use whatever language or platform they are familar to build their module without concern too much about integration, since the REST will be supportted by almost everything. 

In the future, I would prefer to rewrite most of the modules in RUST and internal integration rather than REST to reduce the overhead.

# Write some explaination code before other dev team members start

In miletone1 folder, I wrote the basic of dev env for develoeprs to join. However, before the other dev to join, I can write down some explaination code so that it could be easier for other developers to get the basic idea. Usually it would be easier for developers to understand the code than plan text. 

The code for preparation won't be part of the main product, nor in the PoC. The only purpose is easily explain to other developers what we need to do.

Since the goal is simple and straightforward, I will make everything as easy as possible so long as other dev can understand the idea. 

- I will write in node.js
- I won't separate each module in different web services, instead, put them in one services but in different file. Other develoeprs can read the code, then redo the logic in their own langauge / platform in standlone module
- Most of the functions are placeholder with meaningful name and comments (I will try to explain it as clear as possible, but.... let's see how I can get)
- Of course, the code won't have any real function. Just to explain the relationship between modules and basic business logic

