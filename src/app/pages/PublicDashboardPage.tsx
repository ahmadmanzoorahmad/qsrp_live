import { 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  BarChart3,
  PieChart
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { dashboardStats, ministries } from "../data/mockData";

export function PublicDashboardPage() {
  const colors = {
    primary: "#059669",
    secondary: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Public Transparency Dashboard</h1>
        <p className="text-slate-600">
          Real-time insights into public consultation activity, ministry performance, and consultation trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {dashboardStats.totalDocuments}
          </div>
          <div className="text-sm text-slate-600">Total Documents Published</div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            {dashboardStats.underReview} currently under review
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {dashboardStats.totalFeedback.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Total Public Feedback</div>
          <div className="mt-2 text-xs text-slate-500">
            From {dashboardStats.publicParticipants.toLocaleString()} participants
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {dashboardStats.resolved.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Issues Resolved</div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            {Math.round((dashboardStats.resolved / dashboardStats.totalFeedback) * 100)}% resolution rate
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <BarChart3 className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {dashboardStats.avgResponseTime} days
          </div>
          <div className="text-sm text-slate-600">Average Response Time</div>
          <div className="mt-2 text-xs text-orange-600 font-medium">
            {dashboardStats.pending} pending responses
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Feedback Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Feedback Trend (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardStats.feedbackTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="submitted" 
                stroke={colors.primary} 
                strokeWidth={2}
                name="Submitted"
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke={colors.info} 
                strokeWidth={2}
                name="Resolved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ministry Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Ministry Response Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardStats.ministryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="ministry" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="onTime" stackId="a" fill={colors.primary} name="On Time %" />
              <Bar dataKey="delayed" stackId="a" fill={colors.danger} name="Delayed %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Document Category Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.categoryDistribution.map((cat, index) => {
            const chartColors = [colors.primary, colors.info, colors.warning, "#8b5cf6"];
            return (
              <div key={index} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-slate-900">{cat.category}</span>
                  <PieChart className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {cat.count}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${cat.percentage}%`,
                        backgroundColor: chartColors[index]
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ministry Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Ministry Performance Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ministry / Authority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Pending Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Avg Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {ministries.map((ministry) => {
                const performance = ministry.avgResponseTime <= 7 ? "excellent" : 
                                   ministry.avgResponseTime <= 10 ? "good" : "needs-improvement";
                return (
                  <tr key={ministry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{ministry.shortName}</div>
                      <div className="text-sm text-slate-500">{ministry.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {ministry.totalDocuments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ministry.pendingTickets > 30 
                          ? "bg-red-100 text-red-700"
                          : ministry.pendingTickets > 20
                          ? "bg-orange-100 text-orange-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {ministry.pendingTickets}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {ministry.avgResponseTime} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        performance === "excellent"
                          ? "bg-emerald-100 text-emerald-700"
                          : performance === "good"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {performance === "excellent" ? "Excellent" : 
                         performance === "good" ? "Good" : "Needs Improvement"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">About This Dashboard</h3>
            <p className="text-sm text-blue-700">
              This dashboard provides real-time transparency into the public consultation process. 
              All data is updated continuously to reflect current status of documents, feedback, and ministry responses. 
              Performance metrics help ensure accountability and time-bound responses to public input.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
