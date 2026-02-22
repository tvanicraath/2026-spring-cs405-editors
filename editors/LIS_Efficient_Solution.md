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

## The Efficient O(n log n) Approach (Patience Sorting)

### Key Idea

We maintain a helper array called $\textit{tails}$, where :

$\textit{tails}[k] = \text{smallest possible last element of any increasing subsequence of length } (k+1)$

The array $\textit{tails}$ is always kept in sorted order.

**Why smaller endings are better :** If two subsequences have the same length, the one ending with a smaller value is more useful — it is easier to extend later with a larger element. By always keeping the smallest possible endings, we maximize the chances of building longer sequences.

Note : that the final $\textit{tails}$ array is **not** the actual LIS. It only gives the correct **length**. The elements in $\textit{tails}$ may come from different subsequences and may not form a valid increasing subsequence themselves.

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

Valid LIS examples: $[2, 3, 7, 101]$ or $[2, 3, 7, 18]$.

Note that $[2, 3, 7, 18]$ happens to match the final $\textit{tails}$ here, but this is not always the case. In general, $\textit{tails}$ is not a valid LIS.

## Proof of Correctness

We prove correctness by maintaining two invariants throughout the algorithm.

### Invariant 1 : $\textit{tails}$ is always sorted

**Proof by induction:**

- **Base case:** An empty array is trivially sorted.
- **Inductive step:** Assume $\textit{tails}$ is sorted before processing $x$. Binary search finds the leftmost index $i$ where $\textit{tails}[i] \geq x$, meaning :

$\textit{tails}[0 \dots i-1] < x \leq \textit{tails}[i]$

If we replace $\textit{tails}[i]$ with $x$ : all elements before $i$ are still $< x$, and all elements after $i$ are $\geq$ the old $\textit{tails}[i] \geq x$, so sorted order is preserved. If we append $x$, then $x$ is larger than all current elements, so sorted order is preserved. Thus $\textit{tails}$ remains sorted after every step.

### Invariant 2 : $\textit{tails}[L-1]$ is always the smallest possible ending for a subsequence of length $L$

**Proof by induction:**

- **Base case:** After the first element, $\textit{tails}[0]$ equals that element, which is trivially the smallest ending for length 1.
- **Inductive step:** Consider processing element $x$ :
    - **Append case :** $x$ is larger than all current tails, so it becomes the only ending for the new maximum length. This is trivially optimal.
    - **Replace case :** We have $\textit{tails}[i] \geq x$ and $\textit{tails}[i-1] < x$. Replacing $\textit{tails}[i]$ with $x$ gives a strictly smaller ending for length $i+1$. Any future element that could extend the old ending can also extend $x$, since $x \leq \textit{tails}[i]$.

Therefore $\textit{tails}$ always stores the optimal smallest ending for each possible length.

### Why $\text{len}(\textit{tails})$ equals the LIS length

Every append means a strictly longer subsequence was found, so the maximum length grows by 1. Every replace keeps the length the same but improves the ending for future extensions. Since we always maintain the best possible endings, we never miss an opportunity to extend to a longer sequence. Therefore the final length of $\textit{tails}$ equals the LIS length.

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
