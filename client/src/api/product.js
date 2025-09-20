import axiosInstance from "../utils/axiosInstance.js";

export const getPublicProducts = async () => {
  const { data } = await axiosInstance.get('/api/products/public');
  return data;
};

export const getMyProducts = async () => {
  const { data } = await axiosInstance.get('/api/products');
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await axiosInstance.post('/api/products', payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await axiosInstance.put(`/api/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await axiosInstance.delete(`/api/products/${id}`);
  return data;
};

