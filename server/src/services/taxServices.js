import {
  createTax,
  findAllTaxes,
  findTaxById,
  findTaxesByApplicableOn,
  updateTaxById,
  deleteTaxById,
  softDeleteTaxById,
} from "../microservices/tax.dao.js";

export const addTax = async (taxData) => {
  return createTax(taxData);
};

export const listAllTaxes = async () => {
  return findAllTaxes();
};

export const getTaxById = async (taxId) => {
  const tax = await findTaxById(taxId);
  if (!tax) {
    throw new Error("Tax not found");
  }
  return tax;
};

export const getTaxesByApplicableOn = async (applicableOn) => {
  return findTaxesByApplicableOn(applicableOn);
};

export const updateTax = async (taxId, taxData) => {
  const tax = await findTaxById(taxId);
  if (!tax) {
    throw new Error("Tax not found");
  }
  return updateTaxById(taxId, taxData);
};

export const removeTax = async (taxId) => {
  const tax = await findTaxById(taxId);
  if (!tax) {
    throw new Error("Tax not found");
  }
  return deleteTaxById(taxId);
};

export const deactivateTax = async (taxId) => {
  const tax = await findTaxById(taxId);
  if (!tax) {
    throw new Error("Tax not found");
  }
  return softDeleteTaxById(taxId);
};
