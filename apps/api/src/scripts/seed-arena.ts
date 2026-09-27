import path from 'path';
import dotenv from 'dotenv';

// Load root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { loadEnv } from '@repo/config';
import { connectDB, disconnectDB, Problem, Achievement, User, Room, Message } from '@repo/database';
import bcrypt from 'bcrypt';

const PROBLEMS = [
  // ── DSA: Arrays ──
  { problemId: 'NX-DS-001', title: 'Find Maximum Element', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 4, concept: 'Traversal', constraints: '1 ≤ N ≤ 10^5', description: 'Given an array of N integers, find the maximum element.', hints: ['Iterate through the array and keep track of the maximum value'], testCases: [{ input: '5\n10 20 5 40 15', expectedOutput: '40', isHidden: false }, { input: '3\n1 2 3', expectedOutput: '3', isHidden: false }, { input: '4\n-1 -5 -2 -8', expectedOutput: '-1', isHidden: true }] },
  { problemId: 'NX-DS-002', title: 'Reverse an Array', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 4, concept: 'Reversal', constraints: '1 ≤ N ≤ 10^5', description: 'Given an array, reverse it in-place.', hints: ['Use two pointers from start and end'], testCases: [{ input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false }, { input: '3\n10 20 30', expectedOutput: '30 20 10', isHidden: true }] },
  { problemId: 'NX-DS-003', title: 'Two Sum', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 6, concept: 'Hashing', constraints: '2 ≤ N ≤ 10^4', description: 'Given an array and a target sum, find two numbers that add up to the target.', hints: ['Use a hash map to store complement values'], testCases: [{ input: '4 9\n2 7 11 15', expectedOutput: '0 1', isHidden: false }, { input: '3 6\n3 2 4', expectedOutput: '1 2', isHidden: true }] },
  { problemId: 'NX-DS-004', title: 'Find Duplicate Elements', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 6, concept: 'Cycle Detection', constraints: '1 ≤ N ≤ 10^5', description: 'Given an array where each element appears once or twice, return all elements that appear twice.', hints: ['Mark visited elements by negating the value at their index'], testCases: [{ input: '8\n4 3 2 7 8 2 3 1', expectedOutput: '2 3', isHidden: false }] },
  { problemId: 'NX-DS-005', title: 'Kadane\'s Algorithm', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 8, concept: 'Dynamic Programming', constraints: '1 ≤ N ≤ 10^5', description: 'Find the contiguous subarray with the largest sum.', hints: ['Track current sum and maximum sum seen so far'], testCases: [{ input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false }] },
  { problemId: 'NX-DS-006', title: 'Merge Sorted Arrays', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 6, concept: 'Merging', constraints: '0 ≤ M,N ≤ 200', description: 'Merge two sorted arrays into one sorted array.', hints: ['Use two pointers technique'], testCases: [{ input: '3 3\n1 3 5\n2 4 6', expectedOutput: '1 2 3 4 5 6', isHidden: false }] },

  // ── DSA: Linked Lists ──
  { problemId: 'NX-DS-030', title: 'Traverse a Linked List', difficulty: 'EASY', subject: 'Data Structures', topic: 'Linked List', semester: 3, unit: 2, marks: 4, concept: 'Traversal', constraints: '0 ≤ N ≤ 5000', description: 'Given a linked list, print all elements from head to tail.', hints: ['Start from head, follow next pointers'], testCases: [{ input: '1 2 3 4 5', expectedOutput: '1 2 3 4 5', isHidden: false }] },
  { problemId: 'NX-DS-031', title: 'Insert at Beginning', difficulty: 'EASY', subject: 'Data Structures', topic: 'Linked List', semester: 3, unit: 2, marks: 4, concept: 'Insertion', constraints: '0 ≤ N ≤ 5000', description: 'Insert a new node at the beginning of a linked list.', hints: ['Create new node, point its next to current head'], testCases: [{ input: '2 3 4\n1', expectedOutput: '1 2 3 4', isHidden: false }] },
  { problemId: 'NX-DS-034', title: 'Reverse Linked List', difficulty: 'EASY', subject: 'Data Structures', topic: 'Linked List', semester: 3, unit: 2, marks: 6, concept: 'Reversal', constraints: '0 ≤ N ≤ 5000', description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.', hints: ['Use three pointers: prev, current, next', 'Initialize prev as null'], testCases: [{ input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false }, { input: '1 2', expectedOutput: '2 1', isHidden: false }] },
  { problemId: 'NX-DS-035', title: 'Detect Cycle in Linked List', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Linked List', semester: 3, unit: 2, marks: 8, concept: 'Cycle Detection', constraints: '0 ≤ N ≤ 10^4', description: 'Given head, determine if the linked list has a cycle in it.', hints: ['Floyd\'s Tortoise and Hare algorithm'], testCases: [{ input: '3 2 0 -4\npos=1', expectedOutput: 'true', isHidden: false }] },
  { problemId: 'NX-DS-036', title: 'Merge Two Sorted Lists', difficulty: 'EASY', subject: 'Data Structures', topic: 'Linked List', semester: 3, unit: 2, marks: 6, concept: 'Merging', constraints: 'Both lists have 0 to 50 nodes', description: 'Merge two sorted linked lists into one sorted list.', hints: ['Use a dummy head node and compare values'], testCases: [{ input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4', isHidden: false }] },

  // ── DSA: Stack ──
  { problemId: 'NX-DS-050', title: 'Implement Stack using Array', difficulty: 'EASY', subject: 'Data Structures', topic: 'Stack', semester: 3, unit: 3, marks: 6, concept: 'Implementation', constraints: '1 ≤ operations ≤ 10^4', description: 'Implement a stack using an array with push, pop, top, and isEmpty operations.', hints: ['Use a top pointer to track the current position'], testCases: [{ input: 'push 1\npush 2\ntop\npop\ntop', expectedOutput: '2\n2\n1', isHidden: false }] },
  { problemId: 'NX-DS-051', title: 'Valid Parentheses', difficulty: 'EASY', subject: 'Data Structures', topic: 'Stack', semester: 3, unit: 3, marks: 6, concept: 'Matching', constraints: '1 ≤ |s| ≤ 10^4', description: 'Given a string containing only parentheses, determine if the input string is valid.', hints: ['Push opening brackets to stack, pop and compare for closing brackets'], testCases: [{ input: '()[]{}', expectedOutput: 'true', isHidden: false }, { input: '(]', expectedOutput: 'false', isHidden: false }] },
  { problemId: 'NX-DS-052', title: 'Infix to Postfix', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Stack', semester: 3, unit: 3, marks: 8, concept: 'Expression Conversion', constraints: '1 ≤ |expression| ≤ 1000', description: 'Convert an infix expression to postfix notation.', hints: ['Use operator precedence and a stack for operators'], testCases: [{ input: 'a+b*c', expectedOutput: 'abc*+', isHidden: false }] },
  { problemId: 'NX-DS-053', title: 'Evaluate Postfix Expression', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Stack', semester: 3, unit: 3, marks: 8, concept: 'Expression Evaluation', constraints: '1 ≤ |expression| ≤ 1000', description: 'Evaluate a postfix expression and return the result.', hints: ['Push operands to stack, pop two operands for each operator'], testCases: [{ input: '2 3 1 * + 9 -', expectedOutput: '-4', isHidden: false }] },

  // ── DSA: Queue ──
  { problemId: 'NX-DS-060', title: 'Implement Queue using Array', difficulty: 'EASY', subject: 'Data Structures', topic: 'Queue', semester: 3, unit: 3, marks: 6, concept: 'Implementation', constraints: '1 ≤ operations ≤ 10^4', description: 'Implement a queue using an array with enqueue, dequeue, front, and isEmpty operations.', hints: ['Use front and rear pointers'], testCases: [{ input: 'enqueue 1\nenqueue 2\nfront\ndequeue\nfront', expectedOutput: '1\n1\n2', isHidden: false }] },
  { problemId: 'NX-DS-061', title: 'Circular Queue', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Queue', semester: 3, unit: 3, marks: 8, concept: 'Circular Implementation', constraints: '1 ≤ k ≤ 1000', description: 'Design a circular queue with a fixed capacity k.', hints: ['Use modulo operator for wrapping around'], testCases: [{ input: 'k=3\nenqueue 1\nenqueue 2\nenqueue 3\nenqueue 4\ndequeue', expectedOutput: 'true\ntrue\ntrue\nfalse\n1', isHidden: false }] },

  // ── DSA: Trees ──
  { problemId: 'NX-DS-070', title: 'Binary Tree Inorder Traversal', difficulty: 'EASY', subject: 'Data Structures', topic: 'Trees', semester: 3, unit: 4, marks: 6, concept: 'Traversal', constraints: '0 ≤ N ≤ 100', description: 'Given the root of a binary tree, return its inorder traversal.', hints: ['Left → Root → Right'], testCases: [{ input: '1 null 2 3', expectedOutput: '1 3 2', isHidden: false }] },
  { problemId: 'NX-DS-071', title: 'Maximum Depth of Binary Tree', difficulty: 'EASY', subject: 'Data Structures', topic: 'Trees', semester: 3, unit: 4, marks: 6, concept: 'Recursion', constraints: '0 ≤ N ≤ 10^4', description: 'Find the maximum depth (height) of a binary tree.', hints: ['Recursively find the depth of left and right subtrees'], testCases: [{ input: '3 9 20 null null 15 7', expectedOutput: '3', isHidden: false }] },
  { problemId: 'NX-DS-072', title: 'Binary Search Tree Validation', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Trees', semester: 3, unit: 4, marks: 8, concept: 'BST Property', constraints: '1 ≤ N ≤ 10^4', description: 'Determine if a given binary tree is a valid BST.', hints: ['Use inorder traversal — result should be sorted', 'Or pass min/max bounds recursively'], testCases: [{ input: '2 1 3', expectedOutput: 'true', isHidden: false }, { input: '5 1 4 null null 3 6', expectedOutput: 'false', isHidden: false }] },

  // ── DSA: Graphs ──
  { problemId: 'NX-DS-080', title: 'BFS Traversal', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Graphs', semester: 3, unit: 5, marks: 8, concept: 'BFS', constraints: '1 ≤ V ≤ 1000', description: 'Perform BFS traversal of a graph starting from vertex 0.', hints: ['Use a queue and visited array'], testCases: [{ input: '5 4\n0 1\n0 2\n1 3\n2 4', expectedOutput: '0 1 2 3 4', isHidden: false }] },
  { problemId: 'NX-DS-081', title: 'DFS Traversal', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Graphs', semester: 3, unit: 5, marks: 8, concept: 'DFS', constraints: '1 ≤ V ≤ 1000', description: 'Perform DFS traversal of a graph starting from vertex 0.', hints: ['Use recursion or a stack'], testCases: [{ input: '5 4\n0 1\n0 2\n1 3\n2 4', expectedOutput: '0 1 3 2 4', isHidden: false }] },
  { problemId: 'NX-DS-082', title: 'Detect Cycle in Undirected Graph', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Graphs', semester: 3, unit: 5, marks: 10, concept: 'Cycle Detection', constraints: '1 ≤ V ≤ 1000', description: 'Check if an undirected graph contains a cycle.', hints: ['Use DFS with parent tracking'], testCases: [{ input: '4 4\n0 1\n1 2\n2 3\n3 0', expectedOutput: 'true', isHidden: false }] },

  // ── DBMS: SQL ──
  { problemId: 'NX-DB-001', title: 'Select All Records', difficulty: 'EASY', subject: 'DBMS', topic: 'SQL', semester: 3, unit: 1, marks: 4, concept: 'SELECT', constraints: 'Standard SQL', description: 'Write a SQL query to select all columns from the "students" table.', hints: ['Use SELECT * FROM'], testCases: [{ input: 'students table with 5 rows', expectedOutput: 'SELECT * FROM students;', isHidden: false }] },
  { problemId: 'NX-DB-002', title: 'Filter with WHERE', difficulty: 'EASY', subject: 'DBMS', topic: 'SQL', semester: 3, unit: 1, marks: 4, concept: 'WHERE clause', constraints: 'Standard SQL', description: 'Write a SQL query to select students with marks > 80.', hints: ['Use WHERE clause with comparison'], testCases: [{ input: 'students table', expectedOutput: 'SELECT * FROM students WHERE marks > 80;', isHidden: false }] },
  { problemId: 'NX-DB-003', title: 'GROUP BY with COUNT', difficulty: 'MEDIUM', subject: 'DBMS', topic: 'SQL', semester: 3, unit: 1, marks: 6, concept: 'Aggregation', constraints: 'Standard SQL', description: 'Write a query to count students per department.', hints: ['Use GROUP BY with COUNT()'], testCases: [{ input: 'students table with dept column', expectedOutput: 'SELECT dept, COUNT(*) FROM students GROUP BY dept;', isHidden: false }] },
  { problemId: 'NX-DB-004', title: 'JOIN Two Tables', difficulty: 'MEDIUM', subject: 'DBMS', topic: 'SQL', semester: 3, unit: 2, marks: 8, concept: 'JOIN', constraints: 'Standard SQL', description: 'Write a query to join students and departments tables to show student name with department name.', hints: ['Use INNER JOIN on department_id'], testCases: [{ input: 'students, departments tables', expectedOutput: 'SELECT s.name, d.name FROM students s INNER JOIN departments d ON s.dept_id = d.id;', isHidden: false }] },

  // ── DBMS: Normalization ──
  { problemId: 'NX-DB-010', title: 'Identify 1NF Violations', difficulty: 'EASY', subject: 'DBMS', topic: 'Normalization', semester: 3, unit: 2, marks: 6, concept: '1NF', constraints: 'Conceptual', description: 'Given a table schema, identify if it violates 1NF and explain why.', hints: ['Check for atomic values and repeating groups'], testCases: [{ input: 'Student(id, name, phone_numbers)', expectedOutput: 'Violates 1NF: phone_numbers contains multiple values', isHidden: false }] },
  { problemId: 'NX-DB-011', title: 'Convert to 3NF', difficulty: 'HARD', subject: 'DBMS', topic: 'Normalization', semester: 3, unit: 2, marks: 10, concept: '3NF', constraints: 'Conceptual', description: 'Given a relation with functional dependencies, decompose it into 3NF.', hints: ['Find candidate keys first', 'Check for transitive dependencies'], testCases: [{ input: 'R(A,B,C,D) FDs: A→B, B→C, A→D', expectedOutput: 'R1(A,B,D) R2(B,C)', isHidden: false }] },

  // ── DBMS: Transactions ──
  { problemId: 'NX-DB-020', title: 'ACID Properties', difficulty: 'EASY', subject: 'DBMS', topic: 'Transactions', semester: 3, unit: 3, marks: 6, concept: 'ACID', constraints: 'Conceptual', description: 'Explain each ACID property with an example of a bank transfer transaction.', hints: ['Atomicity, Consistency, Isolation, Durability'], testCases: [{ input: 'Bank transfer: A sends 100 to B', expectedOutput: 'Atomicity: Both debit and credit succeed or fail together', isHidden: false }] },

  // ── Java: OOP ──
  { problemId: 'NX-JV-001', title: 'Create a Class', difficulty: 'EASY', subject: 'Java', topic: 'OOP', semester: 3, unit: 1, marks: 4, concept: 'Class Definition', constraints: 'Java 17+', description: 'Create a Java class Student with name, rollNo, marks fields and a display() method.', hints: ['Define private fields with public getters'], testCases: [{ input: 'Student s = new Student("Jash", 101, 95);', expectedOutput: 'Name: Jash, Roll: 101, Marks: 95', isHidden: false }] },
  { problemId: 'NX-JV-002', title: 'Inheritance Demo', difficulty: 'EASY', subject: 'Java', topic: 'Inheritance', semester: 3, unit: 2, marks: 6, concept: 'Inheritance', constraints: 'Java 17+', description: 'Create a base class Shape and derived classes Circle and Rectangle. Implement area() for each.', hints: ['Use abstract class or interface'], testCases: [{ input: 'Circle r=5\nRectangle l=4 w=6', expectedOutput: '78.54\n24.0', isHidden: false }] },
  { problemId: 'NX-JV-003', title: 'Exception Handling', difficulty: 'MEDIUM', subject: 'Java', topic: 'Exception Handling', semester: 3, unit: 3, marks: 6, concept: 'Try-Catch', constraints: 'Java 17+', description: 'Write a program that handles ArrayIndexOutOfBoundsException and ArithmeticException.', hints: ['Use multiple catch blocks or multi-catch'], testCases: [{ input: 'divide 10 by 0', expectedOutput: 'ArithmeticException caught: / by zero', isHidden: false }] },
  { problemId: 'NX-JV-004', title: 'Collections - ArrayList', difficulty: 'MEDIUM', subject: 'Java', topic: 'Collections', semester: 3, unit: 4, marks: 8, concept: 'ArrayList Operations', constraints: 'Java 17+', description: 'Implement a program using ArrayList to add, remove, search, and sort student names.', hints: ['Use Collections.sort() for sorting'], testCases: [{ input: 'add Jash\nadd Harsh\nadd Dhamik\nsort\nremove Harsh', expectedOutput: 'Dhamik Harsh Jash\nDhamik Jash', isHidden: false }] },

  // ── Web Development ──
  { problemId: 'NX-WD-001', title: 'HTTP Status Codes', difficulty: 'EASY', subject: 'Web Development', topic: 'HTTP', semester: 3, unit: 1, marks: 4, concept: 'Status Codes', constraints: 'Conceptual', description: 'Match HTTP status codes to their meanings: 200, 301, 404, 500.', hints: ['2xx = Success, 3xx = Redirect, 4xx = Client Error, 5xx = Server Error'], testCases: [{ input: '200', expectedOutput: 'OK', isHidden: false }] },
  { problemId: 'NX-WD-002', title: 'Build a REST API', difficulty: 'MEDIUM', subject: 'Web Development', topic: 'REST', semester: 3, unit: 2, marks: 8, concept: 'CRUD Operations', constraints: 'Node.js + Express', description: 'Design a RESTful API for a todo application with GET, POST, PUT, DELETE endpoints.', hints: ['Use appropriate HTTP methods and status codes'], testCases: [{ input: 'POST /todos { title: "Study DSA" }', expectedOutput: '201 Created', isHidden: false }] },
  { problemId: 'NX-WD-003', title: 'JWT Authentication', difficulty: 'HARD', subject: 'Web Development', topic: 'Authentication', semester: 3, unit: 3, marks: 10, concept: 'JWT', constraints: 'Node.js', description: 'Implement JWT-based authentication with login, protected routes, and token refresh.', hints: ['Use jsonwebtoken package', 'Store refresh tokens securely'], testCases: [{ input: 'POST /login { email, password }', expectedOutput: '{ accessToken, refreshToken }', isHidden: false }] },

  // ── More DSA problems to hit 50+ ──
  { problemId: 'NX-DS-007', title: 'Rotate Array', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 6, concept: 'Rotation', constraints: '1 ≤ N ≤ 10^5', description: 'Rotate an array to the right by K steps.', hints: ['Use reversal technique: reverse all, reverse first K, reverse rest'], testCases: [{ input: '7 3\n1 2 3 4 5 6 7', expectedOutput: '5 6 7 1 2 3 4', isHidden: false }] },
  { problemId: 'NX-DS-008', title: 'Best Time to Buy Stock', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 6, concept: 'Greedy', constraints: '1 ≤ N ≤ 10^5', description: 'Given stock prices over N days, find the maximum profit from one buy and one sell.', hints: ['Track minimum price seen so far'], testCases: [{ input: '6\n7 1 5 3 6 4', expectedOutput: '5', isHidden: false }] },
  { problemId: 'NX-DS-009', title: 'Move Zeroes', difficulty: 'EASY', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 4, concept: 'Two Pointers', constraints: '1 ≤ N ≤ 10^4', description: 'Move all zeroes to the end of array while maintaining relative order.', hints: ['Use a write pointer for non-zero elements'], testCases: [{ input: '5\n0 1 0 3 12', expectedOutput: '1 3 12 0 0', isHidden: false }] },
  { problemId: 'NX-DS-010', title: 'Sort Array of 0s, 1s, 2s', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Arrays', semester: 3, unit: 1, marks: 6, concept: 'Dutch National Flag', constraints: '1 ≤ N ≤ 10^5', description: 'Sort an array containing only 0s, 1s and 2s in single pass.', hints: ['Use three pointers: low, mid, high'], testCases: [{ input: '6\n2 0 2 1 1 0', expectedOutput: '0 0 1 1 2 2', isHidden: false }] },
  { problemId: 'NX-DS-073', title: 'Level Order Traversal', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Trees', semester: 3, unit: 4, marks: 6, concept: 'BFS', constraints: '0 ≤ N ≤ 2000', description: 'Return the level order traversal of a binary tree (values grouped by level).', hints: ['Use a queue, process level by level'], testCases: [{ input: '3 9 20 null null 15 7', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false }] },
  { problemId: 'NX-DS-074', title: 'Lowest Common Ancestor', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Trees', semester: 3, unit: 4, marks: 8, concept: 'LCA', constraints: '2 ≤ N ≤ 10^5', description: 'Find the lowest common ancestor of two given nodes in a binary tree.', hints: ['If both nodes are in left subtree, recurse left; if both in right, recurse right; otherwise current node is LCA'], testCases: [{ input: '3 5 1 6 2 0 8\np=5 q=1', expectedOutput: '3', isHidden: false }] },
  { problemId: 'NX-DS-037', title: 'Remove Nth Node From End', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Linked List', semester: 3, unit: 2, marks: 6, concept: 'Two Pointers', constraints: '1 ≤ N ≤ 30', description: 'Remove the nth node from the end of a linked list.', hints: ['Use two pointers with N gap between them'], testCases: [{ input: '1 2 3 4 5\nn=2', expectedOutput: '1 2 3 5', isHidden: false }] },
  { problemId: 'NX-DS-054', title: 'Min Stack', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Stack', semester: 3, unit: 3, marks: 8, concept: 'Design', constraints: 'All operations O(1)', description: 'Design a stack that supports push, pop, top, and getMin in O(1) time.', hints: ['Use an auxiliary stack to track minimums'], testCases: [{ input: 'push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', expectedOutput: '-3\n0\n-2', isHidden: false }] },
  { problemId: 'NX-DS-083', title: 'Shortest Path (BFS)', difficulty: 'MEDIUM', subject: 'Data Structures', topic: 'Graphs', semester: 3, unit: 5, marks: 10, concept: 'BFS Shortest Path', constraints: '1 ≤ V ≤ 1000', description: 'Find the shortest path between two vertices in an unweighted graph.', hints: ['BFS gives shortest path in unweighted graphs'], testCases: [{ input: '6 7\n0 1\n0 2\n1 3\n2 3\n3 4\n4 5\nsrc=0 dest=5', expectedOutput: '4', isHidden: false }] },
  { problemId: 'NX-DS-084', title: 'Topological Sort', difficulty: 'HARD', subject: 'Data Structures', topic: 'Graphs', semester: 3, unit: 5, marks: 10, concept: 'Topological Ordering', constraints: '1 ≤ V ≤ 1000', description: 'Find a topological ordering of a directed acyclic graph.', hints: ['Use DFS with finish time or Kahn\'s algorithm with in-degree'], testCases: [{ input: '6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1', expectedOutput: '5 4 2 3 1 0', isHidden: false }] },
];

const ACHIEVEMENTS = [
  { achievementId: 'ACH-001', name: 'First Blood', description: 'Solve your first problem', icon: '🎯', category: 'MILESTONE', criteria: { type: 'PROBLEMS_SOLVED', value: 1 }, xpReward: 50, rarity: 'COMMON' },
  { achievementId: 'ACH-002', name: 'Problem Crusher', description: 'Solve 10 problems', icon: '💪', category: 'PRACTICE', criteria: { type: 'PROBLEMS_SOLVED', value: 10 }, xpReward: 200, rarity: 'COMMON' },
  { achievementId: 'ACH-003', name: 'Century', description: 'Solve 100 problems', icon: '💯', category: 'PRACTICE', criteria: { type: 'PROBLEMS_SOLVED', value: 100 }, xpReward: 1000, rarity: 'EPIC' },
  { achievementId: 'ACH-004', name: 'Speed Coder', description: 'Solve a Medium problem in under 5 minutes', icon: '⚡', category: 'PRACTICE', criteria: { type: 'FAST_SOLVE', value: 300 }, xpReward: 150, rarity: 'RARE' },
  { achievementId: 'ACH-005', name: 'Clash Victor', description: 'Win your first Code Clash', icon: '⚔️', category: 'CLASH', criteria: { type: 'CLASHES_WON', value: 1 }, xpReward: 100, rarity: 'COMMON' },
  { achievementId: 'ACH-006', name: 'Undefeated', description: 'Win 5 Code Clashes in a row', icon: '🔥', category: 'CLASH', criteria: { type: 'WIN_STREAK', value: 5 }, xpReward: 500, rarity: 'EPIC' },
  { achievementId: 'ACH-007', name: 'Champion', description: 'Win 50 Code Clashes', icon: '🏆', category: 'CLASH', criteria: { type: 'CLASHES_WON', value: 50 }, xpReward: 2000, rarity: 'LEGENDARY' },
  { achievementId: 'ACH-008', name: 'Streak Starter', description: 'Maintain a 3-day streak', icon: '🔥', category: 'STREAK', criteria: { type: 'STREAK_DAYS', value: 3 }, xpReward: 75, rarity: 'COMMON' },
  { achievementId: 'ACH-009', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🗓️', category: 'STREAK', criteria: { type: 'STREAK_DAYS', value: 7 }, xpReward: 200, rarity: 'RARE' },
  { achievementId: 'ACH-010', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑', category: 'STREAK', criteria: { type: 'STREAK_DAYS', value: 30 }, xpReward: 1000, rarity: 'LEGENDARY' },
  { achievementId: 'ACH-011', name: 'Social Butterfly', description: 'Join 5 rooms', icon: '🦋', category: 'SOCIAL', criteria: { type: 'ROOMS_JOINED', value: 5 }, xpReward: 100, rarity: 'COMMON' },
  { achievementId: 'ACH-012', name: 'All Rounder', description: 'Solve problems in 4 different subjects', icon: '🌐', category: 'MILESTONE', criteria: { type: 'SUBJECTS_COVERED', value: 4 }, xpReward: 300, rarity: 'RARE' },
];

async function seed() {
  const env = loadEnv();
  await connectDB(env.MONGODB_URI);
  console.log('🌱 Seeding Nexus Arena & Database...\n');

  // Seed Default Users
  console.log('👤 Seeding default users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const usersToSeed = [
    {
      email: 'jash@sbmp.edu.in',
      passwordHash,
      firstName: 'Jash',
      lastName: 'Chothani',
      role: 'STUDENT',
      authProvider: 'LOCAL',
      isEmailVerified: true,
      gamification: { xp: 3500, streak: 12, longestStreak: 14, rating: 1420, problemsSolved: 48, rank: 'DIAMOND', badges: ['ARRAY_MASTER', 'CODE_CLASH_HERO'] },
    },
    {
      email: 'admin@sbmp.edu.in',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      authProvider: 'LOCAL',
      isEmailVerified: true,
      gamification: { xp: 10000, streak: 30, longestStreak: 30, rating: 2200, problemsSolved: 150, rank: 'GRANDMASTER', badges: ['ADMINISTRATOR'] },
    },
    {
      email: 'aarav@sbmp.edu.in',
      passwordHash,
      firstName: 'Aarav',
      lastName: 'Mehta',
      role: 'STUDENT',
      authProvider: 'LOCAL',
      isEmailVerified: true,
      gamification: { xp: 2800, streak: 8, longestStreak: 10, rating: 1350, problemsSolved: 35, rank: 'GOLD', badges: ['DSA_STAR'] },
    },
    {
      email: 'priya@sbmp.edu.in',
      passwordHash,
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'STUDENT',
      authProvider: 'LOCAL',
      isEmailVerified: true,
      gamification: { xp: 4100, streak: 15, longestStreak: 18, rating: 1580, problemsSolved: 62, rank: 'GRANDMASTER', badges: ['TOP_CODER'] },
    },
  ];

  for (const u of usersToSeed) {
    await User.findOneAndUpdate(
      { email: u.email },
      u,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Users seeded: jash@sbmp.edu.in (password123), admin@sbmp.edu.in (admin123)\n`);

  // Seed Problems
  console.log(`📝 Seeding ${PROBLEMS.length} problems...`);
  for (const problem of PROBLEMS) {
    await Problem.findOneAndUpdate(
      { problemId: problem.problemId },
      problem,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ ${PROBLEMS.length} problems seeded.\n`);

  // Seed Achievements
  console.log(`🏅 Seeding ${ACHIEVEMENTS.length} achievements...`);
  for (const achievement of ACHIEVEMENTS) {
    await Achievement.findOneAndUpdate(
      { achievementId: achievement.achievementId },
      achievement,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ ${ACHIEVEMENTS.length} achievements seeded.\n`);

  // Seed Arena Rooms
  console.log('🏛️ Seeding Arena Study Rooms...');
  const jashUser = await User.findOne({ email: 'jash@sbmp.edu.in' });
  if (jashUser) {
    const room1 = await Room.findOneAndUpdate(
      { name: 'Sem 3 — DSA Array & Linked List Sprint' },
      {
        name: 'Sem 3 — DSA Array & Linked List Sprint',
        description: 'Collaborative study room for Data Structures & Algorithms lab assignments',
        type: 'CODING',
        hostId: jashUser._id,
        privacy: 'PUBLIC',
        status: 'ACTIVE',
        maxParticipants: 10,
      },
      { upsert: true, new: true }
    );

    const room2 = await Room.findOneAndUpdate(
      { name: 'Sem 3 — OOP C++ Inheritance Lab' },
      {
        name: 'Sem 3 — OOP C++ Inheritance Lab',
        description: 'C++ Object Oriented Programming practice & solution discussions',
        type: 'STUDY',
        hostId: jashUser._id,
        privacy: 'PUBLIC',
        status: 'ACTIVE',
        maxParticipants: 8,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Arena Rooms seeded.\n`);

    // Seed Room Chat Messages
    console.log('💬 Seeding Chat Messages...');
    await Message.create([
      { conversationId: room1._id, senderId: jashUser._id, content: 'Hey team! Let\'s solve the array max problem first.', type: 'TEXT' },
      { conversationId: room1._id, senderId: jashUser._id, content: 'I implemented two pointers logic. Checks passed!', type: 'TEXT' },
      { conversationId: room1._id, senderId: jashUser._id, content: 'Awesome! Testing the edge cases with negative values now.', type: 'TEXT' },
    ]);
    console.log(`✅ Chat messages seeded.\n`);
  }

  console.log('🎉 Nexus Arena & Database seeded successfully!');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
