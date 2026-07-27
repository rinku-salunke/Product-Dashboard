import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center my-6 max-w-lg mx-auto">
        <p className="font-semibold text-lg">Oops! Something went wrong.</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-4 flex items-center justify-center">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-64 md:h-80 object-contain rounded-lg"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{product.title}</h1>
            <p className="text-3xl font-extrabold text-blue-600 mt-3">${product.price}</p>
            
            <p className="text-gray-600 mt-4 text-sm leading-relaxed">
              {product.description}
            </p>

            <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Brand:</span>
                <span className="text-slate-800 font-semibold">{product.brand || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Stock Status:</span>
                <span className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Rating:</span>
                <span className="text-slate-800 font-semibold">⭐ {product.rating} / 5</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm text-sm">
              Edit Product
            </button>
            <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-6 rounded-xl transition-colors text-sm border border-red-200">
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;