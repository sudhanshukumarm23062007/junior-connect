import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Briefcase, 
  Clock, 
  Star, 
  LogOut, 
  Save, 
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { SKILLS_LIST, COLLEGES, DEPARTMENTS } from '../../core/constants';
import confetti from 'canvas-confetti';

interface StudentProfileViewProps {
  onRequireAuth?: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ onRequireAuth }) => {
  const { profile, logout, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [availability, setAvailability] = useState(profile?.availability || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Student Profile</h2>
        <p className="text-xs text-slate-500">
          Sign in to access your student ID card, manage mentorship hours, and showcase technical skills to peers.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      if (skills.length < 8) {
        setSkills([...skills, skill]);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { userRepository } = await import('../../services/dataService');
      await userRepository.updateProfile(profile.id, {
        bio,
        availability,
        skills
      });
      await refreshProfile();
      setEditing(false);
      setSavedSuccess(true);
      confetti({ particleCount: 50, spread: 60 });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Student ID Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-slate-100"
                />
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    profile.role === 'senior' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {profile.role === 'senior' ? 'Senior Mentor' : 'Junior Student'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{profile.college}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile.course} • {profile.department} • Year {profile.year}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition self-start sm:self-auto"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{profile.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Overall Rating</div>
            </div>
            <div className="text-center border-x border-slate-200">
              <div className="text-sm font-bold text-indigo-600">{profile.mentorshipCount || 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">1-on-1 Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-purple-600">{profile.reviewCount || 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Peer Reviews</div>
            </div>
          </div>

          {savedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          {editing ? (
            /* Editing Form */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Bio / Introduction
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell campus juniors about your technical interests or domain focus..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Weekly Mentorship Availability
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri • 6:00 PM - 8:30 PM EST"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Skills & Subject Doubts You Can Help With
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {SKILLS_LIST.map((s) => {
                    const active = skills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s} {active && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* Readonly Details */
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About Me</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  {profile.bio || 'JuniorConnect student member. Active across university Q&A and peer mentoring channels.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Skills & Specializations</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((sk) => (
                      <span key={sk} className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium rounded-xl">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No skills added yet. Click Edit Profile to showcase your expertise.</span>
                  )}
                </div>
              </div>

              {profile.availability && (
                <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-purple-950">Active Slots: </span>
                    <span className="text-purple-800">{profile.availability}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
