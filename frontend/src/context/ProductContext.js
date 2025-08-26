import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { authFetch } from "../apiClient";
import { hydrateProducts, saveProducts, clearProductsCache } from "../cache/productsCache";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const cached = hydrateProducts(user.uid);
    if (cached.length) setProducts(cached);

    (async () => {
      try {
        const res = await authFetch("/user_products");
        const data = await res.json();
        if (res.ok && data.products) {
          setProducts(data.products);
          saveProducts(user.uid, data.products);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const clearProducts = () => {
    setProducts([]);
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) clearProductsCache(user.uid);
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