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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.carts)) {
        setCarts(data.carts);
        setCurrentPage(1);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleProducts = (cartId) => {
    setExpandedCartId((prev) => (prev === cartId ? null : cartId));
  };

  const handleRetry = () => {
    fetchCarts();
  };

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

  // Loading state – shows while fetching
  if (loading) {
    return (
      <div className="status-container">
        <div className="spinner"></div>
        <p className="status-message loading">Loading your carts...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="status-container">
        <p className="status-message error">Failed to load: {error}</p>
        <button onClick={handleRetry} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  // Empty state – clean & simple, no extra buttons
  if (carts.length === 0) {
    return (
      <div className="status-container">
        <div className="empty-icon">🛒</div>
        <p className="status-message empty">Loading Your Carts</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ----- CSS Variables (Theme) ----- */
        :root {
          --color-primary: #6c5ce7;
          --color-primary-dark: #5a4bd1;
          --color-success: #00b894;
          --color-danger: #ff6b6b;
          --color-text: #2d3436;
          --color-text-light: #636e72;
          --color-bg: #f8f9fe;
          --color-white: #ffffff;
          --shadow-card: 0 8px 24px rgba(108, 92, 231, 0.08);
          --shadow-hover: 0 16px 48px rgba(108, 92, 231, 0.16);
          --radius: 16px;
          --transition: 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* ----- Container ----- */
        .carts-container {
          padding: 32px 24px;
          max-width: 1280px;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--color-bg);
          min-height: 100vh;
        }

        /* ----- Header ----- */
        .carts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .carts-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .carts-header h1 span {
          background: var(--color-primary);
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 4px 14px;
          border-radius: 40px;
          letter-spacing: 0;
        }

        .refresh-btn {
          background: var(--color-white);
          border: 1px solid #e9ecef;
          padding: 10px 20px;
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: var(--transition);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .refresh-btn:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(108, 92, 231, 0.2);
        }

        /* ----- Grid ----- */
        .carts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        /* ----- Cart Card ----- */
        .cart-card {
          background: var(--color-white);
          border-radius: var(--radius);
          padding: 20px 22px 22px;
          box-shadow: var(--shadow-card);
          transition: var(--transition);
          border: 1px solid rgba(108, 92, 231, 0.06);
          display: flex;
          flex-direction: column;
        }

        .cart-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
          border-color: rgba(108, 92, 231, 0.12);
        }

        /* ----- Card Header ----- */
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 2px solid #f1f2f6;
          margin-bottom: 14px;
        }

        .cart-header h2 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .user-badge {
          background: #eef3ff;
          color: var(--color-primary);
          padding: 4px 14px;
          border-radius: 40px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* ----- Summary ----- */
        .cart-summary {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .cart-summary p {
          display: flex;
          justify-content: space-between;
          margin: 0;
          font-size: 0.95rem;
          color: var(--color-text-light);
        }

        .cart-summary .total {
          font-weight: 700;
          color: var(--color-text);
          font-size: 1.05rem;
        }

        .cart-summary .discounted {
          font-weight: 700;
          color: var(--color-success);
        }

        /* ----- Toggle Button ----- */
        .toggle-products-btn {
          background: #f8f9fe;
          border: none;
          padding: 10px 16px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-light);
          transition: var(--transition);
          margin: 6px 0 2px;
          align-self: flex-start;
        }

        .toggle-products-btn:hover {
          background: var(--color-primary);
          color: white;
          transform: scale(1.02);
        }

        /* ----- Products List (with slide animation) ----- */
        .products-wrapper {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.4s ease, opacity 0.3s ease, margin 0.3s ease;
          margin-top: 0;
        }

        .products-wrapper.expanded {
          max-height: 800px;
          opacity: 1;
          margin-top: 14px;
        }

        .products-list {
          border-top: 1px solid #f1f2f6;
          padding-top: 14px;
        }

        .products-list h4 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text);
          letter-spacing: 0.01em;
        }

        .products-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f8f9fe;
        }

        .product-item:last-child {
          border-bottom: none;
        }

        .product-thumb {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 10px;
          background: #f1f2f6;
          flex-shrink: 0;
        }

        .product-title {
          flex: 1;
          font-weight: 500;
          color: var(--color-text);
          font-size: 0.9rem;
          min-width: 80px;
        }

        .product-qty,
        .product-price {
          font-size: 0.8rem;
          color: var(--color-text-light);
          white-space: nowrap;
        }

        .product-total {
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.85rem;
          white-space: nowrap;
        }

        /* ----- Pagination ----- */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .page-btn {
          background: var(--color-white);
          border: 1px solid #e9ecef;
          padding: 8px 16px;
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text);
          cursor: pointer;
          transition: var(--transition);
          min-width: 44px;
          text-align: center;
        }

        .page-btn:hover:not(.active) {
          background: #f1f2f6;
          border-color: var(--color-primary);
        }

        .page-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-btn:disabled:hover {
          background: var(--color-white);
          border-color: #e9ecef;
        }

        .page-arrow {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 40px;
          transition: var(--transition);
          color: var(--color-text-light);
        }

        .page-arrow:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
        }

        .page-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 0.9rem;
          color: var(--color-text-light);
          margin: 0 12px;
        }

        /* ----- Status (Loading / Error / Empty) ----- */
        .status-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 40px 20px;
          text-align: center;
        }

        .status-message {
          font-size: 1.2rem;
          color: var(--color-text-light);
          margin: 16px 0 0;
        }

        .status-message.loading {
          color: var(--color-primary);
        }
        .status-message.error {
          color: var(--color-danger);
        }
        .status-message.empty {
          color: var(--color-text-light);
        }

        /* Spinner */
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e9ecef;
          border-top: 4px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-icon {
          font-size: 4rem;
          opacity: 0.5;
          margin-bottom: 8px;
        }

        .retry-btn {
          margin-top: 20px;
          padding: 10px 32px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 40px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 14px rgba(108, 92, 231, 0.3);
        }

        .retry-btn:hover {
          background: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(108, 92, 231, 0.4);
        }

        /* Responsive */
        @media (max-width: 600px) {
          .carts-container {
            padding: 16px;
          }
          .carts-header h1 {
            font-size: 1.5rem;
          }
          .carts-grid {
            grid-template-columns: 1fr;
          }
          .cart-card {
            padding: 16px;
          }
          .product-item {
            flex-wrap: wrap;
          }
          .product-title {
            min-width: 60px;
          }
          .pagination-container {
            gap: 4px;
          }
          .page-btn {
            padding: 6px 12px;
            font-size: 0.8rem;
            min-width: 36px;
          }
        }
      `}</style>

      <div className="carts-container">
        <div className="carts-header">
          <h1>
            🛒View Shopping Carts
            <span>{carts.length}</span>
          </h1>
          <button onClick={handleRetry} className="refresh-btn">
            ⟳ Refresh
          </button>
        </div>

        <div className="carts-grid">
          {currentCarts.map((cart) => {
            const isExpanded = expandedCartId === cart.id;
            return (
              <div key={cart.id} className="cart-card">
                <div className="cart-header">
                  <h2>Cart #{cart.id}</h2>
                  <span className="user-badge">👤 User {cart.userId}</span>
                </div>

                <div className="cart-summary">
                  <p>
                    <span>📦 Products: {cart.totalProducts}</span>
                    <span>🔢 Quantity: {cart.totalQuantity}</span>
                  </p>
                  <p>
                    <span className="total">
                      💰 Total: ${cart.total.toFixed(2)}
                    </span>
                    <span className="discounted">
                      ✨ Discounted: ${cart.discountedTotal.toFixed(2)}
                    </span>
                  </p>
                </div>

                <button
                  className="toggle-products-btn"
                  onClick={() => toggleProducts(cart.id)}
                >
                  {isExpanded ? "▲ Hide products" : "▼ Show products"}
                </button>

                <div
                  className={`products-wrapper ${isExpanded ? "expanded" : ""}`}
                >
                  <div className="products-list">
                    <h4>Product details</h4>
                    <ul>
                      {cart.products.map((product) => (
                        <li key={product.id} className="product-item">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="product-thumb"
                            loading="lazy"
                          />
                          <span className="product-title">{product.title}</span>
                          <span className="product-qty">
                            ×{product.quantity}
                          </span>
                          <span className="product-price">
                            ${product.price}
                          </span>
                          <span className="product-total">
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

        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="page-arrow"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? "active" : ""}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="page-arrow"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default Carts;
