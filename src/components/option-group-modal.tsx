"use client";
import { useState } from "react";
import { OptionGroup, Option } from "@/types/menu-item";

interface OptionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (optionGroup: OptionGroup) => void;
  initialData?: OptionGroup;
}

export default function OptionGroupModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: OptionGroupModalProps) {
  const [activeTab, setActiveTab] = useState<'setup' | 'preview'>('setup');
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<'modifier' | 'variation'>(initialData?.type || 'modifier');
  const [options, setOptions] = useState<Option[]>(
    initialData?.options || [{ name: '', priceAdjustment: 0 }]
  );
  const [requireSelection, setRequireSelection] = useState(initialData?.requireSelection || false);
  const [enableInventory, setEnableInventory] = useState(initialData?.enableInventory || false);

  const handleAddOption = () => {
    setOptions([...options, { name: '', priceAdjustment: 0 }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, field: keyof Option, value: string | number) => {
    const updatedOptions = options.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    );
    setOptions(updatedOptions);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name for the option group');
      return;
    }

    const validOptions = options.filter(option => option.name.trim());
    if (validOptions.length === 0) {
      alert('Please add at least one option');
      return;
    }

    const optionGroup: OptionGroup = {
      id: initialData?.id,
      name: name.trim(),
      type,
      options: validOptions,
      requireSelection,
      enableInventory
    };

    onSave(optionGroup);
    onClose();
  };

  const isFormValid = name.trim() && options.some(option => option.name.trim());

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white z-[60] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create option group</h2>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 font-medium rounded-md ${
              activeTab === 'setup' 
                ? 'text-white bg-black hover:bg-gray-800' 
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium rounded-md ${
              activeTab === 'preview' 
                ? 'text-white bg-black hover:bg-gray-800' 
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Preview
          </button>
        </div>

        <div>
          {activeTab === 'setup' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Option group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Type</label>
                <div className="space-y-3">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer ${
                      type === 'modifier' ? 'border-black bg-gray-50' : 'border-gray-200'
                    }`}
                    onClick={() => setType('modifier')}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={type === 'modifier'}
                        onChange={() => setType('modifier')}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">Modifier</div>
                        <div className="text-sm text-gray-600">
                          Modifiers are for standard options you have on an item (e.g. extra sauce, no onions, etc.)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer ${
                      type === 'variation' ? 'border-black bg-gray-50' : 'border-gray-200'
                    }`}
                    onClick={() => setType('variation')}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={type === 'variation'}
                        onChange={() => setType('variation')}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">Variation</div>
                        <div className="text-sm text-gray-600">
                          Variations are when you want to setup distinct types of an item (e.g. flavor, size, etc.)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Options</label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="text-gray-400 cursor-move">⋮⋮</div>
                      <input
                        type="text"
                        placeholder="Option name"
                        value={option.name}
                        onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                        className="flex-1 border rounded-md px-3 py-2 text-sm"
                      />
                      <div className="flex items-center border rounded-md">
                        <span className="px-3 py-2 text-sm">$ +/-</span>
                        <input
                          type="number"
                          step="0.01"
                          value={option.priceAdjustment}
                          onChange={(e) => handleOptionChange(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-2 border-l"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={options.length === 1}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddOption}
                  className="w-full mt-3 border-2 border-dashed border-gray-300 rounded-md py-2 text-sm text-gray-600 hover:border-gray-400"
                >
                  Add option
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Rules</label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Require a selection</div>
                      <div className="text-sm text-gray-600">
                        If you turn this on, customers will have to select at least one option before adding to cart
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireSelection}
                        onChange={(e) => setRequireSelection(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Enable inventory for this group</div>
                      <div className="text-sm text-gray-600">
                        This will allow you to limit how many of each option can be sold when you add this item to a drop
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableInventory}
                        onChange={(e) => setEnableInventory(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">{name || 'Option Group Name'}</h3>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <span>{option.name || 'Option name'}</span>
                    <span className="text-sm text-gray-600">
                      {option.priceAdjustment > 0 ? '+' : ''}${option.priceAdjustment.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
              isFormValid
                ? 'bg-black hover:bg-gray-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Create option group
          </button>
        </div>
    </div>
  );
}
