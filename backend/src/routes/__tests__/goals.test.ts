import request from 'supertest';
import express from 'express';
import goalsRouter from '../goals';
import supabase from '../../utils/database';
import { authenticateToken } from '../../middleware/auth';

// Mock Supabase
jest.mock('../../utils/database', () => ({
  from: jest.fn(() => {
    const mockChainable = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      // These will be set dynamically in the test
      data: [],
      error: null,
      count: 0,
    };
    return mockChainable;
  }),
}));

// Mock authenticateToken middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id' }; // Mock authenticated user
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/goals', goalsRouter);

describe('Goals API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Create a fresh mock object for each test
    const mockChainable = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: [],
      error: null,
      count: 0,
    };
    (supabase.from as jest.Mock).mockReturnValue(mockChainable);
  });

  describe('GET /', () => {
    test('should return all goals for the authenticated user', async () => {
      const mockGoals = [
        {
          id: 'goal1',
          user_id: 'test-user-id',
          title: 'Goal 1',
          description: 'Desc 1',
          category: 'career',
          priority: 'high',
          target_date: '2025-12-31',
          status: 'active',
          is_smart_goal: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'goal2',
          user_id: 'test-user-id',
          title: 'Goal 2',
          description: 'Desc 2',
          category: 'health',
          priority: 'medium',
          target_date: '2025-11-30',
          status: 'completed',
          is_smart_goal: false,
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
        },
      ];

      // Get the mock object returned by supabase.from
      const mockFromReturn = (supabase.from('goals') as any);

      // Set the data, error, and count on this mock object
      mockFromReturn.data = mockGoals;
      mockFromReturn.error = null;
      mockFromReturn.count = mockGoals.length;

      const res = await request(app).get('/goals');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].title).toEqual('Goal 1');
      expect(res.body.data[1].title).toEqual('Goal 2');
      expect(mockFromReturn.select).toHaveBeenCalledWith(
        `
        *,
        milestones (*)
      `
      );
      expect(mockFromReturn.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockFromReturn.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockFromReturn.range).toHaveBeenCalledWith(0, 9);
    });

    test('should return filtered goals for the authenticated user', async () => {
      const mockGoals = [
        {
          id: 'goal1',
          user_id: 'test-user-id',
          title: 'Goal 1',
          description: 'Desc 1',
          category: 'career',
          priority: 'high',
          target_date: '2025-12-31',
          status: 'active',
          is_smart_goal: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockFromReturn = (supabase.from('goals') as any);
      mockFromReturn.data = mockGoals;
      mockFromReturn.error = null;
      mockFromReturn.count = mockGoals.length;

      const res = await request(app).get('/goals?status=active&category=career');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toEqual('Goal 1');
      expect(mockFromReturn.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockFromReturn.eq).toHaveBeenCalledWith('category', 'career');
    });
  });

  describe('GET /:id', () => {
    test('should return a single goal by ID for the authenticated user', async () => {
      const mockGoal = {
        id: 'goal1',
        user_id: 'test-user-id',
        title: 'Goal 1',
        description: 'Desc 1',
        category: 'career',
        priority: 'high',
        target_date: '2025-12-31',
        status: 'active',
        is_smart_goal: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockFromReturn = (supabase.from('goals') as any);
      mockFromReturn.data = mockGoal;
      mockFromReturn.error = null;
      mockFromReturn.single.mockResolvedValue({ data: mockGoal, error: null });

      const res = await request(app).get('/goals/goal1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toEqual('Goal 1');
      expect(mockFromReturn.eq).toHaveBeenCalledWith('id', 'goal1');
      expect(mockFromReturn.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockFromReturn.single).toHaveBeenCalled();
    });

    test('should return 404 if goal not found', async () => {
      const mockFromReturn = (supabase.from('goals') as any);
      mockFromReturn.data = null;
      mockFromReturn.error = null;
      mockFromReturn.single.mockResolvedValue({ data: null, error: null });

      const res = await request(app).get('/goals/nonexistent-goal');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual('Goal not found');
    });

    test('should return 404 if goal does not belong to user', async () => {
      const mockFromReturn = (supabase.from('goals') as any);
      // Mock single() to return null data, simulating no goal found for the user
      mockFromReturn.single.mockResolvedValue({ data: null, error: null });

      const res = await request(app).get('/goals/goal1');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual('Goal not found');
    });
  });

  describe('POST /', () => {
    test('should create a new goal', async () => {
      const newGoalData = {
        title: 'New Goal',
        description: 'New Description',
        category: 'personal',
        targetDate: '2026-01-01',
      };
      const mockNewGoal = {
        id: 'new-goal-id',
        user_id: 'test-user-id',
        ...newGoalData,
        priority: 'medium',
        status: 'active',
        is_smart_goal: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFromReturn = (supabase.from('goals') as any);
      mockFromReturn.insert().select().single.mockResolvedValue({ data: mockNewGoal, error: null });

      const res = await request(app).post('/goals').send(newGoalData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toEqual('New Goal');
      expect(mockFromReturn.insert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Goal',
        user_id: 'test-user-id',
      }));
    });

    test('should create a new goal with milestones', async () => {
      const newGoalData = {
        title: 'Goal with Milestones',
        description: 'Description with milestones',
        category: 'personal',
        targetDate: '2026-01-01',
        milestones: [
          { title: 'Milestone 1', description: 'Desc 1', targetDate: '2025-06-01', order: 1 },
          { title: 'Milestone 2', description: 'Desc 2', targetDate: '2025-09-01', order: 2 },
        ],
      };
      const mockNewGoal = {
        id: 'new-goal-id-with-milestones',
        user_id: 'test-user-id',
        ...newGoalData,
        priority: 'medium',
        status: 'active',
        is_smart_goal: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFromReturn = (supabase.from('goals') as any);
      mockFromReturn.insert().select().single.mockResolvedValueOnce({ data: mockNewGoal, error: null }); // For goal insert
      mockFromReturn.insert().select().single.mockResolvedValueOnce({ data: [], error: null }); // For milestones insert

      const res = await request(app).post('/goals').send(newGoalData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toEqual('Goal with Milestones');
      expect(mockFromReturn.insert).toHaveBeenCalledTimes(2); // One for goal, one for milestones
      expect(mockFromReturn.insert).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ goal_id: 'new-goal-id-with-milestones', title: 'Milestone 1' }),
        expect.objectContaining({ goal_id: 'new-goal-id-with-milestones', title: 'Milestone 2' }),
      ]));
    });

    test('should return 400 if required fields are missing', async () => {
      const invalidGoalData = {
        description: 'New Description',
        category: 'personal',
        targetDate: '2026-01-01',
      };

      const res = await request(app).post('/goals').send(invalidGoalData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual('Missing required fields: title, description, category, targetDate');
    });
  });
});
