<h2>Motivation: Divide and Conquer and Recurrence Relations</h2>

<p>
Many efficient algorithms are based on the divide-and-conquer technique.
In this approach, a problem is broken into smaller subproblems of the same type, each
subproblem is solved recursively, and the results are combined to form the final solution.
This works well when the problem has optimal substructure, meaning the solution
to the problem depends on solutions to its subproblems.
</p>

<p>
Since divide-and-conquer algorithms are naturally recursive, their running time also
becomes recursive. Unlike simple iterative algorithms, the total time now depends on the
time taken by recursive calls on smaller inputs.
</p>

<p>
As a result, the running time of such algorithms is expressed using
<strong>recurrence relations</strong>, typically of the form
<em>T(n) = aT(n/b) + f(n)</em>. To analyze these recurrences efficiently, we need systematic
methods, which motivates the study of the Master Theorem.
</p>

<h2>The Master Theorem</h2>

<p>
Many divide-and-conquer algorithms lead to recurrence relations of a common form.
The <strong>Master Theorem</strong> provides a convenient way to find the asymptotic
running time of such recurrences without solving them from scratch each time.
</p>

<p>
The theorem applies to recurrences of the form:
</p>

<p>
<em>T(n) = aT(n/b) + f(n)</em>
</p>

<p>
Here, <em>a</em> represents the number of subproblems, each of size <em>n/b</em>, and
<em>f(n)</em> denotes the cost of dividing the problem and combining the results.
We assume that <em>a ≥ 1</em>, <em>b &gt; 1</em>, and <em>T(1) = Θ(1)</em>.
</p>

<p>
The Master Theorem compares the function <em>f(n)</em> with
<em>n<sup>log<sub>b</sub>a</sup></em> and classifies the recurrence into one of the
following three cases:
</p>

<p>
<strong>Case 1:</strong>
If <em>f(n) = O(n<sup>log<sub>b</sub>a − ε</sup>)</em> for some constant <em>ε &gt; 0</em>,
then the work done by the recursive calls dominates, and
<em>T(n) = Θ(n<sup>log<sub>b</sub>a</sup>)</em>.
</p>

<p>
<strong>Case 2:</strong>
If <em>f(n) = Θ(n<sup>log<sub>b</sub>a</sup>)</em>, then the work is evenly distributed
across all levels of recursion, and
<em>T(n) = Θ(n<sup>log<sub>b</sub>a</sup> log n)</em>.
</p>

<p>
<strong>Case 3:</strong>
If <em>f(n) = Ω(n<sup>log<sub>b</sub>a + ε</sup>)</em> for some constant <em>ε &gt; 0</em>,
and the regularity condition holds, then the non-recursive work dominates, and
<em>T(n) = Θ(f(n))</em>.
</p>

<h2>Proof of the Master Theorem (Recursion Tree Method)</h2>

<img src="editors/recursion-tree.png">

<p>
From the above recursion tree, we observe the structure of the divide-and-conquer process.
At the root level, there is a single problem of size <strong>n</strong>. Each problem is
divided into <strong>a</strong> subproblems, each of size <strong>n/b</strong>.
</p>

<p>
After every k levels of recursion, there are
a<sup>k</sup> subproblems, each of size
n / b<sup>k</sup>.
</p>

<p>
After <strong>k</strong> levels of recursion, there are
<strong>a<sup>k</sup></strong> subproblems, each of size
<strong>n / b<sup>k</sup></strong>.
</p>

<p>
So, the total work done at the <strong>k</strong>-th level is
</p>

<p>
O((n / b<sup>k</sup>)<sup>d</sup>) · a<sup>k</sup>
= O(a<sup>k</sup> (n / b<sup>k</sup>)<sup>d</sup>)
</p>

<p>
= O(n<sup>d</sup> (a / b<sup>d</sup>)<sup>k</sup>)
</p>

<p>
After <strong>log<sub>b</sub> n</strong> levels, the subproblem size
reduces to 1, which corresponds to the base case of the recursion.
</p>

<p>
Therefore, the total running time of the algorithm is obtained by
summing the work done at each level:
</p>

<p>
T(n) = O(
n<sup>d</sup>
∑<sub>k = 0</sub><sup>log<sub>b</sub> n</sup>
(a / b<sup>d</sup>)<sup>k</sup>
)
</p>

<p>
We have obtained the following expression for the running time:
</p>

<p>
T(n) = O(
n<sup>d</sup>
∑<sub>k = 0</sub><sup>log<sub>b</sub> n</sup>
(a / b<sup>d</sup>)<sup>k</sup>
)
</p>

<p>
<strong>Case 1:</strong> <strong>a &lt; b<sup>d</sup></strong>
</p>

<p>
In this case, we have
<strong>a / b<sup>d</sup> &lt; 1</strong>.
So by the summation lemma we know that this series converges to a constant.
</p>

<p>
Therefore, the total running time is dominated by the factor
<strong>n<sup>d</sup></strong>, and we get
</p>

<p>
<strong>T(n) = O(n<sup>d</sup>)</strong>.
</p>

<p>
<strong>Case 2:</strong> <strong>a = b<sup>d</sup></strong>
</p>

<p>
In this case, we have
a / b<sup>d</sup> = 1.
Now as each term turns out to be 1 so sum turns out be (log<sub>b</sub> n).
</p>

<p>
Therefore, the total running time becomes
</p>

<p>
<strong>T(n) = O(n<sup>d</sup> log<sub>b</sub> n)</strong>.
</p>

<p>
<strong>Case 3:</strong> <strong>a &gt; b<sup>d</sup></strong>
</p>

<p>
In this case, we have
<strong>a / b<sup>d</sup> &gt; 1</strong>.
Therefore, the summation grows exponentially and is dominated by its last term,
which is
<strong>(a / b<sup>d</sup>)<sup>log<sub>b</sub> n</sup></strong>.
</p>

<p>
Substituting this into the expression for <strong>T(n)</strong>, we get
</p>

<p>
T(n) = O(
n<sup>d</sup>
(a / b<sup>d</sup>)<sup>log<sub>b</sub> n</sup>
)
</p>

<p>
Using the identity
<strong>(a / b<sup>d</sup>)<sup>log<sub>b</sub> n</sup>
= n<sup>log<sub>b</sub> a − d</sup></strong>,
we obtain
</p>

<p>
<strong>T(n) = O(n<sup>log<sub>b</sub> a</sup>)</strong>.
</p>

<p>
<strong>Theorem (Master Theorem):</strong>
If
<strong>T(n) = aT(n / b) + O(n<sup>d</sup>)</strong>
for constants
<strong>a &gt; 0</strong>,
<strong>b &gt; 1</strong>, and
<strong>d ≥ 0</strong>,
then the running time satisfies the following bounds:
</p>

<p>
<strong>
T(n) ∈
{
O(n<sup>d</sup>) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if a &lt; b<sup>d</sup> <br>
O(n<sup>d</sup> log n) &nbsp; if a = b<sup>d</sup> <br>
O(n<sup>log<sub>b</sub> a</sup>) if a &gt; b<sup>d</sup>
}
</strong>
</p>

<p>
The three cases are commonly referred to as the
<strong>top-heavy</strong>,
<strong>steady-state</strong>, and
<strong>bottom-heavy</strong>
cases respectively, depending on which level of the recursion tree dominates the total
cost.
</p>

<p>
Thus, the proof follows by expressing the total running time as a summation over the
levels of the recursion tree and analyzing this summation for different values of
a relative to b<sup>d</sup>. This leads directly to the three cases of the Master Theorem.
</p>
