// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Product from "./Product";
import GetAllProducts from "./Components/GetAllProducts";
import ProductDetail from "./Components/ProductDetail";
import CategoryList from "./Components/CategoryList";
import Login from "./Components/Login";
import { SortingProvider } from "./Components/SortingContext"; // adjust if needed

function App() {
  return (
    <BrowserRouter>
      <SortingProvider>   {/* 👈 Provider lives here */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Product />}>
            <Route path="/get-all" element={<GetAllProducts />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/single-product/:id" element={<ProductDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SortingProvider>
    </BrowserRouter>
  );
}

export default App;