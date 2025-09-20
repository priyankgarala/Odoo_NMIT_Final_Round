import axiosInstance from "../utils/axiosInstance.js";

export const createSalesOrder = async (salesOrderData) => {
  const { data } = await axiosInstance.post('/api/sales-orders', salesOrderData);
  return data;
};

export const confirmSalesOrder = async (salesOrderId) => {
  const { data } = await axiosInstance.put(`/api/sales-orders/${salesOrderId}/confirm`);
  return data;
};

export const generateCustomerInvoice = async (salesOrderId) => {
  const { data } = await axiosInstance.put(`/api/sales-orders/${salesOrderId}/invoice`);
  return data;
};
