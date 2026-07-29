import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Get user full name for welcome message
  const userFullName = localStorage.getItem("userFullName") || "User";
  const userFirstName = localStorage.getItem("userFirstName") || "";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userLastName");
    setIsDropdownOpen(false);
    navigate("/login");
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

  const sidebarWidth = isSidebarCollapsed
    ? "w-14 md:w-20"
    : "w-48 md:w-64";

  const contentMargin = isSidebarCollapsed
    ? "md:ml-14 lg:ml-20"
    : "md:ml-48 lg:ml-64";

  return (
    <div className="flex w-full min-h-screen bg-[#0b0b12] font-sans overflow-x-hidden text-slate-100">
      
      {/* ===== MOBILE OVERLAY BACKDROP ===== */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full
          bg-[#0b0b12] border-r border-white/5 
          flex flex-col shadow-2xl 
          transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand Header */}
        <div className={`
          flex items-center gap-3 px-3 py-5 border-b border-white/5 shrink-0
          ${isSidebarCollapsed ? "justify-center" : "px-4"}
        `}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/10 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">E‑Commerce Admin</h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">Management Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-6 overflow-y-auto">
          <div className="space-y-1">
            <Link
              to="/products"
              className={navLinkClass("/products")}
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {!isSidebarCollapsed && <span>Products</span>}
            </Link>

            <Link
              to="/users"
              className={navLinkClass("/users")}
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {!isSidebarCollapsed && <span>Users</span>}
            </Link>

            <Link
              to="/carts"
              className={navLinkClass("/carts")}
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!isSidebarCollapsed && <span>Carts</span>}
            </Link>
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="hidden md:block p-2 border-t border-white/5">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isSidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7M19 5l-7 7 7 7" />
              )}
            </svg>
          </button>
        </div>

        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className={`flex-1 flex flex-col min-w-0 w-full bg-[#0b0b12] overflow-x-hidden transition-all duration-300 ${contentMargin}`}>
        
        {/* Header with Hamburger + Welcome Message + Avatar */}
        <header className="min-h-16 bg-[#0b0b12] border-b border-white/5 flex items-center px-3 sm:px-6 lg:px-8 shrink-0 relative">
          
          {/* LEFT: Hamburger on mobile */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* CENTER: Welcome Message - No background rectangle */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 max-w-full">
              <span className="text-sm sm:text-base shrink-0">👋</span>
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{userFullName}</span>
              </p>
            </div>
          </div>

          {/* RIGHT: Avatar & dropdown */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto shrink-0">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-xs sm:text-sm ring-2 ring-white/10 hover:ring-blue-400 transition-all cursor-pointer focus:outline-none"
              >
                {user ? user.firstName?.charAt(0).toUpperCase() || "A" : "A"}
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] rounded-xl shadow-2xl border border-white/10 z-50 py-1 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white">
                        {userFullName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email || "admin@example.com"}
                      </p>
                      <p className="text-xs text-blue-400 mt-1">Admin</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
        <main className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#0b0b12] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;