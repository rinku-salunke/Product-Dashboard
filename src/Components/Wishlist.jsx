import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("token") !== null;
  const userFullName = localStorage.getItem("userFullName") || "";

  // Load wishlist from localStorage
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlistItems(wishlist);
    setLoading(false);
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // Add to cart
  const addToCart = (product) => {
    alert(`🛒 Added "${product.title}" to cart!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-sm text-gray-400">Loading wishlist...</p>
      </div>
    );
  }

  // ---------- IF NOT LOGGED IN - Show Login Prompt ----------
  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto bg-[#12121c] border border-white/5 rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-pink-500/20">
            <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Please Login
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-md">
            Login to view items in your wishlist and start saving your favorite products!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl transition shadow-lg shadow-pink-600/30 text-sm"
            >
              🔐 Login Now
            </button>
            <Link
              to="/products"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition text-sm"
            >
              Browse Products →
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            New here? <Link to="/login" className="text-pink-400 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    );
  }

  // ---------- LOGGED IN - Show Wishlist Items ----------
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with User Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-500/20 rounded-2xl p-4 sm:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
             My Wishlist
            <span className="bg-pink-500/20 text-pink-400 text-sm font-semibold px-3 py-1 rounded-full border border-pink-500/30">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
            </span>
          </h1>
          {userFullName && (
            <p className="text-sm text-gray-400 mt-1">
              Welcome back, <span className="text-pink-400">{userFullName}</span>!
            </p>
          )}
        </div>
        
        {wishlistItems.length > 0 && (
          <div className="flex gap-2">
            <Link
              to="/products"
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-sm font-medium transition border border-blue-500/30 flex items-center gap-2"
            >
              ← Browse More
            </Link>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your wishlist?")) {
                  setWishlistItems([]);
                  localStorage.setItem("wishlist", JSON.stringify([]));
                  window.dispatchEvent(new Event("wishlistUpdated"));
                }
              }}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-sm font-medium transition border border-red-500/30 flex items-center gap-2"
            >
              🗑️ Clear All
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Items Grid */}
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-[#12121c] border border-white/5 rounded-2xl">
          <p className="text-gray-400 text-lg font-medium">Your wishlist is empty</p>
          <p className="text-gray-500 text-sm mt-1">Start adding products you love!</p>
          <Link
            to="/products"
            className="mt-6 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-pink-600/30"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlistItems.map((product) => (
            <div
              key={product.id}
              className="bg-[#12121c] border border-white/5 rounded-xl p-4 shadow-xl hover:border-pink-500/30 transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="relative w-full h-48 bg-[#0b0b12] rounded-lg overflow-hidden border border-white/5 mb-3">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-1.5 rounded-full transition border border-red-500/30"
                  title="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <span className="absolute bottom-2 left-2 bg-pink-500/80 text-white text-[8px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  ❤️ Wishlist
                </span>
              </div>

              {/* Product Info */}
              <h3 className="font-semibold text-sm text-white truncate group-hover:text-pink-400 transition-colors">
                {product.title}
              </h3>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-pink-400 font-bold text-lg">${product.price}</span>
                {product.rating && (
                  <span className="text-gray-400 text-sm">⭐ {product.rating}</span>
                )}
              </div>

              {product.category && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-pink-600/20 text-pink-400 text-[10px] font-semibold rounded-full border border-pink-500/20">
                  {product.category}
                </span>
              )}

              {/* Action Buttons */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                <Link
                  to={`/products/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white py-1.5 rounded-lg transition-all text-xs font-semibold border border-blue-500/30"
                >
                  👁️ View
                </Link>
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 flex items-center justify-center gap-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white py-1.5 rounded-lg transition-all text-xs font-semibold border border-emerald-500/30"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;