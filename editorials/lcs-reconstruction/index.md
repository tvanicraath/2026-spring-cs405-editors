+++
draft = false
type = "courses"
courseImage = '../../bogo.png'
courseCode = 'CS 405'
courseName = 'Student Editorials'
semester = 'Spring (Sem 2) 2026'
title = 'CS405 - LCS Reconstruction in Linear Space'
subheader = 'LCS Reconstruction in Linear Space'
subheadertext = 'Uday Hapaliya'
+++

## Introduction

In class, we discussed how to compute the **length** of the Longest Common Subsequence (LCS) using dynamic programming.

In this editorial, we focus on the **reconstruction phase** of LCS, which is how to retrieve the actual subsequence using the already computed DP table.

## Problem Statement

Given two strings:

- $X = x_1 x_2 \dots x_m$
- $Y = y_1 y_2 \dots y_n$

We first compute the DP table $dp[i][j]$ such that:
- $dp[i][j]$ represents the length of the LCS of the first $i$ characters of $X$ and the first $j$ characters of $Y$.
After filling this table, we want to reconstruct the actual LCS string.

## Key Idea Behind Reconstruction

While filling the DP table, we used the recurrence:

- If $x_i = y_j$:
    - $dp[i][j] = 1 + dp[i-1][j-1]$
- Otherwise:
    - $dp[i][j] = \max(dp[i-1][j], dp[i][j-1])$

The reconstruction process simply **reverses this logic**.

We start from $dp[m][n]$ and trace backwards:
- If characters match, include the character in the LCS and move diagonally.
- If they do not match, move in the direction of the larger value.
This process continues until we reach the first row or first column.

## Pseudocode

```
LCS_Reconstruct(X, Y, dp, m, n):
    i ← m
    j ← n
    result ← empty list

    while i > 0 and j > 0:
        if X[i] == Y[j]:
            append X[i] to result
            i ← i - 1
            j ← j - 1

        else if dp[i-1][j] >= dp[i][j-1]:
            i ← i - 1

        else:
            j ← j - 1

    reverse(result)
    return result
```

## Explanation

1. Start at cell $(m, n)$.
2. If the characters match:
    - That character must be part of the LCS.
    - Move diagonally to $(i-1, j-1)$.
3. If the characters do not match:
    - Compare $dp[i-1][j]$ and $dp[i][j-1]$.
    - Move to the larger one.
4. Stop when either $i = 0$ or $j = 0$.
5. Since characters were collected in reverse order, reverse the result at the end.

## Example

- $X = ABCBDAB$
- $Y = BDCABA$

After filling the DP table, suppose the LCS length is 4.
Backtracking might produce: **BCBA**
Another valid LCS: **BDAB**

## Proof of Correctness

We prove correctness using the structure of the DP recurrence.

### Case 1: Characters Match

If $X[i] = Y[j]$, then by recurrence:

- $dp[i][j] = 1 + dp[i-1][j-1]$

This means:

- The character must be part of an optimal solution.
- Moving diagonally ensures we follow the subproblem that contributed to the optimal answer.

Thus, adding the character is correct.

### Case 2: Characters Do Not Match

If $X[i] \ne Y[j]$, then:
- $dp[i][j] = \max(dp[i-1][j], dp[i][j-1])$

So the optimal solution came from either:
- Removing the last character of $X$, or
- Removing the last character of $Y$.
By moving in the direction of the larger value, we ensure we stay on a path that leads to an optimal LCS.
Thus, at every step, we follow a subproblem that preserves optimality.

### Termination

- The loop stops when either string becomes empty.
- At that point, no further common characters are possible.
- Hence, the constructed string is indeed a longest common subsequence.

## Time Complexity Analysis

### Reconstruction Phase

- At each step, either $i$ decreases or $j$ decreases.
- In the worst case, we move at most $m + n$ steps.
Therefore, reconstruction takes $O(m+n)$ time.

### Total Time Complexity

The DP table construction dominates, so the total time complexity is: $O(mn)$

## Space Complexity Analysis

- DP table requires $O(mn)$ space.
- Result string stores at most $O(\min(m, n))$ characters.
- Thus total space complexity is: $O(mn)$

---

# LCS: Space Optimization and Divide & Conquer Reconstruction

In the previous editorial, we discussed how to reconstruct the LCS using the full $O(mn)$ DP table.

In this section, we will discuss:

1. How LCS length can be computed in $O(\min(m,n))$ space
2. Why that trick does not directly help in reconstruction
3. A Divide & Conquer method that reconstructs LCS in
    - $O(mn)$ time
    - $O(m+n)$ space

## 1. **Space Optimization for LCS Length**

$$
dp[i][j] = \begin{cases}1 + dp[i - 1][j - 1] & \text{if } X[i] = Y[j] \\\max(dp[i - 1][j], dp[i][j - 1]) & \text{otherwise}\end{cases}
$$

If we observe carefully, to compute row $i$, we only need:

- The previous row ($i-1$)
- The current row

This means we do not need the entire $m \times n$ table.

We can keep only two rows:

- $prev[0..n]$
- $curr[0..n]$

After finishing a row, we copy curr into prev and move forward.
Thus, space reduces to: $O(min⁡(m,n))$
while time remains: $O(mn)$.

### Intuition

Each DP cell depends only on:

- Left neighbor (same row)
- Top neighbor (previous row)
- Top-left neighbor (previous row)

So storing more than one previous row is unnecessary for computing only length.

## 2. Why This Trick Does Not Work for Reconstruction

When reconstructing LCS using backtracking, we rely on the entire DP table.
While backtracking from $(m,n)$, we need to know:

- Whether we came from top
- Or from left
- Or from diagonal

If we only store two rows, all earlier decisions are lost.
So although we can compute the length in small space, we cannot reconstruct the sequence because:

- Reconstruction requires historical DP information.
- Space-optimized DP overwrites previous rows.

Therefore:

- Length → possible in $O(\min(m,n))$ space
- Reconstruction → needs more information

## 3. Divide & Conquer Approach for LCS Reconstruction

There exists a method that combines:

- Space-optimized LCS-length DP
- Divide & Conquer strategy

It reconstructs LCS in:

- Time: $O(mn)$
- Space: $O(m+n)$

### Idea

Instead of storing the whole table, we:

1. Divide string $X$ into two halves:
    - First half: $X_{left}$
    - Second half: $X_{right}$
2. Compute:
    - Forward LCS length between $X_{left}$ and $Y$
    - Backward LCS length between reversed $X_{right}$ and reversed $Y$
3. Combine the two results to find a split point in $Y$.
4. Recursively apply the same idea to the two halves.

### Why This Works

The key idea is:

If we split $X$ into two halves, then the LCS must also split at some position in $Y$.
We try all possible split positions in $Y$ indirectly using forward and backward DP.
We choose the position that maximizes:

$$
L1[j]+L2[n−j]
$$

where:

- $L_1[j]$ = LCS length of first half of $X$ with first $j$ chars of $Y$
- $L_2[n-j]$ = LCS length of second half of $X$ with remaining chars of $Y$

This guarantees we split correctly.
Then we recursively reconstruct:

- LCS of first half
- LCS of second half

Finally, concatenate both results.

## **→ Pseudocode (Divide & Conquer Version)**

```
LCSd_q(X, Y):m ← length(X)
n ← length(Y)

if m == 0:
    return ""

if m == 1:
    if X[1] appears in Y:
        return X[1]
    else:
        return ""

mid ← m / 2

L1 ← LCS-Length(X[1..mid], Y)
L2 ← LCS-Length(reverse(X[mid+1..m]), reverse(Y))

Find k that maximizes:
    L1[k] + L2[n-k]

left_part  ← LCSd_q(X[1..mid], Y[1..k])
right_part ← LCSd_q(X[mid+1..m], Y[k+1..n])

return left_part + right_part
```

LCS-Length : using space-optimized $O(n)$ DP.

### Time Complexity

At each level:

- We compute two LCS-length DP passes → $O(mn)$ total over recursion.
- Recursion splits the problem roughly in half each time.

Overall time:

$$
O(mn)
$$

### Space Complexity

At any point:

- We store only two rows → $O(n)$
- Recursion stack depth → $O(\log m)$
- Final string storage → $O(m+n)$

Thus total space:

$$
O(m+n)
$$

which is much smaller than $O(mn)$.

## → Advanced Section: Why Divide & Conquer is Correct

### Key Observation

Any LCS between $X$ and $Y$ must pass through some partition of $X$.

If we split $X$ into two halves:

$$
X = X_{left} + X_{right}
$$

Then the LCS can be written as:

$$
LCS(X,Y) = LCS(X_{left}, Y_{left}) + LCS(X_{right}, Y_{right})
$$

for some partition of $Y$.

The question is:
**How do we find that correct partition?**

### Forward and Backward Computation

When we compute:

- Forward LCS lengths from start
- Backward LCS lengths from end

We are effectively measuring:

- Best possible match before split
- Best possible match after split

If we choose $k$ that maximizes:

$$
L_1[k] + L_2[n-k]
$$

we ensure:

- The total length equals optimal LCS length.
- The split is consistent with optimal substructure.

### Why It Maintains Optimality

LCS satisfies optimal substructure:

If a solution is optimal, its subproblems must also be optimal.
Since we split at the position that preserves total optimal length, recursive calls also operate on optimal subproblems.
Thus correctness follows by induction on string length.



<div align="right">
    {{< editorCard name="Uday Hapaliya" roll="UI24CS28" linkedin="uday-hapaliya-481ba131a" github="udayhapaliya" link="https://www.linkedin.com/in/uday-hapaliya-481ba131a" >}}
</div>

---

{{< back "courses/2026-spring-cs405#core-contributors" "all editorials" >}}