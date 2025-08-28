"use client"

import { useState, useEffect } from "react"
import { X, Edit, Check } from "lucide-react"
import CreateLocationModal from "./create-location-modal"

interface PickupLocation {
  id: string
  name: string
  street_address: string
  unit_suite?: string
  city?: string
  state?: string
  zip_code?: string
  instructions?: string
  photo_url?: string
  hide_address: boolean
  tax_rate: number
  formatted_address: string
  short_address: string
}

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (location: PickupLocation) => void
  selectedLocationId?: any
}

export default function LocationSelector({ isOpen, onClose, onSelect, selectedLocationId }: LocationSelectorProps) {
  const [locations, setLocations] = useState<PickupLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)

      // Get the auth token from localStorage
      const token = localStorage.getItem("auth_token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_URL}/pickup-locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch pickup locations")
      }

      const data = await response.json()
      setLocations(data.data || [])
    } catch (error) {
      console.error("Error loading pickup locations:", error)
      setError(error instanceof Error ? error.message : "Failed to load pickup locations")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLocation = () => {
    setEditingLocation(null)
    setIsCreateModalOpen(true)
  }

  const handleEditLocation = (location: PickupLocation) => {
    setEditingLocation(location)
    setIsCreateModalOpen(true)
  }

  const handleLocationCreated = (location: PickupLocation) => {
    if (editingLocation) {
      // Update existing location in the list
      setLocations(locations.map((loc) => (loc.id === location.id ? location : loc)))
    } else {
      // Add new location to the list
      setLocations([...locations, location])
    }

    setIsCreateModalOpen(false)
  }

  const handleSelectLocation = (location: PickupLocation) => {
    onSelect(location)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Select Location</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateLocation}
              className="px-4 py-2 bg-[#00a0b0] text-white rounded-full hover:bg-opacity-90 transition-colors"
            >
              Create
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#00a0b0] border-t-transparent mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading locations...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <button
                onClick={loadLocations}
                className="mt-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : locations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No locations found</p>
              <button
                onClick={handleCreateLocation}
                className="mt-2 px-4 py-2 bg-[#00a0b0] text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Create Your First Location
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`border ${
                    selectedLocationId === location.id ? "border-[#00a0b0]" : "border-gray-200"
                  } rounded-md p-4 hover:border-[#00a0b0] transition-colors cursor-pointer`}
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{location.name}</h3>
                      <p className="text-sm text-gray-500">{location.short_address}</p>
                      {location.tax_rate > 0 && (
                        <div className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Tax: {location.tax_rate}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditLocation(location)
                        }}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Edit size={16} />
                      </button>
                      {selectedLocationId === location.id && (
                        <div className="text-[#00a0b0]">
                          <Check size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Create Location Modal */}
      {isCreateModalOpen && (
        <CreateLocationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleLocationCreated}
          location={editingLocation}
        />
      )}
    </div>
  )
}
