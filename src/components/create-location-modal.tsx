"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Info, Upload, Trash2, Eye } from "lucide-react"
import toast from "react-hot-toast"
import TaxRateModal from "./tax-rate-modal"
import GooglePlacesAutocomplete from "./google-places-autocomplete"
import api from "@/lib/api-client"
import type { PickupLocation } from "@/types/pickup-types"

interface CreateLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (location: PickupLocation) => void
  location: PickupLocation | null
}

export default function CreateLocationModal({ isOpen, onClose, onSave, location }: CreateLocationModalProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [aptSuite, setAptSuite] = useState("")
  const [instructions, setInstructions] = useState("")
  const [hideAddress, setHideAddress] = useState(false)
  const [taxRate, setTaxRate] = useState(0)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  // Using shared API client handles auth automatically

  // Initialize form with existing location data if editing
  useEffect(() => {
    if (location) {
      console.log("Initializing form with location:", location)
      setName(location.name || "")
      setAddress(location.address || "")
      setAptSuite(location.apt_suite || "")
      setInstructions(location.instructions || "")
      setHideAddress(location.hide_address || false)
      setTaxRate(location.tax_rate || 0)

      // Set photo URL if available
      if (location.photo_url) {
        console.log("Setting photo URL:", location.photo_url)
        setPhotoUrl(location.photo_url)
      }
    } else {
      // Reset form for new location
      setName("")
      setAddress("")
      setAptSuite("")
      setInstructions("")
      setHideAddress(false)
      setTaxRate(0)
      setPhoto(null)
      setPhotoUrl(null)
    }

    // Clear validation errors
    setValidationErrors({})
  }, [location, isOpen])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = "Location name is required"
    }

    if (!address.trim()) {
      errors.address = "Address is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      // Create form data for multipart/form-data submission
      const formData = new FormData()
      formData.append("name", name)
      formData.append("address", address)

      if (aptSuite) {
        formData.append("apt_suite", aptSuite)
      }

      if (instructions) {
        formData.append("instructions", instructions)
      }

      formData.append("hide_address", hideAddress ? "1" : "0")
      formData.append("tax_rate", taxRate.toString())

      // Add photo if selected
      if (photo) {
        formData.append("photo", photo)
      } else if (location && photoUrl === null) {
        // If editing and photo was removed
        formData.append("remove_photo", "1")
      }

      let ok: boolean
      let data: any
      let message: string | undefined

      if (location) {
        // Update existing location (method spoofing via _method)
        formData.append("_method", "PUT")
        const res = await api.post<any>(`/pickup-locations/${location.id}`, {
          formData,
          pointName: "updatePickupLocation",
        })
        ok = res.ok
        data = res.data
        message = res.message
      } else {
        const res = await api.post<any>(`/pickup-locations`, {
          formData,
          pointName: "createPickupLocation",
        })
        ok = res.ok
        data = res.data
        message = res.message
      }

      if (!ok) {
        throw new Error(message || "Failed to save location")
      }

      toast.success(location ? "Location updated successfully" : "Location created successfully", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

  onSave(data)
    } catch (error) {
      console.error("Error saving location:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save location", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!location) return

    try {
      setIsSubmitting(true)

      const { ok, message } = await api.delete(`/pickup-locations/${location.id}`, {
        pointName: "deletePickupLocation",
      })
      if (!ok) throw new Error(message || "Failed to delete location")

      toast.success("Location deleted successfully", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

  // Close the modal and refresh the parent component
      onClose()
    } catch (error) {
      console.error("Error deleting location:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete location", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)

      // Create a preview URL
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoUrl(null)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleOpenTaxModal = () => {
    setIsTaxModalOpen(true)
  }

  const handleTaxRateSave = (rate: number) => {
    setTaxRate(rate)
    setIsTaxModalOpen(false)
  }

  const handleAddressChange = (value: string, placeDetails?: google.maps.places.PlaceResult) => {
    setAddress(value)
  }

  const toggleImagePreview = () => {
    setIsImagePreviewOpen(!isImagePreviewOpen)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{location ? "Edit Location" : "Create Location"}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Location Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
                Location Name
              </label>
              <Info size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="locationName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sally's Bar, Farmers Market, etc."
              className={`w-full p-3 bg-gray-100 border ${
                validationErrors.name ? "border-red-500" : "border-gray-200"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
            />
            {validationErrors.name && <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>}
          </div>

          {/* Location Address */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Location Address</label>
            <div className="relative">
              <GooglePlacesAutocomplete
                value={address}
                onChange={handleAddressChange}
                placeholder="Address"
                className={`w-full p-3 bg-gray-100 border ${
                  validationErrors.address ? "border-red-500" : "border-gray-200"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
              />
              {validationErrors.address && <p className="mt-1 text-sm text-red-500">{validationErrors.address}</p>}
            </div>

            <input
              type="text"
              value={aptSuite}
              onChange={(e) => setAptSuite(e.target.value)}
              placeholder="Apt, unit, suite, etc. (optional)"
              className="w-full p-3 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent"
            />
          </div>

          {/* Pickup Instructions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="pickupInstructions" className="block text-sm font-medium text-gray-700">
                Pickup Instructions
              </label>
              <Info size={16} className="text-gray-400" />
            </div>
            <textarea
              id="pickupInstructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="No instructions provided"
              className="w-full p-3 bg-gray-100 border border-gray-200 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent"
            ></textarea>
            <div className="text-right text-xs text-gray-500">{instructions.length}/1000</div>
          </div>

          {/* Pickup Photo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Pickup Photo</label>
              <Info size={16} className="text-gray-400" />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              aria-label="Upload pickup location photo"
              title="Upload pickup location photo"
              className="hidden"
            />

            <div className="border border-dashed border-gray-300 rounded-md p-4">
              {photoUrl ? (
                <div className="relative">
                  <img
                    src={photoUrl || "/placeholder.svg"}
                    alt="Pickup location"
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      console.error("Error loading image:", e)
                      ;(e.target as HTMLImageElement).src = "/abstract-location.png"
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={toggleImagePreview}
                      aria-label="View full image"
                      className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-opacity"
                      title="View full image"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={handleOpenFileDialog}
                      aria-label="Change image"
                      className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-opacity"
                      title="Change image"
                    >
                      <Upload size={16} />
                    </button>
                    <button
                      onClick={handleRemovePhoto}
                      aria-label="Remove image"
                      className="p-2 bg-red-500/70 rounded-full text-white hover:bg-red-500/90 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleOpenFileDialog}
                  className="flex flex-col items-center justify-center py-8 cursor-pointer"
                >
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Upload size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-700 mb-2">Upload a photo</p>
                  <p className="text-gray-500 text-sm text-center">Drag and drop or click to upload</p>
                </div>
              )}
            </div>
          </div>

          {/* Hide Address */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Hide Address</h3>
                <p className="text-sm text-gray-500">
                  Only provides customers with the exact address after they have completed checkout.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideAddress}
                  onChange={() => setHideAddress(!hideAddress)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color,#1A1625)]"></div>
              </label>
            </div>
          </div>

          {/* Tax Rate */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Tax Rate</h3>
                <p className="text-sm text-gray-500">
                  Set a custom tax rate that will be used for any order placed at this location.
                </p>
              </div>
              {taxRate > 0 ? (
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-medium mr-2">{taxRate}%</span>
                  <button
                    onClick={handleOpenTaxModal}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenTaxModal}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Set
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <div>
            {location && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#ff5a5f] text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Tax Rate Modal */}
      {isTaxModalOpen && (
        <TaxRateModal
          isOpen={isTaxModalOpen}
          onClose={() => setIsTaxModalOpen(false)}
          onSave={handleTaxRateSave}
          currentRate={taxRate}
        />
      )}

      {/* Image Preview Modal */}
      {isImagePreviewOpen && photoUrl && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Location Image Preview</h3>
              <button
                type="button"
                onClick={toggleImagePreview}
                aria-label="Close preview"
                title="Close preview"
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 max-h-[70vh] overflow-auto flex justify-center">
                <img
                  src={photoUrl || "/placeholder.svg"}
                  alt="Location Preview"
                  className="max-w-full h-auto object-contain"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={toggleImagePreview}
                  className="px-4 py-2 bg-[var(--primary-color,#1A1625)] text-white rounded-md hover:bg-opacity-90"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Delete Location</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this location? This action cannot be undone and will remove all pickup
              windows associated with this location.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLocation}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
