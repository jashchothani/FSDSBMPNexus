export interface IRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'STUDY' | 'CODING' | 'CLASH' | 'QUIZ' | 'CUSTOM';
  hostId: string;
  privacy: 'PUBLIC' | 'CLASS_ONLY' | 'PRIVATE';
  courseId?: string; // If CLASS_ONLY
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  maxParticipants: number;
  currentProblemId?: string; // For clash/coding
  currentQuizId?: string; // For quiz
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomMember {
  _id: string;
  roomId: string;
  userId: string;
  role: 'HOST' | 'MODERATOR' | 'MEMBER';
  status: 'ONLINE' | 'OFFLINE';
  joinedAt: Date;
  leftAt?: Date;
}
