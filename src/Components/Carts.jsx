import React, { useState, useEffect, useRef } from "react";

const Carts = () => {
  // ---------- State ----------
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCartId, setExpandedCartId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const abortControllerRef = useRef(null);

  // Track deleted cart IDs to filter out from API responses
  const [deletedCartIds, setDeletedCartIds] = useState([]);

  // Filter by user
  const [userIdFilter, setUserIdFilter] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);

  // Mutations (add/edit/delete) & modals
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    userId: "",
    products: [{ id: "", quantity: "" }],
  });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCart, setEditingCart] = useState(null);
  const [editFormData, setEditFormData] = useState({
    merge: true,
    products: [{ id: "", quantity: "" }],
  });

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ---------- NEW: Place Order state ----------
  const [placingOrder, setPlacingOrder] = useState({}); // Track which cart is being processed

  // ---------- Helper: filter out deleted carts ----------
  const filterDeleted = (cartList) => {
    return cartList.filter((cart) => !deletedCartIds.includes(cart.id));
  };

  // ---------- Fetch all carts ----------
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
        // Filter out deleted carts
        const filtered = filterDeleted(data.carts);
        setCarts(filtered);
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

  // ---------- NEW: Listen for cart updates from Wishlist ----------
  useEffect(() => {
    const handleCartUpdate = () => {
      // Refresh the cart list when items are added from Wishlist
      fetchCarts();
    };
    
    // Add event listener
    window.addEventListener("cartUpdated", handleCartUpdate);
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []); // Empty dependency array means this runs once on mount

  // ---------- Fetch carts by user ----------
  const fetchCartsByUser = async (userId) => {
    if (!userId || isNaN(userId)) {
      fetchCarts();
      return;
    }
    setFilterLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://dummyjson.com/carts/user/${userId}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let cartList = [];
      if (data && Array.isArray(data.carts)) {
        cartList = data.carts;
      } else if (data && data.id) {
        cartList = [data];
      }
      // Filter out deleted carts
      const filtered = filterDeleted(cartList);
      setCarts(filtered);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setFilterLoading(false);
    }
  };

  // Handle filter input (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userIdFilter.trim() === "") {
        fetchCarts();
      } else {
        fetchCartsByUser(userIdFilter.trim());
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [userIdFilter]);

  // ---------- Fetch single cart detail ----------
  const fetchCartDetail = async (cartId) => {
    setDetailLoading(true);
    setMutationError(null);
    try {
      const response = await fetch(`https://dummyjson.com/carts/${cartId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSelectedCart(data);
      setShowDetailModal(true);
    } catch (err) {
      setMutationError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // ---------- Add cart ----------
  const handleAddCart = async (e) => {
    e.preventDefault();
    setMutationLoading(true);
    setMutationError(null);

    try {
      const products = addFormData.products
        .filter((p) => p.id && p.quantity)
        .map((p) => ({
          id: parseInt(p.id),
          quantity: parseInt(p.quantity),
        }));

      if (products.length === 0) {
        throw new Error("Please add at least one product");
      }

      const payload = {
        userId: parseInt(addFormData.userId),
        products,
      };

      const response = await fetch("https://dummyjson.com/carts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const newCart = await response.json();

      setCarts((prev) => [newCart, ...prev]);
      setShowAddModal(false);
      setAddFormData({ userId: "", products: [{ id: "", quantity: "" }] });
    } catch (err) {
      setMutationError(err.message);
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------- Edit cart (merge products) ----------
  const handleEditCart = async (e) => {
    e.preventDefault();
    setMutationLoading(true);
    setMutationError(null);

    try {
      const products = editFormData.products
        .filter((p) => p.id && p.quantity)
        .map((p) => ({
          id: parseInt(p.id),
          quantity: parseInt(p.quantity),
        }));

      if (products.length === 0) {
        throw new Error("Please add at least one product");
      }

      const payload = {
        merge: editFormData.merge,
        products,
      };

      const response = await fetch(
        `https://dummyjson.com/carts/${editingCart.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const updatedCart = await response.json();

      setCarts((prev) =>
        prev.map((c) => (c.id === updatedCart.id ? updatedCart : c))
      );
      setShowEditModal(false);
      setEditingCart(null);
      setEditFormData({ merge: true, products: [{ id: "", quantity: "" }] });
    } catch (err) {
      setMutationError(err.message);
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------- Delete cart ----------
  const handleDeleteCart = async (cartId) => {
    if (!window.confirm(`Are you sure you want to delete cart #${cartId}?`)) {
      return;
    }

    setMutationLoading(true);
    setMutationError(null);
    try {
      const response = await fetch(`https://dummyjson.com/carts/${cartId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();

      // Add to deleted IDs so future fetches filter it out
      setDeletedCartIds((prev) => [...prev, cartId]);
      // Remove from current list
      setCarts((prev) => prev.filter((c) => c.id !== cartId));
      if (expandedCartId === cartId) setExpandedCartId(null);
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------- NEW: Place Order function ----------
  const handlePlaceOrder = async (cartId) => {
    // Set loading state for this specific cart
    setPlacingOrder(prev => ({ ...prev, [cartId]: true }));
    
    try {
      // Find the cart
      const cart = carts.find(c => c.id === cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }

      // Check if cart has products
      if (!cart.products || cart.products.length === 0) {
        throw new Error("Cart is empty. Add products before placing order.");
      }

      // Calculate total amount
      const totalAmount = cart.total || cart.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      // Show order confirmation
      const confirmOrder = window.confirm(
        `📦 Order Summary:\n\n` +
        `Cart #${cartId}\n` +
        `User ID: ${cart.userId}\n` +
        `Total Products: ${cart.totalProducts || cart.products.length}\n` +
        `Total Quantity: ${cart.totalQuantity || cart.products.reduce((sum, p) => sum + p.quantity, 0)}\n` +
        `Total Amount: $${totalAmount.toFixed(2)}\n\n` +
        `Do you want to place this order?`
      );

      if (!confirmOrder) {
        setPlacingOrder(prev => ({ ...prev, [cartId]: false }));
        return;
      }

      // Simulate API call to place order
      // In a real app, you would call your order API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // Create order object (for demo purposes)
      const orderData = {
        cartId: cartId,
        userId: cart.userId,
        products: cart.products,
        total: totalAmount,
        orderDate: new Date().toISOString(),
        status: "Placed",
        orderId: `ORD-${Date.now()}-${cartId}`
      };

      // Store order in localStorage (for demo)
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      localStorage.setItem("orders", JSON.stringify([orderData, ...existingOrders]));

      // Success message
      alert(`✅ Order placed successfully!\nOrder ID: ${orderData.orderId}\nTotal: $${totalAmount.toFixed(2)}`);

      // Delete the cart after placing order
      await handleDeleteCartAfterOrder(cartId);

      // Refresh cart list
      await fetchCarts();

    } catch (error) {
      alert(`❌ Failed to place order: ${error.message}`);
      console.error("Place order error:", error);
    } finally {
      setPlacingOrder(prev => ({ ...prev, [cartId]: false }));
    }
  };

  // ---------- NEW: Delete cart after order placement ----------
  const handleDeleteCartAfterOrder = async (cartId) => {
    try {
      const response = await fetch(`https://dummyjson.com/carts/${cartId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();

      // Add to deleted IDs so future fetches filter it out
      setDeletedCartIds((prev) => [...prev, cartId]);
      // Remove from current list
      setCarts((prev) => prev.filter((c) => c.id !== cartId));
      if (expandedCartId === cartId) setExpandedCartId(null);
    } catch (err) {
      console.error("Failed to delete cart after order:", err);
      // Don't throw error here to prevent breaking the order flow
    }
  };

  // ---------- Helpers for form fields (add/edit) ----------
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProductChange = (index, field, value) => {
    const updated = [...addFormData.products];
    updated[index][field] = value;
    setAddFormData((prev) => ({ ...prev, products: updated }));
  };

  const handleAddProductRemove = (index) => {
    const updated = addFormData.products.filter((_, i) => i !== index);
    setAddFormData((prev) => ({ ...prev, products: updated }));
  };

  const handleAddProductAdd = () => {
    setAddFormData((prev) => ({
      ...prev,
      products: [...prev.products, { id: "", quantity: "" }],
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditProductChange = (index, field, value) => {
    const updated = [...editFormData.products];
    updated[index][field] = value;
    setEditFormData((prev) => ({ ...prev, products: updated }));
  };

  const handleEditProductRemove = (index) => {
    const updated = editFormData.products.filter((_, i) => i !== index);
    setEditFormData((prev) => ({ ...prev, products: updated }));
  };

  const handleEditProductAdd = () => {
    setEditFormData((prev) => ({
      ...prev,
      products: [...prev.products, { id: "", quantity: "" }],
    }));
  };

  // ---------- UI helpers ----------
  const toggleProducts = (cartId) => {
    setExpandedCartId((prev) => (prev === cartId ? null : cartId));
  };

  const handleRetry = () => fetchCarts();

  // ---------- Pagination (with page correction) ----------
  const totalPages = Math.min(10, Math.ceil(carts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCarts = carts.slice(startIndex, endIndex);

  // Reset page if out of bounds
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedCartId(null);
    }
  };

  // ---------- Loading states ----------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-indigo-500 font-medium">Loading your carts...</p>
      </div>
    );
  }

  if (error && !carts.length) {
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

  // ---------- Render ----------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            🛒 Shopping Carts
            <span className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {carts.length}
            </span>
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition shadow-md flex items-center gap-2"
          >
            ➕ Add Cart
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              placeholder="Filter by User ID"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-48"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">👤</span>
          </div>
          <button
            onClick={handleRetry}
            className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition shadow-sm flex items-center gap-2"
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      {filterLoading && (
        <div className="text-indigo-500 text-sm mb-4">Filtering by user...</div>
      )}

      {mutationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {mutationError}
        </div>
      )}

      {/* Cart Grid */}
      {carts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl opacity-50">🛒</div>
          <p className="mt-2 text-gray-500 text-lg">No carts found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentCarts.map((cart) => {
              const isExpanded = expandedCartId === cart.id;
              const isPlacingOrder = placingOrder[cart.id] || false;
              
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

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => toggleProducts(cart.id)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition"
                    >
                      {isExpanded ? "▲ Hide" : "▼ Show"} products
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => fetchCartDetail(cart.id)}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingCart(cart);
                          setEditFormData({
                            merge: true,
                            products: [{ id: "", quantity: "" }],
                          });
                          setShowEditModal(true);
                        }}
                        className="text-xs bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-3 py-1.5 rounded-full transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCart(cart.id)}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-full transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* ---------- NEW: Place Order Button ---------- */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handlePlaceOrder(cart.id)}
                      disabled={isPlacingOrder || !cart.products || cart.products.length === 0}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                        isPlacingOrder || !cart.products || cart.products.length === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-600/40"
                      }`}
                    >
                      {isPlacingOrder ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          📦 Place Order
                          {cart.products && cart.products.length > 0 && (
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                              ${cart.total.toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                    {cart.products && cart.products.length === 0 && (
                      <p className="text-[10px] text-gray-400 text-center mt-1">
                        Cart is empty. Add products first.
                      </p>
                    )}
                  </div>

                  {/* Products List (expandable) */}
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                      isExpanded
                        ? "max-h-[600px] opacity-100 mt-4"
                        : "max-h-0 opacity-0"
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
        </>
      )}

      {/* ---------- Add Cart Modal ---------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">➕ Add New Cart</h2>
            <form onSubmit={handleAddCart}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="number"
                    name="userId"
                    value={addFormData.userId}
                    onChange={handleAddFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Products
                  </label>
                  {addFormData.products.map((product, index) => (
                    <div key={index} className="flex gap-2 items-center mb-2">
                      <input
                        type="number"
                        placeholder="Product ID"
                        value={product.id}
                        onChange={(e) =>
                          handleAddProductChange(index, "id", e.target.value)
                        }
                        required
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={product.quantity}
                        onChange={(e) =>
                          handleAddProductChange(index, "quantity", e.target.value)
                        }
                        required
                        className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      {addFormData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddProductRemove(index)}
                          className="text-red-500 hover:text-red-700 text-xl"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddProductAdd}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add another product
                  </button>
                </div>

                {mutationError && (
                  <div className="text-red-500 text-sm">{mutationError}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={mutationLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {mutationLoading ? "Creating..." : "Create Cart"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddFormData({ userId: "", products: [{ id: "", quantity: "" }] });
                      setMutationError(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Edit Cart Modal ---------- */}
      {showEditModal && editingCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ✏️ Edit Cart #{editingCart.id}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Add products to this cart. Existing products will be kept if "merge" is enabled.
            </p>
            <form onSubmit={handleEditCart}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="merge"
                    checked={editFormData.merge}
                    onChange={handleEditFormChange}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Merge with existing products
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Products to add
                  </label>
                  {editFormData.products.map((product, index) => (
                    <div key={index} className="flex gap-2 items-center mb-2">
                      <input
                        type="number"
                        placeholder="Product ID"
                        value={product.id}
                        onChange={(e) =>
                          handleEditProductChange(index, "id", e.target.value)
                        }
                        required
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={product.quantity}
                        onChange={(e) =>
                          handleEditProductChange(index, "quantity", e.target.value)
                        }
                        required
                        className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      {editFormData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEditProductRemove(index)}
                          className="text-red-500 hover:text-red-700 text-xl"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleEditProductAdd}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add another product
                  </button>
                </div>

                {mutationError && (
                  <div className="text-red-500 text-sm">{mutationError}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={mutationLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {mutationLoading ? "Updating..." : "Update Cart"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCart(null);
                      setEditFormData({ merge: true, products: [{ id: "", quantity: "" }] });
                      setMutationError(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Detail Modal ---------- */}
      {showDetailModal && selectedCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                🛒 Cart #{selectedCart.id}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg mb-4">
                  <div>
                    <span className="text-gray-500">User ID:</span> {selectedCart.userId}
                  </div>
                  <div>
                    <span className="text-gray-500">Total Products:</span> {selectedCart.totalProducts}
                  </div>
                  <div>
                    <span className="text-gray-500">Total Quantity:</span> {selectedCart.totalQuantity}
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span> ${selectedCart.total.toFixed(2)}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Discounted Total:</span>{" "}
                    <span className="text-green-600 font-semibold">
                      ${selectedCart.discountedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-700 mb-2">Products</h3>
                <ul className="space-y-2">
                  {selectedCart.products.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center gap-3 text-sm border-b border-gray-100 pb-2 last:border-0"
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{product.title}</p>
                        <p className="text-gray-500 text-xs">
                          ${product.price} × {product.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-700">
                        ${(product.price * product.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* ---------- NEW: Place Order button in detail modal ---------- */}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handlePlaceOrder(selectedCart.id);
                  }}
                  disabled={placingOrder[selectedCart.id] || !selectedCart.products || selectedCart.products.length === 0}
                  className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    placingOrder[selectedCart.id] || !selectedCart.products || selectedCart.products.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
                  }`}
                >
                  {placingOrder[selectedCart.id] ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Placing Order...
                    </>
                  ) : (
                    "📦 Place Order"
                  )}
                </button>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Carts;