import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Plus, MessageCircle, Star, Calendar, Heart, CheckCircle, User, Settings, Bell } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import useUser from "./hooks/useUser";
import useGoals from "./hooks/useGoals";

function App() {
  const [isLogin, setIsLogin] = useState(true); // To toggle between login and register

  const { session, loading, signIn, signUp, signOut } = useAuth(); // Use the auth hook
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: goals, isLoading: areGoalsLoading } = useGoals();

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, firstName, lastName);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading || isUserLoading || areGoalsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!session) {
    // Render Login/Registration UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-orange-500 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            {isLogin ? 'Welcome Back!' : 'Join Buildu Goals'}
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-orange-600 transition-all shadow-md"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 font-semibold hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Buildu Goals</h1>
                <p className="text-xs text-gray-500">Empowering Your Journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={signOut} // Add logout button
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Good morning, {user?.first_name}! 👋</h2>
              <p className="text-blue-100 text-lg">You're making amazing progress on your journey</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="text-sm font-medium">{goals?.length} goals active</span>
                </div>
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="text-sm font-medium">72% overall progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Journey Overview</h3>

              <div className="flex justify-center mb-8">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.72)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">72%</div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">8</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500 mb-1">3</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-400 mb-1">2</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
              </div>
            </div>

            {/* Today's Focus */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Today's Focus</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded mr-4" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">Complete online CV workshop</h4>
                    <p className="text-sm text-gray-600">Employment Skills • 30 minutes</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded mr-4" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">Practice interview questions</h4>
                    <p className="text-sm text-gray-600">Personal Development • 15 minutes</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded mr-4" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">Update LinkedIn profile</h4>
                    <p className="text-sm text-gray-600">Networking • 20 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Goals */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Your Active Goals</h3>
                <Link 
                  to="/new-goal"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-orange-600 transition-all flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
                </Link>
              </div>

              <div className="grid gap-6">
                {/* Goal Card 1 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Find Employment</h4>
                        <p className="text-sm text-gray-600">Due: March 15, 2024</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">80%</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">80%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">CV completed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">LinkedIn profile updated</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2"></div>
                      <span className="text-gray-700">Apply to 5 positions</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Update Progress
                  </button>
                </div>

                {/* Goal Card 2 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <Star className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Digital Skills</h4>
                        <p className="text-sm text-gray-600">Due: February 28, 2024</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">60%</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Basic Excel course</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2"></div>
                      <span className="text-gray-700">AI tools workshop</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2"></div>
                      <span className="text-gray-700">Social media marketing basics</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                    Continue Learning
                  </button>
                </div>

                {/* Goal Card 3 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                        <Heart className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Wellbeing</h4>
                        <p className="text-sm text-gray-600">Ongoing</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">90%</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Daily mindfulness practice</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Exercise 3x per week</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2"></div>
                      <span className="text-gray-700">Join local support group</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors">
                    Track Today
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Coach */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">AI Coach</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">Hi Sarah! I noticed you're 80% through your CV goal. How are you feeling about your progress? 👋</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Link 
                  to="/chat"
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Ask for help
                </Link>
                <button className="flex-1 py-2 px-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Share progress
                </button>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Achievements</h3>
                <span className="text-2xl">🏆</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">CV Workshop Completed!</p>
                    <p className="text-xs text-green-600">Yesterday • Employment Skills</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-lg">🎉</span>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">7-Day Streak!</p>
                    <p className="text-xs text-blue-600">2 days ago • Daily Goals</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-lg">⭐</span>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-orange-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800">First Networking Event</p>
                    <p className="text-xs text-orange-600">1 week ago • Professional Development</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-lg">🤝</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-blue-600 font-medium text-sm hover:bg-blue-50 rounded-lg transition-colors">
                View All Achievements
              </button>
            </div>

            {/* Daily Inspiration */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Daily Inspiration</h3>
                <span className="text-xl">💖</span>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <div className="h-32 bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-white text-center px-4 font-medium italic">
                    "She believed she could, so she did. Every small step forward is a victory worth celebrating."
                  </p>
                </div>
                <p className="text-sm text-gray-600 text-center font-medium">— Your AI Coach</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Today's Affirmation</h4>
                <p className="text-sm text-gray-600 italic">"I am capable of achieving my goals and creating positive change in my life."</p>
              </div>

              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                <Heart className="w-4 h-4 inline mr-2" />
                Get New Inspiration
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-white text-center">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 mr-3" />
            <h3 className="text-2xl font-bold">Time for Your Weekly Check-in! 📋</h3>
          </div>
          <p className="text-blue-100 mb-6">Reflect on your progress and set intentions for the week ahead.</p>
          <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            Start Check-in
          </button>
        </div>
      </div>

      {/* Chat Button */}
      <Link 
        to="/chat"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full shadow-lg hover:from-purple-700 hover:to-orange-600 transition-all flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>
    </div>
  );
}

export default App;