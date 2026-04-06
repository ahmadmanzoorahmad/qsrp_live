import { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, ArrowRight, Shield, Zap, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROFILES = [
  { id: 'demo-citizen1', label: 'Submitter', email: 'citizen1@any.com', color: 'bg-slate-100 text-slate-700' },
  { id: 'demo-reviewer-moitt', label: 'Ministry Reviewer', email: 'reviewer.moitt@gov.pk', color: 'bg-blue-100 text-blue-700' },
  { id: 'demo-approver-committee1', label: 'Approver', email: 'approver.committee1@gov.pk', color: 'bg-purple-100 text-purple-700' },
  { id: 'demo-admin-pda', label: 'Admin (PDA)', email: 'admin.pda@gov.pk', color: 'bg-amber-100 text-amber-700' },
];

const LIVE_CREDENTIALS = [
  { email: 'ctlive@gov.pk', password: 'ct12345', label: 'Submitter', color: 'bg-slate-100 text-slate-700' },
  { email: 'mrlive@gov.pk', password: 'mr12345', label: 'Reviewer', color: 'bg-blue-100 text-blue-700' },
  { email: 'aplive@gov.pk', password: 'ap12345', label: 'Approver', color: 'bg-purple-100 text-purple-700' },
  { email: 'lelive@gov.pk', password: 'le12345', label: 'Legal', color: 'bg-indigo-100 text-indigo-700' },
  { email: 'exelive@gov.pk', password: 'exe12345', label: 'Executive', color: 'bg-cyan-100 text-cyan-700' },
  { email: 'audlive@gov.pk', password: 'aud12345', label: 'Auditor', color: 'bg-teal-100 text-teal-700' },
  { email: 'uplive@gov.pk', password: 'up12345', label: 'Uploader', color: 'bg-orange-100 text-orange-700' },
  { email: 'adlive@gov.pk', password: 'ad12345', label: 'Admin', color: 'bg-amber-100 text-amber-700' },
  { email: 'salive@gov.pk', password: 'sa12345', label: 'Super Admin', color: 'bg-red-100 text-red-700' },
];

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, loginAs, register, isDemoMode } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingInAs, setLoggingInAs] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, name, password);
      }
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (id: string) => {
    setLoggingInAs(id);
    setError('');
    try {
      await loginAs(id);
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quick login failed');
    } finally {
      setLoggingInAs(null);
    }
  };

  const handleLiveLogin = async (cred: { email: string; password: string }) => {
    setLoggingInAs(cred.email);
    setError('');
    try {
      await login(cred.email, cred.password);
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoggingInAs(null);
    }
  };

  const prefillCredential = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 pt-6 pb-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-emerald-100 text-sm">QSRP – e-Consult Pakistan</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Demo quick access */}
          {isDemoMode && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Demo Login</p>
                <Link
                  to="/demo-access"
                  onClick={onClose}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  All profiles
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROFILES.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => handleQuickLogin(profile.id)}
                    disabled={!!loggingInAs}
                    className="text-left p-3 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group disabled:opacity-50"
                  >
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${profile.color}`}>
                      {profile.label}
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">{profile.email}</div>
                    {loggingInAs === profile.id && (
                      <div className="text-xs text-emerald-600 mt-1">Logging in...</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Credentials Section */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Live Credential Accounts</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LIVE_CREDENTIALS.map(cred => (
                <button
                  key={cred.email}
                  onClick={() => prefillCredential(cred)}
                  disabled={!!loggingInAs}
                  className="text-left p-2.5 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-50"
                >
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${cred.color}`}>
                    {cred.label}
                  </div>
                  <div className="text-xs text-slate-500 font-mono truncate">{cred.email}</div>
                  <div className="text-xs text-slate-400 font-mono">{cred.password}</div>
                  {loggingInAs === cred.email && (
                    <div className="text-xs text-emerald-600 mt-1">Logging in...</div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Click any live account to prefill credentials, then press Login — or use in Live Mode.
            </p>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-medium">or enter credentials manually</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isDemoMode ? "Any password (demo) or live credentials" : "Enter password"}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <span className="text-slate-500">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
