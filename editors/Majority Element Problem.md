# Majority Element problem :-
<pre>Given an array of size N and we want to find the majority element appears >N/2 times.
For finding the element that appears >N/2 times in an array of size N..

<h2><b>Naive(Bruteforce) :-</b></h2>
    The extreme naive solution we can think of is to traverse the entire array and keep a variable count.
Now take the first element and store it in variable ele, increase count by one and search the entire array if
we get an element which is equal to ele(we stored in the beginning) then again increase the count by one.

    Once we traversed the entire array for the first element then check if the count is >N/2 or not.
if Yes - print the number
if No - take the next element of the array in the variable ele and upgrade the counter as 1.

Do the same for other elements.
  
<b>Note :- If the size of the array is N and we are looking for the element appears >N/2 times
then it will always be one element.</b>
<hr>
Example :- If N == 8 -> N/2 = 4. Now an element to be majority in the array it must appears at least 5 times
and if an element appears 5 times then others cannot appear > N/2 (i.e. 5 times in this example.)

    we can think of this as a bubble sort but here instead of swapping we are checking the condition of 
matching and increasing the count.
<hr>
<h4>Time complexity :- O(N^2) because we are running two loops.
Space complexity :- O(1) because we are not using any extra spaces(other than just a variable ele)</h4>
<h2><b>Better approach :-</b></h2>
    To reduce the time complexity to O(NlogN) we can use hashtable(hash array) or maps.
If we use map for storing the element and it's frequency (how many times that element appears) we can reduce 
the time complexity.

we can declare map as map(int,int) in c++ which stores the element and it's frequency.map is like dictionary
of python(Stores as key,value pairs).

    Now we run a loop for once and instead of increasing the count by 1 we are storing the frequency and once
the loop is over we can find the element which is appears >N/2 time by writing map.second
<hr>
<h4>Time complexity :- O(NlogN) because we are running one loop and the operation of map using logN time comp.
we can further decrease this as O(N) if we use an unordered map because the time complexity of unordered map 
is O(1).
Space complexity :- O(N) because we are storing every element in the map.</h4>
    but here we are using space of O(N) so to decrease that we use Boyer-Moore's algorithm.

<h2><b>Boyer-Moore's voting algorithm :-</b></h2>

It says :- Take the first element from the array and increase count by 1 if it appears again increase the 
           the count by 1 again and if another element appears  decrease the count by 1.
           
    In this algorithm we will keep a variable count to count the frequency of the element and a variable ele
to keep track of the element whose frequency we are counting. Now we will run the loop for once and keep
updating the count.
<hr>
Example :- If the given array is [2,2,3,2,3,2,5,2]. So at first the ele = 2, arr[i] = 2 and the count = 1
in the 2nd pass the arr[i] = 2 and count = 2,(count increases because arr[i] == ele)
in the 3rd pass the arr[i] = 3 and count = 1,(count decreases because arr[i] != ele)
in the 4th pass the arr[i] = 2 and count = 2,(count increases because arr[i] == ele) and so on.

<b>Note :- If the count decreases to 0 then we have to update the ele by arr[i] and count by 1.</b>
<hr>
Example :- If the given array is [2,2,3,3,3,3,5,3]. So at first the ele = 2, arr[i] = 2 and the count = 1
in the 2nd pass the arr[i] = 2 and count = 2,(count increases because arr[i] == ele)
in the 3rd pass the arr[i] = 3 and count = 1,(count decreases because arr[i] != ele)
in the 4th pass the arr[i] = 3 and count = 0,(count decreases because arr[i] != ele) after this (count == 0)
  so the ele will be arr[i] and count will be 1..
in the 5th pass the arr[i] = 3 and count = 1,(count increase because arr[i] == ele) 
and so on.

    At the end of the code we check if the count for the element stored in ele is >N/2 or not.
if Yes - print the number
if No - majority element doesn't exist.
<hr>
<h3>Pseudo-Code</h3>
BOYER_MOORE(A[1…n])
    ele = NULL
    count = 0

    for i = 1 to n do
        if count = 0 then
            ele = A[i]
            count = 1
        else if A[i] = ele then
            count = count + 1
        else
            count = count - 1
        end if
    end for

    return ele

<hr>
<h4>Time complexity :- O(N)(because we are running only one loop) + O(N)(to check the freq of the ele).
                   O(N + N) = O(2N) ~ O(N).
Space complexity :- O(1) because we are not using any extra data structure(except variable ele).</h4>

<h2>Proof of correctness and Loop invariant:-</h2>
An argument that the algorithm works correctly for all inputs.
Proof: A valid argument that establishes the truth of a mathematical statement
  
To prove the algorithm correct, let us define the following loop-invariant:
At the start of each iteration i, count represents the difference between the number of occurrences of
element and the number of occurrences of all other elements.

count = “how many more times candidate element appears than non-candidate elements so far.”

    Now we will prove this for all i>=0 by induction.
<hr>
<h3>Induction Hypothesis</h3>
Assume that after processing the first i elements, the loop invariant is true.

for i+1:
Case 1:count = 0
No elements remain after cancellation of A[1…i]

Algorithm sets:
element = A[i+1]
count = 1

Case 2: count > 0 and A[i+1] = element
Algorithm increments count

Case 3: count > 0 and A[i+1] ≠ candidate
Algorithm decrements count

<h2>Generalization for N/k(Misra-Gries algorithm) :-</h2>
It says :- The Misra–Gries algorithm is a streaming algorithm used to find frequent elements (heavy hitters)
in a data stream using limited memory.

    Let's consider k to be 3 and N is 8 Now an element to be majority it must appear at least 3 times.
Now keep two variable as count1 and count2 because there are at most 2 variables that maybe appears atleast
3 times. that's why we are keeping two variable as count1 and count2.Implementation of this is same as Boyer
Moore's algorithm.(Value of k should be at least 2)

    Same for the k = 4 and N = 8, for this we have to keep three counters count1, count2 and count3.

So to generalize the term we have to use <b>k-1</b> count variable. you can imagine count variable as a
containers or buckets.
<hr>
<h3>Pseudo-Code</h3>
MISRA_GRIES(A[1…n], k)
    create empty map C     

    for i = 1 to n do
        if A[i] is in C then
            C[A[i]] = C[A[i]] + 1

        else if size(C) < (k − 1) then
            C[A[i]] = 1

        else
            for each key x in C do
                C[x] = C[x] − 1
                if C[x] = 0 then
                    remove x from C
                end if
            end for
        end if
    end for

    return keys of C  


</pre>
