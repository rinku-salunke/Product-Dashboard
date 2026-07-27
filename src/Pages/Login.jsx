import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Basic validation (Replace this with your backend API authentication call)
    if (email === "admin@example.com" && password === "admin123") {
      // Save dummy token to localStorage to satisfy the ProtectedRoute check
      localStorage.setItem("token", "dummy-jwt-token-12345");

      // Redirect to your product dashboard
      navigate("//get-all");
    } else {
      setError("Invalid email or password. Try admin@example.com / admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-slate-900 rounded-xl shadow-lg p-8 text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Admin Portal</h1>
          <p className="text-sm text-slate-400 mt-2">
            Sign in to manage your products
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 shadow-md text-sm"
          >
            Login
          </button>
        </form>

        {/* Helper Hint */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Demo Credentials:{" "}
          <span className="text-slate-300">admin@example.com</span> /{" "}
          <span className="text-slate-300">admin123</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
