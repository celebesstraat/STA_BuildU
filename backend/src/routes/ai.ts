import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth';
import { AIRequest, AIResponse, ApiResponse, MotivationalContent } from '../types';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Motivational quotes database (fallback for when AI is not available)
const motivationalQuotes = [
  {
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "perseverance"
  },
  {
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "dreams"
  },
  {
    content: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "resilience"
  },
  {
    content: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "confidence"
  },
  {
    content: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "motivation"
  },
  {
    content: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "potential"
  },
  {
    content: "Great things never come from comfort zones.",
    author: "Unknown",
    category: "growth"
  },
  {
    content: "Dream it. Wish it. Do it.",
    author: "Unknown",
    category: "action"
  },
  {
    content: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown",
    category: "proactive"
  },
  {
    content: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown",
    category: "achievement"
  }
];

// Goal setting tips
const goalSettingTips = [
  {
    title: "Start Small, Think Big",
    content: "Break your larger goal into smaller, manageable steps. Each small win builds momentum toward your bigger achievement."
  },
  {
    title: "Write It Down",
    content: "Goals that are written down are 42% more likely to be achieved. Make your intentions concrete and visible."
  },
  {
    title: "Set a Deadline",
    content: "A goal without a deadline is just a wish. Give yourself a specific timeframe to create urgency and accountability."
  },
  {
    title: "Visualize Success",
    content: "Spend time imagining yourself achieving your goal. Visualization helps your brain recognize the resources needed to succeed."
  },
  {
    title: "Track Your Progress",
    content: "Regular check-ins keep you motivated and help you adjust your approach when needed."
  }
];

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

    const messageLower = message.toLowerCase();

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

    // Get user's active goals to personalize tips
    const { data: goals } = await supabase
      .from('goals')
      .select('category, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    const categories = goals?.map(g => g.category) || [];
    const hasEmploymentGoals = categories.includes('employment');
    const hasSkillsGoals = categories.includes('skills');
    const hasWellbeingGoals = categories.includes('wellbeing');

    let tips = [];

    if (hasEmploymentGoals) {
      tips.push({
        title: "Job Search Success Tip",
        content: "Set aside 30 minutes each day for job search activities. Consistency beats intensity when building career momentum."
      });
    }

    if (hasSkillsGoals) {
      tips.push({
        title: "Skill Development Tip",
        content: "Practice new skills for just 15 minutes daily. Small, consistent practice leads to significant improvement over time."
      });
    }

    if (hasWellbeingGoals) {
      tips.push({
        title: "Wellbeing Tip",
        content: "Celebrate small wins! Acknowledging your progress, no matter how small, builds confidence and motivation."
      });
    }

    // Default tips if no specific goals
    if (tips.length === 0) {
      tips.push({
        title: "Getting Started Tip",
        content: "Begin with one small, achievable goal. Success builds upon success, and every journey starts with a single step."
      });
    }

    res.json({
      success: true,
      data: tips
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