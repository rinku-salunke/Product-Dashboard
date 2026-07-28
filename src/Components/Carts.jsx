import React, { useState, useEffect, useRef } from "react";

const Carts = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCartId, setExpandedCartId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const abortControllerRef = useRef(null);

  const fetchCarts = async () => {
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://dummyjson.com/carts", {
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data.carts)) {
        setCarts(data.carts);
        setCurrentPage(1);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
    return () => abortControllerRef.current?.abort();
  }, []);

  const toggleProducts = (cartId) => {
    setExpandedCartId((prev) => (prev === cartId ? null : cartId));
  };

  const handleRetry = () => fetchCarts();

  const totalPages = Math.min(10, Math.ceil(carts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCarts = carts.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedCartId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-indigo-500 font-medium">Loading your carts...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 text-lg font-semibold">Failed to load: {error}</p>
        <button
          onClick={handleRetry}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl opacity-50">🛒</div>
        <p className="mt-2 text-gray-500 text-lg">No carts found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          🛒 Shopping Carts
          <span className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {carts.length}
          </span>
        </h1>
        <button
          onClick={handleRetry}
          className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition shadow-sm flex items-center gap-2"
        >
          ⟳ Refresh
        </button>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentCarts.map((cart) => {
          const isExpanded = expandedCartId === cart.id;
          return (
            <div
              key={cart.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-indigo-50/50 hover:border-indigo-200"
            >
              {/* Cart Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Cart #{cart.id}
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                  👤 User {cart.userId}
                </span>
              </div>

              {/* Summary */}
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex justify-between">
                  <span>📦 Products: {cart.totalProducts}</span>
                  <span>🔢 Qty: {cart.totalQuantity}</span>
                </p>
                <p className="flex justify-between font-semibold text-gray-800">
                  <span>💰 Total: ${cart.total.toFixed(2)}</span>
                  <span className="text-green-600">
                    ✨ Discounted: ${cart.discountedTotal.toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => toggleProducts(cart.id)}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-full transition"
              >
                {isExpanded ? "▲ Hide products" : "▼ Show products"}
              </button>

              {/* Products List with smooth expand/collapse */}
              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                  isExpanded ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
              >
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Product details
                  </h4>
                  <ul className="space-y-2">
                    {cart.products.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center gap-3 text-sm border-b border-gray-50 pb-2 last:border-0"
                      >
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                          loading="lazy"
                        />
                        <span className="flex-1 font-medium text-gray-800 truncate">
                          {product.title}
                        </span>
                        <span className="text-gray-500 text-xs">×{product.quantity}</span>
                        <span className="text-gray-700 font-semibold whitespace-nowrap">
                          ${(product.price * product.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10 pt-4 border-t border-gray-200">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                page === currentPage
                  ? "bg-indigo-600 text-white shadow-md"
                  : "border border-gray-300 text-gray-600 hover:bg-indigo-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>

          <span className="text-sm text-gray-500 ml-2">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default Carts;