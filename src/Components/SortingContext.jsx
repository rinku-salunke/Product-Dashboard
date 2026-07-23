// src/Components/SortingContext.jsx
import { createContext, useContext, useState } from "react";

const SortingContext = createContext();

export function useSorting() {
  return useContext(SortingContext);
}

export function SortingProvider({ children }) {
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("asc");

  return (
    <SortingContext.Provider value={{ sortBy, setSortBy, sortOrder, setSortOrder }}>
      {children}
    </SortingContext.Provider>
  );
}