import express from 'express';
import supabase from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { AIRequest, AIResponse, ApiResponse, MotivationalContent } from '../types';

const router = express.Router();

// Initialize Supabase client


// Apply authentication middleware to all routes
router.use(authenticateToken);



// Basic AI chat endpoint (uses simple responses for now)
router.post('/chat', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { message, context }: AIRequest = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      } as ApiResponse);
    }

    // For MVP, provide template-based responses
    // In production, this would integrate with Hugging Face or Claude API
    let response = '';
    let suggestions: string[] = [];

    const { data: motivationalQuotes } = await supabase.from('motivational_content').select('content, author, category').eq('type', 'quote');
    const { data: goalSettingTips } = await supabase.from('motivational_content').select('title, content').eq('type', 'tip');

    const messageLower = message.toLowerCase();

    if (!motivationalQuotes || !goalSettingTips) {
      return res.status(500).json({
        success: false,
        error: 'Could not fetch motivational content'
      } as ApiResponse);
    }

    if (messageLower.includes('goal') || messageLower.includes('achieve')) {
      const randomTip = goalSettingTips[Math.floor(Math.random() * goalSettingTips.length)];
      response = `That's a great question about goal setting! Here's a helpful tip: **${randomTip.title}**\n\n${randomTip.content}\n\nRemember, every journey begins with a single step. What specific step could you take today to move closer to your goal?`;
      suggestions = [
        "Help me break down my goal into smaller steps",
        "What should I do when I feel stuck?",
        "How do I stay motivated when progress is slow?"
      ];
    } else if (messageLower.includes('motivation') || messageLower.includes('inspire')) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      response = `Here's some inspiration for you:\n\n*"${randomQuote.content}"*\n— ${randomQuote.author}\n\nYou have the strength and capability to achieve amazing things. Every challenge you face is an opportunity to grow stronger. Keep believing in yourself!`;
      suggestions = [
        "Tell me more about overcoming challenges",
        "How do I build confidence?",
        "Share another inspiring quote"
      ];
    } else if (messageLower.includes('stuck') || messageLower.includes('difficult') || messageLower.includes('hard')) {
      response = `I understand that things can feel challenging sometimes. Remember, feeling stuck is temporary - it's often a sign that you're on the verge of a breakthrough! Here are some strategies that can help:\n\n• Take a step back and reassess your approach\n• Break the problem into smaller, manageable pieces\n• Ask for help from friends, family, or mentors\n• Try a different strategy or angle\n• Celebrate the progress you've already made\n\nWhat specific challenge are you facing right now?`;
      suggestions = [
        "Help me with my job search strategy",
        "I'm struggling with time management",
        "How do I handle rejection?"
      ];
    } else if (messageLower.includes('cv') || messageLower.includes('resume') || messageLower.includes('interview')) {
      response = `Career development is such an important goal! Here are some practical tips:\n\n**For CV/Resume:**\n• Tailor it to each job application\n• Use action verbs and quantify achievements\n• Keep it concise (1-2 pages)\n• Include relevant skills from recent training\n\n**For Interviews:**\n• Research the company beforehand\n• Prepare STAR method examples\n• Practice common questions out loud\n• Prepare thoughtful questions to ask them\n\nWhat aspect of your career development would you like to focus on first?`;
      suggestions = [
        "Help me update my CV with new skills",
        "How do I prepare for my first interview in years?",
        "What questions should I ask in an interview?"
      ];
    } else {
      response = `Thank you for sharing that with me! I'm here to support you on your journey. Whether you're working on career goals, personal development, or overcoming challenges, remember that every step forward is progress worth celebrating.\n\nWhat would you like to focus on today?`;
      suggestions = [
        "Help me set a new goal",
        "I need some motivation",
        "Share tips for staying on track"
      ];
    }

    // Log the conversation (simplified for MVP)
    const conversationId = `conv_${Date.now()}_${userId}`;

    const aiResponse: AIResponse = {
      message: response,
      suggestions,
      metadata: {
        model: 'buildu-template-v1',
        tokens: response.length,
        conversationId
      }
    };

    res.json({
      success: true,
      data: aiResponse,
      message: 'AI response generated successfully'
    } as ApiResponse<AIResponse>);

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get daily motivational content
router.get('/inspiration', async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get today's date for consistent daily content
    const { data: motivationalQuotes } = await supabase.from('motivational_content').select('content, author, category').eq('type', 'quote');

    if (!motivationalQuotes) {
      return res.status(500).json({
        success: false,
        error: 'Could not fetch motivational content'
      } as ApiResponse);
    }

    const today = new Date().toDateString();
    const seed = today + userId;
    const randomIndex = Math.abs(seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % motivationalQuotes.length;

    const todaysQuote = motivationalQuotes[randomIndex];

    const inspirationalContent: MotivationalContent = {
      id: `daily_${today}`,
      type: 'quote',
      title: "Today's Inspiration",
      content: todaysQuote.content,
      author: todaysQuote.author,
      category: todaysQuote.category,
      tags: ['daily', 'motivation', todaysQuote.category],
      isPersonalized: false,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: inspirationalContent
    } as ApiResponse<MotivationalContent>);

  } catch (error) {
    console.error('Daily inspiration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get personalized tips based on user's goals
router.get('/tips', async (req, res) => {
  try {
    const userId = req.user!.id;

    const { data: goals } = await supabase
      .from('goals')
      .select('category, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    const categories = goals?.map(g => g.category) || [];
    const hasEmploymentGoals = categories.includes('employment');
    const hasSkillsGoals = categories.includes('skills');
    const hasWellbeingGoals = categories.includes('wellbeing');

    const { data: tips } = await supabase.from('motivational_content').select('title, content, category').eq('type', 'tip');

    if (!tips) {
      return res.status(500).json({
        success: false,
        error: 'Could not fetch motivational content'
      } as ApiResponse);
    }

    let filteredTips = [];

    if (hasEmploymentGoals) {
      filteredTips.push(...tips.filter(t => t.category === 'employment'));
    }

    if (hasSkillsGoals) {
      filteredTips.push(...tips.filter(t => t.category === 'skills'));
    }

    if (hasWellbeingGoals) {
      filteredTips.push(...tips.filter(t => t.category === 'wellbeing'));
    }

    // Default tips if no specific goals
    if (filteredTips.length === 0) {
      filteredTips.push(...tips.filter(t => t.category === 'goal-setting'));
    }

    res.json({
      success: true,
      data: filteredTips
    } as ApiResponse);

  } catch (error) {
    console.error('Personalized tips error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;