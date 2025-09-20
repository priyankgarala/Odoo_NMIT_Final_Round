import {
  createProduct,
  findProductsByUser,
  findProductById,
  updateProductById,
  deleteProductById,
  findAllActiveProducts,
} from "../microservices/product.dao.js";
  
export const addProduct = async (userId, payload) => {
  const { ...productData } = payload;
  // console.log("Creating product with taxes:", { taxes, productData }); // Debug log
  
  const product = await createProduct({ ...productData, created_by: userId });
  return product;
};
  
export const listMyProducts = async (userId) => {
  const products = await findProductsByUser(userId);;
  return products;
};
  
export const listPublicProducts = async () => {
  const products = await findAllActiveProducts();
  return products;
};
  
export const getMyProduct = async (userId) => {
  const product = await findProductsByUser(userId);
  return product;
};
  
export const updateMyProduct = async (userId, productId, payload) => {
  console.log("Updating product:", productId, payload); // Debug log
  
  const product = await findProductById(productId);
  if (!product || Number(product.created_by) !== Number(userId)) {
    throw new Error("Product not found or unauthorized");
  }
  
  const { ...productData } = payload;
  console.log("Product data to update:", productData); // Debug log
  // console.log("Taxes to update:", taxes); // Debug log
  
  const updatedProduct = await updateProductById(productId, productData);
  console.log("Product updated:", updatedProduct); // Debug log
  
  // // Handle tax relationships if provided
  // if (taxes !== undefined) {
  //   console.log("Updating tax relationships for product:", productId); // Debug log
  //   await updateProductTaxes(productId, taxes);
  // }
  
  // const finalProduct = await findProductWithTaxes(productId);
  // console.log("Final product with taxes:", finalProduct); // Debug log
  
  return updatedProduct;
};
  
export const removeMyProduct = async (userId, productId) => {
  const product = await findProductById(productId);
  if (!product || Number(product.created_by) !== Number(userId)) {
    throw new Error("Product not found or unauthorized");
  }
  await deleteProductById(productId);
  return { success: true };
};
  
  
  