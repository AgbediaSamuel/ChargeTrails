import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const fetchProducts = async () => {
      const cached = localStorage.getItem("products");
      if (cached) {
        setProducts(JSON.parse(cached));
        return;
      }
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken(true);
        const res = await fetch("http://localhost:8000/user_products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.products) {
          setProducts(data.products);
          localStorage.setItem("products", JSON.stringify(data.products));
        }
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const clearProducts = () => {
    setProducts([]);
    localStorage.removeItem("products");
  };

  return (
    <ProductContext.Provider value={{ products, setProducts, clearProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}