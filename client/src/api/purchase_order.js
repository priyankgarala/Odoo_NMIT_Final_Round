import axiosInstance from "../utils/axiosInstance.js";

export const createPurchaseOrder = async (payload) => {
    const { data } = await axiosInstance.post('/api/purchase-orders', payload);
    return data;
};

export const getPurchaseOrders = async () => {
    const { data } = await axiosInstance.get('/api/purchase-orders');
    return data;
};

export const getPurchaseOrderById = async (id) => {
    const { data } = await axiosInstance.get(`/api/purchase-orders/${id}`);
    return data;
};

export const confirmPurchaseOrder = async (id) => {
    const { data } = await axiosInstance.put(`/api/purchase-orders/${id}/confirm`);
    return data;
};

export const billPurchaseOrder = async (id) => {
    const { data } = await axiosInstance.put(`/api/purchase-orders/${id}/bill`);
    return data;
};