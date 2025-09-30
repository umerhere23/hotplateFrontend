// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  type Product,
  type CreateProductPayload 
} from "@/services/api";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [optionGroups, setOptionGroups] = useState<Array<{
    id: string;
    name: string;
    required: boolean;
    options: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>>([]);

  // Helper to reset form to initial create state
  const resetForm = () => {
    setFormData({ name: "", price: "", description: "", image: "" });
    setImagePreview(null);
    setSpecialInstructions(false);
    setOptionGroups([]);
    setErrors({});
    setEditingId(null);
  };

  // Show notification for a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setNotification({ type: 'error', message: 'Failed to load products. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addOptionGroup = () => {
    const newOptionGroup = {
      id: `option-group-${Date.now()}`,
      name: "",
      required: false,
      options: []
    };
    setOptionGroups([...optionGroups, newOptionGroup]);
  };

  const updateOptionGroup = (groupId: string, updates: Partial<typeof optionGroups[0]>) => {
    setOptionGroups(prev => 
      prev.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  };

  const removeOptionGroup = (groupId: string) => {
    setOptionGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const addOptionToGroup = (groupId: string) => {
    const newOption = {
      id: `option-${Date.now()}`,
      name: "",
      price: 0
    };
    
    setOptionGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, options: [...group.options, newOption] }
          : group
      )
    );
  };

  const updateOption = (groupId: string, optionId: string, updates: Partial<typeof optionGroups[0]['options'][0]>) => {
    setOptionGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? {
              ...group, 
              options: group.options.map(option => 
                option.id === optionId ? { ...option, ...updates } : option
              )
            }
          : group
      )
    );
  };

  const removeOption = (groupId: string, optionId: string) => {
    setOptionGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, options: group.options.filter(option => option.id !== optionId) }
          : group
      )
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    try {
      const productPayload: CreateProductPayload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        image: imagePreview || undefined,
        special_instructions: specialInstructions,
        option_groups: optionGroups.map(g => ({
          name: g.name,
          required: g.required,
          options: g.options.map(o => ({ name: o.name, price: o.price }))
        }))
      };

      let result;
      if (editingId) {
        // Edit flow
        result = await updateProduct(editingId, productPayload);
      } else {
        result = await createProduct(productPayload);
      }
      
      if (result.success && result.data) {
        // Add the new product to local state
        if (editingId) {
          setProducts(prevProducts => prevProducts.map(p => p.id === editingId ? (result.data as Product) : p));
        } else {
          setProducts(prevProducts => [...prevProducts, result.data as Product]);
        }
        
  // Reset form and close modal
  resetForm();
  setIsOpen(false);
  setNotification({ type: 'success', message: editingId ? 'Product updated successfully!' : 'Product created successfully!' });
      } else {
        setNotification({ type: 'error', message: result.message || 'Failed to create product' });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setNotification({ type: 'error', message: 'Failed to create product' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const result = await deleteProduct(id);
      
      if (result.success) {
        // Remove from local state
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
        setNotification({ type: 'success', message: 'Product deleted successfully!' });
      } else {
        setNotification({ type: 'error', message: result.message || 'Failed to delete product' });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setNotification({ type: 'error', message: 'Failed to delete product' });
    }
  };

  const handleDuplicate = async (id: number) => {
  // Deprecated: duplication removed in favor of edit. Left intentionally blank.
  };


  return (
    <div>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Products</h2>
        <button
          onClick={() => { resetForm(); setIsOpen(true); }}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          Create Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Date Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-3">
                      <img
                        src={product.image_url || product.image || "/food.png"}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    </td>
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">
                      {typeof product.price === 'string' && product.price.startsWith('$') 
                        ? product.price 
                        : `$${product.price}`}
                    </td>
                    <td className="p-3">
                      {product.created_at 
                        ? new Date(product.created_at).toDateString()
                        : product.date || new Date().toDateString()}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          // Prefill form and open modal for editing
                          setEditingId(product.id);
                          setFormData({
                            name: product.name || "",
                            price: String(product.price || ""),
                            description: product.description || "",
                            image: product.image || product.image_url || "",
                          });
                          setImagePreview(product.image || product.image_url || null);
                          setOptionGroups(product.option_groups || []);
                          setSpecialInstructions(!!product.special_instructions);
                          setIsOpen(true);
                        }}
                        className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <p className="text-center text-gray-500 py-6">No products yet</p>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center  bg-black/10">
          <div className="bg-white w-[500px] max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-md relative">
            <h3 className="text-xl font-semibold mb-4">Create Product</h3>

            {/* Upload Photo */}
            <div className="bg-[#ECECF0] rounded-lg p-6 text-center mb-4 cursor-pointer relative">
              <label className="block cursor-pointer">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="mx-auto w-32 h-32 object-cover rounded"
                  />
                ) : (
                  <p className="text-gray-500">
                    Upload a file or drag and drop here <br />
                    <span className="text-xs">
                      Recommended size is 750px × 750px
                    </span>
                  </p>
                )}
                {/* Hidden input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm mb-1">Name *</label>
                  <input
                    type="text"
                    placeholder="Something tasty"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`w-full border p-2 rounded ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="col-span-1">
                  <label className="block text-sm mb-1">Best Price *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: e.target.value });
                        if (errors.price) setErrors({ ...errors, price: "" });
                      }}
                      className={`w-full border pl-6 p-2 rounded ${errors.price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Description *</label>
                <textarea
                  placeholder="Write about how delicious this is"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) setErrors({ ...errors, description: "" });
                  }}
                  className={`w-full border p-2 rounded ${errors.description ? 'border-red-500' : ''}`}
                  rows={3}
                  maxLength={1000}
                ></textarea>
                <div className="flex justify-between items-center">
                  {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                  <p className="text-xs text-gray-400 ml-auto">
                    {formData.description.length}/1000
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Option groups</label>
                <div className="space-y-2">
                  {optionGroups.length === 0 && (
                    <div className="text-sm text-gray-500">No option groups yet</div>
                  )}

                  {optionGroups.map((group) => (
                    <div key={group.id} className="border p-2 rounded space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Group name (e.g. Size)"
                          value={group.name}
                          onChange={(e) => updateOptionGroup(group.id, { name: e.target.value })}
                          className="flex-1 border p-1 rounded"
                        />
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={group.required}
                            onChange={(e) => updateOptionGroup(group.id, { required: e.target.checked })}
                          />
                          Required
                        </label>
                        <button
                          onClick={() => removeOptionGroup(group.id)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-2">
                        {group.options.map((opt) => (
                          <div key={opt.id} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Option name"
                              value={opt.name}
                              onChange={(e) => updateOption(group.id, opt.id, { name: e.target.value })}
                              className="flex-1 border p-1 rounded"
                            />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={String(opt.price)}
                              onChange={(e) => updateOption(group.id, opt.id, { price: parseFloat(e.target.value || '0') })}
                              className="w-24 border p-1 rounded"
                            />
                            <button
                              onClick={() => removeOption(group.id, opt.id)}
                              className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <div>
                          <button
                            onClick={() => addOptionToGroup(group.id)}
                            className="w-full border p-2 rounded text-gray-600 text-sm"
                          >
                            + Add option
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <button
                      onClick={addOptionGroup}
                      className="w-full border p-2 rounded text-gray-600"
                    >
                      + Add option group
                    </button>
                  </div>
                </div>
                
               </div>
              <div className="flex items-center justify-between border p-2 rounded">
                <span>Special Instructions</span>
                <button
                  onClick={() => setSpecialInstructions(!specialInstructions)}
                  className={`px-4 py-1 rounded ${specialInstructions
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {specialInstructions ? "Allow" : "Deny"}
                </button>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => { setIsOpen(false); resetForm(); }}
                  disabled={submitLoading}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={submitLoading || !formData.name || !formData.price}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {submitLoading ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' 
            ? 'bg-green-100 border-green-500 text-green-700' 
            : 'bg-red-100 border-red-500 text-red-700'
        } border`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
