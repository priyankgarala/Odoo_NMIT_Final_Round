import axiosInstance from "../utils/axiosInstance.js";

// Contact API functions

export const getAllContacts = async () => {
    const { data } = await axiosInstance.get("/api/contacts");
    return data;
};

export const getVendors = async () => {
    const { data } = await axiosInstance.get("/api/contacts?type=vendor");
    return data;
};

export const getCustomers = async () => {
    const { data } = await axiosInstance.get("/api/contacts?type=customer");
    return data;
};

export const getContactById = async (id) => {
    const { data } = await axiosInstance.get(`/api/contacts/${id}`);
    return data;
};

export const createContact = async (contactData) => {
    const { data } = await axiosInstance.post("/api/contacts", contactData);
    return data;
};

export const updateContact = async (id, contactData) => {
    const { data } = await axiosInstance.put(`/api/contacts/${id}`, contactData);
    return data;
};

export const deleteContact = async (id) => {
    const { data } = await axiosInstance.delete(`/api/contacts/${id}`);
    return data;
};
