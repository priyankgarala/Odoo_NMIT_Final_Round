export { };

export const getPublicProducts = async (axiosInstance) => {
  const { data } = await axiosInstance.get('/api/products/public');
  return data;
};

export const getMyProducts = async (axiosInstance) => {
  const { data } = await axiosInstance.get('/api/products');
  return data;
};

export const createProduct = async (axiosInstance, payload) => {
  const { data } = await axiosInstance.post('/api/products', payload);
  return data;
};

export const updateProduct = async (axiosInstance, id, payload) => {
  const { data } = await axiosInstance.put(`/api/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (axiosInstance, id) => {
  const { data } = await axiosInstance.delete(`/api/products/${id}`);
  return data;
};
