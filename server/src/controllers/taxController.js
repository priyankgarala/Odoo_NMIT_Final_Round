import {
  addTax,
  listAllTaxes,
  getTaxById,
  getTaxesByApplicableOn,
  updateTax,
  removeTax,
  deactivateTax,
} from "../services/taxServices.js";
import HttpError from "../utils/HttpError.js";

export const create_tax = async (req, res, next) => {
  try {
    const tax = await addTax(req.body);
    res.status(201).json(tax);
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to create tax"));
  }
};

export const get_taxes = async (req, res, next) => {
  try {
    const { applicable_on } = req.query;
    let taxes;
    
    if (applicable_on) {
      taxes = await getTaxesByApplicableOn(applicable_on);
    } else {
      taxes = await listAllTaxes();
    }
    
    res.status(200).json(taxes);
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to fetch taxes"));
  }
};

export const get_tax = async (req, res, next) => {
  try {
    const tax = await getTaxById(req.params.id);
    res.status(200).json(tax);
  } catch (error) {
    next(HttpError.notFound(error.message || "Tax not found"));
  }
};

export const update_tax = async (req, res, next) => {
  try {
    const tax = await updateTax(req.params.id, req.body);
    res.status(200).json(tax);
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to update tax"));
  }
};

export const delete_tax = async (req, res, next) => {
  try {
    await removeTax(req.params.id);
    res.status(200).json({ message: "Tax deleted successfully" });
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to delete tax"));
  }
};

export const deactivate_tax = async (req, res, next) => {
  try {
    const tax = await deactivateTax(req.params.id);
    res.status(200).json({ message: "Tax deactivated successfully", tax });
  } catch (error) {
    next(HttpError.badRequest(error.message || "Failed to deactivate tax"));
  }
};

export default {
  create_tax,
  get_taxes,
  get_tax,
  update_tax,
  delete_tax,
  deactivate_tax,
};
