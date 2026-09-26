import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  UserProfile, 
  ConnectionRequest, 
  Connection, 
  ChatThread, 
  ChatMessage, 
  Question, 
  QuestionAnswer, 
  StudyResource, 
  MentorshipSession, 
  InAppNotification,
  ReportItem
} from '../types';

// ==================== USER REPOSITORY ====================
export const userRepository = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (e) {
      console.error('Error fetching profile', e);
      return null;
    }
  },

  async findByEmail(email: string): Promise<UserProfile | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as UserProfile;
      }
      // Also try case-insensitive fallback search
      const allUsersSnap = await getDocs(collection(db, 'users'));
      for (const d of allUsersSnap.docs) {
        const u = d.data() as UserProfile;
        if (u.email && u.email.trim().toLowerCase() === cleanEmail) {
          return u;
        }
      }
      return null;
    } catch (e) {
      console.error('Error finding profile by email', e);
      return null;
    }
  },

  async setProfile(profile: UserProfile): Promise<void> {
    await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: Date.now() });
  },

  async getSeniors(filters?: {
    college?: string;
    department?: string;
    course?: string;
    year?: number;
    skill?: string;
  }): Promise<UserProfile[]> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'senior'));
      const snap = await getDocs(q);
      let list = snap.docs.map(d => d.data() as UserProfile);

      // Filter in memory for compound matching without requiring 15 separate composite Firestore indexes
      if (filters?.college && filters.college !== 'All') {
        list = list.filter(u => u.college.toLowerCase().includes(filters.college!.toLowerCase()));
      }
      if (filters?.department && filters.department !== 'All') {
        list = list.filter(u => u.department.toLowerCase() === filters.department!.toLowerCase());
      }
      if (filters?.course && filters.course !== 'All') {
        list = list.filter(u => u.course.toLowerCase() === filters.course!.toLowerCase());
      }
      if (filters?.year && filters.year > 0) {
        list = list.filter(u => u.year === filters.year);
      }
      if (filters?.skill && filters.skill.trim()) {
        const s = filters.skill.toLowerCase();
        list = list.filter(u => 
          u.skills.some(sk => sk.toLowerCase().includes(s)) ||
          u.subjects.some(sub => sub.toLowerCase().includes(s))
        );
      }

      return list.filter(u => !u.isSuspended);
    } catch (e) {
      console.error('Error querying seniors', e);
      return [];
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => d.data() as UserProfile);
    } catch (e) {
      console.error('Error getting all users', e);
      return [];
    }
  }
};

// ==================== CONNECTIONS REPOSITORY ====================
export const connectionRepository = {
  async sendRequest(req: Omit<ConnectionRequest, 'id' | 'createdAt'>): Promise<string> {
    // Check if request already exists
    const q = query(
      collection(db, 'connectionRequests'),
      where('fromUserId', '==', req.fromUserId),
      where('toUserId', '==', req.toUserId),
      where('status', '==', 'pending')
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error('A connection request is already pending with this senior.');
    }

    const docRef = await addDoc(collection(db, 'connectionRequests'), {
      ...req,
      createdAt: Date.now()
    });

    // Notify senior
    await notificationRepository.create({
      userId: req.toUserId,
      title: 'New Connection Request',
      message: `${req.senderName} would like to connect with you.`,
      type: 'connection',
      linkId: docRef.id
    });

    return docRef.id;
  },

  subscribeToIncomingRequests(seniorId: string, callback: (reqs: ConnectionRequest[]) => void) {
    const q = query(
      collection(db, 'connectionRequests'),
      where('toUserId', '==', seniorId),
      where('status', '==', 'pending')
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ConnectionRequest));
      callback(list);
    });
  },

  subscribeToOutgoingRequests(juniorId: string, callback: (reqs: ConnectionRequest[]) => void) {
    const q = query(
      collection(db, 'connectionRequests'),
      where('fromUserId', '==', juniorId)
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ConnectionRequest));
      callback(list);
    });
  },

  async acceptRequest(requestId: string, fromUserId: string, toUserId: string, seniorName: string): Promise<void> {
    // Update request status
    await updateDoc(doc(db, 'connectionRequests', requestId), { status: 'accepted' });

    // Create bidirectional connection
    await addDoc(collection(db, 'connections'), {
      users: [fromUserId, toUserId],
      createdAt: Date.now()
    });

    // Create or find existing chat thread
    const chatId = [fromUserId, toUserId].sort().join('_');
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (!chatDoc.exists()) {
      const fromProfile = await userRepository.getProfile(fromUserId);
      const toProfile = await userRepository.getProfile(toUserId);

      await setDoc(doc(db, 'chats', chatId), {
        id: chatId,
        participants: [fromUserId, toUserId],
        participantDetails: {
          [fromUserId]: {
            name: fromProfile?.name || 'Student',
            avatarUrl: fromProfile?.avatarUrl || '',
            role: fromProfile?.role || 'junior',
            college: fromProfile?.college || ''
          },
          [toUserId]: {
            name: toProfile?.name || seniorName,
            avatarUrl: toProfile?.avatarUrl || '',
            role: toProfile?.role || 'senior',
            college: toProfile?.college || ''
          }
        },
        lastMessage: 'Connected! Say hello and start your mentorship conversation.',
        lastMessageAt: Date.now(),
        lastSenderId: 'system'
      });
    }

    // Notify junior
    await notificationRepository.create({
      userId: fromUserId,
      title: 'Connection Accepted 🎉',
      message: `${seniorName} accepted your connection request. You can now chat!`,
      type: 'connection',
      linkId: chatId
    });
  },

  async rejectRequest(requestId: string): Promise<void> {
    await updateDoc(doc(db, 'connectionRequests', requestId), { status: 'rejected' });
  },

  async getConnectedUserIds(userId: string): Promise<string[]> {
    try {
      const q = query(collection(db, 'connections'), where('users', 'array-contains', userId));
      const snap = await getDocs(q);
      const ids: string[] = [];
      snap.forEach(d => {
        const users = d.data().users as string[];
        const other = users.find(u => u !== userId);
        if (other) ids.push(other);
      });
      return ids;
    } catch {
      return [];
    }
  }
};

// ==================== CHAT REPOSITORY ====================
export const chatRepository = {
  subscribeToUserChats(userId: string, callback: (chats: ChatThread[]) => void) {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatThread));
      callback(list);
    });
  },

  subscribeToMessages(chatId: string, callback: (msgs: ChatMessage[]) => void) {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      callback(list);
    });
  },

  async sendMessage(chatId: string, msg: Omit<ChatMessage, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    const now = Date.now();
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      ...msg,
      createdAt: now,
      isRead: false
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: msg.type === 'file' ? `📎 Attachment: ${msg.fileName || 'file'}` : msg.text,
      lastMessageAt: now,
      lastSenderId: msg.senderId
    });

    // Notify receiver
    await notificationRepository.create({
      userId: msg.receiverId,
      title: 'New Message',
      message: msg.text.slice(0, 80),
      type: 'chat',
      linkId: chatId
    });
  }
};

// ==================== Q&A REPOSITORY ====================
export const questionRepository = {
  subscribeToQuestions(callback: (questions: Question[]) => void, category?: string) {
    let q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'), limit(50));
    if (category && category !== 'All') {
      q = query(collection(db, 'questions'), where('category', '==', category), orderBy('createdAt', 'desc'), limit(50));
    }
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
      callback(list);
    });
  },

  async createQuestion(qData: Omit<Question, 'id' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'answerCount' | 'hasAcceptedAnswer'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...qData,
      upvotes: 0,
      upvotedBy: [],
      answerCount: 0,
      hasAcceptedAnswer: false,
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async toggleUpvoteQuestion(questionId: string, userId: string, currentlyUpvoted: boolean): Promise<void> {
    const ref = doc(db, 'questions', questionId);
    if (currentlyUpvoted) {
      await updateDoc(ref, {
        upvotes: increment(-1),
        upvotedBy: arrayRemove(userId)
      });
    } else {
      await updateDoc(ref, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
    }
  },

  subscribeToAnswers(questionId: string, callback: (answers: QuestionAnswer[]) => void) {
    const q = query(
      collection(db, 'questions', questionId, 'answers'),
      orderBy('upvotes', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionAnswer));
      callback(list);
    });
  },

  async addAnswer(questionId: string, ans: Omit<QuestionAnswer, 'id' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'isAccepted'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'questions', questionId, 'answers'), {
      ...ans,
      upvotes: 0,
      upvotedBy: [],
      isAccepted: false,
      createdAt: Date.now()
    });

    await updateDoc(doc(db, 'questions', questionId), {
      answerCount: increment(1)
    });

    return docRef.id;
  },

  async acceptAnswer(questionId: string, answerId: string): Promise<void> {
    await updateDoc(doc(db, 'questions', questionId, 'answers', answerId), {
      isAccepted: true
    });
    await updateDoc(doc(db, 'questions', questionId), {
      hasAcceptedAnswer: true
    });
  },

  async toggleUpvoteAnswer(questionId: string, answerId: string, userId: string, currentlyUpvoted: boolean): Promise<void> {
    const ref = doc(db, 'questions', questionId, 'answers', answerId);
    if (currentlyUpvoted) {
      await updateDoc(ref, {
        upvotes: increment(-1),
        upvotedBy: arrayRemove(userId)
      });
    } else {
      await updateDoc(ref, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
    }
  }
};

// ==================== RESOURCES REPOSITORY ====================
export const resourceRepository = {
  subscribeToResources(callback: (resources: StudyResource[]) => void, category?: string) {
    let q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    if (category && category !== 'All') {
      q = query(collection(db, 'resources'), where('category', '==', category), orderBy('createdAt', 'desc'));
    }
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyResource));
      callback(list);
    });
  },

  async addResource(data: Omit<StudyResource, 'id' | 'createdAt' | 'downloads'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'resources'), {
      ...data,
      downloads: 0,
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async incrementDownload(resourceId: string): Promise<void> {
    await updateDoc(doc(db, 'resources', resourceId), {
      downloads: increment(1)
    });
  },

  async deleteResource(resourceId: string): Promise<void> {
    await deleteDoc(doc(db, 'resources', resourceId));
  }
};

// ==================== MENTORSHIP REPOSITORY ====================
export const mentorshipRepository = {
  subscribeToStudentSessions(studentId: string, callback: (sessions: MentorshipSession[]) => void) {
    const q = query(
      collection(db, 'mentorships'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MentorshipSession));
      callback(list);
    });
  },

  subscribeToMentorSessions(mentorId: string, callback: (sessions: MentorshipSession[]) => void) {
    const q = query(
      collection(db, 'mentorships'),
      where('mentorId', '==', mentorId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MentorshipSession));
      callback(list);
    });
  },

  async requestSession(session: Omit<MentorshipSession, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'mentorships'), {
      ...session,
      status: 'requested',
      createdAt: Date.now()
    });

    await notificationRepository.create({
      userId: session.mentorId,
      title: 'New Mentorship Request',
      message: `${session.studentName} booked a session: "${session.topic}" on ${session.date} at ${session.startTime}.`,
      type: 'mentorship',
      linkId: docRef.id
    });

    return docRef.id;
  },

  async updateSessionStatus(sessionId: string, status: MentorshipSession['status'], session: MentorshipSession): Promise<void> {
    await updateDoc(doc(db, 'mentorships', sessionId), { status });

    if (status === 'accepted') {
      await notificationRepository.create({
        userId: session.studentId,
        title: 'Mentorship Confirmed! 🚀',
        message: `${session.mentorName} accepted your session on ${session.date} at ${session.startTime}.`,
        type: 'mentorship',
        linkId: sessionId
      });
    } else if (status === 'completed') {
      // Increment mentor's mentorship count
      await updateDoc(doc(db, 'users', session.mentorId), {
        mentorshipCount: increment(1)
      });
    }
  },

  async submitReview(sessionId: string, mentorId: string, rating: number, review: string): Promise<void> {
    await updateDoc(doc(db, 'mentorships', sessionId), {
      rating,
      review
    });

    // Update mentor aggregate rating
    const mentorRef = doc(db, 'users', mentorId);
    const mentorDoc = await getDoc(mentorRef);
    if (mentorDoc.exists()) {
      const mData = mentorDoc.data() as UserProfile;
      const currentReviews = mData.reviewCount || 0;
      const currentRating = mData.rating || 5.0;
      const newReviewCount = currentReviews + 1;
      const newRating = Number((((currentRating * currentReviews) + rating) / newReviewCount).toFixed(1));

      await updateDoc(mentorRef, {
        rating: newRating,
        reviewCount: newReviewCount
      });
    }
  }
};

// ==================== NOTIFICATIONS REPOSITORY ====================
export const notificationRepository = {
  subscribe(userId: string, callback: (notes: InAppNotification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as InAppNotification));
      callback(list);
    });
  },

  async create(note: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    await addDoc(collection(db, 'notifications'), {
      ...note,
      isRead: false,
      createdAt: Date.now()
    });
  },

  async markAsRead(noteId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', noteId), { isRead: true });
  }
};

// ==================== REPORTS & MODERATION ====================
export const reportRepository = {
  async submitReport(report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...report,
      status: 'open',
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async getOpenReports(): Promise<ReportItem[]> {
    const q = query(collection(db, 'reports'), where('status', '==', 'open'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportItem));
  },

  async resolveReport(reportId: string): Promise<void> {
    await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
  }
};
