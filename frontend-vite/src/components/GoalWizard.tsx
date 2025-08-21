import { useState } from 'react';
import { ArrowLeft, ArrowRight, Target, Calendar, Star, CheckCircle } from 'lucide-react';

interface GoalData {
  title: string;
  description: string;
  category: 'employment' | 'skills' | 'wellbeing' | 'childcare' | 'other';
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  milestones: Array<{
    title: string;
    description: string;
    targetDate: string;
  }>;
}

const GoalWizard = ({ onComplete, onClose }: { onComplete: (goal: GoalData) => void; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [goalData, setGoalData] = useState<GoalData>({
    title: '',
    description: '',
    category: 'employment',
    priority: 'medium',
    targetDate: '',
    milestones: []
  });

  const [currentMilestone, setCurrentMilestone] = useState({
    title: '',
    description: '',
    targetDate: ''
  });

  const categoryOptions = [
    { value: 'employment', label: 'Employment', icon: '💼', description: 'Job search, applications, interviews' },
    { value: 'skills', label: 'Skills Development', icon: '📚', description: 'Learning new skills, certifications' },
    { value: 'wellbeing', label: 'Personal Wellbeing', icon: '🌱', description: 'Mental health, self-care, balance' },
    { value: 'childcare', label: 'Childcare Solutions', icon: '👶', description: 'Childcare arrangements, support' },
    { value: 'other', label: 'Other', icon: '⭐', description: 'Other personal or professional goals' }
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'low', label: 'Low Priority', color: 'bg-blue-100 text-blue-700 border-blue-200' }
  ];

  const addMilestone = () => {
    if (currentMilestone.title.trim()) {
      setGoalData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { ...currentMilestone }]
      }));
      setCurrentMilestone({ title: '', description: '', targetDate: '' });
    }
  };

  const removeMilestone = (index: number) => {
    setGoalData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return goalData.title.trim().length > 0;
      case 2: return goalData.description.trim().length > 0;
      case 3: return goalData.category && goalData.priority;
      case 4: return goalData.targetDate;
      case 5: return true;
      default: return false;
    }
  };

  const handleComplete = () => {
    onComplete(goalData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-serif">Create Your Goal</h2>
              <p className="text-purple-100 mt-1">Step {step} of 5</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 bg-purple-800 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Goal Title */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <Target className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  What's your goal?
                </h3>
                <p className="text-gray-600">
                  Start with a clear, inspiring title for what you want to achieve
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={goalData.title}
                    onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Find a part-time marketing role"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                {/* AI Suggestion */}
                <div className="bg-soft-lavender rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">💡 Tip:</span> Make it specific and personal. 
                    Instead of "Get a job," try "Secure a customer service role at a local business."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <Star className="h-16 w-16 text-warm-coral mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Tell us more about it
                </h3>
                <p className="text-gray-600">
                  Describe why this goal matters to you and what success looks like
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Goal Description *
                  </label>
                  <textarea
                    value={goalData.description}
                    onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you want to achieve and why it's important to you..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-growth-green/10 border-l-4 border-growth-green rounded-r-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">✨ Remember:</span> This is your personal journey. 
                    There's no right or wrong answer - just be honest about what you want!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Category & Priority */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <CheckCircle className="h-16 w-16 text-sage-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Categorize your goal
                </h3>
                <p className="text-gray-600">
                  Help us understand what type of goal this is and its priority
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-3">
                    Goal Category *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setGoalData(prev => ({ ...prev, category: option.value as 'employment' | 'skills' | 'wellbeing' | 'childcare' | 'other' }))}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          goalData.category === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <div className="font-medium text-slate-800">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-3">
                    Priority Level *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setGoalData(prev => ({ ...prev, priority: option.value as 'low' | 'medium' | 'high' }))}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          goalData.priority === option.value
                            ? option.color
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Target Date */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <Calendar className="h-16 w-16 text-rose-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  When do you want to achieve this?
                </h3>
                <p className="text-gray-600">
                  Set a realistic target date to keep yourself motivated and on track
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Target Completion Date *
                  </label>
                  <input
                    type="date"
                    value={goalData.targetDate}
                    onChange={(e) => setGoalData(prev => ({ ...prev, targetDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-warm-coral/10 border-l-4 border-warm-coral rounded-r-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">⏰ Remember:</span> Choose a date that challenges you 
                    but is also realistic. You can always adjust it later as you progress!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Milestones */}
          {step === 5 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <Target className="h-16 w-16 text-empowerment-purple mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Break it down into steps
                </h3>
                <p className="text-gray-600">
                  Add smaller milestones to make your goal more achievable (optional)
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Existing milestones */}
                {goalData.milestones.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800">Your Milestones:</h4>
                    {goalData.milestones.map((milestone, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-slate-800">{milestone.title}</div>
                          {milestone.targetDate && (
                            <div className="text-sm text-gray-500">
                              Target: {new Date(milestone.targetDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeMilestone(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add milestone form */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={currentMilestone.title}
                      onChange={(e) => setCurrentMilestone(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Milestone title (e.g., Update my CV)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <textarea
                      value={currentMilestone.description}
                      onChange={(e) => setCurrentMilestone(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description (optional)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="flex space-x-3">
                      <input
                        type="date"
                        value={currentMilestone.targetDate}
                        onChange={(e) => setCurrentMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        max={goalData.targetDate}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={addMilestone}
                        disabled={!currentMilestone.title.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-soft-lavender rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">💪 Remember:</span> Milestones are like stepping stones. 
                    Each one you complete brings you closer to your main goal!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${
                  stepNumber === step
                    ? 'bg-purple-600'
                    : stepNumber < step
                    ? 'bg-growth-green'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {step < 5 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center space-x-2 px-6 py-2 bg-growth-green text-white rounded-lg hover:bg-green-700"
            >
              <span>Create Goal</span>
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalWizard;