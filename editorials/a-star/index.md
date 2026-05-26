+++
draft = false
type = "courses"
courseImage = '../../bogo.png'
courseCode = 'CS 405'
courseName = 'Student Editorials'
semester = 'Spring (Sem 2) 2026'
title = 'CS405 - A* Search'
subheader = 'A* Search'
subheadertext = 'Rachit Singh'
+++

## Demos
- [A* Search Demo](demo)
- [15 Puzzle: Play vs AI](15-puzzle)

## Introduction

In graph theory, the *shortest path problem* is to find a path between two nodes (vertices) that minimizes the total weight (cost) of its edges.

**Breadth-First Search (BFS):** BFS explores neighbors level by level (all nodes at distance 1 from the start, then distance 2, etc.). It uses a queue and is guaranteed to find a solution if one exists, yielding the fewest edges path in an unweighted graph.

**Depth-First Search (DFS):** DFS explores one branch fully before backtracking (using a stack or recursion). It often uses less memory but is *not* guaranteed to find the shortest path first and can get “lost” down infinite branches. DFS is neither optimal nor complete, it can fail to find the shortest path even in finite graphs, and may loop indefinitely in infinite ones without cycle detection.

**Dijkstra’s Algorithm:** Dijkstra’s algorithm solves the single-source shortest-path problem on weighted graphs with non-negative edge weights. It uses a priority queue to always expand the node with the lowest path cost so far, thereby finding the least-cost path from the start to every other node. (With unit edge weights, BFS produces results equivalent to Dijkstra's.)

BFS/DFS are uninformed (no heuristic), while Dijkstra uses exact path costs. A* builds on these by introducing a problem-specific heuristic to guide the search.

---
## History of A* and its connections with AI

A* (pronounced “A-star”) was first introduced in 1968 by Peter Hart, Nils Nilsson, and Bertram Raphael at the Stanford Research Institute.

A* was developed *at SRI*, where the Shakey project (one of the earliest integrated AI systems combining perception, planning, and action) was ongoing, and path planning for Shakey was one motivating problem.

“Graph Traverser” algorithm developed by **Doran and Michie** (1966) used the heuristic estimate \(h(n)\) to guide search, but Raphael proposed combining it with the cost-so-far \(g(n)\) (i.e. using $(f(n)=g(n)+h(n))$)

Hart’s contribution was to formalize the conditions (now called *admissibility* and *consistency*) that guarantee this approach finds optimal paths

Over time, A* became a cornerstone of AI path-planning and search. It is widely used in robotics, game development (e.g. navigation meshes), logistics, and any domain requiring shortest-path planning with heuristics. 

A* is fundamentally a search algorithm designed to compute the shortest path between nodes built on mathematical principles and standard data structures such as priority queues. However, its significance within Artificial Intelligence arises from the use of a heuristic function. This heuristic acts as an informed estimate, guiding the search toward more promising directions rather than exhaustively exploring all options. By prioritizing paths that appear closer to the goal and avoiding unnecessary exploration, A* demonstrates a form of decision-making under uncertainty an essential characteristic of intelligent behavior.

---

## Heuristics

In A*, each node (n) has:

- **(g(n)):** the cost of the path from the start to (n).
- **(h(n)):** a *heuristic* estimate of the cheapest remaining cost to reach the goal from $n$.  The **evaluation function** is defined as $f(n) = g(n) + h(n)$ . A* always expands the node with the smallest $f(n)$ value next. This balances the path cost so far with an optimistic estimate of the remaining cost.
  Notably, when the heuristic is zero (i.e., $h(n) = 0$ for all nodes), A* reduces exactly to **Dijkstra’s algorithm**.

Key properties of heuristics include:

- **Admissible:** (h(n)) never overestimates the true cost to reach the goal. Formally, for every node (n), $h(n) \le h^*(n)$ where $h^*(n)$ is the actual shortest-path cost from (n) to the goal. Admissible heuristics are also called “optimistic.” With an admissible (h), A* is guaranteed to find a shortest path.
- **Perfect (ideal) heuristic:** This is when $h(n) = h^*(n)$, i.e. the heuristic exactly equals the true remaining cost. A perfect heuristic would guide A* directly along the optimal path (expanding essentially only the nodes on that path). Of course, perfect heuristics require knowing the answer in advance and are mainly a theoretical benchmark.
- **Consistent (monotone) heuristic:** For every edge ((n,m)), the heuristic must satisfy $h(n) \le cost(n,m) + h(m))$. In other words, it obeys a triangle inequality. Consistency implies admissibility and ensures that once a node is expanded, its best path cost is final (so A* need not revisit nodes). Consistent heuristics guarantee that the (f)-values along any path are non-decreasing.

In short, $f(n)=g(n)+h(n)$ ranks nodes for expansion, and choosing a good heuristic (admissible and as close as possible to $h^*$ drastically reduces the search compared to uninformed search. Straight-line (Euclidean) distance is admissible for unconstrained movement, Manhattan distance is admissible for grid movement restricted to cardinal directions.

---

### Why A* with an Admissible Heuristic is Optimal?

Intuitively, admissibility of $h$ ensures A* never overlooks an optimal path. If the heuristic $h(n)$ is **admissible** (i.e., $h(n)\le h^∗(n))$, then A* is guaranteed to find an optimal (shortest-cost) path. The classic proof (Hart et al. 1968) runs as follows:

Definitions

- $g(n)$: cost from start to n

- $h(n)$: heuristic estimate from n to goal

- $f(n)=g(n)+h(n)$

- $C^∗$: optimal path cost from start to goal

- $h^∗(n)$ = true cost from n to goal

Admissibility     = $h(n)\le h^∗(n))$ 

                           = $g(n)+h(n)\le g(n)+h^∗(n)$

So f(n) is a lower bound on the true cost of any solution via n.

A* always selects the node with the **smallest f**.

Consider any node n on the optimal path, then  $f(n) = g(n)+h^∗(n)\le C^∗$

So every node on the optimal path has $f(n)\le C^∗$

A* always expands the node with minimum f. Therefore, It will expand **all nodes with f(n)<C∗** before considering worse paths and there is always at least one node on the optimal path in OPEN with $f \le C^*$

For the goal node t: $f(t)= g(t)+h(t)=C^∗+0=C^∗$

Now suppose (for contradiction) A* returns a suboptimal goal with cost $C>C^∗$.

Then:

- There must still exist some node n on the optimal path with $f(n)\le C^*$ 
- But A* would expand n before any node with $f > C^*$

Contradiction.

Thus **A*** never terminates on a suboptimal path if (h) is admissible. More formally: “If the heuristic function is admissible, then A* is guaranteed to find an optimal solution”

---

### A* Variants and Extensions

Several variations of A* address memory or speed trade-offs:

- **Iterative Deepening A*** (IDA*, 1985): IDA* replaces A*’s priority queue with repeated depth-first searches, each with an increasing cost bound. Starting with $bound=h( \text{start}$), it does a DFS (keeping track of $ f(n)=g(n)+h(n)$, pruning any branch whose $f$ exceeds the current bound. When the DFS finishes, the bound is increased to the smallest $f$ value that exceeded it, and the search repeats. IDA* thus uses only linear stack space (like DFS) but may expand nodes multiple times because it has no memory of past expansions. Like A*, IDA* is optimal with admissible $h$. Its advantage is greatly reduced memory usage at the cost of extra node re-expansions.

- **Bidirectional A***: A bidirectional search runs two simultaneous searches – one forward from the start and one backward from the goal – and stops when the frontiers meet. In ideal cases each search only needs to cover roughly half the distance $d$, giving time complexity roughly $O(b^{d/2}+b^{d/2})$ instead of $O(b^d)$ for a single search. Heuristic estimates can guide both fronts (one uses $ h(n)$ from start-to-goal, the other can use a heuristic to the start). Proper termination conditions are required to ensure optimality. For example, the BHFFA2 algorithm is a bidirectional A*-like method that is guaranteed to find the shortest path (with an admissible heuristic on each side). In practice, bidirectional A* can dramatically reduce the number of expanded nodes when a strong heuristic is available from both directions.

- **Other variants:** There are many other tweaks not detailed here. For example,  
  Weighted A* (ε-A*) finds paths within a factor of ε of optimal, trading the optimality guarantee for reduced node expansions.
  SMA* (Russell 1992) caps memory to a fixed number of nodes, evicting the highest-f leaf when full and tracking its cost in the parent for possible re-expansion.
  Each variant is designed for specific constraints, but all build on the basic principle $f=g+h$.

**Summary:** A* is an informed best-first search that finds optimal paths when using an admissible heuristic. It generalizes classical searches by steering the search towards the goal , and its foundations lie in early AI research on planning and graph search. Variants like IDA* and bidirectional A* adapt A* for memory limits or faster convergence, showing the flexibility of the A* framework.

---

### Algorithm

```pseudocode
We create two lists – Open List and Closed List (just like Dijkstra Algorithm)  

// A* Search Algorithm
1.  Initialize the open list
2.  Initialize the closed list
    put the starting node on the open 
    list (you can leave its f at zero)
3.  while the open list is not empty
    a) find the node with the least f on 
       the open list, call it "q"
    b) pop q off the open list

    c) generate q's 8 successors and set their 
       parents to q

    d) for each successor
        i) if successor is the goal, stop search

        ii) else, compute both g and h for successor
          successor.g = q.g + distance between 
                              successor and q
          successor.h = distance from goal to 
          successor (This can be done using many 
          ways, we will discuss three heuristics- 
          Manhattan, Diagonal and Euclidean 
          Heuristics)

          successor.f = successor.g + successor.h
        iii) if a node with the same position as 
            successor is in the OPEN list which has a 
           lower f than successor, skip this successor
        iV) if a node with the same position as 
            successor  is in the CLOSED list which has
            a lower f than successor, skip this successor
            otherwise, add  the node to the open list
     end (for loop)

    e) push q on the closed list
    end (while loop)
```

Source [A* Search Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/dsa/a-search-algorithm/)

<img src="https://media.geeksforgeeks.org/wp-content/uploads/a_-search-algorithm-2.png" title="" alt="A_Star_Search" width="294">

---

### Approximation Heuristics in A*

A* uses heuristic functions to estimate the distance from the current node to the goal.

1. **Manhattan Distance**

$$
h = |x_{current} - x_{goal}| + |y_{current} - y_{goal}|
$$

- Measures grid distance (no diagonals)  
- **Use when:** movement is allowed in **4 directions** (up, down, left, right)
2. **Diagonal Distance (Octile Distance)**

$$
dx = |x_{current} - x_{goal}|,\quad dy = |y_{current} - y_{goal}|
$$

$$
h = D \cdot (dx + dy) + (D_2 - 2D)\cdot \min(dx, dy)
$$

- Combines straight and diagonal movement  

- **Use when:** movement is allowed in **8 directions** (like a king in chess)  

- Typically:
  
  $$
  D = 1,\quad D_2 = \sqrt{2}
  $$
3. **Euclidean Distance**

$$
h = \sqrt{(x_{current} - x_{goal})^2 + (y_{current} - y_{goal})^2}
$$

- Straight-line distance  
- **Use when:** movement is allowed in **any direction (continuous space)**

---

****Limitations****   
Although being the best path finding algorithm around, A* Search Algorithm doesn’t produce the shortest path always, as it relies heavily on heuristics / approximations to calculate - h

****Applications****   
A* Search Algorithm is often used to find the shortest path from one point to another point. You can use this for each enemy to find a path to the goal.  
One example of this is the very popular game- Warcraft III 

****What if the search space is not a grid and is a graph ?****  
The same rules applies there also. The example of grid is taken for the simplicity of understanding. So we can find the shortest path between the source node and the target node in a graph using this A* Search Algorithm, just like we did for a 2D Grid.

****Time Complexity****   
Considering a graph, it may take us to travel all the edge to reach the destination cell from the source cell [For example, consider a graph where source and destination nodes are connected by a series of edges, like - 0(source) -->1 --> 2 --> 3 (target)  
So the worse case time complexity is $O(E)$, where E is the number of edges in the graph

****Auxiliary Space**** In the worse case we can have all the edges inside the open list, so required auxiliary space in worst case is $O(V)$, where V is the total number of vertices.



<div align="right">
  {{< editorCard name="Rachit Singh" roll="UI24CS67" github="Rachit1801" link="https://www.instagram.com/rachitliveshere/" >}}
</div>

---

{{< back "courses/2026-spring-cs405#core-contributors" "all editorials" >}}
