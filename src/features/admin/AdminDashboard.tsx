import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, ReportItem } from '../../types';
import { userRepository, reportRepository } from '../../services/dataService';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  Check, 
  Ban, 
  Award, 
  FileText, 
  Activity,
  Trash2,
  Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const allUsers = await userRepository.getAllUsers();
      const allReports = await reportRepository.getOpenReports();
      setUsers(allUsers);
      setReports(allReports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (u: UserProfile) => {
    await userRepository.updateProfile(u.id, { isVerified: !u.isVerified });
    setUsers(users.map(item => item.id === u.id ? { ...item, isVerified: !item.isVerified } : item));
  };

  const toggleSuspension = async (u: UserProfile) => {
    await userRepository.updateProfile(u.id, { isSuspended: !u.isSuspended });
    setUsers(users.map(item => item.id === u.id ? { ...item, isSuspended: !item.isSuspended } : item));
  };

  const handleResolveReport = async (repId: string) => {
    await reportRepository.resolveReport(repId);
    setReports(reports.filter(r => r.id !== repId));
  };

  const totalSeniors = users.filter(u => u.role === 'senior').length;
  const totalJuniors = users.filter(u => u.role === 'junior').length;
  const verifiedMentors = users.filter(u => u.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-500/30">
            <Lock className="w-3.5 h-3.5" />
            University Campus Administration & Trust
          </div>
          <h1 className="text-2xl font-bold">Admin Moderation Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review academic verification requests, manage reports, and ensure safety across campus mentorship threads.
          </p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'reports' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Reports ({reports.length})
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Registered</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Senior Mentors</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{totalSeniors}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Verified Badges</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{verifiedMentors}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Flagged Reports</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{reports.length}</div>
        </div>
      </div>

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Registered Students & Mentors</h3>
            <span className="text-xs text-slate-400">Click to toggle campus verification status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">College & Department</th>
                  <th className="p-3.5">Rating / Sessions</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover bg-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            {u.name}
                            {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'senior' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">{u.college}</div>
                      <div className="text-[10px] text-slate-400">{u.course} • Year {u.year}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-amber-600">★ {u.rating?.toFixed(1) || '5.0'}</div>
                      <div className="text-[10px] text-slate-400">{u.mentorshipCount || 0} mentored</div>
                    </td>

                    <td className="p-3.5">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => toggleVerification(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                          u.isVerified
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {u.isVerified ? 'Verified ✓' : 'Verify Mentor'}
                      </button>

                      <button
                        onClick={() => toggleSuspension(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                          u.isSuspended
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isSuspended ? 'Reinstate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reports Management */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500" />
              <p className="text-sm font-semibold text-slate-800">Campus Integrity Clear!</p>
              <p className="text-xs text-slate-400">Zero active student moderation flags.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold uppercase">
                      Target: {rep.targetType}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{rep.targetTitleOrName}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Reported by {rep.reporterName}:</strong> "{rep.reason}"
                  </p>
                </div>

                <button
                  onClick={() => handleResolveReport(rep.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0"
                >
                  Mark Resolved
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
