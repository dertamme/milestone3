import { API_URL } from "../config";

export const fetchInventory = async (searchTerm = "") => {
  let url = `${API_URL}/inventory`;
  if (searchTerm) {
    url += `?search=${encodeURIComponent(searchTerm)}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.description || "Failed to fetch inventory.");
  }
  return data;
};

export const updateInventory = async (productId, updateData) => {
  const url = `${API_URL}/inventory/${productId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.description || "Failed to update inventory.");
  }
  return data;
};

export const fetchLowStockInventory = async () => {
  const url = `${API_URL}/inventory/low_stock`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.description || "Failed to fetch low stock inventory.");
  }
  return data;
};
