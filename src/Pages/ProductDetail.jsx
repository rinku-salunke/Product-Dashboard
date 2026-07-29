import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user details from localStorage
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const userFullName = localStorage.getItem("userFullName") || "User";

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`https://dummyjson.com/products/${id}`);

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || "Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] sm:min-h-[300px]">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-xs sm:text-sm font-medium mt-3">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 sm:p-6 rounded-xl text-center my-4 sm:my-6 max-w-lg mx-auto">
        <p className="font-semibold text-base sm:text-lg">Oops! Something went wrong.</p>
        <p className="text-xs sm:text-sm mt-1">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </button>

      {/* Product Details */}
      <div className="bg-[#12121c] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Product Image */}
          <div className="bg-[#0b0b12] rounded-lg sm:rounded-xl overflow-hidden border border-white/5 p-3 sm:p-4 flex items-center justify-center">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-48 sm:h-56 md:h-64 lg:h-80 object-contain rounded-lg"
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col h-full justify-between">
            <div>
              <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-600/20 text-blue-400 text-[10px] sm:text-xs font-semibold rounded-full uppercase tracking-wider mb-2 border border-blue-500/20">
                {product.category}
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                {product.title}
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-2 sm:mt-3">
                ${product.price}
              </p>
              
              <p className="text-gray-400 mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed">
                {product.description}
              </p>

              <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 border-t border-white/5 pt-3 sm:pt-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Brand:</span>
                  <span className="text-gray-300 font-semibold text-right">{product.brand || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Stock Status:</span>
                  <span className={`font-semibold text-right ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Rating:</span>
                  <span className="text-gray-300 font-semibold">⭐ {product.rating} / 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Section - Fully Responsive */}
      {userProfile && Object.keys(userProfile).length > 0 && (
        <div className="bg-[#12121c] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">👤</span> User Profile
            <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs font-normal text-gray-400">(Logged in user)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Personal Information */}
            <div className="bg-[#0b0b12] rounded-lg sm:rounded-xl border border-white/5 p-3 sm:p-4">
              <h3 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                Personal Info
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Name</span>
                  <span className="text-white font-medium text-[10px] sm:text-sm text-right">
                    {userProfile.firstName} {userProfile.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Maiden Name</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.maidenName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Age</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.age || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Gender</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm capitalize text-right">
                    {userProfile.gender || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Birth Date</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.birthDate || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-[#0b0b12] rounded-lg sm:rounded-xl border border-white/5 p-3 sm:p-4">
              <h3 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                Contact Info
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Email</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm truncate max-w-[80px] sm:max-w-[140px] text-right">
                    {userProfile.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Phone</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.phone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Username</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    @{userProfile.username || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Physical & Other Details */}
            <div className="bg-[#0b0b12] rounded-lg sm:rounded-xl border border-white/5 p-3 sm:p-4">
              <h3 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                Physical & Other
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Blood Group</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.bloodGroup || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Height</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.height ? `${userProfile.height} cm` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Weight</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.weight ? `${userProfile.weight} kg` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Eye Color</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.eyeColor || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] sm:text-sm">Hair</span>
                  <span className="text-gray-300 text-[10px] sm:text-sm text-right">
                    {userProfile.hair?.color || "N/A"} {userProfile.hair?.type || ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;