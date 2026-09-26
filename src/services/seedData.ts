import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  UserCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { COLLEGES } from '../core/constants';
import { userRepository, questionRepository, resourceRepository } from '../services/dataService';

export const SEED_SENIORS = [
  {
    name: 'Aman Verma',
    email: 'aman.verma@lpu.in',
    role: 'senior' as const,
    college: 'Lovely Professional University (LPU)',
    course: 'B.Tech / B.E.',
    department: 'Computer Science & Engineering',
    year: 4,
    bio: 'Upcoming SDE at Amazon. 4th-year LPU CSE student with 500+ LeetCode problems solved. Excited to guide juniors on campus placement prep, coding rounds, and core subjects.',
    skills: ['Data Structures & Algorithms', 'System Design', 'React & Next.js', 'Java & Spring Boot'],
    subjects: ['Data Structures', 'Operating Systems', 'DBMS'],
    projects: ['Campus Connect LPU', 'Realtime Code Collaboration Tool'],
    achievements: ['Smart India Hackathon Finalist', 'Amazon SDE Offer', 'Dean Merit Scholar'],
    internships: ['Amazon AWS SDE Intern', 'HighRadius Intern'],
    availability: 'Mon, Wed, Fri • 6:30 PM - 9:00 PM IST',
    rating: 4.95,
    reviewCount: 31,
    mentorshipCount: 47,
    isVerified: true,
    isSuspended: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@stanford.edu',
    role: 'senior' as const,
    college: 'Stanford University',
    course: 'B.Tech / B.E.',
    department: 'Computer Science & Engineering',
    year: 4,
    bio: 'Incoming Software Engineer at Google. Passionate about Distributed Systems, LeetCode (2100+ rating), and system design mentoring.',
    skills: ['Data Structures & Algorithms', 'System Design', 'Java & Spring Boot', 'Competitive Programming'],
    subjects: ['Operating Systems', 'DBMS', 'Algorithms'],
    projects: ['Distributed Key-Value Store in Go', 'High-throughput Event Queue'],
    achievements: ['Google Summer of Code 2024 Mentor', 'ACM ICPC Regionalist'],
    internships: ['Google SWE Intern (Mountain View)', 'Amazon SDE Intern'],
    availability: 'Tue, Thu, Sat • 6:00 PM - 9:00 PM EST',
    rating: 4.9,
    reviewCount: 28,
    mentorshipCount: 42,
    isVerified: true,
    isSuspended: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.s@mit.edu',
    role: 'senior' as const,
    college: 'Massachusetts Institute of Technology (MIT)',
    course: 'M.Tech / M.S.',
    department: 'Data Science & AI',
    year: 2,
    bio: 'AI/ML Researcher working on LLM alignment and vision-language architectures. Helped 30+ juniors land tier-1 research and ML engineering internships.',
    skills: ['Python & Machine Learning', 'Cloud Architecture (GCP / AWS)', 'System Design'],
    subjects: ['Deep Learning', 'Linear Algebra', 'Computer Vision'],
    projects: ['Multimodal Medical Diagnoser', 'LLM Agentic Evaluation Bench'],
    achievements: ['NeurIPS 2024 Workshop Best Paper', 'Dean\'s Honor List'],
    internships: ['DeepMind Research Intern', 'Microsoft Research'],
    availability: 'Mon, Wed • 5:00 PM - 8:00 PM EST',
    rating: 5.0,
    reviewCount: 35,
    mentorshipCount: 51,
    isVerified: true,
    isSuspended: false,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'David Chen',
    email: 'david.chen@berkeley.edu',
    role: 'senior' as const,
    college: 'University of California, Berkeley',
    course: 'B.Tech / B.E.',
    department: 'Computer Science & Engineering',
    year: 3,
    bio: 'Mobile Dev lead @ Cal Hacks. Built apps with 100k+ downloads. Open source contributor to Flutter and React ecosystem.',
    skills: ['Flutter & Dart', 'React & Next.js', 'UI/UX Design & Figma'],
    subjects: ['Mobile Computing', 'Software Engineering', 'Human-Computer Interaction'],
    projects: ['CampusBite Food Delivery App', 'CalEvents Interactive Map'],
    achievements: ['1st Place Cal Hacks 2024', 'Apple Swift Student Challenge Winner'],
    internships: ['Meta Frontend Engineer Intern', 'Uber Mobile Intern'],
    availability: 'Weekends • 11:00 AM - 4:00 PM PST',
    rating: 4.8,
    reviewCount: 19,
    mentorshipCount: 33,
    isVerified: true,
    isSuspended: false,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Sneha Rao',
    email: 'sneha.rao@iitd.ac.in',
    role: 'senior' as const,
    college: 'Indian Institute of Technology (IIT) Delhi',
    course: 'B.Tech / B.E.',
    department: 'Information Technology',
    year: 4,
    bio: 'Placed at Microsoft IDC. Ready to guide juniors through mock interviews, resume roast, and DSA roadmap from beginner to advanced.',
    skills: ['Data Structures & Algorithms', 'Database Design (SQL & NoSQL)', 'DevOps & Kubernetes'],
    subjects: ['Computer Networks', 'DBMS', 'Discrete Mathematics'],
    projects: ['Scalable Microservices E-Commerce Platform', 'Campus Lost & Found'],
    achievements: ['Candidate Master on Codeforces (1950)', 'Published IEEE paper'],
    internships: ['Microsoft SWE Intern', 'Goldman Sachs Summer Analyst'],
    availability: 'Daily • 7:00 PM - 9:00 PM IST',
    rating: 4.9,
    reviewCount: 44,
    mentorshipCount: 68,
    isVerified: true,
    isSuspended: false,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  }
];

export const seedDatabaseIfEmpty = async () => {
  try {
    const existing = await userRepository.getAllUsers();
    if (existing.length === 0) {
      console.log('Seeding initial verified senior mentors & university knowledge base...');
      
      // Seed seniors
      for (let i = 0; i < SEED_SENIORS.length; i++) {
        const s = SEED_SENIORS[i];
        const uid = `seed_senior_${i + 1}`;
        await userRepository.setProfile({
          id: uid,
          createdAt: Date.now() - (i * 86400000 * 5),
          ...s
        });
      }

      // Seed questions
      await questionRepository.createQuestion({
        authorId: 'seed_junior_1',
        authorName: 'Rohan Mehra',
        authorRole: 'junior',
        authorCollege: 'Stanford University',
        title: 'How do I start preparing for SDE-1 internships in my 2nd year?',
        description: 'I have finished basic C++ and Object-Oriented Programming. Should I jump straight into Striver’s A-Z DSA sheet, or build full-stack projects first? Looking for guidance from seniors who cleared FAANG interviews.',
        category: 'DSA',
        tags: ['Internships', 'DSA', 'InterviewPrep', 'C++']
      });

      await questionRepository.createQuestion({
        authorId: 'seed_junior_2',
        authorName: 'Ananya Deshmukh',
        authorRole: 'junior',
        authorCollege: 'Massachusetts Institute of Technology (MIT)',
        title: 'Best resources for understanding Database Normalization (1NF to BCNF)?',
        description: 'Our mid-semester exams are in 2 weeks and I am struggling with multi-valued dependencies and BCNF decomposition examples. Any concise notes or lecture recommendations?',
        category: 'DBMS',
        tags: ['DBMS', 'Exams', 'StudyNotes', 'College']
      });

      // Seed resources
      await resourceRepository.addResource({
        title: 'LPU CSE Placement Preparation Guide & Practice Sheet',
        description: 'Comprehensive placement roadmap for Lovely Professional University: covers previous interview questions from Amazon, Optum, Cognizant, and HighRadius campus recruitment.',
        category: 'Placement Preparation Guide',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: '5.8 MB',
        uploadedBy: 'seed_senior_1',
        uploaderName: 'Aman Verma',
        college: 'Lovely Professional University (LPU)',
        course: 'B.Tech / B.E.',
        department: 'Computer Science & Engineering',
        year: 4
      });

      await resourceRepository.addResource({
        title: 'Ultimate DSA & LeetCode 75 Patterns Cheatsheet',
        description: 'Complete high-yield pattern notes: Two Pointers, Sliding Window, Monotonic Stack, Dynamic Programming and Graph Traversals with code templates.',
        category: 'Placement Preparation Guide',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: '4.2 MB',
        uploadedBy: 'seed_senior_1',
        uploaderName: 'Aarav Patel',
        college: 'Stanford University',
        course: 'B.Tech / B.E.',
        department: 'Computer Science & Engineering',
        year: 4
      });

      await resourceRepository.addResource({
        title: 'Database Management Systems (DBMS) Handwritten Midterm Notes',
        description: 'Comprehensive notes covering ER diagrams, Relational Algebra, SQL queries, Indexing (B+ Trees), ACID transactions and Concurrency control.',
        category: 'Study Notes',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: '8.7 MB',
        uploadedBy: 'seed_senior_4',
        uploaderName: 'Sneha Rao',
        college: 'Indian Institute of Technology (IIT) Delhi',
        course: 'B.Tech / B.E.',
        department: 'Information Technology',
        year: 4
      });
      
      console.log('Seeding completed successfully!');
    }
  } catch (e) {
    console.error('Seeding error', e);
  }
};
