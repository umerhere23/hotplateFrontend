"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Upload, X, Save, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { createMenuItem, updateMenuItem, deleteMenuItem, getMenuItems } from "@/services/api"
import ImageUploader from "./image-uploader"
import { OptionGroup, SpecialInstructions } from "@/types/menu-item"

export interface MenuItem {
  id?: string | number
  event_id: string | number
  name: string
  description: string
  price: number
  image_url?: string
  category?: string
  is_available?: boolean
  sort_order?: number
  option_groups?: OptionGroup[]
  special_instructions?: SpecialInstructions
  tax_rate?: number
}

interface MenuTabProps {
  eventId: string | number
  onMenuItemsChange?: (items: MenuItem[]) => void
  onContinue?: () => void
}

interface MenuItemFormData {
  name: string
  description: string
  price: string
  image_url?: string
  category: string
  is_available: boolean
  option_groups?: OptionGroup[]
  special_instructions?: SpecialInstructions
  tax_rate?: number
}

const MenuTab: React.FC<MenuTabProps> = ({ eventId, onMenuItemsChange, onContinue }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<string | number | null>(null)
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "main",
    is_available: true,
    option_groups: [],
    special_instructions: {
      allowCustomerNotes: false,
      requireNote: false
    },
    tax_rate: 0,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing menu items when component mounts
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const items = await getMenuItems(eventId)
        const formattedItems: MenuItem[] = items.map(item => ({
          id: item.id || `temp-${Date.now()}-${Math.random()}`,
          event_id: item.event_id,
          name: item.name,
          description: item.description || "",
          price: item.price,
          image_url: item.image_url,
          category: "main", // Default category
          is_available: true, // Default availability
        }))
        setMenuItems(formattedItems)
        onMenuItemsChange?.(formattedItems)
      } catch (error) {
        console.error("Error loading menu items:", error)
      }
    }

    if (eventId) {
      loadMenuItems()
    }
  }, [eventId, onMenuItemsChange])
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Item name is required"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Price must be a positive number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form input changes
  const handleInputChange = (field: keyof MenuItemFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Handle image selection
  const handleImageSelect = (imageUrl: string) => {
    handleInputChange("image_url", imageUrl)
  }

  // Add new menu item
  const handleAddItem = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createMenuItem({
        event_id: eventId,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image_url: formData.image_url || undefined,
        option_groups: formData.option_groups,
        special_instructions: formData.special_instructions,
        tax_rate: formData.tax_rate,
      })

      if (response.success && response.data) {
        const newItem: MenuItem = {
          id: response.data.id,
          event_id: eventId,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          image_url: formData.image_url || undefined,
          category: formData.category,
          is_available: formData.is_available,
          option_groups: formData.option_groups,
          special_instructions: formData.special_instructions,
          tax_rate: formData.tax_rate,
        }

        setMenuItems(prev => [...prev, newItem])
        onMenuItemsChange?.([...menuItems, newItem])
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          image_url: "",
          category: "main",
          is_available: true,
          option_groups: [],
          special_instructions: {
            allowCustomerNotes: false,
            requireNote: false
          },
          tax_rate: 0,
        })
        setIsAddingItem(false)
        
        toast.success("Menu item added successfully!")
      } else {
        throw new Error(response.message || "Failed to create menu item")
      }
    } catch (error) {
      console.error("Error creating menu item:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add menu item")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit menu item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item.id || "")
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image_url: item.image_url || "",
      category: item.category || "main",
      is_available: item.is_available !== false,
    })
    setIsAddingItem(true)
  }

  // Update menu item
  const handleUpdateItem = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await updateMenuItem(editingItem!, {
        event_id: eventId,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image_url: formData.image_url || undefined,
      })

      if (response.success) {
        const updatedItem: MenuItem = {
          id: editingItem!,
          event_id: eventId,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          image_url: formData.image_url || undefined,
          category: formData.category,
          is_available: formData.is_available,
        }

        setMenuItems(prev => 
          prev.map(item => 
            item.id === editingItem ? updatedItem : item
          )
        )

        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          image_url: "",
          category: "main",
          is_available: true,
        })
        setIsAddingItem(false)
        setEditingItem(null)
        
        toast.success("Menu item updated successfully!")
      } else {
        throw new Error(response.message || "Failed to update menu item")
      }
    } catch (error) {
      console.error("Error updating menu item:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update menu item")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete menu item
  const handleDeleteItem = async (itemId: string | number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return
    }

    try {
      const response = await deleteMenuItem(itemId)
      
      if (response.success) {
        setMenuItems(prev => prev.filter(item => item.id !== itemId))
        toast.success("Menu item deleted successfully!")
      } else {
        throw new Error(response.message || "Failed to delete menu item")
      }
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete menu item")
    }
  }

  // Cancel form
  const handleCancelForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "main",
      is_available: true,
    })
    setFormErrors({})
    setIsAddingItem(false)
    setEditingItem(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
          <p className="text-sm text-gray-500">Add items that customers can order for this event</p>
        </div>
        {!isAddingItem && (
          <button
            onClick={() => setIsAddingItem(true)}
            className="flex items-center px-4 py-2 bg-[var(--primary-color,#1A1625)] text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Item
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAddingItem && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter item name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {formErrors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={`w-full p-3 border rounded-md h-20 focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe the item"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {formErrors.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent ${
                  formErrors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {formErrors.price && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {formErrors.price}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent"
                title="Select item category"
              >
                <option value="main">Main Course</option>
                <option value="appetizer">Appetizer</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
                <option value="side">Side</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Image (optional)
              </label>
              <ImageUploader
                onImageSelect={handleImageSelect}
                initialImage={formData.image_url}
              />
            </div>

            {/* Available Toggle */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => handleInputChange("is_available", e.target.checked)}
                  className="h-4 w-4 text-[var(--primary-color,#1A1625)] border-gray-300 rounded focus:ring-[var(--primary-color,#1A1625)]"
                />
                <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                  Available for ordering
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancelForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingItem ? handleUpdateItem : handleAddItem}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--primary-color,#1A1625)] text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingItem ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {editingItem ? "Update Item" : "Add Item"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="space-y-4">
        {menuItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Plus size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first menu item for this event</p>
            {!isAddingItem && (
              <button
                onClick={() => setIsAddingItem(true)}
                className="px-4 py-2 bg-[var(--primary-color,#1A1625)] text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-semibold text-[var(--primary-color,#1A1625)]">
                            ${Number(item.price).toFixed(2)}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.is_available !== false
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {item.is_available !== false ? "Available" : "Unavailable"}
                          </span>
                          {item.category && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2 text-gray-500 hover:text-[var(--primary-color,#1A1625)] hover:bg-gray-100 rounded-md transition-colors"
                      title="Edit item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id!)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save & Continue Button */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
        <p className="text-sm text-gray-500">
          {menuItems.length === 0 
            ? "You can add menu items later if needed."
            : `${menuItems.length} menu item${menuItems.length !== 1 ? 's' : ''} added.`
          }
        </p>
        <button
          onClick={() => onContinue?.()}
          className="px-6 py-2 bg-[var(--primary-color,#1A1625)] text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  )
}

export default MenuTab
