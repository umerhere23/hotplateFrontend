"use client";
import { useState } from "react";

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export default function CreateItemModal({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (item: Item) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState<string | undefined>();

  // handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name) return;
    onCreate({
      id: Date.now(),
      name,
      description: desc,
      price,
      image,
    });
  };

  return (
    <div className="fixed inset-0 flex justify-end bg-black/20 z-50">
      {/* Sidebar */}
      <div className="bg-white w-full max-w-md h-full shadow-lg p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Item</h2>
          <button onClick={onBack} className="text-gray-500">
            ✕
          </button>
        </div>

        {/* Upload */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="upload-photo"
          />
          <label
            htmlFor="upload-photo"
            className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-gray-100 cursor-pointer text-center block"
          >
            Upload photo
          </label>
          {image && (
            <img
              src={image}
              alt="preview"
              className="w-24 h-24 object-cover rounded mt-2"
            />
          )}
          <p className="text-xs text-gray-500 mt-1">
            Recommended size is 750px x 750px
          </p>
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Something tasty"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            rows={3}
            placeholder="Write about how delicious this is"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Base price</label>
          <div className="flex items-center gap-2">
            <span className="border px-3 py-2 rounded-md">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white px-4 py-2 rounded-md"
        >
          Create item
        </button>
      </div>
    </div>
  );
}
