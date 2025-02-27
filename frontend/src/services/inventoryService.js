import { API_URL } from "../config";

export const fetchInventory = async (searchTerm = "") => {
  try {
    let url = `${API_URL}/inventory`;
    if (searchTerm) {
      url += `?search=${encodeURIComponent(searchTerm)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch inventory.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateInventory = async (productId, updateData) => {
  try {
    const url = `${API_URL}/inventory/${productId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || "Failed to update inventory.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchLowStockInventory = async () => {
  try {
    const url = `${API_URL}/inventory/low_stock`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch low stock inventory.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
