// src/Components/GetAllProducts.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

function Products() {
  // ---------- Local sorting state (no context) ----------
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("asc");

  const [products, setProducts] = useState([]);
  const [allProductsCache, setAllProductsCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    thumbnail: "",
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = allProductsCache.map((p) => p.category).filter(Boolean);
    return ["all", ...new Set(cats)];
  }, [allProductsCache]);

  // ---------- Fetch all products ----------
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

  // ---------- Search with fallback ----------
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

  // ---------- Delete ----------
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

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setAllProductsCache((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete the product. Please try again.");
    }
  };

  // ---------- Add ----------
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) {
      alert("Please fill in the required fields (Title and Price).");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("https://dummyjson.com/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          price: Number(formData.price),
          category: formData.category || "general",
          description: formData.description || "",
          thumbnail:
            formData.thumbnail.trim() ||
            "https://cdn.dummyjson.com/product-images/placeholder.jpg",
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const newProduct = await res.json();
      console.log("Added successfully:", newProduct);

      setProducts((prev) => [newProduct, ...prev]);
      setAllProductsCache((prev) => [newProduct, ...prev]);

      setFormData({
        title: "",
        price: "",
        category: "",
        description: "",
        thumbnail: "",
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add product:", err);
      alert("Failed to add the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Edit (start) ----------
  const handleEditClick = (product, e) => {
    e.preventDefault();
    setEditingProduct({
      id: product.id,
      title: product.title || "",
      price: product.price || "",
      category: product.category || "",
      description: product.description || "",
      thumbnail: product.thumbnail || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------- Update ----------
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct.title.trim() || !editingProduct.price) {
      alert("Please fill in the required fields (Title and Price).");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch(
        `https://dummyjson.com/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editingProduct.title,
            price: Number(editingProduct.price),
            category: editingProduct.category,
            description: editingProduct.description,
            thumbnail: editingProduct.thumbnail,
          }),
        },
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const updatedData = await res.json();
      console.log("Updated successfully:", updatedData);

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedData.id ? updatedData : p)),
      );
      setAllProductsCache((prev) =>
        prev.map((p) => (p.id === updatedData.id ? updatedData : p)),
      );

      alert("Product updated successfully!");
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Failed to update the product. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------- useEffect hooks ----------
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    if (allProductsCache.length > 0 && searchTerm.trim()) {
      searchProductsAPI(searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProductsCache]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  // ---------- Processing pipeline ----------
  const getProcessedProducts = useCallback(() => {
    let processed = products;

    if (selectedCategory !== "all") {
      processed = processed.filter((p) => p.category === selectedCategory);
    }

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

  // ---------- Pagination ----------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = processedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const calculatedTotalPages =
    Math.ceil(processedProducts.length / itemsPerPage) || 1;
  const totalPages = Math.min(calculatedTotalPages, 10);

  // ---------- Render ----------
  return (
    <div className="flex flex-col min-h-full justify-start bg-gray-950 px-3 sm:px-6 pb-3 sm:pb-6 pt-0 rounded-2xl sm:rounded-3xl border border-gray-800 shadow-2xl overflow-x-hidden gap-0">
      {/* ========== INLINE HEADER ========== */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm pt-4 pb-3 border-b border-gray-800/80 flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
        {/* Left: Title & Add button */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Products Management
          </h2>
        </div>

        {/* Right: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Category filter */}
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            + Add New
          </button>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="default">Sort by</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>

          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-200 placeholder-gray-500 text-xs rounded-xl px-3 py-2 w-32 sm:w-44 focus:outline-none focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-500 hover:text-white text-xs font-semibold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* INLINE EDIT FORM */}
      {editingProduct && (
        <div className="bg-gray-900 border border-amber-500/40 p-4 sm:p-6 rounded-2xl shadow-xl my-3">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
            <h2 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
              ✏️ Editing Product ID: {editingProduct.id}
            </h2>
            <button
              onClick={() => setEditingProduct(null)}
              className="text-gray-400 hover:text-white text-xs font-semibold px-2 py-1 bg-gray-950 rounded-lg border border-gray-800 cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          <form
            onSubmit={handleUpdateSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                value={editingProduct.title}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    title: e.target.value,
                  })
                }
                required
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: e.target.value,
                  })
                }
                required
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Product URL (Image)
              </label>
              <input
                type="url"
                value={editingProduct.thumbnail}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    thumbnail: e.target.value,
                  })
                }
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INLINE ADD FORM */}
      {showAddForm && (
        <div className="bg-gray-900 border border-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl my-3">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Add New Product Form
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white text-xs font-semibold px-2 py-1 bg-gray-950 rounded-lg border border-gray-800 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <form
            onSubmit={handleAddProductSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                placeholder="e.g. BMW Pencil"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 10"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. stationery"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Product URL (Image)
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail: e.target.value })
                }
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Adding..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LOADING STATE */}
      {(loading || isSearching) && (
        <div className="flex flex-col justify-center items-center min-h-[250px] sm:min-h-[350px] space-y-3 bg-gray-900/30 border border-gray-800/40 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-gray-400 tracking-wider uppercase">
            {loading ? "Loading Products..." : "Searching..."}
          </p>
        </div>
      )}

      {/* ERROR STATE */}
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

      {/* PRODUCT GRID */}
      {!loading && !isSearching && !error && (
        <>
          {processedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-gray-900/30 border border-gray-800/60 rounded-2xl text-gray-400 space-y-3 shadow-inner">
              <span className="text-4xl">📦</span>
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
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                {currentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-gray-900 border border-gray-800/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:border-gray-700 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
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
                            {typeof p.rating === "number"
                              ? p.rating.toFixed(1)
                              : p.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-800/80 flex items-center gap-1.5">
                      <Link
                        to={`/single-product/${p.id}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white py-2 rounded-lg transition-all text-[10px] font-semibold border border-blue-500/30"
                        title="View Details"
                      >
                        <span>👁️ View</span>
                      </Link>
                      <button
                        onClick={(e) => handleEditClick(p, e)}
                        className="px-2.5 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-gray-950 rounded-lg transition-all text-[10px] font-semibold border border-amber-500/30 cursor-pointer"
                        title="Edit Product"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteProduct(p.id, e)}
                        className="px-2.5 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all text-[10px] font-semibold border border-red-500/30 cursor-pointer"
                        title="Delete Product"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-gray-800/80">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs disabled:opacity-40 hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500"
                            : "bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"
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
                    className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs disabled:opacity-40 hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
