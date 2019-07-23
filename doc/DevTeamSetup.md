Some ideas about how to setup the development team and control our budget

# Goal

We will need very few full time developers and a large group of open source code contributors from community.

Depends on the progress of PoC, we probably starting from only one full timer, then 2 or maybe 3 after half year. 

# Full timer's conpensation

Based on the "reasonable base rate" plus token incentive plan adjustment.
## Reasonable base rate
Reasonable base rate means "At that location at the time of hire, how much is the actual market rate to hire someone with the similar skill set"
The calculation based on
- This employees current salary , benefit or perk from previous or current employer
- Inflation rate
- Glassdoor.com reference number.

## Token incentive plan adjustment
let B = Reasonable base salar rate
let R = incentive rate
let G = the gap percentage between actually cash salary and base rate

Full timer will get 
Cash salary = B * (1 - G) 
Token incentive = B * G * (1 + R)

For example:
An to be hire empolyee's salary is $100k. He would like to choose G to be 30%. The first year X = 0.5. 
He can get cash income at 100k * (1-30%) = $70k
He can get token incentive at 100K * 30% * (1 + 0.5) = 45k  This part will be paid in token. 

the token won't be able to be sold for cash until the token listed in exchange. So this is considered an incentive. 

## Incentive Rate X changes
In the beginning, we can have a rather big X rate to encourage early team member. For example, we can start X = 50%.
We can set a depreciate rate for X over the time. For example, every year or every quarter, we reduce X half. 
For example, we reduce X half every 6 months. Then the employee will be incentived 25% instead of 50% after 6 months starting from the project start (not from his first working day).

When token listed in exchange, X will become 0 immediately.

## Token exchange rate and evaluation
Before the token listed in exchange, there won't be real market price (exchange to USD for example). We can consider the token incentive some kind of "convertable notes". When the incentive token was issue, it is just an "I Owe You". The rate will be determined by the evaluation price of next round of investment. Let's use the same example we used in last paragraph. the developer get his 70% salary in cash ($70k / 12 = $5833) and 30% * 1.5 in token (worth $30k / 12 * 1.5 = $3750) in Jan 2020. the $3750 is an "I Owe You" and won't be converted into token at that moment because there is no price in Jan 2020. One month later,  in Feb 2020, an investor has evaluation at $1 per token and make the investment $1M for 1M token. The "I Owe You" will be converted into 3750 token and issue to this developer immediately. Before the token listed in public exchange, internal trade is OK.

# Partime team members compensation based on tasks

We hope to have a lot of code contributors from open source community. 
We do not pay them cash incentive but in token. The token could be ELA so that they can sale in the market for cash at any time.

The rate is based on tasks.

We should give each task a rough budget. Developer who wants to bid the tasks need to give a reasonable quoto. (I believe in most cases there will be zero or only one bidder at the early stage). We will pay when task done and passed test.

The problem of this method is that it is pretty hard to estimate the cost up front. Not only the team leader, but also to the bidder.

the estimate could be very rough. 

My suggestion is just have a total milestone budget for the first few months. then based on the progress to decide future plan.



