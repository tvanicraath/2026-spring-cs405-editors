# Longest Increasing Subsequence (LIS) — Efficient Solution

## Problem Overview

Given an array of $n$ integers:

$A = [a_1, a_2, \dots, a_n]$

Find the length of the longest strictly increasing subsequence. Elements don't need to be consecutive, just in order.

**Example:**

For $A = [3, 1, 2, 5, 4]$, one LIS is $[1, 2, 5]$, so the answer is $3$.

---

## The O(n²) Approach via LCS

In class we saw how to reduce LIS to LCS.

**Idea:**

- Take the original array $A$
- Create array $B$ = sorted version of $A$ with duplicates removed
- Compute LCS of $A$ and $B$

**Why it works:**

Any increasing subsequence of $A$ appears in sorted order in $B$. So any common subsequence of $A$ and $B$ must be increasing. The LCS gives exactly the LIS.

**Complexity:**

- Time: $O(n^2)$ for the LCS DP
- Space: $O(n^2)$ for the DP table

This works but gets slow for large $n$.

---

## The O(n log n) Approach — Patience Sorting

### Why is it called Patience Sorting?

The name comes from a one-person card game called Patience (known as Solitaire in the US).

**The game:**

- Cards are dealt one by one
- Each card is placed on the **leftmost pile** whose top card is larger than the current card
- If no such pile exists, start a new pile on the right
- Goal: end with as few piles as possible

**Key fact:** the number of piles at the end equals the LIS length.

**Why is this called Patience?** At the end of the game, card 1 is always on top of some pile. Remove it, card 2 appears on top somewhere. Keep going and you sort the whole deck. This patient card-by-card sorting is where the name comes from (Mallows, 1963).

---

### Card Game Example

Deck: $[3, 1, 4, 2, 5]$

```
Card 3 → no piles yet, start Pile 1
  Pile 1: [3]

Card 1 → Pile 1 top is 3, and 1 < 3 → place here
  Pile 1: [1, 3]

Card 4 → Pile 1 top is 1, 4 > 1 → no valid pile → start Pile 2
  Pile 1: [1, 3]   Pile 2: [4]

Card 2 → Pile 1 top is 1, skip. Pile 2 top is 4, 2 < 4 → place here
  Pile 1: [1, 3]   Pile 2: [2, 4]

Card 5 → Pile 1 top 1, skip. Pile 2 top 2, skip → start Pile 3
  Pile 1: [1, 3]   Pile 2: [2, 4]   Pile 3: [5]
```

**3 piles → LIS length = 3.** One valid LIS is $[1, 2, 5]$.

Notice the pile tops from left to right are always increasing: $[1, 2, 5]$. The placement rule guarantees this.

---

### From the Card Game to the Algorithm

We only care about the top card of each pile. So instead of storing full piles, we store just the tops in an array called $\textit{tails}$:

$\textit{tails}[k]$ = smallest possible last element of any increasing subsequence of length $k+1$

Since the tops are always sorted, we use **binary search** to find the right pile in $O(\log n)$ instead of scanning left to right.

**Note:** The final $\textit{tails}$ array is not the actual LIS — it just gives the correct length.

---

## Pseudocode

```
LIS(A):
    tails <- empty array

    for x in A:
        left  <- 0
        right <- length(tails)
        
        while left < right:
            mid <- floor((left + right) / 2)
            if tails[mid] < x:
                left <- mid + 1
            else:
                right <- mid

        if left == length(tails):
            tails.append(x)
        else:
            tails[left] <- x

    return length(tails)
```

---

## Walkthrough

$A = [10, 9, 2, 5, 3, 7, 101, 18]$

| Step | $x$ | tails before | Action | tails after | Length |
| --- | --- | --- | --- | --- | --- |
| 1 | 10 | [] | append | [10] | 1 |
| 2 | 9 | [10] | replace index 0 | [9] | 1 |
| 3 | 2 | [9] | replace index 0 | [2] | 1 |
| 4 | 5 | [2] | append | [2, 5] | 2 |
| 5 | 3 | [2, 5] | replace index 1 | [2, 3] | 2 |
| 6 | 7 | [2, 3] | append | [2, 3, 7] | 3 |
| 7 | 101 | [2, 3, 7] | append | [2, 3, 7, 101] | 4 |
| 8 | 18 | [2, 3, 7, 101] | replace index 3 | [2, 3, 7, 18] | 4 |

**LIS length = 4.** One valid LIS is $[2, 3, 7, 101]$.

---

## Correctness

We keep two invariants true throughout:

**Invariant 1: $\textit{tails}$ is always sorted**

Binary search finds leftmost $i$ where $\textit{tails}[i] \geq x$, so:

$\textit{tails}[0..i-1] < x \leq \textit{tails}[i]$

Replacing $\textit{tails}[i]$ with $x$ keeps this order. Appending also keeps it sorted since $x$ is larger than everything. So $\textit{tails}$ stays sorted after every step.

**Invariant 2: $\textit{tails}[k]$ is the smallest possible ending for length $k+1$**

- Append case: $x$ is the only ending for the new max length, trivially optimal.
- Replace case: we replace $\textit{tails}[i]$ with a smaller $x$. Any future element that could follow the old ending can also follow $x$, so we never lose options.

From these two invariants: every append finds a longer subsequence, every replace keeps the best possible ending. So $\text{length}(\textit{tails})$ at the end = LIS length.

---

## Complexity

**Time:** Binary search per element = $O(\log n)$, done for all $n$ elements.

$$\text{Total} = O(n \log n)$$

**Space:** $\textit{tails}$ stores at most $n$ elements.

$$\text{Total} = O(n)$$

---

## A Consequence — LIS or LDS of Size $\sqrt{n}$

After patience sorting on any sequence of $n$ numbers, let:

- $p$ = number of piles = LIS length
- $h$ = height of tallest pile = LDS length (each pile is a decreasing sequence)

Since all $n$ cards go into some pile: $n \leq p \times h$.

If both $p < \sqrt{n}$ and $h < \sqrt{n}$, then $p \times h < n$. Contradiction.

So at least one of $p$ or $h$ must be $\geq \sqrt{n}$.

**Conclusion:** Every sequence of $n$ numbers has either a LIS of length $\geq \sqrt{n}$ or a LDS of length $\geq \sqrt{n}$.

For example, any list of 100 numbers must have either 10 going up or 10 going down somewhere.

---

## LIS of a Random Permutation

For a random shuffle of ${1, 2, \dots, n}$, there is no special structure. Both $p$ and $h$ stay around $\sqrt{n}$, so:

- With high probability, LIS length is $O(\sqrt{n})$
- In expectation: $E[L_n] = \Theta(\sqrt{n})$

Hammersley (1972) proved $E[L_n] \sim c\sqrt{n}$ for some constant $c$. Simulations pointed clearly to $c = 2$.

---

## History — Why Did It Take So Long to Prove $c = 2$?

| Year | What happened |
| --- | --- |
| 1960s | Ulam poses the problem |
| 1972 | Hammersley proves $E[L_n] \sim c\sqrt{n}$ but cannot find $c$ |
| 1977 | Logan-Shepp and Vershik-Kerov independently prove $E[L_n] \sim 2\sqrt{n}$ |
| 1999 | Baik-Deift-Johansson find the full distribution |

The 1977 proof needed Young tableaux — a structure from algebra — and was far from obvious. The 1999 result was even more surprising:

$$P!\left(\frac{L_n - 2\sqrt{n}}{n^{1/6}} \leq x\right) \to F(x) \quad \text{as } n \to \infty$$

where $F(x)$ is the Tracy-Widom distribution — the same law that describes the largest eigenvalue of a random matrix. Nobody expected a card game to connect to random matrix theory.

The reason it took so long — LIS secretly touches combinatorics, representation theory, and random matrix theory. Each area needed different tools (Aldous and Diaconis, 1999).

---

## Practice Problems

**LeetCode:**

- [300. Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)
- [354. Russian Doll Envelopes](https://leetcode.com/problems/russian-doll-envelopes/) — 2D LIS
- [673. Number of Longest Increasing Subsequences](https://leetcode.com/problems/number-of-longest-increasing-subsequences/)

**Codeforces:**

- [340E — Iahub and Permutations](https://codeforces.com/problemset/problem/340/E)
- [269B — Maximum Absurdity](https://codeforces.com/problemset/problem/269/B)

---
