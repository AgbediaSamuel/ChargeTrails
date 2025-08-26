import React, { useState } from "react";
import { getAuth } from "firebase/auth";

const TestSearch = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetProducts = async () => {
    setError("");
    setProducts([]);
    setLoading(true);
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        setError("No user is currently signed in.");
        setLoading(false);
        return;
      }
      const idToken = await auth.currentUser.getIdToken(true);

      const response = await fetch("http://localhost:8000/user_products", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.products) {
        setProducts(data.products);
      } else {
        setError(data.error || "Failed to fetch products.");
      }
    } catch (err) {
      setError("Failed to get products: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Test User Products Fetch</h2>
      <button onClick={handleGetProducts} disabled={loading}>
        {loading ? "Loading..." : "Get User Products"}
      </button>
      {products.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <strong>Products:</strong>
          <ul>
            {products.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default TestSearch;