import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../api/user";
import { logoutUser } from "../api/auth.js";
import axiosInstance from "../utils/axiosInstance";
import { getMyProducts, createProduct, updateProduct, deleteProduct } from "../api/product";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", quantity: 1, category: "", condition: "new", image_url: "" });
  const [productError, setProductError] = useState("");
  const [editProductId, setEditProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", quantity: 1, category: "", condition: "new", image_url: "" });
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: ""
  });

  // Load user profile
  useEffect(() => {
    getUserProfile()
      .then((data) => {
        console.log("Profile data received:", data);
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          avatar: data.avatar || ""
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile");
        setLoading(false);
      });
    // Load my products
    getMyProducts(axiosInstance)
      .then(setProducts)
      .catch((error) => console.error("Failed to load products:", error));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    updateUserProfile(formData)
      .then((data) => {
        console.log("Profile updated:", data);
        setUser(data);
        setEditMode(false);
        toast.success("Profile updated!");
      })
      .catch((error) => {
        console.error("Update failed:", error);
        toast.error("Update failed");
      });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const handleProductChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async () => {
    setProductError("");
    try {
      const created = await createProduct(axiosInstance, { ...productForm, price: Number(productForm.price) });
      setProducts([created, ...products]);
      setProductForm({ name: "", description: "", price: "", quantity: 1, category: "", condition: "new", image_url: "" });
    } catch (err) {
      setProductError(err?.response?.data?.message || err?.message || "Failed to create product");
    }
  };

  const handleUpdateProduct = async (id, updates) => {
    try {
      const updated = await updateProduct(axiosInstance, id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(axiosInstance, id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete product");
    }
  };

  const startEditProduct = (product) => {
    setEditProductId(product.id);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      quantity: product.quantity ?? 1,
      category: product.category || "",
      condition: product.condition || "new",
      image_url: product.image_url || "",
    });
  };

  const cancelEditProduct = () => {
    setEditProductId(null);
  };

  const saveEditProduct = async (id) => {
    const payload = {
      ...editForm,
      price: Number(editForm.price),
      quantity: Number(editForm.quantity),
    };
    await handleUpdateProduct(id, payload);
    setEditProductId(null);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Failed to load profile</p>;

  return (
    <>
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img
              src={formData.avatar || "https://via.placeholder.com/100"}
              alt="avatar"
              className="w-24 h-24 rounded-full border"
            />
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <hr className="my-4" />

        {editMode ? (
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full border p-2 rounded"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full border p-2 rounded bg-gray-100"
            />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write your bio..."
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="Profile picture URL"
              className="w-full border p-2 rounded"
            />

            <div className="flex gap-4">
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-700">Name:</p>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Email:</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Bio:</p>
                <p className="text-gray-900">{user.bio || "No bio yet"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Member Since:</p>
                <p className="text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setEditMode(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    <div className="bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">My Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {products.map(p => (
          <div key={p.id} className="border rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{p.name}</h3>
              <div className="space-x-2">
                <button onClick={() => handleUpdateProduct(p.id, { is_active: !p.is_active })} className="px-3 py-1 rounded bg-yellow-500 text-white">{p.is_active ? 'Deactivate' : 'Activate'}</button>
                {editProductId === p.id ? (
                  <>
                    <button onClick={() => saveEditProduct(p.id)} className="px-3 py-1 rounded bg-green-600 text-white">Save</button>
                    <button onClick={cancelEditProduct} className="px-3 py-1 rounded bg-gray-400 text-white">Cancel</button>
                  </>
                ) : (
                  <button onClick={() => startEditProduct(p)} className="px-3 py-1 rounded bg-blue-600 text-white">Edit</button>
                )}
                <button onClick={() => handleDeleteProduct(p.id)} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
              </div>
            </div>

            {editProductId === p.id ? (
              <div className="mt-3 grid grid-cols-1 gap-2">
                <input className="border p-2 rounded" name="name" value={editForm.name} onChange={(e)=>setEditForm({...editForm,[e.target.name]:e.target.value})} placeholder="Name" />
                <input className="border p-2 rounded" name="price" value={editForm.price} onChange={(e)=>setEditForm({...editForm,[e.target.name]:e.target.value})} placeholder="Price" />
                <input className="border p-2 rounded" name="quantity" value={editForm.quantity} onChange={(e)=>setEditForm({...editForm,[e.target.name]:e.target.value})} placeholder="Quantity" />
                <input className="border p-2 rounded" name="category" value={editForm.category} onChange={(e)=>setEditForm({...editForm,[e.target.name]:e.target.value})} placeholder="Category" />
                <input className="border p-2 rounded" name="image_url" value={editForm.image_url} onChange={(e)=>setEditForm({...editForm,[e.target.name]:e.target.value})} placeholder="Image URL" />
                <select className="border p-2 rounded" name="condition" value={editForm.condition} onChange={(e)=>setEditForm({...editForm,[e.target.name]:e.target.value})}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
                <textarea className="border p-2 rounded" name="description" value={editForm.description} onChange={(e)=>setEditForm({...editForm,[e.target.name]:e.target.value})} placeholder="Description" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">{p.description}</p>
                <p className="mt-2 font-bold">${p.price}</p>
              </>
            )}
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-bold mt-8">Add New Product</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-6">
        <input className="border p-2 rounded" name="name" value={productForm.name} onChange={handleProductChange} placeholder="Name" />
        <input className="border p-2 rounded" name="price" value={productForm.price} onChange={handleProductChange} placeholder="Price" />
        <input className="border p-2 rounded" name="quantity" value={productForm.quantity} onChange={handleProductChange} placeholder="Quantity" />
        <input className="border p-2 rounded" name="category" value={productForm.category} onChange={handleProductChange} placeholder="Category" />
        <input className="border p-2 rounded" name="image_url" value={productForm.image_url} onChange={handleProductChange} placeholder="Image URL" />
        <select className="border p-2 rounded" name="condition" value={productForm.condition} onChange={handleProductChange}>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>
        <textarea className="border p-2 rounded col-span-1 md:col-span-2" name="description" value={productForm.description} onChange={handleProductChange} placeholder="Description" />
      </div>
      <button onClick={handleCreateProduct} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Product</button>
      {productError && <p className="text-red-600 text-sm mt-2">{productError}</p>}

      
    </div>
    </>
  );
};

export default ProfilePage;
