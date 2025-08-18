import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth';
import { Goal, Milestone, CreateGoalRequest, UpdateGoalRequest, ApiResponse, PaginatedResponse } from '../types';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all goals for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('goals')
      .select(`
        *,
        milestones (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: goals, error, count } = await query;

    if (error) {
      console.error('Goals fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch goals'
      } as ApiResponse);
    }

    // Transform database format to API format
    const transformedGoals: Goal[] = goals?.map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.target_date,
      status: goal.status,
      isSmartGoal: goal.is_smart_goal,
      specific: goal.specific || '',
      measurable: goal.measurable || '',
      achievable: goal.achievable || '',
      relevant: goal.relevant || '',
      timeBound: goal.time_bound || '',
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    })) || [];

    res.json({
      success: true,
      data: transformedGoals,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } as PaginatedResponse<Goal>);

  } catch (error) {
    console.error('Goals fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get single goal by ID
router.get('/:id', async (req, res) => {
  try {
    const goalId = req.params.id;
    const userId = req.user!.id;

    const { data: goal, error } = await supabase
      .from('goals')
      .select(`
        *,
        milestones (*),
        progress_updates (*)
      `)
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (error || !goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      } as ApiResponse);
    }

    // Transform database format to API format
    const transformedGoal: Goal = {
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.target_date,
      status: goal.status,
      isSmartGoal: goal.is_smart_goal,
      specific: goal.specific || '',
      measurable: goal.measurable || '',
      achievable: goal.achievable || '',
      relevant: goal.relevant || '',
      timeBound: goal.time_bound || '',
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    };

    res.json({
      success: true,
      data: transformedGoal
    } as ApiResponse<Goal>);

  } catch (error) {
    console.error('Goal fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Create new goal
router.post('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const goalData: CreateGoalRequest = req.body;

    // Validate required fields
    if (!goalData.title || !goalData.description || !goalData.category || !goalData.targetDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category, targetDate'
      } as ApiResponse);
    }

    // Create goal in database
    const { data: newGoal, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        priority: goalData.priority || 'medium',
        target_date: goalData.targetDate,
        status: 'active',
        is_smart_goal: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Goal creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create goal'
      } as ApiResponse);
    }

    // Create milestones if provided
    if (goalData.milestones && goalData.milestones.length > 0) {
      const milestonesData = goalData.milestones.map(milestone => ({
        goal_id: newGoal.id,
        title: milestone.title,
        description: milestone.description,
        target_date: milestone.targetDate,
        order: milestone.order,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase
        .from('milestones')
        .insert(milestonesData);
    }

    // Transform database format to API format
    const transformedGoal: Goal = {
      id: newGoal.id,
      userId: newGoal.user_id,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      targetDate: newGoal.target_date,
      status: newGoal.status,
      isSmartGoal: newGoal.is_smart_goal,
      specific: newGoal.specific || '',
      measurable: newGoal.measurable || '',
      achievable: newGoal.achievable || '',
      relevant: newGoal.relevant || '',
      timeBound: newGoal.time_bound || '',
      createdAt: newGoal.created_at,
      updatedAt: newGoal.updated_at
    };

    res.status(201).json({
      success: true,
      data: transformedGoal,
      message: 'Goal created successfully'
    } as ApiResponse<Goal>);

  } catch (error) {
    console.error('Goal creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Update goal
router.put('/:id', async (req, res) => {
  try {
    const goalId = req.params.id;
    const userId = req.user!.id;
    const updateData: UpdateGoalRequest = req.body;

    // Verify goal belongs to user
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      } as ApiResponse);
    }

    // Update goal
    const { data: updatedGoal, error } = await supabase
      .from('goals')
      .update({
        title: updateData.title,
        description: updateData.description,
        category: updateData.category,
        priority: updateData.priority,
        target_date: updateData.targetDate,
        status: updateData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('Goal update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update goal'
      } as ApiResponse);
    }

    // Transform database format to API format
    const transformedGoal: Goal = {
      id: updatedGoal.id,
      userId: updatedGoal.user_id,
      title: updatedGoal.title,
      description: updatedGoal.description,
      category: updatedGoal.category,
      priority: updatedGoal.priority,
      targetDate: updatedGoal.target_date,
      status: updatedGoal.status,
      isSmartGoal: updatedGoal.is_smart_goal,
      specific: updatedGoal.specific || '',
      measurable: updatedGoal.measurable || '',
      achievable: updatedGoal.achievable || '',
      relevant: updatedGoal.relevant || '',
      timeBound: updatedGoal.time_bound || '',
      createdAt: updatedGoal.created_at,
      updatedAt: updatedGoal.updated_at
    };

    res.json({
      success: true,
      data: transformedGoal,
      message: 'Goal updated successfully'
    } as ApiResponse<Goal>);

  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Delete goal
router.delete('/:id', async (req, res) => {
  try {
    const goalId = req.params.id;
    const userId = req.user!.id;

    // Verify goal belongs to user
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      } as ApiResponse);
    }

    // Delete goal (cascading delete should handle milestones and progress updates)
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('Goal deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete goal'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Goal deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get goal statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get goal counts by status
    const { data: goalStats, error } = await supabase
      .from('goals')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      console.error('Goal stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch goal statistics'
      } as ApiResponse);
    }

    // Calculate statistics
    const stats = goalStats?.reduce((acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalGoals = goalStats?.length || 0;
    const completedGoals = stats.completed || 0;
    const activeGoals = stats.active || 0;
    const progressPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalGoals,
        activeGoals,
        completedGoals,
        pausedGoals: stats.paused || 0,
        cancelledGoals: stats.cancelled || 0,
        progressPercentage,
        streak: 12 // TODO: Calculate actual streak from progress updates
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Goal stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;