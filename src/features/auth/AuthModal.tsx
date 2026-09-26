import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Mail,
  User,
  School,
  Briefcase
} from 'lucide-react';
import { COLLEGES, DEPARTMENTS, COURSES, SKILLS_LIST } from '../../core/constants';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isNoAccountFound, setIsNoAccountFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'junior' | 'senior'>('junior');
  const [college, setCollege] = useState(COLLEGES[0]);
  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [customCollege, setCustomCollege] = useState('');
  const [course, setCourse] = useState(COURSES[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDept, setCustomDept] = useState('');
  const [year, setYear] = useState<number>(2);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < 6) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsNoAccountFound(false);
    setLoading(true);
    try {
      await login(email, password);
      onClose?.();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('NO_ACCOUNT_FOUND') || msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        setIsNoAccountFound(true);
        setError('No account found for this email. If you have not registered yet, click "Create Account" below, or choose a 1-Click Demo Account.');
      } else {
        setError(msg.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (demoRole: 'junior' | 'senior' | 'lpu_senior' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo(demoRole);
      confetti({ particleCount: 70, spread: 60 });
      onClose?.();
    } catch (err: any) {
      setError('Failed to sign in to demo account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegisterWithCurrentCreds = () => {
    setIsLogin(false);
    setError(null);
    setIsNoAccountFound(false);
    if (!name && email) {
      const extractedName = email.split('@')[0].replace(/[._]/g, ' ');
      setName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1));
    }
    setStep(2); // Go to academic details step since email & password are typed
  };

  const handleRegisterSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const finalCollege = (isCustomCollege && customCollege.trim()) ? customCollege.trim() : college;
      const finalDepartment = (isCustomDept && customDept.trim()) ? customDept.trim() : department;

      await register(email, password, {
        name,
        role,
        college: finalCollege,
        course,
        department: finalDepartment,
        year,
        skills: selectedSkills,
        subjects: selectedSkills.slice(0, 3),
        bio: bio || (role === 'senior' ? 'Enthusiastic senior ready to guide juniors with academics & placements!' : 'Junior student curious about tech and learning.')
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onClose?.();
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '') || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header Accent */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-7 text-white text-center relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition text-xs"
              title="Close"
            >
              ✕
            </button>
          )}

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mb-2 ring-4 ring-white/10">
            <GraduationCap className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">JuniorConnect</h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            {isLogin 
              ? 'Campus Sign In & 1-Click Demo Profiles' 
              : `Step ${step} of 3: ${step === 1 ? 'Account Setup' : step === 2 ? 'Academic Details' : 'Skills & Role'}`}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="font-semibold">{error}</div>
              {isNoAccountFound && (
                <button
                  type="button"
                  onClick={handleSwitchToRegisterWithCurrentCreds}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Create Account with this Email Now
                </button>
              )}
            </div>
          )}

          {isLogin ? (
            /* =================== LOGIN VIEW =================== */
            <div className="space-y-5">
              {/* 1-Click Quick Demo Accounts Bar */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> 1-Click Instant Demo Login
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold">No password needed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoSignIn('junior')}
                    className="p-2 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 rounded-xl text-xs font-semibold border border-indigo-200/80 transition flex flex-col items-center justify-center text-center shadow-xs"
                  >
                    <span className="text-base mb-0.5">🎒</span>
                    <span>Junior</span>
                    <span className="text-[9px] opacity-75">Rohan (2nd Yr)</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoSignIn('lpu_senior')}
                    className="p-2 bg-white hover:bg-emerald-600 hover:text-white text-slate-800 rounded-xl text-xs font-semibold border border-emerald-300 transition flex flex-col items-center justify-center text-center shadow-xs ring-1 ring-emerald-200"
                  >
                    <span className="text-base mb-0.5">🎓</span>
                    <span>LPU Senior</span>
                    <span className="text-[9px] opacity-75">Aman (LPU CSE)</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoSignIn('senior')}
                    className="p-2 bg-white hover:bg-purple-600 hover:text-white text-slate-800 rounded-xl text-xs font-semibold border border-purple-200/80 transition flex flex-col items-center justify-center text-center shadow-xs"
                  >
                    <span className="text-base mb-0.5">🎓</span>
                    <span>Senior</span>
                    <span className="text-[9px] opacity-75">Aarav (Stanford)</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoSignIn('admin')}
                    className="p-2 bg-white hover:bg-slate-800 hover:text-white text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition flex flex-col items-center justify-center text-center shadow-xs"
                  >
                    <span className="text-base mb-0.5">🛡️</span>
                    <span>Admin</span>
                    <span className="text-[9px] opacity-75">Moderator</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or sign in with email</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    <span>University / College Email <span className="text-rose-500 font-bold">*</span></span>
                    <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@stanford.edu or student@lpu.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <span>Password <span className="text-rose-500 font-bold">*</span></span>
                    </label>
                    <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory (min 6)</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Campus'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsLogin(false); setStep(1); setError(null); }}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Create JuniorConnect Account
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* =================== ONBOARDING & REGISTRATION WIZARD =================== */
            <div>
              {/* Progress bar & Mandatory legend */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs mb-4 pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-700">
                  Step {step} of 3: {step === 1 ? 'Personal Details' : step === 2 ? 'Academic Info' : 'Role & Focus Areas'}
                </span>
                <span className="text-rose-600 font-bold text-[11px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <span className="text-sm font-extrabold leading-none">*</span> Fields marked are mandatory
                </span>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <span>Full Name <span className="text-rose-500 font-bold">*</span></span>
                      <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <span>College Email Address <span className="text-rose-500 font-bold">*</span></span>
                      <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmail(val);
                          if (val.toLowerCase().includes('lpu')) {
                            setCollege('Lovely Professional University (LPU)');
                            setIsCustomCollege(false);
                          }
                        }}
                        placeholder="e.g. yourname@lpu.in or personal email"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    {email.toLowerCase().includes('lpu') ? (
                      <div className="mt-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Lovely Professional University (LPU) auto-detected from your email!</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Works with any college email (e.g. .edu, .ac.in, @lpu.in) or personal email.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <span>Create Password <span className="text-rose-500 font-bold">*</span></span>
                      <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory (min 6 chars)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!name.trim()) {
                        setError('Full Name is mandatory.');
                        return;
                      }
                      if (!email.trim() || !email.includes('@')) {
                        setError('A valid College Email Address is mandatory.');
                        return;
                      }
                      if (password.length < 6) {
                        setError('Password is mandatory and must be at least 6 characters.');
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    Next: Academic Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <span>College / University <span className="text-rose-500 font-bold">*</span></span>
                        <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCollege(!isCustomCollege)}
                        className="text-[11px] text-indigo-600 font-bold hover:underline"
                      >
                        {isCustomCollege ? 'Pick from list' : '+ Type my college'}
                      </button>
                    </div>

                    {/* Quick Select Campus Pills */}
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span>Quick Select:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '🎓 LPU (Lovely Professional University)', val: 'Lovely Professional University (LPU)' },
                          { label: '🏛️ IIT Delhi', val: 'Indian Institute of Technology (IIT) Delhi' },
                          { label: '🏛️ IIT Bombay', val: 'Indian Institute of Technology (IIT) Bombay' },
                          { label: '⚡ BITS Pilani', val: 'BITS Pilani' },
                          { label: '🌲 Stanford', val: 'Stanford University' }
                        ].map((item) => {
                          const isSelected = !isCustomCollege && college === item.val;
                          return (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setCollege(item.val);
                                setIsCustomCollege(false);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {item.label}
                              {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isCustomCollege ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          required
                          value={customCollege}
                          onChange={(e) => setCustomCollege(e.target.value)}
                          placeholder="Type your exact college or university name..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                        {(customCollege.toLowerCase().includes('lpu') || customCollege.toLowerCase().includes('lovely')) && (
                          <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700 flex items-center justify-between">
                            <span>Did you mean <strong>Lovely Professional University (LPU)</strong>?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCollege('Lovely Professional University (LPU)');
                                setIsCustomCollege(false);
                                setCustomCollege('');
                              }}
                              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700"
                            >
                              Select LPU
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <select
                        value={college}
                        onChange={(e) => {
                          if (e.target.value === 'OTHER_CUSTOM') {
                            setIsCustomCollege(true);
                          } else {
                            setCollege(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-800"
                      >
                        <option value="Lovely Professional University (LPU)">🎓 Lovely Professional University (LPU)</option>
                        <option value="Lovely Professional University (LPU)">🎓 LPU - Lovely Professional University</option>
                        {COLLEGES.filter(c => c !== 'Lovely Professional University (LPU)').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="OTHER_CUSTOM">+ Other (Type your College Name)</option>
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        <span>Degree / Course <span className="text-rose-500 font-bold">*</span></span>
                        <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1 py-0.5 rounded border border-rose-100">Mandatory</span>
                      </label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {COURSES.map((cr) => (
                          <option key={cr} value={cr}>{cr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        <span>Current Year <span className="text-rose-500 font-bold">*</span></span>
                        <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1 py-0.5 rounded border border-rose-100">Mandatory</span>
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={1}>1st Year (Freshman)</option>
                        <option value={2}>2nd Year (Sophomore)</option>
                        <option value={3}>3rd Year (Junior)</option>
                        <option value={4}>4th Year (Senior)</option>
                        <option value={5}>Postgrad / Final</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <span>Department / Branch <span className="text-rose-500 font-bold">*</span></span>
                        <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomDept(!isCustomDept)}
                        className="text-[11px] text-indigo-600 font-bold hover:underline"
                      >
                        {isCustomDept ? 'Pick from list' : '+ Type my branch'}
                      </button>
                    </div>

                    {isCustomDept ? (
                      <input
                        type="text"
                        required
                        value={customDept}
                        onChange={(e) => setCustomDept(e.target.value)}
                        placeholder="e.g. Artificial Intelligence & Machine Learning..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    ) : (
                      <select
                        value={department}
                        onChange={(e) => {
                          if (e.target.value === 'OTHER_DEPT') {
                            setIsCustomDept(true);
                          } else {
                            setDepartment(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                        <option value="OTHER_DEPT">+ Other (Type your Branch)</option>
                      </select>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const chosenCollege = (isCustomCollege ? customCollege : college).trim();
                        if (!chosenCollege) {
                          setError('College / University is mandatory. Please pick or type your college.');
                          return;
                        }
                        const chosenDept = (isCustomDept ? customDept : department).trim();
                        if (!chosenDept) {
                          setError('Department / Branch is mandatory. Please pick or type your branch.');
                          return;
                        }
                        setError(null);
                        setStep(3);
                      }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
                    >
                      Next: Choose Role & Skills <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      <span>Select Your Role On JuniorConnect <span className="text-rose-500 font-bold">*</span></span>
                      <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('junior')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition ${
                          role === 'junior'
                            ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 text-sm">Junior / Mentee</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Looking for guidance, PYQs, placement notes, and mentorship.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('senior')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition ${
                          role === 'senior'
                            ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 text-sm">Senior / Mentor</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Offer 1-on-1 mentorship, share interview tips & study resources.
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <span>Select Skills / Focus Areas (Up to 5) <span className="text-rose-500 font-bold">*</span></span>
                      <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory (Choose min 1)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                      {SKILLS_LIST.map((skill) => {
                        const active = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                              active
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {skill} {active && '✓'}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSkills.length === 0 && (
                      <p className="text-[10px] text-rose-500 font-medium mt-1">
                        Please select at least 1 skill or subject you are interested in or can guide on.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      <span>Short Bio / Introduction <span className="text-slate-400 font-normal lowercase">(optional)</span></span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={role === 'senior' ? 'e.g. Placed at Microsoft, passionate about DSA & system design...' : 'e.g. 2nd year CS student eager to crack internships...'}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRegisterSubmit}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                    >
                      {loading ? 'Creating Profile...' : 'Complete & Launch JuniorConnect'}
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 text-center mt-4">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(null); }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Sign In instead
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
