export const getAllTaxes = async (axiosInstance, applicableOn = null) => {
  const url = applicableOn ? `/api/taxes?applicable_on=${applicableOn}` : '/api/taxes';
  const { data } = await axiosInstance.get(url);
  return data;
};

export const getTaxById = async (axiosInstance, id) => {
  const { data } = await axiosInstance.get(`/api/taxes/${id}`);
  return data;
};

export const createTax = async (axiosInstance, taxData) => {
  const { data } = await axiosInstance.post('/api/taxes', taxData);
  return data;
};

export const updateTax = async (axiosInstance, id, taxData) => {
  const { data } = await axiosInstance.put(`/api/taxes/${id}`, taxData);
  return data;
};

export const deleteTax = async (axiosInstance, id) => {
  const { data } = await axiosInstance.delete(`/api/taxes/${id}`);
  return data;
};

export const deactivateTax = async (axiosInstance, id) => {
  const { data } = await axiosInstance.patch(`/api/taxes/${id}/deactivate`);
  return data;
};
