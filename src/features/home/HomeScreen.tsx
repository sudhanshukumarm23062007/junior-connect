import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Search, 
  HelpCircle, 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  MessageSquare,
  Award,
  TrendingUp,
  FileText
} from 'lucide-react';
import { userRepository, questionRepository, resourceRepository } from '../../services/dataService';
import { UserProfile, Question, StudyResource } from '../../types';

interface HomeScreenProps {
  onNavigateTab: (tab: 'home' | 'discover' | 'questions' | 'chat' | 'resources' | 'mentorship' | 'profile' | 'admin') => void;
  onOpenSenior: (senior: UserProfile) => void;
  onRequireAuth: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenSenior,
  onRequireAuth
}) => {
  const { profile } = useAuth();
  const [topSeniors, setTopSeniors] = useState<UserProfile[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [recentResources, setRecentResources] = useState<StudyResource[]>([]);

  useEffect(() => {
    // Load top rated seniors
    userRepository.getSeniors().then((seniors) => {
      setTopSeniors(seniors.slice(0, 3));
    });

    // Load recent questions
    const unsubQ = questionRepository.subscribeToQuestions((qList) => {
      setRecentQuestions(qList.slice(0, 3));
    });

    // Load recent resources
    const unsubR = resourceRepository.subscribeToResources((rList) => {
      setRecentResources(rList.slice(0, 3));
    });

    return () => {
      unsubQ();
      unsubR();
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            University Senior Mentoring Platform
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {profile ? `Welcome back, ${profile.name.split(' ')[0]} 👋` : 'Connect with University Seniors 🎓'}
          </h1>

          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed max-w-xl">
            {profile?.role === 'senior'
              ? 'Thank you for giving back to campus! Review student booking requests and answer subject doubts.'
              : 'Ask questions, find 1-on-1 mentors, share previous year exam papers, and fast-track your tech career.'}
          </p>

          {/* Quick Action Tiles */}
          <div className="pt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('discover')}
              className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-2xl text-xs shadow-md transition flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              Find a Senior Mentor
            </button>

            <button
              onClick={() => onNavigateTab('questions')}
              className="px-5 py-2.5 bg-indigo-600/70 hover:bg-indigo-600 border border-white/20 text-white font-semibold rounded-2xl text-xs backdrop-blur-md transition flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Ask a Question
            </button>

            <button
              onClick={() => onNavigateTab('resources')}
              className="px-5 py-2.5 bg-purple-600/70 hover:bg-purple-600 border border-white/20 text-white font-semibold rounded-2xl text-xs backdrop-blur-md transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Download Study Notes
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Seniors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Recommended Campus Seniors
            </h2>
            <p className="text-xs text-slate-500">Verified mentors with stellar peer feedback</p>
          </div>

          <button
            onClick={() => onNavigateTab('discover')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all mentors <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topSeniors.map((senior) => (
            <div
              key={senior.id}
              onClick={() => onOpenSenior(senior)}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={senior.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={senior.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1">
                        {senior.name}
                        {senior.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {senior.course} • Year {senior.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{senior.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {senior.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {senior.skills.slice(0, 3).map((sk) => (
                    <span key={sk} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  <strong className="text-indigo-600 font-semibold">{senior.mentorshipCount || 0}</strong> mentored
                </span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  Connect <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Popular Questions & Latest Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Questions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Trending Doubts & Discussions
              </h3>
              <p className="text-xs text-slate-400">Frequently asked student questions</p>
            </div>
            <button
              onClick={() => onNavigateTab('questions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {recentQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => onNavigateTab('questions')}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-100 transition cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 bg-white rounded-md font-semibold text-slate-700 border border-slate-200">
                    {q.category}
                  </span>
                  <span>{q.answerCount || 0} answers</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{q.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{q.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Resources */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" /> High-Yield Study Materials
              </h3>
              <p className="text-xs text-slate-400">Handouts and placement roadmaps</p>
            </div>
            <button
              onClick={() => onNavigateTab('resources')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {recentResources.map((r) => (
              <div
                key={r.id}
                onClick={() => onNavigateTab('resources')}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-purple-50/50 border border-slate-100 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white text-purple-700 rounded-md text-[10px] font-bold border border-slate-200">
                      {r.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{r.fileSize || '3.5 MB'}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">{r.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">By {r.uploaderName} • {r.college}</p>
                </div>

                <span className="text-xs font-bold text-indigo-600 shrink-0">
                  {r.downloads || 0} downloads
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
