import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  FileText, LayoutDashboard, MessageSquare,
  User, LogIn, Menu, X, LogOut, Shield, Users,
  BarChart3, AlertCircle, ChevronDown, Zap, FolderOpen
} from "lucide-react";
import { useState } from "react";
import { useAuth, canAccessMinistryDashboard, canAccessAdminDashboard, canManageDocuments, ROLE_LABELS, ROLE_COLORS } from "../contexts/AuthContext";
import { LoginModal } from "./LoginModal";
import type { UserRole } from "../data/database";

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isDemoMode, setDemoMode } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const ticketsLabel = user && user.role !== 'public' ? "Tickets" : "My Tickets";

  const baseNavigation = [
    { name: "Home", path: "/", icon: LayoutDashboard },
    { name: "Documents", path: "/documents", icon: FileText },
    { name: ticketsLabel, path: "/my-tickets", icon: MessageSquare },
    { name: "Public Dashboard", path: "/dashboard", icon: BarChart3 },
  ];

  const govNavigation = user && canAccessMinistryDashboard(user.role)
    ? [{ name: "Ministry Dashboard", path: "/ministry-dashboard", icon: Users }]
    : [];

  const docMgmtNavigation = user && canManageDocuments(user.role)
    ? [{ name: "Doc Management", path: "/document-management", icon: FolderOpen }]
    : [];

  const adminNavigation = user && canAccessAdminDashboard(user.role)
    ? [{ name: "Admin Dashboard", path: "/admin-dashboard", icon: Shield }]
    : [];

  const navigation = [...baseNavigation, ...govNavigation, ...docMgmtNavigation, ...adminNavigation];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-amber-500 text-amber-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Demo Mode – Sandbox Data. No real data is being used.</span>
              <Link to="/demo-access" className="underline underline-offset-2 hover:no-underline ml-1 hidden sm:inline">
                Switch Profile
              </Link>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/demo-access"
                className="text-xs font-semibold bg-amber-950/10 hover:bg-amber-950/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Demo Access
              </Link>
              <button
                onClick={() => setDemoMode(false)}
                className="text-xs font-semibold bg-amber-950 text-amber-100 hover:bg-amber-950/80 px-3 py-1.5 rounded-lg transition-colors"
              >
                Switch to Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Mode Banner */}
      {!isDemoMode && (
        <div className="bg-emerald-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Live Mode – Real authentication and role-based access enforced</span>
            </div>
            <button
              onClick={() => setDemoMode(true)}
              className="text-xs font-semibold underline underline-offset-2 hover:no-underline"
            >
              Switch to Demo
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/qsrp-logo.png" alt="QSRP – Qanoon & Standards Review Portal" className="h-12 w-auto" />
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-bold text-emerald-800">E-Consult Pakistan</div>
                <div className="text-xs text-slate-500 font-medium">for LAW &amp; Regulations</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-sm font-medium text-slate-900 leading-tight">{user.name}</div>
                      <div className={`text-xs px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${ROLE_COLORS[user.role as UserRole]}`}>
                        {ROLE_LABELS[user.role as UserRole]}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</div>
                          {user.ministry && (
                            <div className="text-xs text-slate-400 mt-0.5 truncate">{user.ministry}</div>
                          )}
                        </div>
                        <div className="py-1">
                          <Link
                            to="/my-tickets"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            {ticketsLabel}
                          </Link>
                          {canAccessMinistryDashboard(user.role) && (
                            <Link
                              to="/ministry-dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Users className="w-4 h-4 text-slate-400" />
                              Ministry Dashboard
                            </Link>
                          )}
                          {canManageDocuments(user.role) && (
                            <Link
                              to="/document-management"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <FolderOpen className="w-4 h-4 text-slate-400" />
                              Document Management
                            </Link>
                          )}
                          {canAccessAdminDashboard(user.role) && (
                            <Link
                              to="/admin-dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Shield className="w-4 h-4 text-slate-400" />
                              Admin Dashboard
                            </Link>
                          )}
                          {isDemoMode && (
                            <Link
                              to="/demo-access"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <User className="w-4 h-4 text-slate-400" />
                              Switch Profile
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-slate-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isDemoMode && (
                    <Link
                      to="/demo-access"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Demo Access
                    </Link>
                  )}
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-600" />
              ) : (
                <Menu className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.path)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

              <div className="pt-3 border-t border-slate-100 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className={`text-xs px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${ROLE_COLORS[user.role as UserRole]}`}>
                          {ROLE_LABELS[user.role as UserRole]}
                        </div>
                      </div>
                    </div>
                    {isDemoMode && (
                      <Link
                        to="/demo-access"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Switch Demo Profile</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    {isDemoMode && (
                      <Link
                        to="/demo-access"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-amber-700 bg-amber-50 rounded-xl"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Demo Access</span>
                      </Link>
                    )}
                    <button
                      onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">Login</span>
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/qsrp-logo.png" alt="QSRP" className="h-14 w-auto brightness-0 invert opacity-90" />
              </div>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                A national digital governance platform where draft laws and standards become transparent,
                reviewable, trackable, and accountable from publication to final decision.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Platform</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/documents" className="hover:text-emerald-400 transition-colors">Browse Documents</Link></li>
                <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Public Dashboard</Link></li>
                <li><Link to="/my-tickets" className="hover:text-emerald-400 transition-colors">Track Feedback</Link></li>
                <li><Link to="/demo-access" className="hover:text-emerald-400 transition-colors">Demo Access</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Resources</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">User Guide</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>© 2026 Pakistan Digital Authority. All rights reserved.</span>
            <span>Built for transparent digital governance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
