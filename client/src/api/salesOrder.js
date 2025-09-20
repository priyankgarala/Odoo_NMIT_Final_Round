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

// User Invoice API functions
export const getUserInvoices = async () => {
  const { data } = await axiosInstance.get('/api/user-invoices');
  return data;
};

export const getUserInvoiceById = async (invoiceId) => {
  const { data } = await axiosInstance.get(`/api/user-invoices/${invoiceId}`);
  return data;
};

export const getCustomerInvoiceById = async (invoiceId) => {
  const { data } = await axiosInstance.get(`/api/user-invoices/${invoiceId}`);
  return data;
};

export const updateInvoiceStatus = async (userInvoiceId, paymentStatus) => {
  const { data } = await axiosInstance.put(`/api/user-invoices/${userInvoiceId}/status`, {
    userInvoiceId,
    paymentStatus
  });
  return data;
};