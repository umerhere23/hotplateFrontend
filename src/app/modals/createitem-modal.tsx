"use client";
import { useState } from "react";
import { createMenuItem } from "@/services/api";
import toast from "react-hot-toast";

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
  eventId,
}: {
  onBack: () => void;
  onCreate: (item: Item) => void;
  eventId?: string | number | null;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the item");
      return;
    }
    
    if (price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // If eventId is provided, save to backend first
    if (eventId) {
      setIsLoading(true);
      try {
        const payload = {
          event_id: eventId,
          name: name.trim(),
          description: desc.trim(),
          price: price,
          image_url: image || undefined,
        };

        console.log("Creating menu item with payload:", payload);
        const result = await createMenuItem(payload);
        
        if (!result.success) {
          toast.error(result.message || "Failed to create menu item");
          return;
        }

        toast.success("Menu item created successfully");
        
        // Call the onCreate callback with the API response data or local data
        const newItem: Item = {
          id: result.data?.id || Date.now(),
          name: name.trim(),
          description: desc.trim(),
          price: price,
          image: image,
        };
        
        onCreate(newItem);
        
        // Reset form
        setName("");
        setDesc("");
        setPrice(0);
        setImage(undefined);
        
      } catch (error: any) {
        console.error("Error creating menu item:", error);
        toast.error(error?.message || "Failed to create menu item");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback: just create local item if no eventId
      toast.success("Item added to local menu");
      onCreate({
        id: Date.now(),
        name: name.trim(),
        description: desc.trim(),
        price,
        image,
      });
      
      // Reset form
      setName("");
      setDesc("");
      setPrice(0);
      setImage(undefined);
    }
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
          disabled={isLoading || !name.trim() || price <= 0}
          className={`w-full px-4 py-2 rounded-md text-white font-medium ${
            isLoading || !name.trim() || price <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {isLoading ? "Creating..." : "Create item"}
        </button>
      </div>
    </div>
  );
}
