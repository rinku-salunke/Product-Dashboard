// src/Components/CategoryList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layers, Sparkles } from "lucide-react";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://dummyjson.com/products/category-list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium tracking-wide">
          Loading categories...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 max-w-lg mx-auto">
        <p className="font-semibold text-lg mb-1">Unable to load categories</p>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Top Banner / Header section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catalog Explorer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Product Categories
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Browse through all available database categories fetched directly
            from the API endpoint. Click any category to view its products.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
          <p className="text-slate-400 text-sm">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/products-by-category/${category}`}
              className="group relative bg-slate-900/95 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 p-5 rounded-2xl shadow-md hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 flex items-center space-x-3.5 cursor-pointer overflow-hidden"
            >
              {/* Subtle background glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner shrink-0">
                <Layers className="w-4 h-4" />
              </div>

              <div className="relative z-10">
                <h3 className="capitalize font-semibold text-slate-200 group-hover:text-white text-sm tracking-wide transition-colors">
                  {category.replace(/-/g, " ")}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;