export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    dateOfBirth?: string;
    location?: string;
    employmentStatus: 'unemployed' | 'employed' | 'seeking' | 'student';
    createdAt: string;
    updatedAt: string;
}
export interface Goal {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: 'employment' | 'skills' | 'wellbeing' | 'childcare' | 'other';
    priority: 'low' | 'medium' | 'high';
    targetDate: string;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    isSmartGoal: boolean;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
    createdAt: string;
    updatedAt: string;
}
export interface Milestone {
    id: string;
    goalId: string;
    title: string;
    description: string;
    targetDate: string;
    completedAt?: string;
    status: 'pending' | 'in_progress' | 'completed';
    order: number;
    createdAt: string;
    updatedAt: string;
}
export interface ProgressUpdate {
    id: string;
    goalId: string;
    milestoneId?: string;
    userId: string;
    updateType: 'milestone_completed' | 'progress_note' | 'evidence_added' | 'setback';
    title: string;
    description?: string;
    evidenceUrl?: string;
    evidenceType?: 'photo' | 'document' | 'certificate' | 'link';
    progressPercentage?: number;
    mood?: 1 | 2 | 3 | 4 | 5;
    createdAt: string;
}
export interface AIConversation {
    id: string;
    userId: string;
    goalId?: string;
    conversationType: 'goal_setting' | 'motivation' | 'problem_solving' | 'celebration' | 'general';
    messages: AIMessage[];
    createdAt: string;
    updatedAt: string;
}
export interface AIMessage {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: {
        model?: string;
        tokens?: number;
        cost?: number;
    };
}
export interface MotivationalContent {
    id: string;
    type: 'quote' | 'affirmation' | 'tip' | 'story';
    title: string;
    content: string;
    author?: string;
    category?: string;
    tags: string[];
    isPersonalized: boolean;
    createdAt: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface AuthUser extends User {
    token: string;
    refreshToken?: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    location?: string;
    employmentStatus: User['employmentStatus'];
}
export interface AuthenticatedRequest extends Express.Request {
    user: User;
}
export interface CreateGoalRequest {
    title: string;
    description: string;
    category: Goal['category'];
    priority: Goal['priority'];
    targetDate: string;
    milestones?: Array<{
        title: string;
        description: string;
        targetDate: string;
        order: number;
    }>;
}
export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
    status?: Goal['status'];
}
export interface AIRequest {
    message: string;
    context?: {
        goalId?: string;
        conversationType?: AIConversation['conversationType'];
        previousMessages?: AIMessage[];
    };
}
export interface AIResponse {
    message: string;
    suggestions?: string[];
    metadata: {
        model: string;
        tokens: number;
        conversationId: string;
    };
}
//# sourceMappingURL=index.d.ts.map