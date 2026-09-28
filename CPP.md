# C++ Interview Preparation Guide

> **Murex Technical Interview — Learning Content for C++ Developers**
>
> This guide outlines the knowledge domains and topics you are expected to be familiar with for the C++ developer role at Murex.
> Use it to structure your learning, identify gaps, and assess your readiness before the interview.

---

## Table of Contents

- [Knowledge Domains](#knowledge-domains)
  - [I. Language Basics](#i-language-basics)
  - [II. Data Structures](#ii-data-structures)
  - [III. Object-Oriented Programming](#iii-object-oriented-programming)
  - [IV. Algorithms](#iv-algorithms)
- [Resources](#resources)
  - [I. Online Learning Material](#i-online-learning-material)
  - [II. Sample Exercises](#ii-sample-exercises)

---

## Knowledge Domains

Expand each section to view the full list of topics and sub-topics expected for the interview.

---

### I. Language Basics

Covers the fundamental building blocks of C++: syntax, type system, control flow, memory management, and core language features that distinguish C++ from other languages.

<details>
<summary>📖 Click to expand — Language Basics</summary>
<br>

<table>
 <thead>
  <tr>
   <th>Knowledge Domain</th>
   <th>Topic</th>
   <th>Sub-Topics</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td rowspan="36">I. Language Basics</td>
   <td>1. C++ Evolution</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>2. Compilation</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>3. Running C++ Code</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td rowspan="6">4. Variables</td>
   <td>1. Declaration and Initialization</td>
  </tr>
  <tr><td>2. Memory Location and Lifecycle</td></tr>
  <tr><td>3. Primitive Types</td></tr>
  <tr><td>4. Non-Primitive Types</td></tr>
  <tr><td>5. Casting</td></tr>
  <tr><td>6. Const Variables</td></tr>
  <tr>
   <td rowspan="4">5. Methods</td>
   <td>1. Signature</td>
  </tr>
  <tr><td>2. Static Method</td></tr>
  <tr><td>3. Instance Method</td></tr>
  <tr><td>4. Pass by Value or Pass by Reference</td></tr>
  <tr>
   <td>6. Operator Precedence</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>7. Math Operations</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>8. String Manipulation</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td rowspan="2">9. Conditionals</td>
   <td>1. If Statement</td>
  </tr>
  <tr><td>2. Switch Statement</td></tr>
  <tr>
   <td rowspan="4">10. Loops</td>
   <td>1. For Loop</td>
  </tr>
  <tr><td>2. While Loop</td></tr>
  <tr><td>3. Do-While Loop</td></tr>
  <tr><td>4. Recursion</td></tr>
  <tr>
   <td rowspan="3">11. I/O Streams</td>
   <td>1. Standard Input</td>
  </tr>
  <tr><td>2. Standard Output</td></tr>
  <tr><td>3. Standard Error</td></tr>
  <tr>
   <td>12. Exceptions</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td rowspan="5">13. Multi-Threading (Basic)</td>
   <td>1. Process</td>
  </tr>
  <tr><td>2. Thread</td></tr>
  <tr><td>3. Fork / Join</td></tr>
  <tr><td>4. Mutex</td></tr>
  <tr><td>5. Race Condition</td></tr>
  <tr>
   <td>14. Templates</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>15. Differences between C++ and Java</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>16. STL</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>17. Namespaces</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>18. Smart Pointers</td>
   <td>&nbsp;</td>
  </tr>
 </tbody>
</table>

</details>

---

### II. Data Structures

Covers the standard containers and data structures available through the C++ STL, their underlying properties, trade-offs, and how to manipulate them effectively.

<details>
<summary>📖 Click to expand — Data Structures</summary>
<br>

<table>
 <thead>
  <tr>
   <th>Knowledge Domain</th>
   <th>Topic</th>
   <th>Sub-Topics</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td rowspan="26">II. Data Structures</td>
   <td rowspan="2">1. Array</td>
   <td>1. std::vector</td>
  </tr>
  <tr><td>2. std::array</td></tr>
  <tr>
   <td rowspan="2">2. List</td>
   <td>1. std::list</td>
  </tr>
  <tr><td>2. std::forward_list</td></tr>
  <tr>
   <td rowspan="4">3. Set</td>
   <td>1. std::set</td>
  </tr>
  <tr><td>2. std::unordered_set</td></tr>
  <tr><td>3. std::multiset</td></tr>
  <tr><td>4. std::unordered_multiset</td></tr>
  <tr>
   <td rowspan="4">4. Map</td>
   <td>1. std::map</td>
  </tr>
  <tr><td>2. std::unordered_map</td></tr>
  <tr><td>3. std::multimap</td></tr>
  <tr><td>4. std::unordered_multimap</td></tr>
  <tr>
   <td>5. Stack</td>
   <td>1. std::stack</td>
  </tr>
  <tr>
   <td rowspan="3">6. Queue</td>
   <td>1. std::queue</td>
  </tr>
  <tr><td>2. std::priority_queue</td></tr>
  <tr><td>3. std::deque</td></tr>
  <tr>
   <td rowspan="2">7. Tree</td>
   <td>1. Binary Tree</td>
  </tr>
  <tr><td>2. BST</td></tr>
  <tr>
   <td rowspan="4">8. Graphs</td>
   <td>1. Directed</td>
  </tr>
  <tr><td>2. Undirected</td></tr>
  <tr><td>3. Acyclic Graph</td></tr>
  <tr><td>4. DAG</td></tr>
  <tr>
   <td rowspan="4">9. Manipulating Data Structures</td>
   <td>1. Iterators</td>
  </tr>
  <tr><td>2. Function Objects (&lt;functional&gt;)</td></tr>
  <tr><td>3. Lambda Expressions</td></tr>
  <tr><td>4. STL Algorithms (&lt;algorithm&gt;)</td></tr>
 </tbody>
</table>

</details>

---

### III. Object-Oriented Programming

Covers core OOP concepts as implemented in C++, including memory management, inheritance hierarchies, polymorphism, and design principles.

<details>
<summary>📖 Click to expand — Object-Oriented Programming</summary>
<br>

<table>
 <thead>
  <tr>
   <th>Knowledge Domain</th>
   <th>Topic</th>
   <th>Sub-Topics</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td rowspan="47">III. OOP</td>
   <td rowspan="18">1. Classes and Objects</td>
   <td>1. What are Classes and Objects/Structs?</td>
  </tr>
  <tr><td>2. Instantiation and the Life Cycle of an Object</td></tr>
  <tr><td>3. Declaring and Implementing a Class</td></tr>
  <tr><td>4. Access Modifiers</td></tr>
  <tr><td>5. Data Member</td></tr>
  <tr><td>6. Method</td></tr>
  <tr><td>7. Types of Constructors</td></tr>
  <tr><td>8. Nested Class</td></tr>
  <tr><td>9. Destructors</td></tr>
  <tr><td>10. Accessors</td></tr>
  <tr><td>11. Static Variable</td></tr>
  <tr><td>12. Static Method</td></tr>
  <tr><td>13. Const Variable</td></tr>
  <tr><td>14. Const Method</td></tr>
  <tr><td>15. Friend Keyword</td></tr>
  <tr><td>16. Enum and Enum Classes</td></tr>
  <tr><td>17. Splitting between Header and Source Files</td></tr>
  <tr><td>18. The Rule of Three</td></tr>
  <tr>
   <td rowspan="6">2. Pointers</td>
   <td>1. What are Pointers?</td>
  </tr>
  <tr><td>2. Stack Memory Allocation</td></tr>
  <tr><td>3. Heap Memory Allocation</td></tr>
  <tr><td>4. References vs. Pointers as Method Parameters</td></tr>
  <tr><td>5. Pointer Arithmetic</td></tr>
  <tr><td>6. Smart Pointers</td></tr>
  <tr>
   <td rowspan="5">3. Inheritance</td>
   <td>1. What is Inheritance?</td>
  </tr>
  <tr><td>2. Modes of Inheritance</td></tr>
  <tr><td>3. Types of Inheritance</td></tr>
  <tr><td>4. Advantages of Inheritance</td></tr>
  <tr><td>5. Types of Casting</td></tr>
  <tr>
   <td rowspan="10">4. Polymorphism</td>
   <td>1. What is Polymorphism?</td>
  </tr>
  <tr><td>2. Method Overriding</td></tr>
  <tr><td>3. Virtual Methods and Pure Virtual Methods</td></tr>
  <tr><td>4. Abstract Classes</td></tr>
  <tr><td>5. Abstraction</td></tr>
  <tr><td>6. Method Overloading</td></tr>
  <tr><td>7. Static vs. Dynamic Polymorphism</td></tr>
  <tr><td>8. Virtual Destructors</td></tr>
  <tr><td>9. Virtual Table</td></tr>
  <tr><td>10. The Diamond Problem</td></tr>
  <tr>
   <td rowspan="2">5. Operator Overloading</td>
   <td>1. What is Operator Overloading?</td>
  </tr>
  <tr><td>2. When is it Used?</td></tr>
  <tr>
   <td rowspan="6">6. Further OOP Principles</td>
   <td>1. Composition</td>
  </tr>
  <tr><td>2. Composition vs. Inheritance: Advantages and Disadvantages</td></tr>
  <tr><td>3. Association</td></tr>
  <tr><td>4. Aggregation</td></tr>
  <tr><td>5. Encapsulation</td></tr>
  <tr><td>6. SOLID Principles</td></tr>
 </tbody>
</table>

</details>

---

### IV. Algorithms

Covers algorithmic thinking, complexity analysis, common problem-solving techniques, and standard sorting and searching algorithms.

<details>
<summary>📖 Click to expand — Algorithms</summary>
<br>

<table>
 <thead>
  <tr>
   <th>Knowledge Domain</th>
   <th>Topic</th>
   <th>Sub-Topics</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td rowspan="29">IV. Algorithms</td>
   <td>1. Time Complexity</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td>2. Space Complexity</td>
   <td>&nbsp;</td>
  </tr>
  <tr>
   <td rowspan="12">3. Techniques</td>
   <td>1. Brute Force Algorithms</td>
  </tr>
  <tr><td>2. Greedy Algorithms</td></tr>
  <tr><td>3. Divide and Conquer Algorithms</td></tr>
  <tr><td>4. Two Pointers Technique</td></tr>
  <tr><td>5. Fast and Slow Pointers Technique</td></tr>
  <tr><td>6. Merge Intervals Technique</td></tr>
  <tr><td>7. Sliding Window Technique</td></tr>
  <tr><td>8. Cyclic Sort Technique</td></tr>
  <tr><td>9. Subsets Technique</td></tr>
  <tr><td>10. Topological Sort</td></tr>
  <tr><td>11. Top K Elements Technique</td></tr>
  <tr><td>12. Min Heaps and Max Heaps Technique</td></tr>
  <tr>
   <td rowspan="7">4. Sorting</td>
   <td>1. Selection Sort</td>
  </tr>
  <tr><td>2. Bubble Sort</td></tr>
  <tr><td>3. Insertion Sort</td></tr>
  <tr><td>4. Merge Sort</td></tr>
  <tr><td>5. Quick Sort</td></tr>
  <tr><td>6. Heap Sort</td></tr>
  <tr><td>7. Bucket Sort</td></tr>
  <tr>
   <td rowspan="4">5. Searching</td>
   <td>1. Tree Traversal Algorithms (Pre-order, In-Order, Post-Order)</td>
  </tr>
  <tr><td>2. Graph Traversal Algorithms (BFS, DFS)</td></tr>
  <tr><td>3. Linear Search</td></tr>
  <tr><td>4. Binary Search</td></tr>
  <tr>
   <td rowspan="4">6. Recursion</td>
   <td>1. Iterative vs. Recursive Approach</td>
  </tr>
  <tr><td>2. Memory Utilization of a Recursive Approach</td></tr>
  <tr><td>3. Maintaining Intermediate Results while Using Recursion</td></tr>
  <tr><td>4. Constructing the Recursive Calls and Determining the Base Case</td></tr>
 </tbody>
</table>

</details>

---

## Resources

### I. Online Learning Material

> The resources below are meant to help you start researching the required topics. They are not intended to be a comprehensive or exhaustive source of learning material.

| Resource | Focus Area |
|---|---|
| [LearnCPP](https://www.learncpp.com/) | C++ Language |
| [GeeksforGeeks — C++](https://www.geeksforgeeks.org/c-plus-plus/) | C++ Language |
| [GeeksforGeeks — Data Structures](https://www.geeksforgeeks.org/data-structures/) | Data Structures |
| [GeeksforGeeks — OOP](https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/) | Object-Oriented Programming |
| [GeeksforGeeks — Algorithms](https://www.geeksforgeeks.org/fundamentals-of-algorithms/) | Algorithms |

---

### II. Sample Exercises

> The exercises below are assembled as a sample to help you prepare for the HackerRank test. We recommend starting with this list, then solving additional exercises from similar categories based on your needs.

#### Language Basics

| # | Exercise | Platform |
|---|---|---|
| 1 | [Strong Password](https://www.hackerrank.com/challenges/strong-password/problem?isFullScreen=true) | HackerRank |
| 2 | [Funny String](https://www.hackerrank.com/challenges/funny-string/problem?isFullScreen=true) | HackerRank |
| 3 | [Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/) | LeetCode |

#### Data Structures

| # | Exercise | Platform |
|---|---|---|
| 1 | [Left Rotation](https://www.hackerrank.com/challenges/array-left-rotation/problem?isFullScreen=true) | HackerRank |
| 2 | [Insert A Node At A Specific Position In A LinkedList](https://www.hackerrank.com/challenges/insert-a-node-at-a-specific-position-in-a-linked-list/problem?isFullScreen=true) | HackerRank |
| 3 | [Equal Stacks](https://www.hackerrank.com/challenges/equal-stacks/problem?isFullScreen=true) | HackerRank |
| 4 | [Remove Element](https://leetcode.com/problems/remove-element/) | LeetCode |

#### Object-Oriented Programming — Easy

| # | Exercise | Platform |
|---|---|---|
| 1 | [Rectangle Area](https://www.hackerrank.com/challenges/rectangle-area/problem?isFullScreen=true) | HackerRank |
| 2 | [Multi-Level Inheritance](https://www.hackerrank.com/challenges/multi-level-inheritance-cpp/problem?isFullScreen=true) | HackerRank |

#### Object-Oriented Programming — Medium

| # | Exercise | Platform |
|---|---|---|
| 1 | [Design Twitter](https://leetcode.com/problems/design-twitter/) | LeetCode |
| 2 | [Design Food Rating System](https://leetcode.com/problems/design-a-food-rating-system/) | LeetCode |
| 3 | [Design Movie Rental System](https://leetcode.com/problems/design-movie-rental-system/) | LeetCode |

#### Algorithms — Easy

| # | Exercise | Platform |
|---|---|---|
| 1 | [Picking Numbers](https://www.hackerrank.com/challenges/picking-numbers/problem?isFullScreen=true) | HackerRank |
| 2 | [Birthday Cake Candles](https://www.hackerrank.com/challenges/birthday-cake-candles/problem?isFullScreen=true) | HackerRank |
| 3 | [Palindrome Number](https://leetcode.com/problems/palindrome-number/) | LeetCode |

#### Algorithms — Medium

| # | Exercise | Platform |
|---|---|---|
| 1 | [Balanced Brackets](https://www.hackerrank.com/challenges/balanced-brackets/problem?isFullScreen=true) | HackerRank |
| 2 | [Self Balancing Tree](https://www.hackerrank.com/challenges/self-balancing-tree/problem?isFullScreen=true) | HackerRank |
| 3 | [Group Anagrams](https://leetcode.com/problems/group-anagrams/) | LeetCode |
| 4 | [Find Bottom Left Tree Value](https://leetcode.com/problems/find-bottom-left-tree-value/) | LeetCode |
