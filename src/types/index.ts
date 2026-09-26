export type UserRole = 'junior' | 'senior' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college: string;
  course: string;
  department: string;
  year: number;
  bio?: string;
  avatarUrl?: string;
  skills: string[];
  subjects: string[];
  projects?: string[];
  achievements?: string[];
  internships?: string[];
  availability?: string; // e.g. "Mon, Wed 5PM-8PM"
  rating: number;
  reviewCount: number;
  mentorshipCount: number;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: number; // epoch ms or timestamp
  updatedAt?: number;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  senderName: string;
  senderAvatar?: string;
  senderCourse?: string;
  senderYear?: number;
  note?: string;
  status: ConnectionStatus;
  createdAt: number;
}

export interface Connection {
  id: string;
  users: string[]; // [uid1, uid2]
  createdAt: number;
}

export interface ChatThread {
  id: string;
  participants: string[];
  participantDetails: {
    [uid: string]: {
      name: string;
      avatarUrl?: string;
      role: UserRole;
      college: string;
    };
  };
  lastMessage: string;
  lastMessageAt: number;
  lastSenderId: string;
  unreadCount?: { [uid: string]: number };
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: number;
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  upvotes: number;
  upvotedBy: string[];
  isAccepted: boolean;
  createdAt: number;
}

export interface Question {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorCollege: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  upvotes: number;
  upvotedBy: string[];
  answerCount: number;
  hasAcceptedAnswer: boolean;
  createdAt: number;
}

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string; // 'pdf' | 'docx' | 'ppt' | 'notes' | 'link'
  fileSize?: string;
  uploadedBy: string;
  uploaderName: string;
  college: string;
  course: string;
  department: string;
  year?: number;
  downloads: number;
  createdAt: number;
}

export type MentorshipStatus = 'requested' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface MentorshipSession {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  status: MentorshipStatus;
  notes?: string;
  meetingLink?: string;
  rating?: number;
  review?: string;
  createdAt: number;
}

export interface MentorReview {
  id: string;
  sessionId: string;
  mentorId: string;
  studentId: string;
  studentName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'question' | 'resource' | 'chat';
  targetId: string;
  targetTitleOrName: string;
  reason: string;
  status: 'open' | 'resolved';
  createdAt: number;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'connection' | 'chat' | 'mentorship' | 'question' | 'system';
  linkId?: string;
  isRead: boolean;
  createdAt: number;
}
