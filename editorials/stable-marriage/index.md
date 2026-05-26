+++
draft = false
type = "courses"
courseImage = '../../bogo.png'
courseCode = 'CS 405'
courseName = 'Student Editorials'
semester = 'Spring (Sem 2) 2026'
title = 'CS405 - Stable Marriage'
subheader = 'Stable Marriage'
subheadertext = 'Dharmik Umretiya'
+++


## Introduction
 Have you ever wondered how people get matched when money isn’t allowed to decide the outcome? Think of students getting colleges, workers getting jobs, or patients being matched to hospitals no bidding, just preferences. How do we ensure no two participants would rather leave their current match and pair up instead? This is where **stable matching** comes in: a concept so powerful that the Nobel Prize in Economic Sciences was awarded for it.  

We’ll be talking about how this works in this editorial, using the famous **Gale–Shapley algorithm**, introduced by David Gale and Lloyd Shapley.

## Problem
Consider a community with a set of $n$ men, $M$, and a set of $n$ women, $W$. Each man $m$ has a ranking of women representing his preferences. Similarly each woman $w$ has a ranking of her preferred men. The stable marriage problem asks to pair (match) the men and women in such a way that no two people prefer each other over their matched partners. More formally:
- A matching, $P_M$, is a one-to-one mapping from $M$ to $W$ (or equivalently we can define a matching as a one-to-one mapping from $W$ to $M$).
- A pair $(m, w)$ is a blocking pair (sometimes also called a rogue pair) iff:
    - $m$ and $w$ are not matched with each other in $P_M$.
    - $m$ prefers $w$ to his matched partner $P_M(m)$.
    - $w$ prefers $m$ to her matched partner $m_0$ where $w = P_M(m_0)$.
- A matching is stable if it doesn’t have a blocking pair.
How can we find a stable matching in general?
## Intuition
In 1962, Gale and Shapley proposed the Deferred Acceptance Algorithm. Here, we assume that each man $m$ (woman $w$) ranks all the possible women (men), i.e. $m$’s ($w$’s) list is complete.
- Start with everyone unmatched
- Each free man proposes to the **highest-ranked woman** on his list he hasn’t proposed to yet.
- Each woman:
    - Accepts the proposal she prefers the most
    - Rejects all others (if any)
- Rejected men propose to their **next preference**.
- No man is left unmatched.

**Observation 1 :** Men propose to women in decreasing order of preference.  

**Observation 2 :** Once a woman is matched, she never becomes unmatched; she only "trades up."

## Algorithm

```text
1. Initialize all men and women as unmatched.
2. While there exists an unmatched man m with a non-empty preference list:
    a. Let w be the most preferred woman on m’s list.
    b. If w is unmatched:
        - Match m with w.
    c. Else:
        - Let m0 be the current partner of w, i.e. w = P_M(m0).
        - If w prefers m over m0:
            - Match w with m.
            - Set m0 as unmatched.
        - Else:
            - w rejects m.
    d. Remove w from m’s preference list.
3. End while
```
**Time Complexity:** $O(n^2)$ — each of the $n$ men can propose to at most $n$ women.
**Space Complexity:** $O(n^2)$ — storing preference lists.
## Proof of Correctness

### Termination
**Claim :** Algorithm terminates after at most $n^2$ iterations of the while loop.                
**Proof :** 
- Each time through the while loop a man proposes to a new woman. There are only $n^2$ possible proposals.
- A man is rejected at most $|W|$ times, each time removing a woman from his preference list. There are $|M|$ such lists, thus it takes at most $|W| \cdot |M|$ steps.
### Perfect Matching
**Claim :** The GS algorithm produces a perfect matching whenever $|M| = |W|$.                   
**Proof :**
- Suppose there is some unmatched man $m$.  
- Since $|M| = |W|$ there exists some unmatched woman $w$.  
- Since $m$ is unmatched he has been rejected by all women.  
- Since $w$ is unmatched she has never rejected a proposal.  
- This is a contradiction since $w$ is in some position in $m$’s preference list.
- So there are no unmatched men.
### Stable Matching
**Claim :** The matching found by the GS algorithm is stable.                        
**Proof :** Consider pair $(m, w)$ where $P_M(m) \ne w$. According to the GS algorithm, two scenarios are possible:
1. $m$ has proposed to $w$ and was rejected; this means $w$ prefers her current partner to $m$.
2. $m$ has not proposed to $w$; this means $m$ prefers his current partner to $w$.
Neither of the above scenarios makes $(m, w)$ a rogue pair, so no rogue pair can exist.
## Remarks
### Man-Optimality
- Each man proposes to women in decreasing order of preference and gets rejected only when the woman has a strictly better option. Since any rejected woman is impossible for him in any stable matching, the algorithm effectively eliminates all partners that cannot appear in a stable solution.
- Therefore, the partner each man ends up with is the best possible partner he can obtain among all stable matching.
### Woman-Pessimality
- Women only choose among the proposals they receive and never actively explore all possible partners. Although they may improve their match during the algorithm, they are limited to men who propose to them.
- If a woman could obtain a better partner in some stable matching, that man must prefer her over his assigned partner. In that case, he would have proposed to her during the algorithm, and she would have accepted him. Hence, such a situation cannot occur.
- Therefore, each woman is matched with the worst partner she can have among all stable matchings.
- The problem can also be solved by running the algorithm with women proposing, which symmetrically produces the woman-optimal (and man-pessimal) stable matching.
## Further Reading
- [Interactive Simulation](http://www.matchu.ai/GaleShapley)
- [Stable Matching Problem (Related Problems)](https://en.wikipedia.org/wiki/Stable_matching_problem#Related_problems)
- [Stanford Lecture Notes on Matching](http://web.stanford.edu/class/msande319/MatchingSpring19/lecture08.pdf)
## Applications
- **Networking (Router Matching):**  
    Stable matching techniques are used in routing and network optimization problems.  
    [Paper Link](http://www.stanford.edu/~balaji/papers/99matchingoutput.pdf)
- **College Admissions (JoSAA Perspective):**  
    A real-world implementation of stable matching in centralized allocation systems.  
    [Paper Link](http://www.columbia.edu/~yk2577/jointAllocation.pdf)
- **Content Delivery Networks (CDNs):**  
    Stable matching can be applied in client–server models, where users are matched to servers to minimize latency, closely related to optimization problems like the travelling salesman problem.

<div align="right">
    {{< editorCard name="Dharmik Umretiya" roll="UI24CS79" github="dharmikumretiya" link="https://dharmikumretiya.space" >}}
</div>



{{< back "courses/2026-spring-cs405#core-contributors" "all editorials" >}}