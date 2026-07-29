import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper: Fetch current authenticated user
  const fetchCurrentUser = async (token) => {
    try {
      const res = await fetch("https://dummyjson.com/auth/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include", // Include cookies if needed
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await res.json();
      localStorage.setItem("userProfile", JSON.stringify(userData));
      console.log("Current user:", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error.message);
      return null;
    }
  };

  // Helper: Refresh the auth session
  const refreshAuthSession = async (refreshToken) => {
    try {
      const res = await fetch("https://dummyjson.com/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: refreshToken, // Optional — server can use cookie if omitted
          expiresInMins: 30, // Optional, defaults to 60
        }),
        credentials: "include", // Include cookies
      });

      if (!res.ok) {
        throw new Error("Failed to refresh session");
      }

      const data = await res.json();
      // Update stored tokens with new ones
      localStorage.setItem("token", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      console.log("Session refreshed successfully");
      return data;
    } catch (error) {
      console.error("Error refreshing session:", error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. LOGIN — get access token
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 2. Store tokens
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));

      // 3. Fetch full user profile using /auth/me
      await fetchCurrentUser(data.accessToken);

      // 4. (Optional) You can also refresh the session here if needed
      // await refreshAuthSession(data.refreshToken);

      navigate("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b12] p-4">
      <div className="w-full max-w-md bg-[#12121c] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Admin Login</h1>
          <p className="text-sm text-slate-400">Sign in to manage your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0b0b12] border border-white/5 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b0b12] border border-white/5 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Try: username: <span className="text-blue-400">emilys</span> |
            password: <span className="text-blue-400">emilyspass</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;