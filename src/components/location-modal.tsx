"use client"

import { useState, useEffect, useRef } from "react"
import { X, Info, Upload, Trash2 } from 'lucide-react'
import toast from "react-hot-toast"
import TaxRateModal from "./tax-rate-modal"
import type { PickupLocation } from "@/types/pickup-location"

// Load Google Maps API script
const loadGoogleMapsScript = (callback: () => void) => {
  const existingScript = document.getElementById("google-maps-script")
  if (!existingScript) {
    const script = document.createElement("script")
    script.id = "google-maps-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = callback
    script.onerror = () => {
      console.error("Failed to load Google Maps API")
    }
    document.head.appendChild(script)
  } else {
    callback()
  }
}

interface LocationModalProps {
  location?: PickupLocation
  onClose: () => void
  onSave: (location: PickupLocation) => void
}

export default function LocationModal({ location, onClose, onSave }: LocationModalProps) {
  const [name, setName] = useState(location?.name || "")
  const [address, setAddress] = useState(location?.address || "")
  const [aptSuite, setAptSuite] = useState(location?.apt_suite || "")
  const [instructions, setInstructions] = useState(location?.instructions || "")
  const [hideAddress, setHideAddress] = useState(location?.hide_address || false)
  const [taxRate, setTaxRate] = useState(location?.tax_rate || 0)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(location?.photo_url || null)
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)

  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    loadGoogleMapsScript(() => {
      setGoogleMapsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && addressInputRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address", "geometry", "name"],
      })

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.formatted_address) {
          setAddress(place.formatted_address)
        }
      })
    }
  }, [googleMapsLoaded])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Location name is required")
      return
    }

    if (!address.trim()) {
      toast.error("Address is required")
      return
    }

    try {
      setLoading(true)

      // Get the auth token from localStorage
      const token = localStorage.getItem("auth_token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const formData = new FormData()
      formData.append("name", name)
      formData.append("address", address)
      formData.append("apt_suite", aptSuite)
      formData.append("instructions", instructions)
      formData.append("hide_address", hideAddress ? "1" : "0")
      formData.append("tax_rate", taxRate.toString())

      if (photo) {
        formData.append("photo", photo)
      }

      let url = `${API_URL}/pickup-locations`
      let method = "POST"

      // If editing an existing location, use PUT method
      if (location) {
        url = `${url}/${location.id}`
        method = "PUT"
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type here, it will be set automatically with the boundary
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save location")
      }

      const data = await response.json()
      
      toast.success(
        location ? "Location updated successfully" : "Location created successfully",
        {
          style: {
            borderRadius: "10px",
            background: "#22c55e",
            color: "#fff",
          },
        }
      )

      onSave(data.data)
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
      setLoading(false)
    }
  }

  const handleTaxRateClick = () => {
    setIsTaxModalOpen(true)
  }

  const handleTaxModalClose = () => {
    setIsTaxModalOpen(false)
  }

  const handleTaxRateSave = (rate: number) => {
    setTaxRate(rate)
    setIsTaxModalOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {location ? "Edit Location" : "Create Location"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Location Name */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
                Location Name
              </label>
              <button className="text-gray-400 hover:text-gray-600">
                <Info className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              id="locationName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Home Kitchen, Farmers Market"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location Address */}
          <div className="mb-4">
            <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Location Address
            </label>
            <input
              type="text"
              id="locationAddress"
              ref={addressInputRef}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street Address"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <input
              type="text"
              value={aptSuite}
              onChange={(e) => setAptSuite(e.target.value)}
              placeholder="Apt, unit, suite, etc. (optional)"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pickup Instructions */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="pickupInstructions" className="block text-sm font-medium text-gray-700">
                Pickup Instructions
              </label>
              <button className="text-gray-400 hover:text-gray-600">
                <Info className="h-4 w-4" />
              </button>
            </div>
            <textarea
              id="pickupInstructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="No instructions provided"
              className="w-full p-3 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={1000}
            ></textarea>
            <div className="text-right text-xs text-gray-500">
              {instructions.length}/1000
            </div>
          </div>

          {/* Pickup Photo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="pickupPhoto" className="block text-sm font-medium text-gray-700">
                Pickup Photo
              </label>
              <button className="text-gray-400 hover:text-gray-600">
                <Info className="h-4 w-4" />
              </button>
            </div>
            <input
              type="file"
              id="pickupPhoto"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview || "/placeholder.svg"}
                  alt="Location preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={handleOpenFileDialog}
                    className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-opacity"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRemovePhoto}
                    className="p-2 bg-red-600 bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleOpenFileDialog}
                className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload a photo</p>
              </div>
            )}
          </div>

          {/* Hide Address Toggle */}
          <div className="mb-4 border border-gray-200 rounded-md p-4">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Tax Rate */}
          <div className="mb-4 border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Tax Rate</h3>
                <p className="text-sm text-gray-500">
                  Set a custom tax rate that will be used for any order placed at this location.
                </p>
              </div>
              <button
                onClick={handleTaxRateClick}
                className="px-3 py-1 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                {taxRate > 0 ? `${taxRate}%` : "Set"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim() || !address.trim()}
            className={`px-4 py-2 bg-[#ff5a5f] text-white rounded-md hover:bg-[#ff4146] transition-colors ${
              loading || !name.trim() || !address.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Tax Rate Modal */}
      {isTaxModalOpen && (
        <TaxRateModal
          currentRate={taxRate}
          onClose={handleTaxModalClose}
          onSave={handleTaxRateSave}
        />
      )}
    </div>
  )
}
