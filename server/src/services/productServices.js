import {
  createProduct,
  findProductsByUser,
  findProductById,
  findProductWithTaxes,
  updateProductById,
  deleteProductById,
  findAllActiveProducts,
} from "../microservices/product.dao.js";
import { updateProductTaxes } from "../microservices/product_tax.dao.js";
  
export const addProduct = async (userId, payload) => {
  const { taxes, ...productData } = payload;
  console.log("Creating product with taxes:", { taxes, productData }); // Debug log
  
  const product = await createProduct({ ...productData, created_by: userId });
  
  // Handle tax relationships if provided
  if (taxes && taxes.length > 0) {
    console.log("Adding taxes to product:", product.id, taxes); // Debug log
    await updateProductTaxes(product.id, taxes);
  }
  
  return findProductWithTaxes(product.id);
};
  
export const listMyProducts = async (userId) => {
  const products = await findProductsByUser(userId);
  // Get taxes for each product
  const productsWithTaxes = await Promise.all(
    products.map(async (product) => {
      const productWithTaxes = await findProductWithTaxes(product.id);
      return productWithTaxes || product;
    })
  );
  return productsWithTaxes;
};
  
export const listPublicProducts = async () => {
  const products = await findAllActiveProducts();
  // Get taxes for each product
  const productsWithTaxes = await Promise.all(
    products.map(async (product) => {
      const productWithTaxes = await findProductWithTaxes(product.id);
      return productWithTaxes || product;
    })
  );
  return productsWithTaxes;
};
  
export const getMyProduct = async (userId, productId) => {
  const product = await findProductWithTaxes(productId);
  if (!product || Number(product.created_by) !== Number(userId)) {
    throw new Error("Product not found");
  }
  return product;
};
  
export const updateMyProduct = async (userId, productId, payload) => {
  console.log("Updating product:", productId, payload); // Debug log
  
  const product = await findProductById(productId);
  if (!product || Number(product.created_by) !== Number(userId)) {
    throw new Error("Product not found or unauthorized");
  }
  
  const { taxes, ...productData } = payload;
  console.log("Product data to update:", productData); // Debug log
  console.log("Taxes to update:", taxes); // Debug log
  
  const updatedProduct = await updateProductById(productId, productData);
  console.log("Product updated:", updatedProduct); // Debug log
  
  // Handle tax relationships if provided
  if (taxes !== undefined) {
    console.log("Updating tax relationships for product:", productId); // Debug log
    await updateProductTaxes(productId, taxes);
  }
  
  const finalProduct = await findProductWithTaxes(productId);
  console.log("Final product with taxes:", finalProduct); // Debug log
  
  return finalProduct;
};
  
export const removeMyProduct = async (userId, productId) => {
  const product = await findProductById(productId);
  if (!product || Number(product.created_by) !== Number(userId)) {
    throw new Error("Product not found or unauthorized");
  }
  await deleteProductById(productId);
  return { success: true };
};
  
  
  