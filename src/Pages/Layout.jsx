// src/Components/Layout.jsx
import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Load user from localStorage when component mounts
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    navigate("/login"); // Redirect to login page
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
    ${
      isActive(path)
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }
  `;

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#0b0b12] font-sans overflow-x-hidden text-slate-100">
      {/* Mobile Header Toggle Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#0b0b12] border-b border-white/5 px-4 py-3.5 w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1 className="text-sm font-bold text-white tracking-tight">
            Admin Portal
          </h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white focus:outline-none bg-white/5 rounded-xl border border-white/5 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0b0b12] border-r border-white/5 flex flex-col shadow-2xl shrink-0 h-full transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-white/5 shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight">
              E‑Commerce Admin
            </h1>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Management Dashboard
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="space-y-1">
            {/* ✅ FIXED: Changed "/get-all" to "/products" */}
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass("/products")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span>Products</span>
            </Link>

            <Link
              to="/users"
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass("/users")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Users</span>
            </Link>

            <Link
              to="/carts"
              onClick={() => setIsMobileMenuOpen(false)}
              className={navLinkClass("/carts")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Carts</span>
            </Link>
          </div>
        </nav>

        {/* ❌ REMOVED: Sidebar Logout Button – moved to Profile dropdown */}
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0 w-full bg-[#0b0b12] overflow-x-hidden">
        {/* Top Header with Avatar Dropdown */}
        <header className="hidden md:flex h-16 bg-[#0b0b12] border-b border-white/5 items-center justify-end px-8 shrink-0 relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Avatar button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/10 hover:ring-blue-400 transition-all cursor-pointer focus:outline-none"
              >
                {/* Show first letter of firstName, fallback to 'A' */}
                {user ? user.firstName?.charAt(0) || "A" : "A"}
              </button>

              {/* ✅ COMPLETE DROPDOWN MENU with Profile + Logout */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] rounded-xl shadow-2xl border border-white/10 z-50 py-1 overflow-hidden">
                    {/* User Info */}
                    {user ? (
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <p className="text-xs text-blue-400 mt-1">Admin</p>
                      </div>
                    ) : (
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">Admin</p>
                      </div>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150 cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 bg-[#0b0b12] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;