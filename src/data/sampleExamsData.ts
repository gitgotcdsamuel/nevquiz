// data/sampleExamsData.ts

export interface ExamQuestion {
  id: number;
  type: 'mcq' | 'boolean' | 'short' | 'explain';
  question: string;
  options?: string[];               // required for mcq & boolean
  correctAnswer: string;            // "A", "B", "C", "D" or "True"/"False" or free text
  explanation: string;
  keywords?: string[];              // used for 'explain' auto-scoring
  sampleAnswer?: string;            // model answer / guidance
  points?: number;
}

export interface Exam {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  duration: number;                 // minutes
  totalMarks: number;
  passingMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  questions: ExamQuestion[];
}

export const sampleExams: Record<string, Exam> = {
  'exam1': {
    id: 'exam1',
    title: 'Data Structures & Algorithms – Midterm',
    courseCode: 'CSC301',
    courseName: 'Advanced Data Structures',
    duration: 120,
    totalMarks: 100,
    passingMarks: 50,
    difficulty: 'Hard',
    instructions: [
      'This exam contains 12 questions worth 100 marks total.',
      'You have 120 minutes to complete the exam.',
      'Remain in full-screen mode during the entire exam.',
      'Tab switching, copy/paste and screenshots are monitored.',
      'Answers are auto-saved periodically.',
      'The exam will auto-submit when time expires.'
    ],
    questions: [
      // MCQ
      {
        id: 1,
        type: 'mcq',
        points: 8,
        question: 'What is the average-case time complexity of searching in a balanced binary search tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 'B',
        explanation: 'Balanced BSTs maintain O(log n) height → search is O(log n) on average and worst case.'
      },
      {
        id: 2,
        type: 'mcq',
        points: 8,
        question: 'Which data structure follows the LIFO (Last In, First Out) principle?',
        options: ['Queue', 'Stack', 'Priority Queue', 'Deque'],
        correctAnswer: 'B',
        explanation: 'Stack is LIFO – the most recently added element is removed first (e.g. browser back button).'
      },
      {
        id: 3,
        type: 'mcq',
        points: 8,
        question: 'In the worst case, what is the time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 'C',
        explanation: 'Worst case occurs with already sorted input and poor pivot choice → O(n²).'
      },

      // Boolean (True/False)
      {
        id: 4,
        type: 'boolean',
        points: 5,
        question: 'A hash table with perfect hashing guarantees O(1) worst-case lookup time.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Perfect hashing eliminates collisions → true O(1) worst-case lookup (though rare in practice).'
      },
      {
        id: 5,
        type: 'boolean',
        points: 5,
        question: 'Every binary tree is also a binary search tree.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Binary tree = each node ≤ 2 children. BST adds ordering constraint (left < node < right).'
      },

      // Short answer
      {
        id: 6,
        type: 'short',
        points: 8,
        question: 'Name the tree traversal that visits nodes in sorted order (for a BST).',
        correctAnswer: 'inorder',
        explanation: 'In-order traversal on BST produces nodes in ascending order.'
      },
      {
        id: 7,
        type: 'short',
        points: 8,
        question: 'Which abstract data type is typically used to implement Dijkstra’s algorithm’s priority queue?',
        correctAnswer: 'priority queue',
        explanation: 'Priority queue (min-heap) efficiently gives the next closest unvisited node.'
      },

      // Explain / open-ended with keyword scoring
      {
        id: 8,
        type: 'explain',
        points: 10,
        question: 'Explain the difference between Depth-First Search (DFS) and Breadth-First Search (BFS). Include one advantage of each.',
        keywords: ['stack', 'queue', 'recursive', 'level order', 'shortest path', 'memory usage', 'topological sort', 'maze'],
        sampleAnswer: 'DFS uses a stack (or recursion) and explores as deep as possible before backtracking. Advantage: uses less memory, good for topological sort. BFS uses a queue and explores level by level. Advantage: finds shortest path in unweighted graphs.',
        explanation: 'Good answers mention data structures used and at least one clear advantage for each method.'
      },
      {
        id: 9,
        type: 'explain',
        points: 10,
        question: 'What is a hash collision? Describe two common methods to resolve it.',
        keywords: ['same hash', 'collision', 'chaining', 'linked list', 'open addressing', 'linear probing', 'double hashing', 'bucket'],
        sampleAnswer: 'A hash collision occurs when two different keys produce the same hash value. Resolution methods: 1) Chaining – store multiple items in a linked list at the same index. 2) Open addressing – probe for the next available slot (linear probing, quadratic probing, double hashing).',
        explanation: 'Strong answers name collision and clearly describe at least two resolution techniques.'
      },
      {
        id: 10,
        type: 'explain',
        points: 10,
        question: 'Explain what dynamic programming is and illustrate the concept using the Fibonacci sequence.',
        keywords: ['subproblems', 'optimal substructure', 'overlapping', 'memoization', 'tabulation', 'bottom-up', 'top-down', 'fibonacci'],
        sampleAnswer: 'Dynamic programming solves problems by breaking them into overlapping subproblems with optimal substructure, storing results to avoid recomputation. Fibonacci example: fib(n) = fib(n-1) + fib(n-2). Naive recursion recomputes values many times → memoization or bottom-up table avoids this.',
        explanation: 'Best answers define DP properties and show overlapping subproblems with Fibonacci.'
      },
      {
        id: 11,
        type: 'explain',
        points: 10,
        question: 'Describe the difference between a stack and a queue. Give one real-world example for each.',
        keywords: ['LIFO', 'FIFO', 'push', 'pop', 'enqueue', 'dequeue', 'undo', 'printer', 'browser history', 'task scheduling'],
        sampleAnswer: 'Stack is LIFO (Last In First Out) – push/pop at same end. Example: browser back button (undo). Queue is FIFO (First In First Out) – enqueue at rear, dequeue from front. Example: printer queue or customer service line.',
        explanation: 'Good answers clearly state LIFO vs FIFO and give realistic everyday examples.'
      },
      {
        id: 12,
        type: 'explain',
        points: 10,
        question: 'What is a binary heap? Explain why it is commonly used to implement priority queues.',
        keywords: ['complete tree', 'heap property', 'min-heap', 'max-heap', 'priority queue', 'log n', 'extract-min', 'insert'],
        sampleAnswer: 'A binary heap is a complete binary tree satisfying the heap property (parent ≥/≤ children). Min-heap → smallest element at root. It supports O(log n) insert and extract-min/max, making it efficient for priority queues (used in Dijkstra, A*, scheduling).',
        explanation: 'Excellent answers mention completeness, heap property and O(log n) operations.'
      }
    ]
  },

  'exam2': {
    id: 'exam2',
    title: 'Calculus II - Mid Term',
    courseCode: 'MATH102',
    courseName: 'Calculus II',
    duration: 90,
    totalMarks: 75,
    passingMarks: 30,
    difficulty: 'Medium',
    instructions: [
      'This exam contains 10 questions worth 75 marks total',
      'You have 90 minutes to complete the exam',
      'Show your work for partial credit',
      'No calculators allowed',
      'You may use scratch paper provided',
      'All answers must be in simplified form'
    ],
    questions: [
      // MCQ
      {
        id: 1,
        type: 'mcq',
        points: 8,
        question: 'What is the integral of ∫(3x² + 2x) dx?',
        options: ['x³ + x² + C', 'x³ + x²', '3x³ + 2x² + C', '6x + 2 + C'],
        correctAnswer: 'A',
        explanation: '∫3x² dx = x³, ∫2x dx = x², so the answer is x³ + x² + C'
      },
      {
        id: 2,
        type: 'mcq',
        points: 8,
        question: 'What is the derivative of f(x) = ln(x² + 1)?',
        options: ['1/(x² + 1)', '2x/(x² + 1)', '2x ln(x² + 1)', '2x'],
        correctAnswer: 'B',
        explanation: 'Using chain rule: d/dx[ln(u)] = (1/u) * du/dx, where u = x² + 1, du/dx = 2x'
      },

      // Boolean (True/False)
      {
        id: 3,
        type: 'boolean',
        points: 5,
        question: 'The definite integral ∫₀¹ x² dx equals 1/3.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: '∫₀¹ x² dx = [x³/3]₀¹ = 1/3 - 0 = 1/3'
      },
      {
        id: 4,
        type: 'boolean',
        points: 5,
        question: 'The series ∑(1/n²) converges.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'This is a p-series with p=2 > 1, so it converges to π²/6.'
      },

      // Short Answer
      {
        id: 5,
        type: 'short',
        points: 10,
        question: 'What is the limit of (sin x)/x as x approaches 0?',
        correctAnswer: '1',
        explanation: 'This is a fundamental limit in calculus, equal to 1.'
      },
      {
        id: 6,
        type: 'short',
        points: 10,
        question: 'Find the derivative of f(x) = e^(3x)',
        correctAnswer: '3e^(3x)',
        explanation: 'Using chain rule: d/dx[e^(3x)] = e^(3x) * d/dx[3x] = 3e^(3x)'
      },
      {
        id: 7,
        type: 'short',
        points: 10,
        question: 'Evaluate: ∫(2x + 1) dx from 0 to 2',
        correctAnswer: '6',
        explanation: '∫(2x + 1) dx = x² + x, evaluate from 0 to 2: (4 + 2) - (0 + 0) = 6'
      },

      // Explanation
      {
        id: 8,
        type: 'explain',
        points: 7,
        question: 'Explain the Fundamental Theorem of Calculus and why it is important.',
        keywords: ['antiderivative', 'derivative', 'integral', 'accumulation', 'rate', 'area', 'connection', 'inverse'],
        sampleAnswer: 'The Fundamental Theorem of Calculus connects differentiation and integration, showing they are inverse operations. It states that if F is the antiderivative of f, then ∫f(x)dx = F(b) - F(a).',
        explanation: 'Your answer should explain both parts of the theorem and its significance.'
      },
      {
        id: 9,
        type: 'explain',
        points: 6,
        question: 'What is L\'Hôpital\'s rule and when can you apply it?',
        keywords: ['0/0', '∞/∞', 'limit', 'derivative', 'indeterminate', 'numerator', 'denominator', 'form'],
        sampleAnswer: 'L\'Hôpital\'s rule states that for limits of the form 0/0 or ∞/∞, the limit of f(x)/g(x) equals the limit of f\'(x)/g\'(x), provided this limit exists.',
        explanation: 'Your answer should state the rule and the conditions for its application.'
      },
      {
        id: 10,
        type: 'explain',
        points: 6,
        question: 'Explain the concept of a Riemann sum and its connection to definite integrals.',
        keywords: ['rectangle', 'partition', 'limit', 'area', 'approximation', 'sum', 'width', 'height'],
        sampleAnswer: 'A Riemann sum approximates the area under a curve by dividing it into rectangles and summing their areas. As the number of rectangles approaches infinity, the Riemann sum approaches the definite integral.',
        explanation: 'Your answer should describe the approximation method and the limiting process.'
      }
    ]
  },

  'exam3': {
    id: 'exam3',
    title: 'Physics Lab Assessment',
    courseCode: 'PHY201',
    courseName: 'Physics Mechanics',
    duration: 60,
    totalMarks: 50,
    passingMarks: 20,
    difficulty: 'Medium',
    instructions: [
      'This assessment contains 10 questions worth 50 marks total',
      'You have 60 minutes to complete the exam',
      'Use g = 9.8 m/s² where needed',
      'Show all calculations for numerical problems',
      'Include units in your answers'
    ],
    questions: [
      // MCQ
      {
        id: 1,
        type: 'mcq',
        points: 5,
        question: 'What is the SI unit of force?',
        options: ['Joule', 'Newton', 'Watt', 'Pascal'],
        correctAnswer: 'B',
        explanation: 'The Newton (N) is the SI unit of force, defined as kg·m/s².'
      },
      {
        id: 2,
        type: 'mcq',
        points: 5,
        question: 'Which law states that for every action there is an equal and opposite reaction?',
        options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Conservation of Energy'],
        correctAnswer: 'C',
        explanation: 'Newton\'s Third Law describes action-reaction pairs.'
      },

      // Boolean
      {
        id: 3,
        type: 'boolean',
        points: 3,
        question: 'Velocity is a scalar quantity.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Velocity is a vector quantity as it has both magnitude and direction.'
      },
      {
        id: 4,
        type: 'boolean',
        points: 3,
        question: 'Work done can be negative.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Work is negative when force opposes displacement.'
      },

      // Short Answer
      {
        id: 5,
        type: 'short',
        points: 6,
        question: 'A car accelerates from rest at 2 m/s² for 5 seconds. What is its final velocity?',
        correctAnswer: '10 m/s',
        explanation: 'v = u + at = 0 + 2×5 = 10 m/s'
      },
      {
        id: 6,
        type: 'short',
        points: 6,
        question: 'What is the kinetic energy of a 2 kg object moving at 3 m/s?',
        correctAnswer: '9 J',
        explanation: 'KE = ½mv² = ½ × 2 × 3² = 9 Joules'
      },
      {
        id: 7,
        type: 'short',
        points: 6,
        question: 'Calculate the work done when a 10 N force moves an object 5 m in the direction of the force.',
        correctAnswer: '50 J',
        explanation: 'W = F × d × cosθ = 10 × 5 × 1 = 50 Joules'
      },

      // Explanation
      {
        id: 8,
        type: 'explain',
        points: 6,
        question: 'Explain the difference between elastic and inelastic collisions. Provide an example of each.',
        keywords: ['momentum', 'kinetic energy', 'conserved', 'lost', 'heat', 'deformation', 'bounce'],
        sampleAnswer: 'In elastic collisions, both momentum and kinetic energy are conserved (like billiard balls). In inelastic collisions, momentum is conserved but kinetic energy is lost to heat/deformation (like a car crash).',
        explanation: 'Your answer should explain the conservation laws and give relevant examples.'
      },
      {
        id: 9,
        type: 'explain',
        points: 5,
        question: 'What is the principle of conservation of mechanical energy? When does it apply?',
        keywords: ['kinetic', 'potential', 'sum', 'constant', 'conservative', 'friction', 'isolated'],
        sampleAnswer: 'Mechanical energy (KE + PE) remains constant in an isolated system with only conservative forces. It applies when no non-conservative forces like friction or air resistance do work.',
        explanation: 'Your answer should state the principle and the conditions for its application.'
      },
      {
        id: 10,
        type: 'explain',
        points: 5,
        question: 'Explain Newton\'s First Law of Motion and give a real-world example.',
        keywords: ['inertia', 'rest', 'constant velocity', 'force', 'balanced', 'unbalanced', 'motion'],
        sampleAnswer: 'Newton\'s First Law states that an object at rest stays at rest, and an object in motion stays in motion with constant velocity, unless acted upon by an unbalanced force. Example: A book on a table stays at rest until someone pushes it.',
        explanation: 'Your answer should state the law and provide a clear example.'
      }
    ]
  },

  'exam4': {
    id: 'exam4',
    title: 'Database Systems Quiz',
    courseCode: 'CSC205',
    courseName: 'Database Management',
    duration: 45,
    totalMarks: 30,
    passingMarks: 15,
    difficulty: 'Easy',
    instructions: [
      'This quiz contains 10 questions worth 30 marks total',
      'You have 45 minutes to complete the quiz',
      'SQL queries must be syntactically correct',
      'Multiple choice questions have only one correct answer'
    ],
    questions: [
      // MCQ
      {
        id: 1,
        type: 'mcq',
        points: 3,
        question: 'Which SQL statement is used to retrieve data from a database?',
        options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
        correctAnswer: 'C',
        explanation: 'SELECT is used to query and retrieve data from database tables.'
      },
      {
        id: 2,
        type: 'mcq',
        points: 3,
        question: 'What does ACID stand for in database transactions?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Accuracy, Completeness, Integrity, Durability',
          'Atomic, Consistent, Isolated, Durable',
          'All Commands In Database'
        ],
        correctAnswer: 'A',
        explanation: 'ACID properties ensure reliable processing of database transactions.'
      },

      // Boolean
      {
        id: 3,
        type: 'boolean',
        points: 2,
        question: 'A primary key can contain NULL values.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Primary keys must be unique and cannot contain NULL values.'
      },
      {
        id: 4,
        type: 'boolean',
        points: 2,
        question: 'SQL is case-sensitive for table names in all database systems.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Case sensitivity depends on the database system and operating system.'
      },

      // Short Answer
      {
        id: 5,
        type: 'short',
        points: 4,
        question: 'Write SQL to select all columns from a table called "students".',
        correctAnswer: 'SELECT * FROM students',
        explanation: 'The asterisk (*) selects all columns from the specified table.'
      },
      {
        id: 6,
        type: 'short',
        points: 4,
        question: 'What command is used to remove all records from a table without deleting the table structure?',
        correctAnswer: 'TRUNCATE',
        explanation: 'TRUNCATE removes all rows while keeping the table structure for future use.'
      },
      {
        id: 7,
        type: 'short',
        points: 4,
        question: 'What type of join returns all rows when there is a match in either table?',
        correctAnswer: 'FULL OUTER JOIN',
        explanation: 'FULL OUTER JOIN returns all records when there is a match in either left or right table.'
      },

      // Explanation
      {
        id: 8,
        type: 'explain',
        points: 3,
        question: 'What is the difference between DELETE and TRUNCATE commands?',
        keywords: ['rows', 'table', 'condition', 'log', 'rollback', 'speed', 'structure'],
        sampleAnswer: 'DELETE removes rows one by one with conditions, can be rolled back, and is slower. TRUNCATE removes all rows at once, cannot be rolled back in some systems, is faster, and resets auto-increment counters.',
        explanation: 'Your answer should compare the two commands in terms of functionality and performance.'
      },
      {
        id: 9,
        type: 'explain',
        points: 3,
        question: 'Explain what a foreign key is and why it is important.',
        keywords: ['reference', 'primary key', 'relationship', 'integrity', 'link', 'constraint', 'table'],
        sampleAnswer: 'A foreign key is a field that references the primary key of another table, establishing a relationship between tables. It maintains referential integrity by ensuring that values in the foreign key column correspond to valid primary keys.',
        explanation: 'Your answer should define foreign key and explain its role in database design.'
      },
      {
        id: 10,
        type: 'explain',
        points: 3,
        question: 'What is database normalization?',
        keywords: ['redundancy', 'anomaly', 'dependence', 'decomposition', 'efficiency', 'integrity'],
        sampleAnswer: 'Normalization is the process of organizing data to reduce redundancy and improve integrity by dividing large tables into smaller ones and defining relationships between them.',
        explanation: 'Your answer should explain the purpose and basic concept of normalization.'
      }
    ]
  },

  'exam5': {
    id: 'exam5',
    title: 'Linear Algebra Test',
    courseCode: 'MATH205',
    courseName: 'Linear Algebra',
    duration: 75,
    totalMarks: 60,
    passingMarks: 24,
    difficulty: 'Hard',
    instructions: [
      'This test contains 10 questions worth 60 marks total',
      'You have 75 minutes to complete the test',
      'Show all steps in matrix operations',
      'Clearly label your answers',
      'Calculators are allowed for basic arithmetic only'
    ],
    questions: [
      // MCQ
      {
        id: 1,
        type: 'mcq',
        points: 6,
        question: 'What is the determinant of a 2×2 matrix [[a, b], [c, d]]?',
        options: ['ad - bc', 'ab - cd', 'ac - bd', 'ad + bc'],
        correctAnswer: 'A',
        explanation: 'For a 2×2 matrix, determinant = ad - bc.'
      },
      {
        id: 2,
        type: 'mcq',
        points: 6,
        question: 'Which of the following is NOT a property of eigenvectors?',
        options: [
          'They are scaled by eigenvalues',
          'They are non-zero vectors',
          'They are always orthogonal',
          'They satisfy Av = λv'
        ],
        correctAnswer: 'C',
        explanation: 'Eigenvectors are not necessarily orthogonal; this is only true for symmetric matrices.'
      },

      // Boolean
      {
        id: 3,
        type: 'boolean',
        points: 4,
        question: 'Every square matrix has an inverse.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Only non-singular matrices (det ≠ 0) have inverses.'
      },
      {
        id: 4,
        type: 'boolean',
        points: 4,
        question: 'The rank of a matrix is the dimension of its column space.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Rank is indeed the dimension of both column space and row space.'
      },

      // Short Answer
      {
        id: 5,
        type: 'short',
        points: 8,
        question: 'Find the determinant of the matrix [[2, 3], [1, 4]]',
        correctAnswer: '5',
        explanation: 'det = (2×4) - (3×1) = 8 - 3 = 5'
      },
      {
        id: 6,
        type: 'short',
        points: 8,
        question: 'What is the dimension of the vector space R³?',
        correctAnswer: '3',
        explanation: 'R³ has dimension 3, with basis vectors i, j, k.'
      },
      {
        id: 7,
        type: 'short',
        points: 8,
        question: 'If A is a 3×4 matrix, what is the size of its transpose?',
        correctAnswer: '4×3',
        explanation: 'Transpose switches rows and columns, so a 3×4 matrix becomes 4×3.'
      },

      // Explanation
      {
        id: 8,
        type: 'explain',
        points: 6,
        question: 'Explain what linear independence means. How can you test if vectors are linearly independent?',
        keywords: ['combination', 'zero', 'trivial', 'scalars', 'determinant', 'rank', 'dimension'],
        sampleAnswer: 'Vectors are linearly independent if no vector can be written as a linear combination of the others. Test by checking if the only solution to c₁v₁ + ... + cₙvₙ = 0 is all cᵢ = 0, or by checking if determinant (for square matrices) is non-zero.',
        explanation: 'Your answer should define independence and describe testing methods.'
      },
      {
        id: 9,
        type: 'explain',
        points: 5,
        question: 'What is an eigenvalue and eigenvector? Why are they important?',
        keywords: ['transformation', 'scaling', 'direction', 'Av=λv', 'invariant', 'diagonalization'],
        sampleAnswer: 'An eigenvector is a non-zero vector that only scales (not changes direction) when a linear transformation is applied. The scaling factor is the eigenvalue. They are important for matrix diagonalization, stability analysis, and principal component analysis.',
        explanation: 'Your answer should define both terms and explain their significance.'
      },
      {
        id: 10,
        type: 'explain',
        points: 5,
        question: 'Explain the concept of a basis for a vector space.',
        keywords: ['span', 'independent', 'minimal', 'generate', 'coordinates', 'dimension'],
        sampleAnswer: 'A basis is a set of linearly independent vectors that span the entire vector space. Every vector in the space can be uniquely expressed as a linear combination of basis vectors.',
        explanation: 'Your answer should explain spanning, independence, and the role of basis in coordinate representation.'
      }
    ]
  }
};

export default sampleExams;