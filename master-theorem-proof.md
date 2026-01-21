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
Many divide-and-conquer algorithms give rise to recurrence relations of a simple and
common form. The <strong>Master Theorem</strong> helps us analyze the running time of such
algorithms without explicitly expanding the recursion.
</p>

<p>
In this setting, we consider recurrences of the form:
</p>

<p>
<em>T(n) = aT(n/b) + O(n<sup>d</sup>)</em>
</p>

<p>
Here, <em>a</em> is the number of subproblems, each of size <em>n/b</em>, and
<em>O(n<sup>d</sup>)</em> represents the work done outside the recursive calls, such as
dividing the problem and combining the results. We assume <em>a ≥ 1</em>,
<em>b &gt; 1</em>, and <em>T(1) = Θ(1)</em>.
</p>

<p>
The Master Theorem compares the values of <em>a</em>, <em>b</em>, and <em>d</em>, and
distinguishes between the following three cases:
</p>

<p>
<strong>Case 1:</strong>
If <em>a &gt; b<sup>d</sup></em>, then the work done in the recursive calls dominates, and
<em>T(n) = Θ(n<sup>log<sub>b</sub>a</sup>)</em>.
</p>

<p>
<strong>Case 2:</strong>
If <em>a = b<sup>d</sup></em>, then the work is evenly balanced across all levels of
recursion, and
<em>T(n) = Θ(n<sup>d</sup> log n)</em>.
</p>

<p>
<strong>Case 3:</strong>
If <em>a &lt; b<sup>d</sup></em>, then the non-recursive work dominates, and
<em>T(n) = Θ(n<sup>d</sup>)</em>.
</p>
