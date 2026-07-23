import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Check if the admin token exists in localStorage
  const isAuthenticated = localStorage.getItem("adminToken") !== null;

  // If NOT authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child component (like AddProduct, DeleteProduct, etc.)
  return children;
}

export default ProtectedRoute;
