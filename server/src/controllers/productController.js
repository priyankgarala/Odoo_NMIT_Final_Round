import {
    addProduct,
    listMyProducts,
    listPublicProducts,
    getMyProduct,
    updateMyProduct,
    removeMyProduct,
  } from "../services/productServices.js";
  import HttpError from "../utils/HttpError.js";
  
  export const create_product = async (req, res, next) => {
    try {
      const product = await addProduct(req.user.id, req.body);
      res.status(201).json(product);
    } catch (error) {
      next(HttpError.badRequest(error.message || "Failed to create product"));
    }
  };
  
  export const get_products = async (req, res, next) => {
    try {
      const products = await listMyProducts(req.user.id);
      res.status(200).json(products);
    } catch (error) {
      next(HttpError.badRequest(error.message || "Failed to fetch products"));
    }
  };
  
  export const get_public_products = async (req, res, next) => {
    try {
      const products = await listPublicProducts();
      res.status(200).json(products);
    } catch (error) {
      next(HttpError.badRequest(error.message || "Failed to fetch products"));
    }
  };
  
  export const get_product = async (req, res, next) => {
    try {
      const product = await getMyProduct(req.user.id, req.params.id);
      res.status(200).json(product);
    } catch (error) {
      next(HttpError.notFound(error.message || "Product not found"));
    }
  };
  
export const update_product = async (req, res, next) => {
  try {
    console.log("Update product request:", req.params.id, req.body); // Debug log
    const product = await updateMyProduct(req.user.id, req.params.id, req.body);
    console.log("Update product response:", product); // Debug log
    res.status(200).json(product);
  } catch (error) {
    console.error("Update product error:", error); // Debug log
    next(HttpError.badRequest(error.message || "Failed to update product"));
  }
};
  
  export const delete_product = async (req, res, next) => {
    try {
      await removeMyProduct(req.user.id, req.params.id);
      res.status(200).json({ message: "Product deleted" });
    } catch (error) {
      next(HttpError.badRequest(error.message || "Failed to delete product"));
    }
  };

  
  export default {
    create_product,
    get_products,
    get_public_products,
    get_product,
    update_product,
    delete_product,
  };