import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { connectionRepository, mentorshipRepository, reportRepository } from '../../services/dataService';
import { 
  X, 
  Star, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  Send, 
  ShieldCheck, 
  Award, 
  Briefcase, 
  MessageCircle,
  Flag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeniorProfileModalProps {
  senior: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWith?: (senior: UserProfile) => void;
  onRequireAuth?: () => void;
}

export const SeniorProfileModal: React.FC<SeniorProfileModalProps> = ({
  senior,
  isOpen,
  onClose,
  onOpenChatWith,
  onRequireAuth
}) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'book' | 'reviews'>('about');
  
  // Connection request state
  const [requestSent, setRequestSent] = useState(false);
  const [connectionNote, setConnectionNote] = useState('');
  const [connecting, setConnecting] = useState(false);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState('2026-09-30');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [topic, setTopic] = useState('Resume Review & Placement Guidance');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Report state
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reported, setReported] = useState(false);

  if (!isOpen || !senior) return null;

  const handleSendConnection = async () => {
    if (!profile) {
      onRequireAuth?.();
      return;
    }
    if (profile.id === senior.id) {
      alert("You cannot send a connection request to yourself.");
      return;
    }

    setConnecting(true);
    try {
      await connectionRepository.sendRequest({
        fromUserId: profile.id,
        toUserId: senior.id,
        senderName: profile.name,
        senderAvatar: profile.avatarUrl,
        senderCourse: `${profile.course} (${profile.department})`,
        senderYear: profile.year,
        note: connectionNote.trim() || 'Hi! I would love to connect for guidance.',
        status: 'pending'
      });
      setRequestSent(true);
      confetti({ particleCount: 60, spread: 60 });
    } catch (err: any) {
      alert(err.message || 'Failed to send connection request');
    } finally {
      setConnecting(false);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      onRequireAuth?.();
      return;
    }

    setBookingLoading(true);
    try {
      await mentorshipRepository.requestSession({
        mentorId: senior.id,
        mentorName: senior.name,
        mentorAvatar: senior.avatarUrl,
        studentId: profile.id,
        studentName: profile.name,
        studentAvatar: profile.avatarUrl,
        topic,
        date: selectedDate,
        startTime: selectedTime,
        endTime: `${parseInt(selectedTime.split(':')[0]) + 1}:00`,
        durationMinutes: 45,
        notes: bookingNotes,
        meetingLink: `https://meet.google.com/ais-${Math.random().toString(36).substring(2, 7)}`
      });
      setBookingSuccess(true);
      confetti({ particleCount: 80, spread: 70 });
    } catch (err: any) {
      alert(err.message || 'Failed to request mentorship session');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!profile) return;
    if (!reportReason.trim()) return;

    await reportRepository.submitReport({
      reporterId: profile.id,
      reporterName: profile.name,
      targetType: 'user',
      targetId: senior.id,
      targetTitleOrName: senior.name,
      reason: reportReason
    });
    setReported(true);
    setTimeout(() => {
      setShowReport(false);
      setReported(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Banner with avatar */}
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar and Primary Info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={senior.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={senior.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-slate-100"
                />
                {senior.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Campus Mentor">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{senior.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    Senior • Year {senior.year}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{senior.college}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {senior.course} • {senior.department}
                </div>
              </div>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 py-2 rounded-2xl self-start sm:self-auto">
              <div className="text-center px-1">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{senior.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{senior.reviewCount || 0} reviews</div>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center px-1">
                <div className="text-sm font-bold text-indigo-600">{senior.mentorshipCount || 0}</div>
                <div className="text-[10px] text-slate-400 font-medium">Sessions</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 mb-5 gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2.5 transition border-b-2 ${
                activeTab === 'about'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview & Skills
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'book'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" /> Book 1-on-1 Mentorship
            </button>
          </div>

          {/* Tab 1: About */}
          {activeTab === 'about' && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  {senior.bio || 'Senior mentor available to assist junior peers with academic coursework, project development, internships, and campus guidance.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Skills & Expertise</h4>
                <div className="flex flex-wrap gap-1.5">
                  {senior.skills && senior.skills.length > 0 ? (
                    senior.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium rounded-xl">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Computer Science fundamentals, Data Structures, Software Engineering</span>
                  )}
                </div>
              </div>

              {senior.internships && senior.internships.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Internships & Experience
                  </h4>
                  <div className="space-y-1.5">
                    {senior.internships.map((exp, idx) => (
                      <div key={idx} className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {exp}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {senior.achievements && senior.achievements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Achievements & Honors
                  </h4>
                  <div className="space-y-1.5">
                    {senior.achievements.map((ach, idx) => (
                      <div key={idx} className="text-xs font-medium text-slate-700 bg-amber-50/60 px-3 py-2 rounded-xl border border-amber-100/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {ach}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {senior.availability && (
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-indigo-950">Mentor Availability: </span>
                    <span className="text-indigo-800">{senior.availability}</span>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowReport(!showReport)}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5" /> Report profile
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('book')}
                    className="px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Calendar className="w-4 h-4" /> Book Session
                  </button>

                  <button
                    onClick={handleSendConnection}
                    disabled={connecting || requestSent}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition ${
                      requestSent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {requestSent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Request Sent!
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {connecting ? 'Sending...' : 'Connect With Senior'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Report Drawer */}
              {showReport && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 space-y-2 mt-2">
                  <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Report this student profile for academic dishonesty or inappropriate behavior
                  </div>
                  <input
                    type="text"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Specify the reason..."
                    className="w-full text-xs px-3 py-2 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowReport(false)}
                      className="text-xs px-3 py-1 text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      className="text-xs px-3 py-1 bg-rose-600 text-white rounded-lg font-medium"
                    >
                      {reported ? 'Reported!' : 'Submit Report'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Book 1-on-1 Mentorship */}
          {activeTab === 'book' && (
            <div>
              {bookingSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Mentorship Request Sent!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {senior.name} has been notified. You will receive a confirmation alert and Google Meet link once accepted.
                  </p>
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookSession} className="space-y-3.5">
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      <span>Session Topic <span className="text-rose-500 font-bold">*</span></span>
                      <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Resume Review & Placement Guidance">Resume Review & Placement Guidance</option>
                      <option value="DSA & Coding Mock Interview">DSA & Coding Mock Interview</option>
                      <option value="Project Architecture & Tech Stack Guidance">Project Architecture & Tech Stack Guidance</option>
                      <option value="Semester Exam Strategy & Subject Doubts">Semester Exam Strategy & Subject Doubts</option>
                      <option value="Off-campus & Internship Application Roadmap">Off-campus & Internship Application Roadmap</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        <span>Select Date <span className="text-rose-500 font-bold">*</span></span>
                        <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1 py-0.5 rounded border border-rose-100">Mandatory</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        <span>Time Slot <span className="text-rose-500 font-bold">*</span></span>
                        <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1 py-0.5 rounded border border-rose-100">Mandatory</span>
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="17:00">5:00 PM - 5:45 PM</option>
                        <option value="18:00">6:00 PM - 6:45 PM</option>
                        <option value="19:00">7:00 PM - 7:45 PM</option>
                        <option value="20:00">8:00 PM - 8:45 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      <span>Notes for Mentor <span className="text-slate-400 font-normal lowercase">(optional)</span></span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="e.g. In 2nd year CS, want advice on whether to focus on Web3 or LeetCode."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('about')}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                    >
                      {bookingLoading ? 'Booking...' : 'Confirm Mentorship Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
