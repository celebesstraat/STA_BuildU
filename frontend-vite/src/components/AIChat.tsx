import { useState } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! I'm your personal goal coach 🌟 I'm here to help you with motivation, goal setting, career advice, and anything else you need support with. What's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    "Help me stay motivated",
    "I'm feeling stuck with my goal",
    "How do I update my CV?",
    "Give me career advice",
    "I need some inspiration"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call the backend API)
    setTimeout(() => {
      const responses = getAIResponse(inputMessage.toLowerCase());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const getAIResponse = (message: string) => {
    if (message.includes('motivat') || message.includes('inspire')) {
      return {
        message: `I understand you're looking for some motivation! Remember, every small step you take is progress. Here's something to inspire you:

*"You are braver than you believe, stronger than you seem, and smarter than you think."* - A.A. Milne

What specific goal or challenge are you working on? I'd love to help you break it down into manageable steps. 💪✨`
      };
    }

    if (message.includes('stuck') || message.includes('difficult') || message.includes('hard')) {
      return {
        message: `It's completely normal to feel stuck sometimes - it often means you're on the verge of a breakthrough! Here are some strategies that can help:

🔄 **Try a different approach**: Sometimes a fresh perspective makes all the difference
📝 **Break it into smaller steps**: What's one tiny action you could take today?
🤝 **Ask for help**: There's strength in reaching out to friends, family, or mentors
🎯 **Revisit your 'why'**: Remember what motivated you to start this goal

What specific challenge are you facing? Let's work through it together!`
      };
    }

    if (message.includes('cv') || message.includes('resume')) {
      return {
        message: `Great question! Updating your CV is such an important step. Here are some key tips:

✨ **Tailor it to each job**: Customize your CV for each application
🎯 **Use action words**: Start bullet points with words like "achieved," "managed," "created"
📊 **Include numbers**: Quantify your achievements whenever possible
🎓 **Add recent learning**: Include any new skills, courses, or workshops

**Structure to follow:**
• Personal details & summary
• Key skills
• Work experience (most recent first)
• Education & qualifications
• Additional skills/interests

Would you like specific help with any section? I can help you write compelling descriptions for your experience! 📄`
      };
    }

    if (message.includes('career') || message.includes('job')) {
      return {
        message: `Career development is such an exciting journey! Here's some practical advice:

🎯 **Know your strengths**: What do you naturally excel at?
🔍 **Research opportunities**: Look into roles that match your skills and interests  
🌐 **Build your network**: Connect with people in your field of interest
📚 **Keep learning**: Stay updated with industry trends and skills

**Job search tips:**
• Set daily goals (e.g., apply to 3 jobs, reach out to 2 contacts)
• Practice your elevator pitch
• Prepare for common interview questions
• Follow up on applications professionally

What type of career path interests you most? I can provide more specific guidance! 🚀`
      };
    }

    // Default response
    return {
      message: `Thank you for sharing that with me! I'm here to support you on your journey. Whether it's about goals, career development, staying motivated, or overcoming challenges, I'm here to help.

Here are some ways I can support you:
🎯 Goal setting and planning
💪 Motivation and encouragement  
📝 CV and interview preparation
🌱 Personal development tips
🤝 Problem-solving strategies

What would you like to explore today? Feel free to ask me anything! ✨`
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your AI Coach</h2>
              <p className="text-purple-100 text-sm">Here to support and motivate you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Chat Button Component
export const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && <AIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default AIChat;