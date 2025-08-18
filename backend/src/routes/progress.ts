import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth';
import { ProgressUpdate, ApiResponse } from '../types';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create progress update
router.post('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      goalId,
      milestoneId,
      updateType,
      title,
      description,
      evidenceUrl,
      evidenceType,
      progressPercentage,
      mood
    } = req.body;

    // Validate required fields
    if (!goalId || !updateType || !title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: goalId, updateType, title'
      } as ApiResponse);
    }

    // Verify goal belongs to user
    const { data: goal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      } as ApiResponse);
    }

    // Create progress update
    const { data: progressUpdate, error } = await supabase
      .from('progress_updates')
      .insert({
        goal_id: goalId,
        milestone_id: milestoneId,
        user_id: userId,
        update_type: updateType,
        title,
        description,
        evidence_url: evidenceUrl,
        evidence_type: evidenceType,
        progress_percentage: progressPercentage,
        mood,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Progress update creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create progress update'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: progressUpdate,
      message: 'Progress update created successfully'
    } as ApiResponse<ProgressUpdate>);

  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get progress updates for a goal
router.get('/goal/:goalId', async (req, res) => {
  try {
    const goalId = req.params.goalId;
    const userId = req.user!.id;

    // Verify goal belongs to user
    const { data: goal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      } as ApiResponse);
    }

    // Get progress updates
    const { data: updates, error } = await supabase
      .from('progress_updates')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Progress updates fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch progress updates'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: updates || []
    } as ApiResponse<ProgressUpdate[]>);

  } catch (error) {
    console.error('Progress updates fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;