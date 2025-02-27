import { API_URL } from "../config";

// Fetch all products
export const fetchProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch products.");
  }
  return data;
};

// Fetch single product
export const fetchProductById = async (productId) => {
  const response = await fetch(`${API_URL}/products/${productId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Failed to fetch product ID: ${productId}`);
  }
  return data;
};

// Create a product (using FormData if uploading images)
export const createProduct = async (formData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create product.");
  }
  return data;
};

// Update a product
export const updateProduct = async (productId, formData) => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PUT",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update product.");
  }
  return data;
};

// Delete a product
export const deleteProduct = async (productId) => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "DELETE",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete product.");
  }
  return data;
};
