import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FileText, MessageSquare, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Users, BarChart3, ArrowUpRight, Shield, Building2,
  Activity, Zap
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { documentDB, ticketDB, userDB } from "../data/database";
import { dashboardStats, ministries } from "../data/mockData";
import { useAuth, canAccessAdminDashboard } from "../contexts/AuthContext";

const STATUS_COLORS: Record<string, string> = {
  "Submitted": "bg-slate-100 text-slate-700",
  "Acknowledged": "bg-blue-100 text-blue-700",
  "AI Triaged": "bg-indigo-100 text-indigo-700",
  "Assigned": "bg-cyan-100 text-cyan-700",
  "In Review": "bg-yellow-100 text-yellow-700",
  "Awaiting Department Response": "bg-orange-100 text-orange-700",
  "Awaiting Legal Review": "bg-purple-100 text-purple-700",
  "Committee Review": "bg-violet-100 text-violet-700",
  "Approved": "bg-green-100 text-green-700",
  "Partially Approved": "bg-teal-100 text-teal-700",
  "Rejected": "bg-red-100 text-red-700",
  "Escalated": "bg-rose-100 text-rose-700",
  "Closed": "bg-slate-100 text-slate-500",
};

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0, totalUsers: 0, totalTickets: 0,
    openReviews: 0, pendingTickets: 0, resolvedTickets: 0,
    escalatedTickets: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [docs, users, tickets] = await Promise.all([
        documentDB.getAll(), userDB.getAll(), ticketDB.getAll()
      ]);
      const openReviews = docs.filter(d => d.status === "Public Review Open").length;
      const pending = tickets.filter(t => !["Approved", "Rejected", "Closed"].includes(t.status)).length;
      const resolved = tickets.filter(t => ["Approved", "Rejected", "Closed"].includes(t.status)).length;
      const escalated = tickets.filter(t => t.escalationLevel > 0).length;

      setStats({
        totalDocuments: docs.length,
        totalUsers: users.length,
        totalTickets: tickets.length,
        openReviews,
        pendingTickets: pending,
        resolvedTickets: resolved,
        escalatedTickets: escalated,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!canAccessAdminDashboard(user?.role)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-600">This dashboard is only accessible to Admin and Super Admin users.</p>
        <Link to="/" className="mt-6 inline-block text-emerald-600 font-semibold hover:text-emerald-700">← Back to Home</Link>
      </div>
    );
  }

  const topStats = [
    { label: "Total Documents", value: dashboardStats.totalDocuments, sub: `${dashboardStats.underReview} under review`, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", trend: "+12" },
    { label: "Total Feedback", value: dashboardStats.totalFeedback.toLocaleString(), sub: `${stats.pendingTickets} pending`, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50", trend: "+8.3%" },
    { label: "Issues Resolved", value: dashboardStats.resolved.toLocaleString(), sub: `${Math.round(dashboardStats.resolved / dashboardStats.totalFeedback * 100)}% resolution rate`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+5.1%" },
    { label: "Avg Response Time", value: `${dashboardStats.avgResponseTime} days`, sub: "Across all ministries", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", trend: "-0.8 days" },
    { label: "Active Escalations", value: dashboardStats.escalations, sub: "Requiring attention", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", trend: "+3" },
    { label: "Public Participants", value: dashboardStats.publicParticipants.toLocaleString(), sub: "Unique submitters", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+124" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Pakistan Digital Authority – System Overview</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/role-management" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Users className="w-4 h-4" />
            Manage Roles
          </Link>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {topStats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{s.trend}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{loading ? "—" : s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Feedback Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Feedback Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly submission vs resolution</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span> Submitted
              <span className="w-3 h-1 bg-blue-500 rounded-full inline-block ml-2"></span> Resolved
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dashboardStats.feedbackTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="submitted" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Submitted" />
              <Line type="monotone" dataKey="resolved" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Document Categories</h3>
          <p className="text-xs text-slate-500 mb-5">Distribution by type</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={dashboardStats.categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="count"
                nameKey="category"
              >
                {dashboardStats.categoryDistribution.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {dashboardStats.categoryDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-slate-700">{item.category}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ministry Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Ministry Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">On-time vs delayed responses</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dashboardStats.ministryPerformance} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <YAxis type="category" dataKey="ministry" tick={{ fontSize: 11, fill: '#64748b' }} width={40} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} formatter={(v) => `${v}%`} />
              <Bar dataKey="onTime" name="On-Time" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#fca5a5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ministry table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Ministry Summary</h3>
          <p className="text-xs text-slate-500 mb-5">Pending workloads and SLA metrics</p>
          <div className="space-y-3">
            {ministries.map((m) => {
              const onTimePct = dashboardStats.ministryPerformance.find(p => p.ministry === m.shortName)?.onTime ?? 0;
              const perfColor = onTimePct >= 80 ? "text-emerald-600 bg-emerald-50" : onTimePct >= 65 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
              const perfLabel = onTimePct >= 80 ? "Good" : onTimePct >= 65 ? "Average" : "Needs Attention";
              return (
                <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                      {m.shortName.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{m.shortName}</div>
                      <div className="text-xs text-slate-500">{m.pendingTickets} pending · {m.avgResponseTime}d avg</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${perfColor}`}>{perfLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white">
        <h3 className="font-semibold mb-1">Admin Quick Actions</h3>
        <p className="text-emerald-100 text-sm mb-5">Manage portal settings and user access</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Manage Users & Roles", to: "/role-management", icon: Users },
            { label: "View All Tickets", to: "/ministry-dashboard", icon: MessageSquare },
            { label: "Browse Documents", to: "/documents", icon: FileText },
            { label: "Public Dashboard", to: "/dashboard", icon: Activity },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
