export interface CollaborativeSession {
  id: string;
  name: string;
  ownerId: string;
  participants: Participant[];
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  sharedContext: Record<string, any>;
  messages: CollaborativeMessage[];
}

export interface Participant {
  userId: string;
  username: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  isOnline: boolean;
  cursor?: CursorPosition;
}

export interface CursorPosition {
  x: number;
  y: number;
  color: string;
}

export interface CollaborativeMessage {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  content: string;
  type: 'text' | 'ai_result' | 'workflow_update' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SharedWorkspace {
  aiConversations: Array<{
    id: string;
    messages: any[];
    model: string;
    timestamp: Date;
  }>;
  workflows: Array<{
    id: string;
    definition: any;
    executions: any[];
  }>;
  platformConnections: string[];
  sharedVariables: Record<string, any>;
}

class CollaborationEngine {
  private static instance: CollaborationEngine;
  private sessions: Map<string, CollaborativeSession> = new Map();
  private userSessions: Map<string, string[]> = new Map();

  public static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine();
    }
    return CollaborationEngine.instance;
  }

  async createSession(name: string, ownerId: string, username: string): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const session: CollaborativeSession = {
      id: sessionId,
      name,
      ownerId,
      participants: [{
        userId: ownerId,
        username,
        role: 'owner',
        joinedAt: new Date(),
        isOnline: true
      }],
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      sharedContext: {},
      messages: []
    };

    this.sessions.set(sessionId, session);
    this.addUserToSession(ownerId, sessionId);
    
    console.log(`🤝 Collaborative session "${name}" created by ${username}`);
    return sessionId;
  }

  async joinSession(sessionId: string, userId: string, username: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if user is already in session
    const existingParticipant = session.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.isOnline = true;
      return true;
    }

    // Add new participant
    session.participants.push({
      userId,
      username,
      role: 'editor',
      joinedAt: new Date(),
      isOnline: true
    });

    this.addUserToSession(userId, sessionId);
    
    // Add system message
    this.addMessage(sessionId, {
      userId: 'system',
      username: 'System',
      content: `${username} joined the session`,
      type: 'system'
    });

    session.lastActivity = new Date();
    console.log(`👋 ${username} joined session ${sessionId}`);
    return true;
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isOnline = false;
      
      // Add system message
      this.addMessage(sessionId, {
        userId: 'system',
        username: 'System',
        content: `${participant.username} left the session`,
        type: 'system'
      });
    }

    this.removeUserFromSession(userId, sessionId);
    session.lastActivity = new Date();
  }

  addMessage(sessionId: string, message: Omit<CollaborativeMessage, 'id' | 'sessionId' | 'timestamp'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const fullMessage: CollaborativeMessage = {
      ...message,
      id: this.generateMessageId(),
      sessionId,
      timestamp: new Date()
    };

    session.messages.push(fullMessage);
    session.lastActivity = new Date();

    // Keep only last 1000 messages
    if (session.messages.length > 1000) {
      session.messages = session.messages.slice(-1000);
    }

    console.log(`💬 Message in session ${sessionId}: ${message.content.substring(0, 50)}...`);
  }

  shareAIConversation(sessionId: string, userId: string, conversation: any): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (!session.sharedContext.aiConversations) {
      session.sharedContext.aiConversations = [];
    }

    session.sharedContext.aiConversations.push({
      id: this.generateId(),
      conversation,
      sharedBy: userId,
      timestamp: new Date()
    });

    const participant = session.participants.find(p => p.userId === userId);
    this.addMessage(sessionId, {
      userId: 'system',
      username: 'System',
      content: `${participant?.username} shared an AI conversation`,
      type: 'system',
      metadata: { type: 'ai_conversation_shared' }
    });
  }

  shareWorkflow(sessionId: string, userId: string, workflow: any): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (!session.sharedContext.workflows) {
      session.sharedContext.workflows = [];
    }

    session.sharedContext.workflows.push({
      id: this.generateId(),
      workflow,
      sharedBy: userId,
      timestamp: new Date()
    });

    const participant = session.participants.find(p => p.userId === userId);
    this.addMessage(sessionId, {
      userId: 'system',
      username: 'System',
      content: `${participant?.username} shared a workflow`,
      type: 'system',
      metadata: { type: 'workflow_shared' }
    });
  }

  updateCursor(sessionId: string, userId: string, position: CursorPosition): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.cursor = position;
    }
  }

  synchronizeState(sessionId: string, userId: string, stateUpdate: Record<string, any>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Merge state updates
    session.sharedContext = { ...session.sharedContext, ...stateUpdate };
    session.lastActivity = new Date();

    console.log(`🔄 State synchronized in session ${sessionId} by user ${userId}`);
  }

  getSession(sessionId: string): CollaborativeSession | undefined {
    return this.sessions.get(sessionId);
  }

  getUserSessions(userId: string): CollaborativeSession[] {
    const sessionIds = this.userSessions.get(userId) || [];
    return sessionIds
      .map(id => this.sessions.get(id))
      .filter((session): session is CollaborativeSession => session !== undefined);
  }

  getSessionMessages(sessionId: string, limit: number = 100): CollaborativeMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.messages.slice(-limit);
  }

  getOnlineParticipants(sessionId: string): Participant[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.participants.filter(p => p.isOnline);
  }

  updateParticipantRole(sessionId: string, targetUserId: string, newRole: Participant['role'], requesterId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const requester = session.participants.find(p => p.userId === requesterId);
    if (!requester || requester.role !== 'owner') return false;

    const targetParticipant = session.participants.find(p => p.userId === targetUserId);
    if (!targetParticipant) return false;

    targetParticipant.role = newRole;
    
    this.addMessage(sessionId, {
      userId: 'system',
      username: 'System',
      content: `${targetParticipant.username}'s role changed to ${newRole}`,
      type: 'system'
    });

    return true;
  }

  endSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.ownerId !== userId) return false;

    session.isActive = false;
    
    // Notify all participants
    this.addMessage(sessionId, {
      userId: 'system',
      username: 'System',
      content: 'Session ended by owner',
      type: 'system'
    });

    // Remove all participants from user sessions map
    session.participants.forEach(participant => {
      this.removeUserFromSession(participant.userId, sessionId);
    });

    console.log(`🔚 Session ${sessionId} ended by owner`);
    return true;
  }

  private addUserToSession(userId: string, sessionId: string): void {
    const userSessions = this.userSessions.get(userId) || [];
    if (!userSessions.includes(sessionId)) {
      userSessions.push(sessionId);
      this.userSessions.set(userId, userSessions);
    }
  }

  private removeUserFromSession(userId: string, sessionId: string): void {
    const userSessions = this.userSessions.get(userId) || [];
    const filtered = userSessions.filter(id => id !== sessionId);
    this.userSessions.set(userId, filtered);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const collaborationEngine = CollaborationEngine.getInstance();
