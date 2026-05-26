+++
draft = false
type = "courses"
courseImage = '../../bogo.png'
courseCode = 'CS 405'
courseName = 'Student Editorials'
semester = 'Spring (Sem 2) 2026'
title = 'CS405 - Rabin Karp and DFT for String Search'
subheader = 'Rabin Karp and DFT for String Search'
subheadertext = 'Apekshaa Yadav'
+++


## Background and History

The Rabin-Karp algorithm was invented in 1987 by Michael O. Rabin and Richard M. Karp: both experts of theoretical computer science, a domain we have been diving into, in both [CS304](../../../2025-monsoon-cs304/) and in this course.
Both Rabin and Karp received the Turing Award for their individual exceptional contributions to the field of computer science.
Together, they combined hashing with the sliding window idea to produce an algorithm elegant enough to be taught in every algorithms course, yet practical enough to power real-world tools.

## The Problem

Given two strings text (the text) and pattern (the pattern), consisting of lowercase English alphabets, find all $0$-based starting indices where pattern occurs as a substring in text.

**For the geeks,**

Given:
- A text $T = T[0], T[1], \ldots ,T[n−1]$ over an alphabet $\Sigma$, with $|T|=n$
- A pattern P = P[0], P[1],…,P[m−1] over the same alphabet $\Sigma$, with $|P|=m$
- Where $m \leq n$

Find:

$$ S = \set{ i \in \set{0,1 \ldots, n−m} | T[i+j] = P[j] \text{ for all } j \in \set{0,1, \ldots, m−1} } $$

That is, the set of all valid shift indices $i$ at which the pattern occurs in the text.

Example: Find `edit` in `editorial`.

```
Text:    e d i t o r i a l
Pattern: e d i t
         ^--- match at index 0
```

## Naive approach

The brute-force solution slides the pattern over every position in the text and compares character by character:

```text
for i = 0 to n - m:
    match = true
    for j = 0 to m - 1:
        if T[i + j] != P[j]:
            match = false
            break
    if match:
        report occurrence at i
```

Time complexity: $O(n \cdot m)$ {COSTLY!! $$$} For large inputs, far too slow.

## Key Idea of Rabin-Karp

Instead of comparing characters one-by-one, convert each window of the text and the patterns to a number (hash), then compare numbers.

Comparing two numbers = $O(1)$ complexity

So most windows are rejected instantly on a hash mismatch, without having to inspect individual characters.

## The Rolling Hash

The hash of a string $s = s(0)s(1)…s(m-1)$ is defined as a polynomial evaluated at base b modulo a large prime number $p$:

$$ \text{hash} = (c_0 \times b^{m-1} + c_1 \times b^{m-2} + \ldots + c_{m-1} \times b^0) (\text{mod } p)$$

where $s$ is the numeric value of a character, $b$ is a small prime, and $p$ is a large prime.

**Rolling to the next window:**

The clever part is computing the hash of the next window from the previous one in $O(1)$, called rolling hash.


$$ \text{newHash} = (\text{oldHash} - c_{\text{old}} \times b^{m-1}) \times b + c_{\text{new}} $$

You just remove the leftmost character and add the new rightmost one — no need to recompute from scratch.

## Spurious Hit

A spurious hit is when two different strings have the same hash — a collision. When hashes match, Rabin-Karp does a full O(m) character-by-character verification to confirm. With a good hash function and large prime, collisions are rare, so this verification is almost never triggered.

To further reduce collision probability, double hashing can be used: maintain two independent hash functions with different bases and primes. A false positive under both simultaneously is astronomically unlikely.

## The Algorithm

### Pseudocode

```text
Function RabinKarp(T, P, b, p):
    N = length(T)
    m = length(P)
    h_pat = hash(P, b, p)
    h_win = hash(T[0 … m-1], b, p)
    b_m = b^(m-1) mod p
    for i = 0 to n - m:
        if h_win == h_pat:
            if T[i … i + m - 1] == P:
                report match at index i
        if i < n - m:
            h_win = ((h_win - T[i] * b_m) * b + T[i + m] mod p
            if h_win < 0:
                h_win = h_win + p
```

### Time Complexity

| Case | Time |
|---|---|
| Average / Best | O(n + m) |
| Worst case (many collisions) | O(n * m) |
| Space | O(1) |

The worst case arises when every window collides with the pattern hash (e.g., all characters identical). In practice, with a well-chosen prime p, the expected number of spurious hits is O(n/p) ~ approx 0.

## Step-by-Step Example

Text T = "abcabc", Pattern P = "cab", base b = 31 (modular arithmetic omitted for clarity):

```
Window 1: T[0..2] = "abc"  →  hash_A  ≠  hash("cab")   skip
Window 2: T[1..3] = "bca"  →  hash_B  ≠  hash("cab")   skip
Window 3: T[2..4] = "cab"  →  hash_C  =  hash("cab")   → verify → ✓ match at index 2
Window 4: T[3..5] = "abc"  →  hash_D  ≠  hash("cab")   skip
```

Each hash transition from window k to k+1 is computed in O(1) using the rolling formula.

## Comparing Rabin Karp with Kruth-Morris-Pratt (KMP)

[Pranav's editorial](../kmp/) covers the KMP algorithm, which preprocesses the pattern into a failure function to avoid redundant comparisons. Here is how the two compare across scenarios.

| Scenario | Rabin-Karp | KMP |
|---|---|---|
| Single pattern, large text | $O(n + m)$ avg | $O(n + m)$ guaranteed |
| Worst-case guarantee | $O(n \cdot m)$ (pathological input) | $O(n + m)$ always |
| Multiple patterns | Hash all patterns into a set; single pass over text | Must run separately per pattern (or use [Aho-Corasick](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm)) |
| Counting total matches | Both equally straightforward | Both equally straightforward |
| Partial / approximate matching | Hash-based windows extend naturally to fuzzy variants | Failure function must be redesigned |
| Wildcards in pattern | Manageable with polynomial tricks (see FFT section) | Requires significant modification |
| 2D pattern matching | Rolling hash generalizes to 2D grids naturally | Very difficult to generalize |
| Implementation complexity | Simple to implement | Moderate (failure function logic) |
| Cache friendliness | Good (sequential access) | Good (sequential access) |

From the above table, we can infer that Rabin-Karp wins on flexibility and multi-pattern search, KMP wins on worst-case guarantees and structural insights into partial matches.

## Further Algorithms: FFT-Based Pattern Matching

For a completely different approach — one that trades hash-based heuristics for exact algebraic structure — we can use the Fast Fourier Transform (FFT).

### The Core Idea

Represent the text and pattern as polynomials, then use polynomial multiplication (via FFT) to compute all match scores simultaneously.

Define indicator polynomials for text T and pattern P (reversed). The coefficient of $x^i$ in their product counts something related to character agreement at position $i$. With the right encoding, a zero coefficient at position $i$ means a perfect match at that position.

For exact matching of pattern P in text T, define:

$$ A(x) = \sum_{i} T[i] \cdot x^i $$
$$ B(x) = \sum_{j} P[m-1-j] * x^j $$

The product $C = A \cdot B$ gives at position i:

$$ C[i + m - 1] = \sum_{j=0}^{m-1} T[i+j] \cdot P[j] $$

This is a dot product — equal to $\sum_{j=0}^{m-1} P[j]^2$ only when $T[i+j] = P[j]$ for all $j$ (for binary/character matching with the right formulation).
FFT computes this product in $O(n \log n)$. Is it better than Rabin-Karp's linear time? Not quite, but the constant matters less here; the FFT approach shines for:

### String Matching with Wildcards

Rabin-Karp (and KMP) struggle when the pattern contains wildcard characters (e.g. `?`) that matches anything. FFT handles this elegantly.

Encode: let $P[j] = 0$ for wildcards. Define:

$$ f(i) = \sum_{j=0}^{m-1} (T[i+j] - P[j])^2 \cdot [P[j] \neq \text{wildcard}] $$

Then $f(i) = 0$ iff position $i$ is a match (with wildcards). Expanding $(T[i+j] - P[j])^2$ yields three convolutions computable via FFT in $O(n \log n)$ total.
This is one of the most elegant applications of FFT in string algorithms. See: [cp-algorithms FFT — String Matching with Wildcards](https://cp-algorithms.com/algebra/fft.html#string-matching-with-wildcards).

## Problems and Further Reading

### Practice Problems

- [SPOJ - NHAY](https://www.spoj.com/problems/NHAY/) — Direct Rabin-Karp / KMP application; find all occurrences of needle in haystack.
- [Codeforces 126E](https://codeforces.com/problemset/problem/126/E) — Requires rolling hash and careful collision avoidance.
- [Codeforces 271D](https://codeforces.com/problemset/problem/271/D) — Beautiful problem combining hashing with binary search on string structure.
- [Codeforces 1063F](https://codeforces.com/problemset/problem/1063/F) — Multi-pattern matching; Rabin-Karp with a hash set is natural here.
- [LeetCode 28 - Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) — Warmup; implement from scratch.
- [LeetCode 1044 - Longest Duplicate Substring](https://leetcode.com/problems/longest-duplicate-substring/) — Rolling hash + binary search; classic.

### Tutorials and References

- [cp-algorithms: String Hashing](https://cp-algorithms.com/string/string-hashing.html) — Best reference for rolling hash implementation details, anti-hack tricks, and double hashing.
- [cp-algorithms: Rabin-Karp](https://cp-algorithms.com/string/rabin-karp.html) — Concise and rigorous.
- [cp-algorithms: KMP](https://cp-algorithms.com/string/prefix-function.html) — For comparison with Pranav's editorial.
- [cp-algorithms: FFT String Matching](https://cp-algorithms.com/algebra/fft.html) — The FFT-based matching and wildcard extension.

### Something Cool: Hashing for 2D Patterns

Rabin-Karp generalizes to 2D pattern matching — finding an $m \times m$ pattern inside an $n \times n$ grid — by hashing each row with a rolling hash, then hashing the resulting column of row-hashes with another rolling hash. This gives $O(n^2)$ 2D pattern matching, which no failure-function-based algorithm achieves as cleanly. A fun exercise!

<div align="right">
    {{< editorCard name="Apekshaa Yadav" roll="UI24CS84" github="apekshaayy" link="https://www.linkedin.com/in/apekshaa-yadav-80a093350/" >}}
</div>



{{< back "courses/2026-spring-cs405#core-contributors" "all editorials" >}}