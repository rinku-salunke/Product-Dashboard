// src/Components/GetAllProducts.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  PackageX,
  Loader2,
  Filter,
  ArrowUpDown,
  Edit3,
  Trash2,
  Eye,
} from "lucide-react";
import { useSorting } from "./SortingContext";

function GetAllProducts() {
  const { sortBy, setSortBy, sortOrder, setSortOrder } = useSorting();

  const [products, setProducts] = useState([]);
  const [allProductsCache, setAllProductsCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Category Filtering State
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique categories dynamically from the cached products
  const categories = useMemo(() => {
    const cats = allProductsCache.map((p) => p.category).filter(Boolean);
    return ["all", ...new Set(cats)];
  }, [allProductsCache]);

  // Fetch ALL products once and cache them
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("https://dummyjson.com/products?limit=0");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      const all = data.products || [];
      setAllProductsCache(all);
      setProducts(all);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  // Search API call with fallback
  const searchProductsAPI = useCallback(
    async (query) => {
      try {
        setIsSearching(true);
        setError(null);
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
          setProducts(allProductsCache);
          setIsSearching(false);
          return;
        }

        const res = await fetch(
          `https://dummyjson.com/products/search?q=${encodeURIComponent(trimmedQuery)}&limit=0`,
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();

        if (data.products.length === 0 && allProductsCache.length > 0) {
          const fallback = allProductsCache.filter((p) => {
            const term = trimmedQuery.toLowerCase();
            const title = (p.title || "").toLowerCase();
            const category = (p.category || "")
              .toLowerCase()
              .replace(/-/g, " ");
            const description = (p.description || "").toLowerCase();
            return (
              title.includes(term) ||
              category.includes(term) ||
              description.includes(term)
            );
          });
          setProducts(fallback);
        } else {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (allProductsCache.length > 0) {
          const term = query.trim().toLowerCase();
          const fallback = allProductsCache.filter((p) => {
            const title = (p.title || "").toLowerCase();
            const category = (p.category || "")
              .toLowerCase()
              .replace(/-/g, " ");
            const description = (p.description || "").toLowerCase();
            return (
              title.includes(term) ||
              category.includes(term) ||
              description.includes(term)
            );
          });
          setProducts(fallback);
        } else {
          setProducts([]);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [allProductsCache],
  );

  // Handle Product Deletion via DummyJSON API
  const handleDeleteProduct = async (id, e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const res = await fetch(`https://dummyjson.com/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      console.log("Deleted successfully:", data);

      // Remove from active products and cache state so UI updates instantly
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setAllProductsCache((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete the product. Please try again.");
    }
  };

  // Load all products on mount
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Safety net: re-run search when cache loads
  useEffect(() => {
    if (allProductsCache.length > 0 && searchTerm.trim()) {
      searchProductsAPI(searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProductsCache]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchProductsAPI(searchTerm);
      } else {
        setProducts(allProductsCache);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchProductsAPI, allProductsCache]);

  // Reset page on search, category filter, or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  // Combined Pipeline: Search results/products -> Category Filter -> Sorting
  const getProcessedProducts = useCallback(() => {
    let processed = products;

    // 1. Apply Category Filter
    if (selectedCategory !== "all") {
      processed = processed.filter((p) => p.category === selectedCategory);
    }

    // 2. Apply Sorting AFTER searching and filtering
    if (sortBy === "default") return processed;

    const sorted = [...processed];
    switch (sortBy) {
      case "title":
        sorted.sort((a, b) => {
          const nameA = (a.title || "").toLowerCase();
          const nameB = (b.title || "").toLowerCase();
          return sortOrder === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
        break;
      case "price":
        sorted.sort((a, b) => {
          return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
        });
        break;
      case "rating":
        sorted.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
        });
        break;
      default:
        break;
    }
    return sorted;
  }, [products, selectedCategory, sortBy, sortOrder]);

  const processedProducts = getProcessedProducts();

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = processedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.min(
    Math.ceil(processedProducts.length / itemsPerPage) || 1,
    10,
  );

  return (
    <div className="flex flex-col min-h-full justify-between space-y-4 sm:space-y-6 bg-gray-950 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-800 shadow-2xl">
      {/* Top Header Row with Admin Profile & Logout Controls */}
      <div className="flex flex-col gap-3 lg:gap-4 bg-gray-900/95 backdrop-blur-md border border-gray-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg">
        {/* Top-Most Subheader Row: Admin Profile on Left & Logout button forced to the Top-Right Corner */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
          {/* Logout Button positioned at the Top Right Corner */}
          <button
            onClick={() => {
              // Add your logout functionality/navigation here
              console.log("Logging out...");
            }}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium transition-all cursor-pointer ml-auto"
          ></button>
        </div>

        {/* Search, Category Filter & Sorting Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          {/* Left Side: Category Filter & Search Input */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-44 bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer capitalize shadow-inner"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat === "all" ? "All Categories" : cat.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60 lg:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-500 text-xs rounded-xl pl-9 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Right Side: Sorting Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-800/80">
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-blue-400 hidden sm:block" />
              <span className="text-[11px] font-medium hidden sm:inline text-gray-300">
                Sort By:
              </span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="default">Default</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="flex-1 sm:flex-none bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(loading || isSearching) && (
        <div className="flex flex-col justify-center items-center min-h-[250px] sm:min-h-[350px] space-y-3 bg-gray-900/30 border border-gray-800/40 rounded-2xl">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs font-medium text-gray-400 tracking-wider uppercase">
            {loading ? "Loading Inventory..." : "Searching..."}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && !isSearching && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 sm:p-8 rounded-2xl text-center my-4 shadow-xl">
          <p className="font-semibold text-base text-red-300">
            Oops! Something went wrong.
          </p>
          <p className="text-xs mt-1 text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchAllProducts();
            }}
            className="mt-4 sm:mt-5 px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-all shadow-md shadow-red-600/30"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !isSearching && !error && (
        <>
          {processedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-gray-900/30 border border-gray-800/60 rounded-2xl text-gray-400 space-y-3 shadow-inner">
              <PackageX className="w-12 h-12 text-gray-600" />
              <p className="text-sm font-medium">
                No products found matching your current filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSortBy("default");
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
              {currentProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-900 border border-gray-800/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:border-gray-700 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative w-full h-36 sm:h-40 md:h-44 bg-gray-950 rounded-lg sm:rounded-xl overflow-hidden border border-gray-800/50 mb-2 sm:mb-3">
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.category && (
                        <span className="absolute top-2 right-2 bg-gray-900/80 backdrop-blur-md text-gray-300 text-[8px] sm:text-[10px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border border-gray-700/50">
                          {p.category}
                        </span>
                      )}
                    </div>

                    {/* Title & Price */}
                    <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        Price
                      </span>
                      <span className="text-blue-400 font-bold text-sm sm:text-base">
                        ${p.price}
                      </span>
                    </div>
                    {p.rating && (
                      <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                        <span className="text-[10px] sm:text-xs text-gray-400">
                          ⭐
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-300">
                          {p.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-800/80 flex items-center gap-1.5">
                    <Link
                      to={`/single-product/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white py-2 rounded-lg transition-all text-[10px] font-semibold border border-blue-500/30"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </Link>

                    <Link
                      to={`/update-product/${p.id}`}
                      className="flex items-center justify-center gap-1 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-gray-950 py-2 px-2.5 rounded-lg transition-all text-[10px] font-semibold border border-amber-500/30"
                      title="Update Product"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={(e) => handleDeleteProduct(p.id, e)}
                      className="flex items-center justify-center gap-1 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white py-2 px-2.5 rounded-lg transition-all text-[10px] font-semibold border border-rose-500/30 cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {processedProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-800/80 pt-4 sm:pt-6 mt-auto gap-3 sm:gap-4">
              <p className="text-[10px] sm:text-xs text-gray-400 text-center sm:text-left">
                Showing{" "}
                <span className="font-semibold text-gray-200">
                  {indexOfFirstItem + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-200">
                  {Math.min(indexOfLastItem, processedProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-200">
                  {processedProducts.length}
                </span>{" "}
                results
              </p>

              <div className="flex items-center space-x-1 flex-wrap justify-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-xs font-semibold bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${
                        currentPage === pageNumber
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500"
                          : "bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-xs font-semibold bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GetAllProducts;
