import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MentorshipSession, MentorReview } from '../../types';
import { mentorshipRepository } from '../../services/dataService';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Video, 
  Star, 
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface MentorshipSessionsViewProps {
  onRequireAuth?: () => void;
}

export const MentorshipSessionsView: React.FC<MentorshipSessionsViewProps> = ({ onRequireAuth }) => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Review modal state
  const [reviewingSession, setReviewingSession] = useState<MentorshipSession | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const unsub = profile.role === 'senior'
      ? mentorshipRepository.subscribeToMentorSessions(profile.id, (list) => setSessions(list))
      : mentorshipRepository.subscribeToStudentSessions(profile.id, (list) => setSessions(list));

    return () => unsub();
  }, [profile]);

  const handleUpdateStatus = async (sessionId: string, newStatus: MentorshipSession['status'], session: MentorshipSession) => {
    try {
      await mentorshipRepository.updateSessionStatus(sessionId, newStatus, session);
      if (newStatus === 'accepted') {
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update session');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !reviewingSession) return;

    setSubmittingReview(true);
    try {
      await mentorshipRepository.submitReview(
        reviewingSession.id,
        reviewingSession.mentorId,
        rating,
        comment
      );
      setReviewingSession(null);
      setComment('');
      confetti({ particleCount: 80, spread: 70 });
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">1-on-1 Mentorship Sessions</h2>
        <p className="text-xs text-slate-500">
          Sign in to view your scheduled mentorship sessions, join video meetings, or manage bookings.
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

  const upcomingList = sessions.filter(s => s.status === 'requested' || s.status === 'accepted');
  const pastList = sessions.filter(s => s.status === 'completed' || s.status === 'rejected' || s.status === 'cancelled');

  const displayedList = activeTab === 'upcoming' ? upcomingList : pastList;

  return (
    <div className="space-y-6">
      {/* Header and Toggle */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {profile.role === 'senior' ? 'Mentor Availability & Sessions' : 'My Mentorship Bookings'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {sessions.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {profile.role === 'senior' 
              ? 'Review pending booking requests from juniors and launch live video call rooms.' 
              : 'Keep track of scheduled 1-on-1 guidance calls with verified campus seniors.'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'upcoming' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Upcoming ({upcomingList.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'past' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Completed & History ({pastList.length})
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {displayedList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
          <Calendar className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No {activeTab} sessions</p>
          <p className="text-xs text-slate-400">
            {profile.role === 'senior'
              ? 'Incoming student booking requests will appear here.'
              : 'Browse verified seniors in the Discover tab to book a 1-on-1 mentorship call.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedList.map((session) => {
            const isMentor = profile.role === 'senior';
            const partnerName = isMentor ? session.studentName : session.mentorName;
            const partnerAvatar = isMentor ? session.studentAvatar : session.mentorAvatar;

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={partnerName}
                      className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{partnerName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{session.topic}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      session.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : session.status === 'requested'
                        ? 'bg-amber-100 text-amber-800'
                        : session.status === 'completed'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-xs text-slate-600 italic bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/50">
                    "{session.notes}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  {session.status === 'accepted' && (
                    <a
                      href={session.meetingLink || 'https://meet.google.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Video className="w-4 h-4" /> Join Video Call
                    </a>
                  )}

                  {isMentor && session.status === 'requested' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'rejected', session)}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'accepted', session)}
                        className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                      >
                        Accept Booking
                      </button>
                    </div>
                  )}

                  {session.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(session.id, 'completed', session)}
                      className="text-xs text-slate-500 hover:text-indigo-600 font-semibold"
                    >
                      Mark as Completed ✓
                    </button>
                  )}

                  {!isMentor && session.status === 'completed' && !session.rating && (
                    <button
                      onClick={() => setReviewingSession(session)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" /> Leave Review & Rating
                    </button>
                  )}

                  {session.rating && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Rated {session.rating} / 5</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Rate Mentorship Session with {reviewingSession.mentorName}
            </h3>
            <p className="text-xs text-slate-500">
              Your feedback helps maintain high guidance quality across the campus.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Star Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Written Feedback / Review
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Great resume critique! Helped me structure my system design answers."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingSession(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
