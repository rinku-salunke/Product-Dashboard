// src/Pages/Login.jsx (Fallback – works without Tailwind)
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/get-all");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b0b12",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "#12121c",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            Admin Login
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Sign in to manage your dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              padding: "12px",
              borderRadius: "12px",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#cbd5e1",
                marginBottom: "4px",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#0b0b12",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "white",
                borderRadius: "12px",
                padding: "10px 16px",
                outline: "none",
              }}
              placeholder="Enter username"
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#cbd5e1",
                marginBottom: "4px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#0b0b12",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "white",
                borderRadius: "12px",
                padding: "10px 16px",
                outline: "none",
              }}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: "600",
              padding: "10px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            Try: username: <span style={{ color: "#60a5fa" }}>emilys</span> |
            password: <span style={{ color: "#60a5fa" }}>emilyspass</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
