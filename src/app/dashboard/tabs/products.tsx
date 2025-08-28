// app/page.tsx
"use client";

import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  date: string;
  image: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState(false);

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

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now(),
      name: formData.name,
      price: `$${formData.price}`,
      description: formData.description,
      date: new Date().toDateString(),
      image: imagePreview || "/food.png",
    };

    setProducts([...products, newProduct]);
    setFormData({ name: "", price: "", description: "", image: "" });
    setImagePreview(null);
    setIsOpen(false);
  };

  const handleDelete = (id: number) => {
    const updatedProducts = products.filter((p) => p.id !== id);
    setProducts(updatedProducts);
  };

  const handleDuplicate = (id: number) => {
    const productToDuplicate = products.find((p) => p.id === id);
    if (productToDuplicate) {
      const duplicatedProduct: Product = {
        ...productToDuplicate,
        id: Date.now(), // new unique ID
        date: new Date().toDateString(), // update created date
      };
      setProducts([...products, duplicatedProduct]);
    }
  };


  return (
    <div>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Products</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Create Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg">
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
                    src={product.image}
                    alt="food"
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.price}</td>
                <td className="p-3">{product.date}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleDuplicate(product.id)}
                    className="px-3 py-1 bg-orange-100 text-orange-600 rounded-md"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-md"
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
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Something tasty"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm mb-1">Best Price</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full border pl-6 p-2 rounded"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  placeholder="Write about how delicious this is"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  rows={3}
                  maxLength={1000}
                ></textarea>
                <p className="text-xs text-gray-400 text-right">
                  {formData.description.length}/1000
                </p>
              </div>
              <div>
                <label className="block text-sm mb-1">Option groups</label>
                <button className="w-full border p-2 rounded text-gray-600">
                  Add option group
                </button>
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
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
