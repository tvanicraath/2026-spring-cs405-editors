# Knuth–Morris–Pratt (KMP) String Matching Algorithm

## Introduction

The **String Matching Problem** is defined as follows:

Given:

- A text string $T$ of length $n$
- A pattern string $P$ of length $m$

Find all positions in $T$ where $P$ occurs.

Formally, find all indices $i$ such that:

$$
T[i \dots i+m-1] = P[0 \dots m-1]
$$

---

## Real World Applications

String matching appears in many real-world systems:

- Find feature in text editors (VSCode, Notepad)
- Search engines (Google, Bing)
- DNA sequence matching in bioinformatics
- Plagiarism detection systems
- Network packet inspection
- Compiler lexical analysis

---

## Historical Background

The KMP algorithm was developed by:

- Donald Knuth
- James H. Morris
- Vaughan Pratt

in 1977.

It was the first algorithm to solve string matching in:

$$
O(n + m)
$$

time.

Before KMP, the best known algorithm took:

$$
O(nm)
$$

time in worst case.

---

## Naive Algorithm

### Approach

For each position in the text, try to match the pattern completely.

### Pseudocode

```text
procedure NaiveSearch(T, P):

    n ← length(T)
    m ← length(P)

    for i from 0 to n - m:

        match ← true

        for j from 0 to m - 1:

            if T[i + j] ≠ P[j]:
                match ← false
                break

        if match = true:
            print i
```

---

## Complexity Analysis of Naive Algorithm

Worst case example:

```text
Text    = aaaaaaaaaaaaab
Pattern = aaaaab
```

At each position, almost full comparison happens.

Time complexity:

$$
O(nm)
$$

This is inefficient for large inputs.

---

## Key Insight Behind KMP

When mismatch occurs, naive algorithm restarts from beginning of pattern.

KMP avoids this repetition by using information already known.

It preprocesses the pattern to build an array called:

## LPS Array (Longest Proper Prefix which is also Suffix)

Definition:

$$
LPS[i] =
\text{length of longest proper prefix of } P[0..i]
\text{ which is also suffix of } P[0..i]
$$

Proper prefix means prefix not equal to whole string.

---

## Example of LPS

Pattern:

```text
aabda
```

Index:

```text
0 1 2 3 4
```

LPS:

```text
0 1 0 0 1
```

Explanation:

At index 4:

prefixes: a, aa, aab, aabd
suffixes: a, da, bda, abda

common prefix and suffix = a

length = 1

---

## How KMP Uses LPS

When mismatch happens at position $j$ in pattern,

instead of restarting from 0,

we jump to:

$$
j = LPS[j-1]
$$

This avoids rechecking characters.

---

## KMP Algorithm

Two phases:

1. Build LPS array
2. Perform search using LPS

---

## Pseudocode: Compute LPS

```text
procedure ComputeLPS(P):

    m ← length(P)

    LPS[0] ← 0

    length ← 0
    i ← 1

    while i < m:

        if P[i] = P[length]:

            length ← length + 1
            LPS[i] ← length
            i ← i + 1

        else:

            if length ≠ 0:
                length ← LPS[length - 1]

            else:
                LPS[i] ← 0
                i ← i + 1
```

---

## Pseudocode: KMP Search

```text
procedure KMPSearch(T, P):

    n ← length(T)
    m ← length(P)

    LPS ← ComputeLPS(P)

    i ← 0
    j ← 0

    while i < n:

        if T[i] = P[j]:

            i ← i + 1
            j ← j + 1

        if j = m:

            print(i - j)

            j ← LPS[j - 1]

        else if i < n and T[i] ≠ P[j]:

            if j ≠ 0:
                j ← LPS[j - 1]

            else:
                i ← i + 1
```

---

## Example Walkthrough (KMP Algorithm)

### Text

abababc

Length = 7

### Pattern

ababc

Length = 5

---

### Step 1: Compute LPS Array

Pattern: ababc

Index:   0 1 2 3 4  
Chars:   a b a b c  
LPS:     0 0 1 2 0  

Explanation:

- LPS[0] = 0  
- LPS[1] = 0  
- LPS[2] = 1  (prefix "a" = suffix "a")  
- LPS[3] = 2  (prefix "ab" = suffix "ab")  
- LPS[4] = 0  

---

### Step 2: Matching Process

We use two pointers:

- i → text pointer  
- j → pattern pointer  

---

### Matching Steps

1. Match: ab ab  
2. Mismatch at c vs a  
3. Use LPS → j = LPS[j-1] = 2  
4. Continue matching  
5. Full pattern matches  

---

### Final Match

Pattern found at index:

2

Because:

T[2...6] = ababc

matches the pattern.

---



---

## Proof of Correctness (KMP Algorithm)

We prove that the KMP algorithm correctly finds the first occurrence of the pattern `P`
in the text `T` without missing any valid match.

---

### Definitions

Let:

- `T` be the text of length `n`
- `P` be the pattern of length `m`
- `LPS[i]` be the length of the longest proper prefix of `P[0...i]`
  which is also a suffix of `P[0...i]`

The KMP algorithm maintains two pointers:

- `i` for the text `T`
- `j` for the pattern `P`

At any time:

P[0...j-1] = T[i-j...i-1]

---

### Lemma 1: LPS Property

For every index `k`, `LPS[k]` stores the length of the longest prefix of `P`
that is also a suffix ending at position `k`.

This means:

P[0 ... LPS[k]-1] = P[k-LPS[k]+1 ... k]

So after a mismatch at position `k+1`, the first `LPS[k]` characters still match.

---

### Lemma 2: No Valid Match is Skipped

Suppose we have matched `j` characters, and a mismatch occurs at:

T[i] != P[j]

So far:

P[0...j-1] = T[i-j...i-1]

From the LPS property:

P[0...LPS[j-1]-1] = P[j-LPS[j-1]...j-1]

This suffix already matches the corresponding part of `T`.

Therefore, shifting `P` to position `LPS[j-1]` keeps all possible matches
that could still succeed.

No valid occurrence is skipped.

---

### Lemma 3: Progress is Guaranteed

On each comparison:

- Either `i` increases, or
- `j` decreases using `LPS`

Since `j` never becomes negative and `i` never decreases,
the algorithm always makes progress.

Thus, the algorithm terminates.

---

### Theorem: KMP Finds All Occurrences Correctly

We prove that KMP reports exactly all valid matches.

#### Case 1: A Match is Reported

When `j = m`, we have matched:

P[0...m-1] = T[i-m...i-1]

So a valid occurrence is found and correctly reported.

#### Case 2: A Match Exists in T

Consider any valid match of `P` starting at position `k` in `T`.

By Lemma 2, KMP never skips any position that can start a match.

By Lemma 3, the algorithm eventually reaches every such position.

Therefore, this match will be detected.

---

### Conclusion

From the above lemmas:

1. LPS correctly represents prefix-suffix information.
2. Mismatch handling never skips valid matches.
3. The algorithm always makes progress.
4. Every real match is eventually found.

Hence, the KMP algorithm is correct.

---


## Time Complexity Analysis

Building LPS:

$$
O(m)
$$

Search phase:

$$
O(n)
$$

Total complexity:

$$
O(n + m)
$$

Each character is processed at most once.

---

## Space Complexity

Space used for LPS array:

$$
O(m)
$$

---

## Why KMP is Optimal

Naive algorithm rechecks characters unnecessarily.

KMP avoids redundant comparisons.

Thus it achieves optimal linear time complexity.

---

## Complete Implementation (C++)

```cpp
#include <bits/stdc++.h>
using namespace std;

vector<int> computeLPS(string pattern)
{
    int m = pattern.size();
    vector<int> lps(m);

    int length = 0;
    lps[0] = 0;

    int i = 1;

    while (i < m)
    {
        if (pattern[i] == pattern[length])
        {
            length++;
            lps[i] = length;
            i++;
        }
        else
        {
            if (length != 0)
                length = lps[length - 1];
            else
            {
                lps[i] = 0;
                i++;
            }
        }
    }

    return lps;
}

vector<int> KMPSearch(string text, string pattern)
{
    vector<int> lps = computeLPS(pattern);

    vector<int> result;

    int i = 0, j = 0;

    while (i < text.size())
    {
        if (text[i] == pattern[j])
        {
            i++;
            j++;
        }

        if (j == pattern.size())
        {
            result.push_back(i - j);
            j = lps[j - 1];
        }
        else if (i < text.size() && text[i] != pattern[j])
        {
            if (j != 0)
                j = lps[j - 1];
            else
                i++;
        }
    }

    return result;
}
```

---

## Applications in Competitive Programming

Common applications include:

- Substring search problems
- String periodicity problems
- Pattern detection
- Minimum string construction
- Prefix-suffix problems

---

## Related Problems

LeetCode:

- Find the Index of the First Occurrence in a String  
  https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/

- Shortest Palindrome  
  https://leetcode.com/problems/shortest-palindrome/


Codeforces:

- Password (uses prefix function / KMP)  
  https://codeforces.com/problemset/problem/126/B

- Prefixes and Suffixes (classic prefix-function / KMP application)  
  https://codeforces.com/problemset/problem/432/D

---

## References

Online Resources:

- GeeksforGeeks — KMP Algorithm for Pattern Searching  
  https://www.geeksforgeeks.org/dsa/kmp-algorithm-for-pattern-searching/

## Videos

These lectures provide excellent explanations of the KMP algorithm from intuition to implementation:

[KMP Algorithm | Inside Code (Clear intuition and implementation)](https://youtu.be/M9azY7YyMqI?si=NDwO6fku2KheLaKZ)

[KMP String Matching Algorithm | CodeStoryWithMIK](https://youtu.be/qases-9gOpk)

[Knuth-Morris-Pratt (KMP) Algorithm | Abdul Bari](https://youtu.be/V5-7GzOfADQ)

---

## Conclusion

The Knuth–Morris–Pratt algorithm is one of the most important string matching algorithms.

Key strengths:

- Linear time complexity
- No redundant comparisons
- Elegant preprocessing using LPS

Final time complexity:

$$
O(n + m)
$$

KMP remains fundamental in computer science, competitive programming, and real-world systems.
