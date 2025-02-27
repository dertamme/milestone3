import { API_URL } from "../config";

// Fetch all orders (supports optional pagination, search, etc.)
export const fetchOrders = async (page = 1, perPage = 10, searchTerm = "") => {
  let url = `${API_URL}/orders?page=${page}&per_page=${perPage}`;
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch orders.");
  }
  return response.json();
};

// Fetch single order
export const fetchOrderById = async (orderId) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch order with ID ${orderId}`);
  }
  return response.json();
};

// Create a new order (JSON body)
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create order.");
  }
  return data;
};

// Update an order's status (or other fields)
export const updateOrderStatus = async (orderId, updateData) => {
  // Example: PUT /orders/<orderId>/status
  const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update order status.");
  }
  return data;
};

// Delete an order
export const deleteOrder = async (orderId) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete order.");
  }
  return data;
};
