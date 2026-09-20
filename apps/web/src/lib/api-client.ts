// API Client layer with real fetch + fallback mock data for full interactive responsiveness

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface QuestionPaper {
  id: string;
  title: string;
  department: string;
  semester: number;
  subject: string;
  year: number;
  season: 'WINTER' | 'SUMMER';
  scheme: 'I-Scheme' | 'K-Scheme' | 'Revised';
  pdfUrl: string;
  fileSize: string;
  views: number;
  downloads: number;
  solutionsAvailable: boolean;
  tags: string[];
}

export interface QuestionBankItem {
  id: string;
  subject: string;
  chapter: string;
  question: string;
  marks: number;
  frequencyCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  yearsAppeared: number[];
  modelAnswer: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'NOTES' | 'SLIDES' | 'SYLLABUS' | 'FORMULA_SHEET';
  subject: string;
  semester: number;
  uploadedBy: string;
  likes: number;
  downloads: number;
  createdAt: string;
}

export const MOCK_PAPERS: QuestionPaper[] = [
  {
    id: 'p-1',
    title: 'Data Structures & Algorithms - Winter 2024 Exam',
    department: 'Computer Engineering',
    semester: 3,
    subject: 'Data Structures & Algorithms',
    year: 2024,
    season: 'WINTER',
    scheme: 'K-Scheme',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '2.4 MB',
    views: 1420,
    downloads: 890,
    solutionsAvailable: true,
    tags: ['Trees', 'Graphs', 'Sorting', 'Recursion'],
  },
  {
    id: 'p-2',
    title: 'Object Oriented Programming C++ - Summer 2024',
    department: 'Computer Engineering',
    semester: 3,
    subject: 'Object Oriented Programming',
    year: 2024,
    season: 'SUMMER',
    scheme: 'K-Scheme',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '1.8 MB',
    views: 980,
    downloads: 540,
    solutionsAvailable: true,
    tags: ['Classes', 'Inheritance', 'Polymorphism', 'Virtual Functions'],
  },
  {
    id: 'p-3',
    title: 'Database Management Systems - Winter 2023',
    department: 'Information Technology',
    semester: 4,
    subject: 'Database Management Systems',
    year: 2023,
    season: 'WINTER',
    scheme: 'I-Scheme',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '3.1 MB',
    views: 2150,
    downloads: 1320,
    solutionsAvailable: true,
    tags: ['SQL', 'Normalization', 'ER Model', 'Transactions'],
  },
  {
    id: 'p-4',
    title: 'Applied Mathematics - Summer 2024',
    department: 'Computer Engineering',
    semester: 2,
    subject: 'Applied Mathematics',
    year: 2024,
    season: 'SUMMER',
    scheme: 'K-Scheme',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '1.5 MB',
    views: 3400,
    downloads: 2100,
    solutionsAvailable: false,
    tags: ['Differential Equations', 'Complex Numbers', 'Matrices'],
  },
  {
    id: 'p-5',
    title: 'Operating Systems - Winter 2024',
    department: 'Information Technology',
    semester: 4,
    subject: 'Operating Systems',
    year: 2024,
    season: 'WINTER',
    scheme: 'K-Scheme',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '2.1 MB',
    views: 1100,
    downloads: 620,
    solutionsAvailable: true,
    tags: ['Process Scheduling', 'Deadlocks', 'Paging', 'Pipes'],
  },
  {
    id: 'p-6',
    title: 'Digital Electronics - Summer 2023',
    department: 'Electronics & Telecommunication',
    semester: 3,
    subject: 'Digital Electronics',
    year: 2023,
    season: 'SUMMER',
    scheme: 'I-Scheme',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '2.7 MB',
    views: 890,
    downloads: 410,
    solutionsAvailable: true,
    tags: ['K-Maps', 'Logic Gates', 'Flip Flops', 'Counters'],
  }
];

export const MOCK_QUESTIONS: QuestionBankItem[] = [
  {
    id: 'q-1',
    subject: 'Data Structures & Algorithms',
    chapter: 'Trees & Binary Search Trees',
    question: 'Explain AVL tree rotations with a step-by-step example for Left-Right (LR) insertion.',
    marks: 8,
    frequencyCount: 5,
    difficulty: 'Hard',
    yearsAppeared: [2021, 2022, 2023, 2024],
    modelAnswer: 'An AVL tree is a self-balancing binary search tree where the balance factor of every node is -1, 0, or +1. When a node becomes unbalanced with balance factor +2 after inserting into the right subtree of left child, an LR rotation is required...',
  },
  {
    id: 'q-2',
    subject: 'Database Management Systems',
    chapter: 'Normalization',
    question: 'Define 3NF and BCNF. Provide a relational table example that is in 3NF but not in BCNF.',
    marks: 6,
    frequencyCount: 7,
    difficulty: 'Medium',
    yearsAppeared: [2019, 2020, 2022, 2023, 2024],
    modelAnswer: 'A relation R is in 3NF if for every non-trivial functional dependency X -> Y, X is a super key or Y is a prime attribute. BCNF requires X to be a super key for EVERY functional dependency X -> Y...',
  },
  {
    id: 'q-3',
    subject: 'Operating Systems',
    chapter: 'Deadlocks',
    question: 'State Banker\'s Algorithm safety condition and trace execution with 3 processes and 3 resource types.',
    marks: 8,
    frequencyCount: 4,
    difficulty: 'Hard',
    yearsAppeared: [2020, 2022, 2024],
    modelAnswer: 'Banker\'s Algorithm checks if allocating resources leaves the system in a safe state by maintaining Available, Allocation, Need, and Max matrices...',
  },
  {
    id: 'q-4',
    subject: 'Object Oriented Programming',
    chapter: 'Polymorphism',
    question: 'Differentiate between Function Overloading and Function Overriding with code snippets.',
    marks: 4,
    frequencyCount: 9,
    difficulty: 'Easy',
    yearsAppeared: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    modelAnswer: 'Function Overloading occurs within the same class (compile-time polymorphism) having different parameter signatures. Function Overriding occurs across inherited classes (runtime polymorphism)...',
  }
];

export async function fetchPapers(params?: Record<string, string>): Promise<QuestionPaper[]> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/papers?${query}`);
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) return data.data;
    }
  } catch (e) {
    // API server offline, return mock data
  }
  return MOCK_PAPERS;
}

export async function askNexusAI(prompt: string, contextPaperId?: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, contextPaperId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.answer || data.message;
    }
  } catch (e) {
    // Fallback response
  }
  return `### SBMPNexus AI Tutor Response\n\nRegarding your query about **"${prompt}"**:\n\n1. **Core Concept**: In diploma engineering curriculum, this concept forms a key 6-8 mark question in semester exams.\n2. **Step-by-Step Breakdown**:\n   - **Definition**: Fundamental principle governing this domain.\n   - **Mathematical Model / Diagram**: Always draw a labeled diagram in MSBTE exams to secure full marks.\n   - **Key Formula**: \\( E = mc^2 \\) or standard algorithmic complexity \\( O(n \\log n) \\).\n3. **Exam Tip**: This topic appeared in **Winter 2024** and **Summer 2023** papers. Focus on drawing neat block diagrams!`;
}
