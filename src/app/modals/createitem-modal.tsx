"use client";
import { useState } from "react";
import { createMenuItem } from "@/services/api";
import toast from "react-hot-toast";
import OptionGroupModal from "@/components/option-group-modal";
import { OptionGroup, SpecialInstructions } from "@/types/menu-item";

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  optionGroups?: OptionGroup[];
  specialInstructions?: SpecialInstructions;
  taxRate?: number;
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
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<SpecialInstructions>({
    allowCustomerNotes: false,
    requireNote: false
  });
  const [taxRate, setTaxRate] = useState<number>(0);
  const [showOptionGroupModal, setShowOptionGroupModal] = useState(false);
  const [editingOptionGroup, setEditingOptionGroup] = useState<OptionGroup | undefined>();

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

  const handleAddOptionGroup = () => {
    setEditingOptionGroup(undefined);
    setShowOptionGroupModal(true);
  };

  const handleEditOptionGroup = (optionGroup: OptionGroup) => {
    setEditingOptionGroup(optionGroup);
    setShowOptionGroupModal(true);
  };

  const handleSaveOptionGroup = (optionGroup: OptionGroup) => {
    if (editingOptionGroup) {
      setOptionGroups(prev => 
        prev.map(og => og.id === editingOptionGroup.id ? optionGroup : og)
      );
    } else {
      const newOptionGroup = { ...optionGroup, id: Date.now() };
      setOptionGroups(prev => [...prev, newOptionGroup]);
    }
    setShowOptionGroupModal(false);
    setEditingOptionGroup(undefined);
  };

  const handleRemoveOptionGroup = (optionGroupId: string | number) => {
    setOptionGroups(prev => prev.filter(og => og.id !== optionGroupId));
  };

  const handleSpecialInstructionsChange = (field: keyof SpecialInstructions, value: boolean) => {
    setSpecialInstructions(prev => ({ ...prev, [field]: value }));
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
          option_groups: optionGroups,
          special_instructions: specialInstructions,
          tax_rate: taxRate,
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
          optionGroups: optionGroups,
          specialInstructions: specialInstructions,
          taxRate: taxRate,
        };
        
        onCreate(newItem);
        
        // Reset form
        setName("");
        setDesc("");
        setPrice(0);
        setImage(undefined);
        setOptionGroups([]);
        setSpecialInstructions({ allowCustomerNotes: false, requireNote: false });
        setTaxRate(0);
        
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
        optionGroups: optionGroups,
        specialInstructions: specialInstructions,
        taxRate: taxRate,
      });
      
      // Reset form
      setName("");
      setDesc("");
      setPrice(0);
      setImage(undefined);
      setOptionGroups([]);
      setSpecialInstructions({ allowCustomerNotes: false, requireNote: false });
      setTaxRate(0);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-end bg-black/20 z-50">
      {/* Sidebar */}
      <div className="bg-white w-full max-w-md h-full shadow-lg p-6 overflow-y-auto relative">
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

        {/* Additional Options */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Additional options</h3>
            <span className="text-gray-400">⌄</span>
          </div>
          
          {/* Option Groups */}
          <div className="mb-4">
            <div className="mb-2">
              <h4 className="text-sm font-medium">Option groups</h4>
              <p className="text-xs text-gray-600">
                Give customers the ability to modify this item with things like flavors or sizes.
              </p>
            </div>
            
            {optionGroups.map((optionGroup) => (
              <div key={optionGroup.id} className="flex items-center justify-between p-3 border rounded mb-2">
                <div>
                  <div className="font-medium text-sm">{optionGroup.name}</div>
                  <div className="text-xs text-gray-600">
                    {optionGroup.type} • {optionGroup.options.length} options
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditOptionGroup(optionGroup)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveOptionGroup(optionGroup.id!)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleAddOptionGroup}
              className="w-full border-2 border-dashed border-gray-300 rounded-md py-2 text-sm text-gray-600 hover:border-gray-400"
            >
              Add option group
            </button>
          </div>

          {/* Special Instructions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">Special Instructions</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Allow customers to write in their own notes & requests for this item</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={specialInstructions.allowCustomerNotes}
                    onChange={(e) => handleSpecialInstructionsChange('allowCustomerNotes', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Require customers to add a note</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={specialInstructions.requireNote}
                    onChange={(e) => handleSpecialInstructionsChange('requireNote', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Tax Rate */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Tax Rate</h4>
                <div className="text-sm text-gray-600">
                  {taxRate.toFixed(2)}% {taxRate === 0 ? '(default)' : ''}
                </div>
              </div>
              <button
                onClick={() => {
                  const newRate = prompt('Enter tax rate (0-100):', taxRate.toString());
                  if (newRate !== null) {
                    const rate = parseFloat(newRate);
                    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
                      setTaxRate(rate);
                    }
                  }
                }}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                Set
              </button>
            </div>
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

        {/* Option Group Modal */}
        <OptionGroupModal
          isOpen={showOptionGroupModal}
          onClose={() => {
            setShowOptionGroupModal(false);
            setEditingOptionGroup(undefined);
          }}
          onSave={handleSaveOptionGroup}
          initialData={editingOptionGroup}
        />
      </div>
    </div>
  );
}
