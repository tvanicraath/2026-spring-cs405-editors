## Motivation: Divide and Conquer and Recurrence Relations

Many efficient algorithms are based on the divide-and-conquer technique.
In this approach, a problem is broken into smaller subproblems of the same type, each
subproblem is solved recursively, and the results are combined to form the final solution.
This works well when the problem has optimal substructure, meaning the solution
to the problem depends on solutions to its subproblems.

Since divide-and-conquer algorithms are naturally recursive, their running time also
becomes recursive. Unlike simple iterative algorithms, the total time now depends on the
time taken by recursive calls on smaller inputs.

As a result, the running time of such algorithms is expressed using
**recurrence relations**, typically of the form
$T(n) = aT(n/b) + f(n)$.
To analyze these recurrences efficiently, we need systematic
methods, which motivates the study of the Master Theorem.

## The Master Theorem

Many divide-and-conquer algorithms lead to recurrence relations of a common form.
The **Master Theorem** provides a convenient way to find the asymptotic
running time of such recurrences without solving them from scratch each time.

The theorem applies to recurrences of the form:

$T(n) = aT(n/b) + f(n)$

Here, $a$ represents the number of subproblems, each of size $n/b$ and
$f(n)$ denotes the cost of dividing the problem and combining the results.
We assume that $a \ge 1$, $b > 1$, and $T(1) = \Theta(1)$.

The Master Theorem compares the function $f(n)$ with
$n^{\log_b a}$
and classifies the recurrence into one of the
following three cases:

**Case 1:**  
If $f(n) = O(n^{\log_b a - \varepsilon})$ for some constant $\varepsilon > 0$,
then the work done by the recursive calls dominates, and  
$T(n) = \Theta(n^{\log_b a})$.

**Case 2:**  
If $f(n) = \Theta(n^{\log_b a})$, then the work is evenly distributed
across all levels of recursion, and  
$T(n) = \Theta(n^{\log_b a} \log n)$.

**Case 3:**  
If $f(n) = \Omega(n^{\log_b a + \varepsilon})$ for some constant $\varepsilon > 0$
and the regularity condition holds, then the non-recursive work dominates, and  
$T(n) = \Theta(f(n))$.

## Proof of the Master Theorem (Recursion Tree Method)

![Recursion Tree](editors/recursion-tree.png)

From the above recursion tree, we observe the structure of the divide-and-conquer process.
At the root level, there is a single problem of size **n**. Each problem is
divided into **a** subproblems, each of size **n/b**.

After every $k$ levels of recursion, there are
$a^k$
subproblems, each of size
$n / b^k$.

After **k** levels of recursion, there are
**$a^k$** subproblems, each of size
**$n / b^k$**.

So, the total work done at the **k**-th level is

$O((n / b^k)^d) \cdot a^k
= O(a^k (n / b^k)^d)$

$= O(n^d (a / b^d)^k)$.

After **$\log_b n$** levels, the subproblem size
reduces to 1, which corresponds to the base case of the recursion.

Therefore, the total running time of the algorithm is obtained by
summing the work done at each level:

$T(n) = O(n^d \sum_{k=0}^{\log_b n} (a / b^d)^k)$.

We have obtained the following expression for the running time:

$T(n) = O(n^d \sum_{k=0}^{\log_b n} (a / b^d)^k)$.

**Case 1:** **$a < b^d$**

In this case, we have
$a / b^d < 1$.
So by the summation lemma we know that this series converges to a constant.

Therefore, the total running time is dominated by the factor
**$n^d$**, and we get

$T(n) = O(n^d)$.

**Case 2:** **$a = b^d$**

In this case, we have
$a / b^d = 1$.
Now as each term turns out to be 1 so sum turns out be $(\log_b n)$.

Therefore, the total running time becomes

$T(n) = O(n^d \log_b n)$.

**Case 3:** **$a > b^d$**

In this case, we have
$a / b^d > 1$.
Therefore, the summation grows exponentially and is dominated by its last term,
which is

$(a / b^d)^{\log_b n}$.

Substituting this into the expression for $T(n)$, we get

$T(n) = O(n^d (a / b^d)^{\log_b n})$.

Using the identity

$(a / b^d)^{\log_b n} = n^{\log_b a - d}$,

we obtain

$T(n) = O(n^{\log_b a})$.

**Theorem (Master Theorem):**  
If

$T(n) = aT(n / b) + O(n^d)$

for constants
**$a > 0$**, **$b > 1$**, and **$d \ge 0$**,
then the running time satisfies the following bounds:

- $O(n^d)$ if $a < b^d$
- $O(n^d \log n)$ if $a = b^d$
- $O(n^{\log_b a})$ if $a > b^d$

The three cases are commonly referred to as the
**top-heavy**, **steady-state**, and
**bottom-heavy**
cases respectively, depending on which level of the recursion tree dominates the total
cost.

Thus, the proof follows by expressing the total running time as a summation over the
levels of the recursion tree and analyzing this summation for different values of
$a$ relative to $b^d$. This leads directly to the three cases of the Master Theorem.

## Why the Master Theorem Is Not Exhaustive

The Master Theorem helps us find the running time of many
divide and conquer algorithms. However, the three cases of the theorem
do not cover all possible recurrences. This limitation follows directly
from the assumptions made in the proof.

In the proof, the total running time is expressed as

$T(n) = O(n^d \sum_{k=0}^{\log_b n} (a / b^d)^k)$.

The Master Theorem relies on the fact that this summation is a
**geometric series**. The three cases arise from the three
possible behaviors of a geometric series, depending on whether
**$a / b^d$** is less than, equal to, or greater than 1.
If the running time cannot be reduced to such a summation, the theorem
does not apply.

Another important assumption of the Master Theorem is that the problem
is divided into **a subproblems of equal size**, each of size
**$n / b$**. If the subproblems are of unequal sizes, the recursion
tree is no longer regular, and the summation used in the proof cannot be
formed. In such cases, the Master Theorem cannot be used.

Even when the subproblems are of equal size, the theorem may still fail
if the non-recursive work does not fit cleanly into one of the three
cases. Consider the recurrence

$T(n) = 2T(n / 2) + n \log n$.

Here, we have **$a = 2$** and **$b = 2$**, so
$n^{\log_b a} = n$.
However, the additional work term **$n \log n$** is asymptotically larger than
**$n$** but smaller than **$n^{1 + \varepsilon}$** for any constant
**$\varepsilon > 0$**. As a result, it does not satisfy
any of the three cases of the Master Theorem.

This example shows that although the Master Theorem is widely applicable,
its cases are not exhaustive. Some divide-and-conquer recurrences fall
outside its scope and require alternative methods of analysis.
