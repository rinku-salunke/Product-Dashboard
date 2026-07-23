// src/Product.jsx
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

function Product() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#0b0b12] font-sans overflow-hidden">
      {/* ===== SIDEBAR – FULLY FITTED, NO SCROLL ===== */}
      <aside className="w-60 bg-[#12121c] border-r border-white/5 text-slate-300 flex flex-col shadow-2xl h-full shrink-0 overflow-hidden">
        
        {/* Brand – Ultra Compact */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">Admin Portal</h1>
          </div>
        </div>

        {/* Navigation – Clean structure */}
        <nav className="flex-1 px-2.5 py-2.5 space-y-3 overflow-hidden">
          
          {/* ===== MENU LINKS ===== */}
          <div>
            <div className="space-y-0.5">
              <Link
                to="/get-all"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive("/get-all")
                    ? "bg-blue-500/15 text-white border-r-2 border-blue-500"
                    : "hover:bg-white/5 hover:text-white text-slate-400"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Products</span>
              </Link>
            </div>
          </div>

        </nav>

        {/* User & Logout – Ultra Compact Bottom */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 mb-1.5">
            
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all duration-200 group"
          >
            
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0b0b12]">
        <header className="h-12 bg-[#12121c]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-white tracking-wide">Product Management Dashboard</h2>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-y-auto bg-[#0b0b12]/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Product;