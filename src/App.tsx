import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { HomeScreen } from './features/home/HomeScreen';
import { DiscoverSeniors } from './features/seniors/DiscoverSeniors';
import { QuestionForum } from './features/questions/QuestionForum';
import { ChatHub } from './features/chat/ChatHub';
import { ResourceLibrary } from './features/resources/ResourceLibrary';
import { MentorshipSessionsView } from './features/mentorship/MentorshipSessionsView';
import { StudentProfileView } from './features/profile/StudentProfileView';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AuthModal } from './features/auth/AuthModal';
import { SeniorProfileModal } from './features/seniors/SeniorProfileModal';
import { seedDatabaseIfEmpty } from './services/seedData';
import { UserProfile } from './types';
import { 
  GraduationCap, 
  Home, 
  Search, 
  HelpCircle, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  User, 
  ShieldCheck, 
  Bell, 
  Check, 
  X,
  Sparkles,
  LogIn
} from 'lucide-react';

function AppContent() {
  const { profile, user, loading, notifications, unreadNotificationCount, markNotificationRead } = useAuth();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'questions' | 'chat' | 'resources' | 'mentorship' | 'profile' | 'admin'>('home');
  
  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [inspectingSenior, setInspectingSenior] = useState<UserProfile | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Seed sample database data once on mount if empty
  useEffect(() => {
    seedDatabaseIfEmpty();
  }, []);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top University Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  JuniorConnect
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                  Campus
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Peer Mentorship & Academic Network</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'home' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'discover' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find Seniors
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'questions' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q&A Doubts
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'resources' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Notes & PYQs
            </button>
            <button
              onClick={() => setActiveTab('mentorship')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'mentorship' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-on-1 Sessions
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'chat' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Messages
            </button>
          </nav>

          {/* Right Action Profile / Notification & Login */}
          <div className="flex items-center gap-2.5">
            {profile ? (
              <div className="flex items-center gap-2">
                {/* Notification Dropdown Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
                    title="Campus Alerts"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">Notifications</span>
                        <span className="text-[10px] text-slate-400">{unreadNotificationCount} unread</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">No new alerts</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.type === 'chat') setActiveTab('chat');
                                if (n.type === 'mentorship') setActiveTab('mentorship');
                                setShowNotifications(false);
                              }}
                              className={`p-2 rounded-xl text-xs cursor-pointer transition ${
                                n.isRead ? 'text-slate-500 hover:bg-slate-50' : 'bg-indigo-50/70 text-indigo-950 font-medium'
                              }`}
                            >
                              <div className="font-semibold text-slate-900">{n.title}</div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill Button */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition"
                >
                  <img
                    src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={profile.name}
                    className="w-7 h-7 rounded-xl object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{profile.name.split(' ')[0]}</div>
                    <div className="text-[9px] text-slate-500 capitalize">{profile.role}</div>
                  </div>
                </button>

                {/* Admin Mode Shortcut */}
                <button
                  onClick={() => setActiveTab('admin')}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                  title="Admin Moderation"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Join Campus
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateTab={setActiveTab}
            onOpenSenior={(s) => setInspectingSenior(s)}
            onRequireAuth={() => openAuth('login')}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverSeniors
            onOpenChatWith={(s) => {
              setInspectingSenior(s);
            }}
            onRequireAuth={() => openAuth('login')}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionForum onRequireAuth={() => openAuth('login')} />
        )}

        {activeTab === 'resources' && (
          <ResourceLibrary onRequireAuth={() => openAuth('login')} />
        )}

        {activeTab === 'mentorship' && (
          <MentorshipSessionsView onRequireAuth={() => openAuth('login')} />
        )}

        {activeTab === 'chat' && (
          <ChatHub onRequireAuth={() => openAuth('login')} />
        )}

        {activeTab === 'profile' && (
          <StudentProfileView onRequireAuth={() => openAuth('login')} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Material 3 standard) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold transition ${
            activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold transition ${
            activeTab === 'discover' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Seniors</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold transition ${
            activeTab === 'questions' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span>Q&A</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold transition ${
            activeTab === 'resources' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold transition ${
            activeTab === 'chat' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-semibold transition ${
            activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {inspectingSenior && (
        <SeniorProfileModal
          senior={inspectingSenior}
          isOpen={!!inspectingSenior}
          onClose={() => setInspectingSenior(null)}
          onOpenChatWith={() => {
            setInspectingSenior(null);
            setActiveTab('chat');
          }}
          onRequireAuth={() => openAuth('login')}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
