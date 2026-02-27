# Longest Increasing Subsequence (LIS) — Efficient Solution

## Introduction

Given an array of integers, the **Longest Increasing Subsequence (LIS)** is the longest subsequence where every next element is strictly greater than the previous one.

The straightforward dynamic programming approach solves this in $O(n^2)$ time by reducing it to the LCS problem. However, this becomes too slow for large inputs. In this editorial, we explore the efficient $O(n \log n)$ solution using **Patience Sorting**.

## Problem Statement

Given an array of $n$ integers :

$A = [a_1, a_2, a_3, \dots, a_n]$

Find the length of the longest strictly increasing subsequence, where a subsequence is obtained by deleting some elements without changing the order of the remaining elements.

**Example :**

```
Input:  A = [10, 9, 2, 5, 3, 7, 101, 18]
Output: 4
Explanation: One LIS is [2, 3, 7, 101]
```

## The O(n²) Approach (Reduction to LCS)

We can solve LIS by converting it to the Longest Common Subsequence (LCS) problem:

1. Take the original array $A$
2. Create a sorted copy $B$ with duplicates removed
3. Find the LCS of $A$ and $B$ — that length is the LIS length

**Why this works:** Any increasing subsequence of $A$ must appear in the same relative order in $B$, because $B$ is sorted. So the longest common subsequence between $A$ and $B$ is exactly the longest increasing subsequence.

**Example :**

```
A = [3, 1, 8, 2, 5]
B = [1, 2, 3, 5, 8]   (sorted, unique)

LCS of A and B = [1, 2, 5]   → LIS Length = 3
```

**Time Complexity :** $O(n^2)$ using standard LCS DP

**Space Complexity :** $O(n^2)$ for the DP table

This becomes too slow for large inputs ($n > 10{,}000$).

## The Efficient O(n log n) Approach — Patience Sorting

### The Card Game

Before jumping into the algorithm, it helps to understand the card game that inspired it — this is exactly where the name "Patience Sorting" comes from.

**The setup :** Take a deck of cards, each labeled with a number. Cards arrive one at a time. You must place each card onto one of the piles on the table, following one simple rule:

> A card can only be placed on top of a pile whose current top card has a **larger** number. If no such pile exists, start a **new pile** to the right.
> 

The goal is to finish with as **few piles as possible**. The strategy that achieves this is the **greedy strategy** : always place the card on the **leftmost valid pile** — the leftmost pile whose top card is larger than the current card.

**The key fact :** The number of piles at the end equals exactly the LIS length.

**Why can you only place a smaller card on a larger one?** Because if you place a larger card on a smaller card, you are blocking future smaller cards from being placed there. Placing smaller on larger keeps the tops as small as possible, leaving room for more cards.

**Why does the leftmost pile matter?** Because placing a card on the leftmost valid pile keeps the rightmost piles free for future cards. This greedily minimizes the total number of piles.

---

### Card Game Example

Let's play with the deck $[3,\ 1,\ 4,\ 2,\ 5]$ and trace every step. We show the full state of all piles after each card, with the **top card shown first** in each pile.

---

**Card = 3**

No piles exist yet, so start a new pile.

```
Pile 1
------
  3
```

---

**Card = 1**

Look at top cards from left to right : Pile 1 has top = 3. Since $1 < 3$, we can place 1 on Pile 1.

```
Pile 1
------
  1      ← top (1 was placed on 3)
  3
```

---

**Card = 4**

Top cards left to right : Pile 1 has top = 1. Since $4 > 1$, we cannot place 4 here. No more piles exist, so start a new pile.

```
Pile 1   Pile 2
------   ------
  1        4
  3
```

---

**Card = 2**

Top cards left to right : Pile 1 has top = 1. Since $2 > 1$, cannot place here. Pile 2 has top = 4. Since $2 < 4$, place 2 on Pile 2. We use the **leftmost valid pile**.

```
Pile 1   Pile 2
------   ------
  1        2      ← top
  3        4
```

---

**Card = 5**

Top cards left to right : Pile 1 top = 1, cannot place ($5 > 1$). Pile 2 top = 2, cannot place ($5 > 2$). No valid pile exists, so start a new pile.

```
Pile 1   Pile 2   Pile 3
------   ------   ------
  1        2        5
  3        4
```

---

**Final result : 3 piles → LIS length = 3.**

One valid LIS is $[1, 2, 5]$ or $[1, 4, 5]$ or $[3, 4, 5]$, all of length 3.

Also notice : the **top cards** of each pile from left to right are $[1,\ 2,\ 5]$ — they are always in sorted (increasing) order. This is not a coincidence; the greedy rule guarantees it.

---

**Why is it called Patience Sorting?**

The name was given by C.L. Mallows. At the end of the game, card labeled 1 is always sitting on top of some pile. Remove it, and card 2 is now on top of some pile. Remove that, and so on — the piles naturally allow you to sort the entire deck in order, the way you might patiently sort a hand of cards one by one. In British English, one-person card games are called *patience* games (what Americans call *solitaire*), and this game is one such patience game.

---

### From the Card Game to the Algorithm

In the card game, we only care about the **top card of each pile** — that is the only card that matters when deciding where to place the next card. So instead of tracking entire piles, we just track an array of top cards called $\textit{tails}$ :

$\textit{tails}[k] = \text{top card of pile } = \text{smallest possible ending of an increasing subsequence of length } (k+1)$

Since the top cards are always in increasing order from left to right (as we saw in the example), $\textit{tails}$ is always a **sorted array**. This means we can use **binary search** to quickly find the correct pile for each new card — instead of scanning all piles from left to right.

This is exactly where the $O(\log n)$ per card comes from, giving us $O(n \log n)$ overall.

Note that the final $\textit{tails}$ array is **not** the actual LIS — it just gives the correct **length**. The elements in $\textit{tails}$ may come from different subsequences and may not form a valid increasing subsequence themselves.

## Pseudocode

```
LIS_Patience_Sorting(A):
    n     <- length(A)
    tails <- empty array

    for i = 0 to n-1:
        x     <- A[i]
        left  <- 0
        right <- length(tails)

        // binary search for first position where tails[mid] >= x
        while left < right:
            mid <- floor((left + right) / 2)
            if tails[mid] < x:
                left <- mid + 1
            else:
                right <- mid

        if left == length(tails):
            tails.append(x)   // x is larger than all tails, start new pile
        else:
            tails[left] <- x

    return length(tails)
```

## Explanation

1. Start with an empty $\textit{tails}$ array.
2. For each element $x$ in $A$, perform a binary search on $\textit{tails}$ to find the first position where the value is $\geq x$.
3. If no such position exists, meaning $x$ is larger than all elements in $\textit{tails}$ :
    - Append $x$ to $\textit{tails}$.
    - This means we have found a subsequence longer than any found before.
4. If such a position is found:
    - Replace the value at that position with $x$.
    - This gives a smaller and therefore better ending for that subsequence length.
5. Repeat steps 2–4 for every element in $A$.
6. Return the length of $\textit{tails}$ — this is the LIS length.

## Example with Detailed Walkthrough

Let $A = [10,\ 9,\ 2,\ 5,\ 3,\ 7,\ 101,\ 18]$

| Step | $x$ | $\textit{tails}$ before | First element $\geq x$ | Action | $\textit{tails}$ after | Length |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 10 | [] | — (empty) | Append | [10] | 1 |
| 2 | 9 | [10] | index 0 → 10 | Replace | [9] | 1 |
| 3 | 2 | [9] | index 0 → 9 | Replace | [2] | 1 |
| 4 | 5 | [2] | not found | Append | [2, 5] | 2 |
| 5 | 3 | [2, 5] | index 1 → 5 | Replace | [2, 3] | 2 |
| 6 | 7 | [2, 3] | not found | Append | [2, 3, 7] | 3 |
| 7 | 101 | [2, 3, 7] | not found | Append | [2, 3, 7, 101] | 4 |
| 8 | 18 | [2, 3, 7, 101] | index 3 → 101 | Replace | [2, 3, 7, 18] | 4 |

Final $\textit{tails} = [2,\ 3,\ 7,\ 18]$, so **LIS length = 4**.

Valid LIS examples : $[2, 3, 7, 101]$ or $[2, 3, 7, 18]$.

Note that $[2, 3, 7, 18]$ happens to match the final $\textit{tails}$ here, but this is not always the case. In general, $\textit{tails}$ is not a valid LIS.

## Proof of Correctness

We prove correctness by maintaining two invariants throughout the algorithm.

### Invariant 1 : $\textit{tails}$ is always sorted

**Proof by induction :**

- **Base case :** An empty array is trivially sorted.
- **Inductive step :** Assume $\textit{tails}$ is sorted before processing $x$. Binary search finds the leftmost index $i$ where $\textit{tails}[i] \geq x$, meaning :

$\textit{tails}[0 \dots i-1] < x \leq \textit{tails}[i]$

If we replace $\textit{tails}[i]$ with $x$ : all elements before $i$ are still $< x$, and all elements after $i$ are $\geq$ the old $\textit{tails}[i] \geq x$, so sorted order is preserved. If we append $x$, then $x$ is larger than all current elements, so sorted order is preserved. Thus $\textit{tails}$ remains sorted after every step.

### Invariant 2 : $\textit{tails}[L-1]$ is always the smallest possible ending for a subsequence of length $L$

**Proof by induction:**

- **Base case :** After the first element, $\textit{tails}[0]$ equals that element, which is trivially the smallest ending for length 1.
- **Inductive step :** Consider processing element $x$ :
    - **Append case :** $x$ is larger than all current tails, so it becomes the only ending for the new maximum length. This is trivially optimal.
    - **Replace case :** We have $\textit{tails}[i] \geq x$ and $\textit{tails}[i-1] < x$. Replacing $\textit{tails}[i]$ with $x$ gives a strictly smaller ending for length $i+1$. Any future element that could extend the old ending can also extend $x$, since $x \leq \textit{tails}[i]$.

Therefore $\textit{tails}$ always stores the optimal smallest ending for each possible length.

### Why $\text{len}(\textit{tails})$ equals the LIS length

Every append means a strictly longer subsequence was found, so the maximum length grows by 1. Every replace keeps the length the same but improves the ending for future extensions. Since we always maintain the best possible endings, we never miss an opportunity to extend to a longer sequence. Therefore the final length of $\textit{tails}$ equals the LIS length.

## A Neat Consequence — LIS or LDS of Size $\sqrt{n}$

Here is a neat little result that comes directly from the pile structure.

After running patience sorting on any sequence of $n$ numbers, let:

- $p$ = number of piles = LIS length
- $h$ = height of the tallest pile = LDS length (each pile is decreasing, so the tallest pile gives the longest decreasing subsequence)

All $n$ cards had to go somewhere, so $n \leq p \times h$. If both $p$ and $h$ were less than $\sqrt{n}$, their product would be less than $n$ — but we just said the product is at least $n$. Contradiction. So one of them has to be $\geq \sqrt{n}$.

**In plain words :** In any list of $n$ numbers, you are guaranteed to find either an increasing run or a decreasing run of length at least $\sqrt{n}$. You cannot avoid both.

As a concrete example — pick any 100 numbers in any order. No matter how clever the arrangement, somewhere in that list there must be either 10 numbers going up or 10 numbers going down.

## LIS of a Random Permutation

What if the input is just a random shuffle?

A random shuffle has no pattern to it — no reason to have an unusually long increasing or decreasing run. So both $p$ and $h$ end up close to $\sqrt{n}$, and the LIS length lands around $c\sqrt{n}$ for some constant $c$.

Hammersley (1972) proved this rigorously — that $E[L_n] \sim c\sqrt{n}$ for some $c$. Running simulations made it pretty clear that $c = 2$, giving :

$E[L_n] \sim 2\sqrt{n}$

So if you take a random shuffle of 100 numbers, the LIS will be around $2\sqrt{100} = 20$. It will not jump around wildly either — it stays close to that value almost every time.

## History — Why Did It Take So Long to Prove $c = 2$?

People could see from simulations that the constant was 2. Proving it was another matter entirely.

**1972 — Hammersley** showed that $E[L_n]/\sqrt{n}$ settles to some constant as $n$ grows. His argument was clever but could not tell you what that constant actually was.

**1977 — Logan-Shepp and Vershik-Kerov** finally pinned it down : $E[L_n] \sim 2\sqrt{n}$. The proof had to pull in Young tableaux — a combinatorial object from algebra used to study symmetry — and carefully analyze what shape these tableaux converge to. It worked, but it was a long way from a card game.

**1999 — Baik, Deift, and Johansson** went even further and found the full distribution of $L_n$ :

$P!\left(\frac{L_n - 2\sqrt{n}}{n^{1/6}} \leq x\right) \to F(x) \quad \text{as } n \to \infty$

where $F(x)$ is the **Tracy-Widom distribution** — the same law that shows up when you study the largest eigenvalue of a random matrix. That connection was a genuine surprise. Nobody sat down expecting a card-sorting problem to have anything to do with random matrices.

The reason it took so long is that the LIS problem, despite looking straightforward, quietly touches three separate areas of mathematics — combinatorics, representation theory, and random matrix theory. Each layer needed its own tools to crack. The constant 2 took until 1977. The full picture took until 1999 (Aldous and Diaconis, 1999).

## Time Complexity Analysis

For each element, binary search on $\textit{tails}$ takes $O(\log n)$ since $\textit{tails}$ holds at most $n$ elements, and the update (append or replace) takes $O(1)$. Processing all $n$ elements gives :

$\text{Total Time Complexity} = O(n \log n)$

**Comparison with** $O(n^2)$**:**

| $n$ | $O(n^2)$ | $O(n \log n)$ |
| --- | --- | --- |
| 10,000 | 100 million ops | ~140,000 ops |
| 1,000,000 | 1 trillion ops | ~20 million ops |

## Space Complexity Analysis

The $\textit{tails}$ array stores at most $n$ elements and no other auxiliary data structures are needed, so :

$\text{Total Space Complexity} = O(n)$
