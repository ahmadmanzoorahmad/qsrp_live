import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Users, Shield, Search, ChevronDown, Check, ArrowLeft,
  AlertTriangle, ToggleLeft, ToggleRight, RefreshCw,
  UserPlus, X, Upload
} from "lucide-react";
import { userDB, type User, type UserRole } from "../data/database";
import { useAuth, canManageRoles, ROLE_LABELS, ROLE_COLORS } from "../contexts/AuthContext";

const ALL_ROLES: UserRole[] = ['public', 'ministry_reviewer', 'approver', 'legal_committee', 'executive', 'auditor', 'uploader', 'admin', 'super_admin'];

const MINISTRIES = [
  "Ministry of Science and Technology",
  "Ministry of Commerce",
  "Ministry of Industries",
  "Ministry of Health",
  "Pakistan Standards & Quality Control Authority",
  "Ministry of Environment",
  "Ministry of Law & Justice",
  "Pakistan Digital Authority",
];

export function RoleManagementPage() {
  const { user: currentUser, updateUserRole, toggleUserActive, addUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [openRoleMenu, setOpenRoleMenu] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    name: '', email: '', password: '', role: 'uploader' as UserRole,
    ministry: '', designation: '',
  });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const all = await userDB.getAll();
      setUsers(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    if (userId === currentUser?.id && (role !== 'admin' && role !== 'super_admin')) {
      showMessage("You cannot demote your own admin account.", "error");
      return;
    }
    setUpdating(userId);
    setOpenRoleMenu(null);
    try {
      await updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      showMessage("Role updated successfully.", "success");
    } catch {
      showMessage("Failed to update role.", "error");
    } finally {
      setUpdating(null);
    }
  }

  async function handleToggleActive(userId: string, current: boolean) {
    if (userId === currentUser?.id) {
      showMessage("You cannot disable your own account.", "error");
      return;
    }
    setUpdating(userId);
    try {
      await toggleUserActive(userId, !current);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !current } : u));
      showMessage(`User ${!current ? "enabled" : "disabled"} successfully.`, "success");
    } catch {
      showMessage("Failed to update user status.", "error");
    } finally {
      setUpdating(null);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddingUser(true);
    try {
      await addUser({
        name: addUserForm.name,
        email: addUserForm.email,
        password: addUserForm.password,
        role: addUserForm.role,
        ministry: addUserForm.ministry || undefined,
        designation: addUserForm.designation || undefined,
      });
      showMessage(`User "${addUserForm.name}" created successfully with role: ${ROLE_LABELS[addUserForm.role]}.`, "success");
      setAddUserForm({ name: '', email: '', password: '', role: 'uploader', ministry: '', designation: '' });
      setShowAddUser(false);
      loadUsers();
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Failed to create user.", "error");
    } finally {
      setAddingUser(false);
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  }

  if (!canManageRoles(currentUser?.role)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-600">Only Admin and Super Admin users can manage roles.</p>
        <Link to="/" className="mt-6 inline-block text-emerald-600 font-semibold">← Back to Home</Link>
      </div>
    );
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = ALL_ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role).length;
    return acc;
  }, {} as Record<UserRole, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/admin-dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Role & User Management</h1>
            <p className="text-slate-500 text-sm">Manage user roles, permissions, and account access</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Add New User — Super Admin only */}
      {currentUser?.role === 'super_admin' && (
        <div className="mb-6">
          {!showAddUser ? (
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          ) : (
            <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 text-sm">Add New User Account</h3>
                    <p className="text-xs text-emerald-700">Create a new live account and assign role & ministry access</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="p-2 hover:bg-emerald-100 rounded-xl transition-colors text-emerald-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddUser} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={addUserForm.name}
                      onChange={e => setAddUserForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Dr. Zara Ahmed"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={addUserForm.email}
                      onChange={e => setAddUserForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="e.g. name@gov.pk"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={addUserForm.password}
                      onChange={e => setAddUserForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Set account password"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={addUserForm.role}
                      onChange={e => setAddUserForm(f => ({ ...f, role: e.target.value as UserRole }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {ALL_ROLES.map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ministry */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Ministry / Organisation
                      {addUserForm.role === 'uploader' && <span className="ml-1 text-orange-600">(required for Uploader)</span>}
                    </label>
                    <select
                      value={addUserForm.ministry}
                      onChange={e => setAddUserForm(f => ({ ...f, ministry: e.target.value }))}
                      required={addUserForm.role === 'uploader'}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">— Select Ministry —</option>
                      {MINISTRIES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation / Title</label>
                    <input
                      type="text"
                      value={addUserForm.designation}
                      onChange={e => setAddUserForm(f => ({ ...f, designation: e.target.value }))}
                      placeholder="e.g. Document Uploader – MoST"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Role preview badge */}
                <div className="flex items-center gap-2 mb-5 p-3 bg-slate-50 rounded-xl">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-600">Account will be created with role:</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[addUserForm.role]}`}>
                    {ROLE_LABELS[addUserForm.role]}
                  </span>
                  {addUserForm.ministry && (
                    <span className="text-xs text-slate-500">— {addUserForm.ministry}</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    {addingUser ? "Creating..." : "Create Account"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Role summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setRoleFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${roleFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}
        >
          All Users ({users.length})
        </button>
        {ALL_ROLES.map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${roleFilter === role ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}
          >
            {ROLE_LABELS[role]} ({roleCounts[role] ?? 0})
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Ministry / Dept</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Current Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${updating === u.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{u.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                        {u.designation && <div className="text-xs text-slate-400">{u.designation}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.ministry ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isDemo
                      ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Demo</span>
                      : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Live</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive !== false
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><div className="w-1.5 h-1.5 rounded-full bg-red-400" />Disabled</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Role dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenRoleMenu(openRoleMenu === u.id ? null : u.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Change Role
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {openRoleMenu === u.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                            {ALL_ROLES.map(role => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(u.id, role)}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <span className={`px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]}</span>
                                {u.role === role && <Check className="w-3 h-3 text-emerald-600" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive !== false)}
                        title={u.isActive !== false ? "Disable account" : "Enable account"}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                      >
                        {u.isActive !== false
                          ? <ToggleRight className="w-5 h-5 text-emerald-600" />
                          : <ToggleLeft className="w-5 h-5 text-slate-400" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Live Mode Role Policy</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Only users with <code className="bg-blue-100 px-1 rounded text-xs">@gov.pk</code> email can be assigned reviewer, approver, admin, or super admin roles.</li>
              <li>• Public users cannot self-upgrade to government roles — all role assignments must be done here by an Admin.</li>
              <li>• Disabling an account immediately terminates any active sessions for that user.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {openRoleMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenRoleMenu(null)} />
      )}
    </div>
  );
}
