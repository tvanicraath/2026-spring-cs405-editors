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

<img src="recursion-tree.png">

<p>
From the above recursion tree, we observe the structure of the divide-and-conquer process.
At the root level, there is a single problem of size <strong>n</strong>. Each problem is
divided into <strong>a</strong> subproblems, each of size <strong>n/b</strong>.
</p>

<p>
After every <strong>k</strong> levels of recursion, there are
<strong>a<sup>k</sup></strong> subproblems, each of size
<strong>n / b<sup>k</sup></strong>.
</p>




