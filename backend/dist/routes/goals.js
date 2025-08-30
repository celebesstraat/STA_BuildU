"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../utils/database"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
// Get all goals for authenticated user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const category = req.query.category;
        const offset = (page - 1) * limit;
        let query = database_1.default
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
            });
        }
        // Transform database format to API format
        const transformedGoals = goals?.map(goal => ({
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
        });
    }
    catch (error) {
        console.error('Goals fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Get single goal by ID
router.get('/:id', async (req, res) => {
    try {
        const goalId = req.params.id;
        const userId = req.user.id;
        const { data: goal, error } = await database_1.default
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
            });
        }
        // Transform database format to API format
        const transformedGoal = {
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
        });
    }
    catch (error) {
        console.error('Goal fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Create new goal
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const goalData = req.body;
        // Validate required fields
        if (!goalData.title || !goalData.description || !goalData.category || !goalData.targetDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, description, category, targetDate'
            });
        }
        // Create goal in database
        const { data: newGoal, error } = await database_1.default
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
            });
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
            await database_1.default
                .from('milestones')
                .insert(milestonesData);
        }
        // Transform database format to API format
        const transformedGoal = {
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
        });
    }
    catch (error) {
        console.error('Goal creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Update goal
router.put('/:id', async (req, res) => {
    try {
        const goalId = req.params.id;
        const userId = req.user.id;
        const updateData = req.body;
        // Verify goal belongs to user
        const { data: existingGoal } = await database_1.default
            .from('goals')
            .select('id')
            .eq('id', goalId)
            .eq('user_id', userId)
            .single();
        if (!existingGoal) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found'
            });
        }
        // Update goal
        const { data: updatedGoal, error } = await database_1.default
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
            });
        }
        // Transform database format to API format
        const transformedGoal = {
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
        });
    }
    catch (error) {
        console.error('Goal update error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Delete goal
router.delete('/:id', async (req, res) => {
    try {
        const goalId = req.params.id;
        const userId = req.user.id;
        // Verify goal belongs to user
        const { data: existingGoal } = await database_1.default
            .from('goals')
            .select('id')
            .eq('id', goalId)
            .eq('user_id', userId)
            .single();
        if (!existingGoal) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found'
            });
        }
        // Delete goal (cascading delete should handle milestones and progress updates)
        const { error } = await database_1.default
            .from('goals')
            .delete()
            .eq('id', goalId);
        if (error) {
            console.error('Goal deletion error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete goal'
            });
        }
        res.json({
            success: true,
            message: 'Goal deleted successfully'
        });
    }
    catch (error) {
        console.error('Goal deletion error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Get goal statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const userId = req.user.id;
        // Get goal counts by status
        const { data: goalStats, error } = await database_1.default
            .from('goals')
            .select('status')
            .eq('user_id', userId);
        if (error) {
            console.error('Goal stats error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch goal statistics'
            });
        }
        // Calculate statistics
        const stats = goalStats?.reduce((acc, goal) => {
            acc[goal.status] = (acc[goal.status] || 0) + 1;
            return acc;
        }, {}) || {};
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
        });
    }
    catch (error) {
        console.error('Goal stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=goals.js.map