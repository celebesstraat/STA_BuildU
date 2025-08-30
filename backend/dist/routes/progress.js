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
const transformProgressUpdate = (update) => ({
    id: update.id,
    goalId: update.goal_id,
    milestoneId: update.milestone_id,
    userId: update.user_id,
    updateType: update.update_type,
    title: update.title,
    description: update.description,
    evidenceUrl: update.evidence_url,
    evidenceType: update.evidence_type,
    progressPercentage: update.progress_percentage,
    mood: update.mood,
    createdAt: update.created_at,
});
// Create progress update
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { goalId, milestoneId, updateType, title, description, evidenceUrl, evidenceType, progressPercentage, mood } = req.body;
        // Validate required fields
        if (!goalId || !updateType || !title) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: goalId, updateType, title'
            });
        }
        // Verify goal belongs to user
        const { data: goal } = await database_1.default
            .from('goals')
            .select('id')
            .eq('id', goalId)
            .eq('user_id', userId)
            .single();
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found'
            });
        }
        // Create progress update
        const { data: progressUpdate, error } = await database_1.default
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
            });
        }
        res.status(201).json({
            success: true,
            data: transformProgressUpdate(progressUpdate),
            message: 'Progress update created successfully'
        });
    }
    catch (error) {
        console.error('Progress update error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// Get progress updates for a goal
router.get('/goal/:goalId', async (req, res) => {
    try {
        const goalId = req.params.goalId;
        const userId = req.user.id;
        // Verify goal belongs to user
        const { data: goal } = await database_1.default
            .from('goals')
            .select('id')
            .eq('id', goalId)
            .eq('user_id', userId)
            .single();
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found'
            });
        }
        // Get progress updates
        const { data: updates, error } = await database_1.default
            .from('progress_updates')
            .select('*')
            .eq('goal_id', goalId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Progress updates fetch error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch progress updates'
            });
        }
        res.json({
            success: true,
            data: updates?.map(transformProgressUpdate) || []
        });
    }
    catch (error) {
        console.error('Progress updates fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=progress.js.map