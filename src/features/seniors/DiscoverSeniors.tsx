import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { userRepository } from '../../services/dataService';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { COLLEGES, DEPARTMENTS, COURSES } from '../../core/constants';
import { SeniorProfileModal } from './SeniorProfileModal';

interface DiscoverSeniorsProps {
  onOpenChatWith?: (senior: UserProfile) => void;
  onRequireAuth?: () => void;
}

export const DiscoverSeniors: React.FC<DiscoverSeniorsProps> = ({ onOpenChatWith, onRequireAuth }) => {
  const { profile } = useAuth();
  const [seniors, setSeniors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);

  // Selected Senior Modal
  const [activeSenior, setActiveSenior] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadSeniors();
  }, [selectedCollege, selectedDepartment, selectedYear]);

  const loadSeniors = async () => {
    setLoading(true);
    try {
      const data = await userRepository.getSeniors({
        college: selectedCollege,
        department: selectedDepartment,
        year: selectedYear
      });
      setSeniors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search filtering in memory for instant responsiveness
  const filteredSeniors = seniors.filter((s) => {
    if (minRating > 0 && (s.rating || 5.0) < minRating) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesName = s.name.toLowerCase().includes(q);
    const matchesCollege = s.college.toLowerCase().includes(q);
    const matchesSkills = s.skills.some((sk) => sk.toLowerCase().includes(q));
    const matchesBio = (s.bio || '').toLowerCase().includes(q);
    return matchesName || matchesCollege || matchesSkills || matchesBio;
  });

  return (
    <div className="space-y-6">
      {/* Header and Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Campus Mentorship Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover Experienced Seniors
          </h1>
          <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
            Connect directly with verified 3rd & 4th-year students from your university. Get resume reviews, mock interviews, study resources, and career guidance.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-5 relative max-w-xl">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills (e.g. DSA, Flutter), company or subject..."
              className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter Mentors
          </span>
          {(selectedCollege !== 'All' || selectedDepartment !== 'All' || selectedYear !== 0 || minRating !== 0) && (
            <button
              onClick={() => {
                setSelectedCollege('All');
                setSelectedDepartment('All');
                setSelectedYear(0);
                setMinRating(0);
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">University / College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="All">All Universities</option>
              {COLLEGES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Senior Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value={0}>All Years</option>
              <option value={3}>3rd Year (Junior Senior)</option>
              <option value={4}>4th Year (Final Year)</option>
              <option value={2}>2nd Year (Master's)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5+ Stars ★</option>
              <option value={4.8}>4.8+ Stars ★</option>
            </select>
          </div>
        </div>
      </div>

      {/* Senior Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl border border-slate-200/60" />
          ))}
        </div>
      ) : filteredSeniors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No seniors found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any seniors matching your criteria. Try adjusting the search term or clearing the college/department filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSeniors.map((senior) => (
            <div
              key={senior.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={senior.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={senior.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 bg-slate-100 shadow-sm"
                      />
                      {senior.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full ring-2 ring-white">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {senior.name}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        Year {senior.year} • {senior.department.split('&')[0]}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {senior.college}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-xl text-xs font-bold border border-amber-200/60 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{senior.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {senior.bio || 'Available for 1-on-1 career, placement and academic mentorship.'}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {senior.skills.slice(0, 3).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                  {senior.skills.length > 3 && (
                    <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-medium">
                      +{senior.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-indigo-600">{senior.mentorshipCount || 0}</span> sessions done
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSenior(senior)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  View Profile & Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Senior Profile Modal */}
      {activeSenior && (
        <SeniorProfileModal
          senior={activeSenior}
          isOpen={!!activeSenior}
          onClose={() => setActiveSenior(null)}
          onOpenChatWith={onOpenChatWith}
          onRequireAuth={onRequireAuth}
        />
      )}
    </div>
  );
};
