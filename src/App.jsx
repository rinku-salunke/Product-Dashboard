import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./Pages/Layout";
import Products from "./Components/Products";
import ProductDetail from "./Pages/ProductDetail";
import Login from "./Auth/Login";
import Users from "./Components/Users";
import Carts from "./Components/Carts";
import ProtectedRoute from "./Auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes - wrapped in Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="users" element={<Users />} />
          <Route path="carts" element={<Carts />} />
        </Route>

        {/* Catch-all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;