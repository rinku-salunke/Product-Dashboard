import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./Pages/Layout";
import Products from "./Components/Products";
import ProductDetail from "./Pages/ProductDetail";
import Login from "./Pages/Login";
import Users from "./Components/Users";
import Carts from "./Components/Carts";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - Login */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/get-all" replace />} />
          <Route path="/get-all" element={<Products />} />
          <Route path="/single-product/:id" element={<ProductDetail />} />
          <Route path="/users" element={<Users />} />
          <Route path="/carts" element={<Carts />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;