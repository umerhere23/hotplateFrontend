"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock } from "lucide-react"
import toast from "react-hot-toast"
import LocationSelector from "./location-selector"
import type { PickupWindow, PickupLocation } from "@/types/pickup-types"
import api from "@/lib/api-client"

interface PickupWindowModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (pickupWindow: PickupWindow) => void
  eventId: string
  pickupWindow: PickupWindow | null // Changed from initialData to pickupWindow to match the parent component
}

export default function PickupWindowModal({ isOpen, onClose, onSave, eventId, pickupWindow }: PickupWindowModalProps) {
  const [pickupDate, setPickupDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [timeZone, setTimeZone] = useState("GMT+5")
  const [selectedLocation, setSelectedLocation] = useState<PickupLocation | null>(null)
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [locationImage, setLocationImage] = useState<string | null>(null)

  // Using shared API client handles auth + base URL

  // Initialize form with existing pickup window data if editing
  useEffect(() => {
    if (pickupWindow) {
      console.log("Initializing pickup window modal with data:", pickupWindow)
      setPickupDate(pickupWindow.pickup_date || "")
      setStartTime(pickupWindow.start_time || "")
      setEndTime(pickupWindow.end_time || "")
      setTimeZone(pickupWindow.time_zone || "GMT+5")

      if (pickupWindow.pickupLocation) {
        setSelectedLocation(pickupWindow.pickupLocation)

        // Set location image if available
        if (pickupWindow.pickupLocation.photo_url) {
          console.log("Setting location image from location:", pickupWindow.pickupLocation.photo_url)
          setLocationImage(pickupWindow.pickupLocation.photo_url)
        } else if (pickupWindow.pickupLocation.image_url) {
          console.log("Setting location image from location:", pickupWindow.pickupLocation.image_url)
          setLocationImage(pickupWindow.pickupLocation.image_url)
        }
      }
    } else {
      // Reset form for new pickup window
      const today = new Date()
      setPickupDate(today.toISOString().split("T")[0])
      setStartTime("12:00")
      setEndTime("13:00")
      setTimeZone("GMT+5")
      setSelectedLocation(null)
      setLocationImage(null)
    }

    // Clear validation errors
    setValidationErrors({})
  }, [pickupWindow, isOpen])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!pickupDate) {
      errors.pickupDate = "Pickup date is required"
    }

    if (!startTime) {
      errors.startTime = "Start time is required"
    }

    if (!endTime) {
      errors.endTime = "End time is required"
    }

    if (startTime && endTime && startTime >= endTime) {
      errors.endTime = "End time must be after start time"
    }

    if (!selectedLocation) {
      errors.location = "Pickup location is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const formatTimeForAPI = (timeString: string): string => {
    // If the time is already in the correct format, return it
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString
    }

    try {
      // Handle different time formats
      if (timeString.includes("T")) {
        // Handle ISO format like "2023-05-17T14:30:00"
        const timePart = timeString.split("T")[1]
        return timePart.substring(0, 5) // Extract HH:MM
      }

      // Handle AM/PM format
      if (timeString.toLowerCase().includes("am") || timeString.toLowerCase().includes("pm")) {
        const date = new Date(`1970-01-01 ${timeString}`)
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")
        return `${hours}:${minutes}`
      }

      // Handle simple HH:MM format but ensure it has leading zeros
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":")
        return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
      }

      console.error("Unable to format time:", timeString)
      return timeString // Return original if we can't format it
    } catch (error) {
      console.error("Error formatting time:", error)
      return timeString // Return original if there's an error
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      // Format times to ensure they're in the correct H:i format
      const formattedStartTime = formatTimeForAPI(startTime)
      const formattedEndTime = formatTimeForAPI(endTime)

      const windowData = {
        pickup_location_id: selectedLocation?.id,
        pickup_date: pickupDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        time_zone: timeZone,
      }

      console.log("Sending pickup window data:", windowData)

      let ok: boolean
      let data: any
      let message: string | undefined

      if (pickupWindow) {
        const res = await api.put<any>(`/events/${eventId}/pickup-windows/${pickupWindow.id}`, {
          data: windowData,
          pointName: "updatePickupWindow",
        })
        ok = res.ok
        data = res.data
        message = res.message
      } else {
        const res = await api.post<any>(`/events/${eventId}/pickup-windows`, {
          data: windowData,
          pointName: "createPickupWindow",
        })
        ok = res.ok
        data = res.data
        message = res.message
      }

      if (!ok) {
        const apiErrors: Record<string, string> = {}
        const errObj: any = data
        if (errObj && typeof errObj === "object" && errObj.errors) {
          Object.entries(errObj.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) apiErrors[key] = messages[0] as string
          })
          setValidationErrors(apiErrors)
        }
        throw new Error(message || errObj?.message || "Failed to save pickup window")
      }

      toast.success(pickupWindow ? "Pickup window updated successfully" : "Pickup window created successfully", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

      onSave(data)
    } catch (error) {
      console.error("Error saving pickup window:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save pickup window", {
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

  const handleOpenLocationSelector = () => {
    setIsLocationSelectorOpen(true)
  }

  const handleLocationSelect = (location: PickupLocation) => {
    setSelectedLocation(location)
    setIsLocationSelectorOpen(false)

    // Update location image when a location is selected
    if (location.photo_url) {
      setLocationImage(location.photo_url)
    } else if (location.image_url) {
      setLocationImage(location.image_url)
    }
  }

  const handleRemoveLocation = () => {
    setSelectedLocation(null)
    setLocationImage(null)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{pickupWindow ? "Edit Pickup Window" : "Create Pickup Window"}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Pickup Date and Time */}
          <div className="space-y-4">
            <div>
              <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  id="pickupDate"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={`w-full p-3 pl-10 bg-gray-100 border ${
                    validationErrors.pickupDate ? "border-red-500" : "border-gray-200"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
                />
              </div>
              {validationErrors.pickupDate && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.pickupDate}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickups Begin
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Clock size={18} />
                  </div>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full p-3 pl-10 bg-gray-100 border ${
                      validationErrors.startTime || validationErrors.start_time ? "border-red-500" : "border-gray-200"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
                  />
                </div>
                {(validationErrors.startTime || validationErrors.start_time) && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.startTime || validationErrors.start_time}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickups End
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Clock size={18} />
                  </div>
                  <input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full p-3 pl-10 bg-gray-100 border ${
                      validationErrors.endTime || validationErrors.end_time ? "border-red-500" : "border-gray-200"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
                  />
                </div>
                {(validationErrors.endTime || validationErrors.end_time) && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.endTime || validationErrors.end_time}</p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500">Setting times in {timeZone}</p>
          </div>

          {/* Pickup Location */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>

              {selectedLocation ? (
                <div className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">{selectedLocation.name}</span>
                      {selectedLocation.short_address && (
                        <span className="ml-2 text-gray-500 text-sm">{selectedLocation.short_address}</span>
                      )}
                    </div>
                    <button onClick={handleRemoveLocation} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleOpenLocationSelector}
                    className="w-full py-2 px-4 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors text-left"
                  >
                    Add a location so customers know where to pickup
                  </button>
                  {validationErrors.location && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.location}</p>
                  )}
                </>
              )}
            </div>

            {selectedLocation && (
              <button
                onClick={handleOpenLocationSelector}
                className="inline-flex items-center py-2 px-4 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Edit/Change Location
              </button>
            )}
          </div>

          {/* Location Image Preview */}
          {locationImage && (
            <div className="mt-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Location Image</p>
              <div className="relative rounded-md overflow-hidden border border-gray-200 h-40">
                <img
                  src={locationImage || "/placeholder.svg"}
                  alt="Location"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Error loading image:", e)
                    // Set a fallback image
                    ;(e.target as HTMLImageElement).src = "/abstract-location.png"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
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

      {/* Location Selector Modal */}
      {isLocationSelectorOpen && (
        <LocationSelector
          isOpen={isLocationSelectorOpen}
          onClose={() => setIsLocationSelectorOpen(false)}
          onSelect={handleLocationSelect}
          selectedLocationId={selectedLocation?.id}
        />
      )}
    </div>
  )
}
