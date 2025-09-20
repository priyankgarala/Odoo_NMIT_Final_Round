import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from "../microservices/contact.dao.js";
import HttpError from "../utils/HttpError.js";

export const get_contacts = async (req, res, next) => {
  try {
    const { type } = req.query;
    const contacts = await getAllContacts(type);
    res.status(200).json({
      message: "Contacts retrieved successfully",
      contacts
    });
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to fetch contacts"));
  }
};

export const get_contact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);
    
    if (!contact) {
      return next(HttpError.notFound("Contact not found"));
    }
    
    res.status(200).json({
      message: "Contact retrieved successfully",
      contact
    });
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to fetch contact"));
  }
};

export const create_contact = async (req, res, next) => {
  try {
    const contactData = req.body;
    const newContact = await createContact(contactData);
    res.status(201).json({
      message: "Contact created successfully",
      contact: newContact
    });
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to create contact"));
  }
};

export const update_contact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contactData = req.body;
    const updatedContact = await updateContact(id, contactData);
    
    if (!updatedContact) {
      return next(HttpError.notFound("Contact not found"));
    }
    
    res.status(200).json({
      message: "Contact updated successfully",
      contact: updatedContact
    });
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to update contact"));
  }
};

export const delete_contact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await deleteContact(id);
    
    if (!deletedContact) {
      return next(HttpError.notFound("Contact not found"));
    }
    
    res.status(200).json({
      message: "Contact deleted successfully",
      contact: deletedContact
    });
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to delete contact"));
  }
};
