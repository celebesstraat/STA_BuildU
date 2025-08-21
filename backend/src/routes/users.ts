import express from 'express';
import supabase from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { calculateStreak } from '../utils/streaks';

const router = express.Router();



// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user!.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, profile_picture, date_of_birth, location, employment_status, created_at, updated_at, last_login_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    // Transform database format to API format
    const userProfile: User = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture,
      dateOfBirth: user.date_of_birth,
      location: user.location,
      employmentStatus: user.employment_status,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({
      success: true,
      data: userProfile
    } as ApiResponse<User>);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      firstName,
      lastName,
      dateOfBirth,
      location,
      employmentStatus,
      profilePicture
    } = req.body;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        location: location,
        employment_status: employmentStatus,
        profile_picture: profilePicture,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name, profile_picture, date_of_birth, location, employment_status, created_at, updated_at')
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      } as ApiResponse);
    }

    // Transform database format to API format
    const userProfile: User = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      profilePicture: updatedUser.profile_picture,
      dateOfBirth: updatedUser.date_of_birth,
      location: updatedUser.location,
      employmentStatus: updatedUser.employment_status,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };

    res.json({
      success: true,
      data: userProfile,
      message: 'Profile updated successfully'
    } as ApiResponse<User>);

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get user dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get goal statistics
    const { data: goals } = await supabase
      .from('goals')
      .select('status, created_at')
      .eq('user_id', userId);

    // Get recent progress updates
    const { data: recentUpdates } = await supabase
      .from('progress_updates')
      .select('created_at, update_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate statistics
    const totalGoals = goals?.length || 0;
    const activeGoals = goals?.filter(g => g.status === 'active').length || 0;
    const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;
    const progressPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const streak = calculateStreak(recentUpdates);

    // Get next milestone or focus
    const { data: upcomingMilestones } = await supabase
      .from('milestones')
      .select(`
        id, title, target_date, goals!inner(user_id)
      `)
      .eq('goals.user_id', userId)
      .eq('status', 'pending')
      .order('target_date', { ascending: true })
      .limit(1);

    const nextFocus = upcomingMilestones && upcomingMilestones.length > 0 
      ? {
          title: upcomingMilestones[0].title,
          targetDate: upcomingMilestones[0].target_date
        }
      : {
          title: 'Set your first goal to get started!',
          targetDate: null
        };

    const dashboardData = {
      totalGoals,
      activeGoals,
      completedGoals,
      progressPercentage,
      streak,
      nextFocus,
      recentActivityCount: recentUpdates?.length || 0
    };

    res.json({
      success: true,
      data: dashboardData
    } as ApiResponse);

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;