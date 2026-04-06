import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User, Shield, CheckCircle2, RotateCcw, ArrowRight, Briefcase,
  Scale, Building2, Star, AlertCircle, Zap, Lock, Eye, EyeOff
} from "lucide-react";
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "../contexts/AuthContext";
import { DEMO_USERS, LIVE_USERS, type User as DBUser } from "../data/database";
import type { UserRole } from "../data/database";

const DEMO_PROFILE_GROUPS = [
  {
    label: "Public Submitters",
    description: "Submitters and organizations who submit feedback on documents",
    icon: User,
    color: "bg-slate-50 border-slate-200",
    iconColor: "bg-slate-100 text-slate-600",
    users: DEMO_USERS.filter(u => u.role === "public"),
  },
  {
    label: "Ministry Reviewers",
    description: "Government officials who review and respond to public feedback",
    icon: Briefcase,
    color: "bg-blue-50 border-blue-200",
    iconColor: "bg-blue-100 text-blue-700",
    users: DEMO_USERS.filter(u => u.role === "ministry_reviewer"),
  },
  {
    label: "Approvers",
    description: "Committee members who make final decisions on feedback",
    icon: CheckCircle2,
    color: "bg-purple-50 border-purple-200",
    iconColor: "bg-purple-100 text-purple-700",
    users: DEMO_USERS.filter(u => u.role === "approver"),
  },
  {
    label: "Admin / PDA",
    description: "Portal administrators managing the full system",
    icon: Shield,
    color: "bg-amber-50 border-amber-200",
    iconColor: "bg-amber-100 text-amber-700",
    users: DEMO_USERS.filter(u => u.role === "admin"),
  },
  {
    label: "Super Admin",
    description: "Director-level authority with full system access",
    icon: Star,
    color: "bg-red-50 border-red-200",
    iconColor: "bg-red-100 text-red-700",
    users: DEMO_USERS.filter(u => u.role === "super_admin"),
  },
];

const LIVE_GROUPS = [
  {
    label: "Submitter",
    description: "Registered submitter who submits feedback on public documents",
    color: "bg-slate-50 border-slate-200",
    iconColor: "bg-slate-100 text-slate-600",
    users: LIVE_USERS.filter(u => u.role === "public"),
  },
  {
    label: "Ministry Reviewer",
    description: "Government official who reviews and responds to submitted feedback",
    color: "bg-blue-50 border-blue-200",
    iconColor: "bg-blue-100 text-blue-700",
    users: LIVE_USERS.filter(u => u.role === "ministry_reviewer"),
  },
  {
    label: "Approver",
    description: "Committee approver who makes binding decisions on feedback",
    color: "bg-purple-50 border-purple-200",
    iconColor: "bg-purple-100 text-purple-700",
    users: LIVE_USERS.filter(u => u.role === "approver"),
  },
  {
    label: "Legal Committee",
    description: "Legal reviewer who validates regulatory compliance and legal implications",
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "bg-indigo-100 text-indigo-700",
    users: LIVE_USERS.filter(u => u.role === "legal_committee"),
  },
  {
    label: "Executive",
    description: "Executive Secretary with read-only oversight across all ministries",
    color: "bg-cyan-50 border-cyan-200",
    iconColor: "bg-cyan-100 text-cyan-700",
    users: LIVE_USERS.filter(u => u.role === "executive"),
  },
  {
    label: "Auditor",
    description: "Platform auditor with cross-ministry read access and audit trail",
    color: "bg-teal-50 border-teal-200",
    iconColor: "bg-teal-100 text-teal-700",
    users: LIVE_USERS.filter(u => u.role === "auditor"),
  },
  {
    label: "Uploader",
    description: "Ministry document uploader – uploads and manages documents on behalf of ministries",
    color: "bg-orange-50 border-orange-200",
    iconColor: "bg-orange-100 text-orange-700",
    users: LIVE_USERS.filter(u => u.role === "uploader"),
  },
  {
    label: "Admin",
    description: "Portal administrator – manage document lifecycle and users",
    color: "bg-amber-50 border-amber-200",
    iconColor: "bg-amber-100 text-amber-700",
    users: LIVE_USERS.filter(u => u.role === "admin"),
  },
  {
    label: "Super Admin",
    description: "Director General – full system control",
    color: "bg-red-50 border-red-200",
    iconColor: "bg-red-100 text-red-700",
    users: LIVE_USERS.filter(u => u.role === "super_admin"),
  },
];

function LiveUserCard({ profile, onLogin, loading }: { profile: DBUser; onLogin: (u: DBUser) => void; loading: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all hover:border-emerald-300">
      <div className="flex items-start gap-4 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 bg-emerald-100 text-emerald-700">
          {profile.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 truncate">{profile.name}</div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">{profile.designation}</div>
          {profile.ministry && (
            <div className="text-xs text-slate-400 mt-0.5 truncate">{profile.ministry}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[profile.role as UserRole]}`}>
          {ROLE_LABELS[profile.role as UserRole]}
        </span>
        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Live</span>
      </div>

      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">Email:</span>
          <span className="font-semibold">{profile.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
          <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="text-slate-400">Pass:</span>
          <span className="font-semibold flex-1">{showPassword ? profile.password : '••••••'}</span>
          <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <button
        onClick={() => onLogin(profile)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
      >
        {loading ? "Logging in..." : (
          <>
            <Zap className="w-4 h-4" />
            Login with Credentials
          </>
        )}
      </button>
    </div>
  );
}

export function DemoAccessPage() {
  const { loginAs, login, resetDemo } = useAuth();
  const navigate = useNavigate();
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'demo' | 'live'>('demo');

  const handleLoginAs = async (user: DBUser) => {
    setLoggingIn(user.id);
    setError("");
    try {
      await loginAs(user.id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoggingIn(null);
    }
  };

  const handleLiveLogin = async (user: DBUser) => {
    setLoggingIn(user.id);
    setError("");
    try {
      await login(user.email, user.password!);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Make sure demo mode is active or try Live mode.");
    } finally {
      setLoggingIn(null);
    }
  };

  const handleReset = async () => {
    if (!confirm("This will reset all demo data to its original state. Any feedback you submitted will be lost. Continue?")) return;
    setResetting(true);
    try {
      await resetDemo();
      window.location.reload();
    } catch {
      setError("Failed to reset demo data");
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">Account Access</div>
              <h1 className="text-3xl font-bold">QSRP Access Portal</h1>
            </div>
          </div>
          <p className="text-emerald-100 max-w-2xl text-lg">
            Explore the full QSRP platform as any role. Demo profiles log in instantly.
            Live credential accounts require passwords and demonstrate real authentication.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span>All data is browser-local only — no production systems affected</span>
            </div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
              {resetting ? "Resetting..." : "Reset Demo Data"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'demo'
                ? 'bg-amber-500 text-amber-950'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            Demo Profiles (11)
            <span className="text-xs">No password required</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4" />
            Live Credentials (9)
            <span className="text-xs">Password authentication</span>
          </button>
        </div>

        {/* Demo Profiles Tab */}
        {activeTab === 'demo' && (
          <div className="space-y-10">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <AlertCircle className="inline w-4 h-4 mr-1" />
              Demo profiles bypass password checks. Click "Login as this Profile" to log in instantly.
            </div>

            {DEMO_PROFILE_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${group.iconColor}`}>
                    <group.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{group.label}</h2>
                    <p className="text-sm text-slate-500">{group.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.users.map((profile) => (
                    <div
                      key={profile.id}
                      className={`bg-white border-2 ${group.color} rounded-2xl p-5 hover:shadow-md transition-all`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${group.iconColor}`}>
                          {profile.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{profile.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{profile.designation}</div>
                          {profile.ministry && (
                            <div className="text-xs text-slate-400 mt-0.5 truncate">{profile.ministry}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[profile.role as UserRole]}`}>
                          {ROLE_LABELS[profile.role as UserRole]}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono mb-4 truncate">{profile.email}</div>

                      <button
                        onClick={() => handleLoginAs(profile)}
                        disabled={loggingIn === profile.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
                      >
                        {loggingIn === profile.id ? (
                          "Logging in..."
                        ) : (
                          <>
                            Login as this Profile
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Credentials Tab */}
        {activeTab === 'live' && (
          <div className="space-y-8">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
              <Zap className="inline w-4 h-4 mr-1" />
              Live credentials use real password authentication. These accounts work in both Demo and Live mode.
              Each account has a fixed password that must be entered correctly.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LIVE_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${group.iconColor}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{group.label}</div>
                      <div className="text-xs text-slate-500">{group.description}</div>
                    </div>
                  </div>
                  {group.users.map(profile => (
                    <LiveUserCard
                      key={profile.id}
                      profile={profile}
                      onLogin={handleLiveLogin}
                      loading={loggingIn === profile.id}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Credentials summary table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Quick Reference — All Live Credentials</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Password</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {LIVE_USERS.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="px-6 py-3 font-mono text-slate-600">{u.email}</td>
                        <td className="px-6 py-3 font-mono font-semibold text-emerald-600">{u.password}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role as UserRole]}`}>
                            {ROLE_LABELS[u.role as UserRole]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About Demo Mode vs Live Mode</h3>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li>• <strong>Demo Mode:</strong> All data is stored locally in your browser. Demo profiles log in instantly with no password.</li>
                <li>• <strong>Live Mode:</strong> Only accounts with passwords (the 8 live credentials above) are accessible.</li>
                <li>• <strong>End-to-end workflow:</strong> Login as Submitter → Submit feedback → Login as Reviewer → Review → Login as Approver → Decide.</li>
                <li>• Use "Reset Demo Data" to restore the original sample data at any time.</li>
                <li>• In Live Mode, only <code className="bg-blue-100 px-1 rounded">@gov.pk</code> emails can be assigned government roles by an administrator.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
