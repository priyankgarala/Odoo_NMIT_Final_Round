export const createPurchaseOrder = async (axiosInstance, payload) => {
const { data } = await axiosInstance.post('/api/purchase_orders', payload);
return data;
};