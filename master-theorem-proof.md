<h2>Motivation: Divide and Conquer and Recurrence Relations</h2>

<p>
Many efficient algorithms are based on the <strong>divide-and-conquer</strong> technique.
In this approach, a problem is broken into smaller subproblems of the same type, each
subproblem is solved recursively, and the results are combined to form the final solution.
This works well when the problem has <strong>optimal substructure</strong>, meaning the solution
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
methods, which motivates the study of the <strong>Master Theorem</strong>.
</p>
