import { useProducts } from "../context/ProductContext";

export function useProductSearch(query) {
  const { products } = useProducts();

  if (!query) return [];

  // Filter and sort by first match position
  return products
    .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const aIndex = a.toLowerCase().indexOf(query.toLowerCase());
      const bIndex = b.toLowerCase().indexOf(query.toLowerCase());
      return aIndex - bIndex;
    });
}