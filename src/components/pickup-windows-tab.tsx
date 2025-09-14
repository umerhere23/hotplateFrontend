"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Info, Plus, MoreVertical, Clock, MapPin, Calendar, Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import api from "@/lib/api-client"
import PickupWindowModal from "./pickup-window-modal"
import type { PickupWindow, PickupLocation } from "@/types/pickup-types"

interface PickupWindowsTabProps {
  eventId: string
}

// Dropdown menu component that uses portal to render outside of any container constraints
function DropdownMenu({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  buttonRef,
}: {
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, right: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth

      // Check if dropdown would go off the right edge
      const rightAligned = rect.left + 200 > windowWidth

      setPosition({
        top: rect.bottom + window.scrollY,
        left: rightAligned ? 0 : rect.left,
        right: rightAligned ? windowWidth - rect.right : 0,
      })
    }
  }, [isOpen, buttonRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current !== event.target &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  if (!isOpen) return null

  // Use portal to render the dropdown outside of any container constraints
  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        ...(position.left ? { left: `${position.left}px` } : { right: `${position.right}px` }),
        zIndex: 9999,
      }}
      className="w-48 bg-white rounded-md shadow-lg border border-gray-200"
    >
      <div className="py-1">
        <button
          onClick={() => {
            onEdit()
            onClose()
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Edit size={16} className="mr-2" />
          Edit
        </button>
        <button
          onClick={() => {
            onDelete()
            onClose()
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default function PickupWindowsTab({ eventId }: PickupWindowsTabProps) {
  const router = useRouter()
  const [pickupWindows, setPickupWindows] = useState<PickupWindow[]>([])
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWindow, setEditingWindow] = useState<PickupWindow | null>(null)
  const [timeSlotsOption, setTimeSlotsOption] = useState("anytime")
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [windowToDelete, setWindowToDelete] = useState<string | number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuButtonRefs = useRef<{ [key: string]: React.RefObject<HTMLButtonElement | null> }>({})

  // Using shared API client for auth + base URL

  useEffect(() => {
    if (eventId) {
      loadPickupWindows()
      loadPickupLocations()
      loadEventDetails()
    }
  }, [eventId])

  // Initialize refs for menu buttons
  useEffect(() => {
    pickupWindows.forEach((window) => {
      const windowId = String(window.id)
      if (!menuButtonRefs.current[windowId]) {
        menuButtonRefs.current[windowId] = React.createRef()
      }
    })
  }, [pickupWindows])

  const loadPickupLocations = async () => {
    try {
  const { ok, data, message } = await api.get<any>(`/pickup-locations`, { pointName: "getPickupLocations" })
  if (!ok) throw new Error(message || "Failed to fetch pickup locations")
  console.log("Pickup locations data:", data)
  setPickupLocations(Array.isArray(data) ? (data as any) : [])
    } catch (error) {
      console.error("Error loading pickup locations:", error)
    }
  }

  const loadPickupWindows = async () => {
    try {
      setLoading(true)

      const { ok, data, message } = await api.get<any>(`/events/${eventId}/pickup-windows`, {
        pointName: "getPickupWindows",
      })
      if (!ok) throw new Error(message || "Failed to fetch pickup windows")
      console.log("Pickup windows data:", data)

      const windows = Array.isArray(data) ? (data as any) : []

      // Ensure each window has the correct location data
      const processedWindows = windows.map((window: PickupWindow) => {
        // If pickupLocation is null or undefined but we have a pickup_location_id
        if ((!window.pickupLocation || Object.keys(window.pickupLocation).length === 0) && window.pickup_location_id) {
          // Find the location in our locations array
          const location = pickupLocations.find(
            (loc) => loc.id === window.pickup_location_id || String(loc.id) === String(window.pickup_location_id),
          )

          if (location) {
            window.pickupLocation = location
          }
        }
        return window
      })

      setPickupWindows(processedWindows)
    } catch (error) {
      console.error("Error loading pickup windows:", error)
      setError(error instanceof Error ? error.message : "Failed to load pickup windows")
    } finally {
      setLoading(false)
    }
  }

  const loadEventDetails = async () => {
    try {
  const { ok, data, message } = await api.get<any>(`/events/${eventId}`, { pointName: "getEventDetails" })
  if (!ok) throw new Error(message || "Failed to fetch event details")
  const event = data as any
  if (event && event.time_slots_option) setTimeSlotsOption(event.time_slots_option)
    } catch (error) {
      console.error("Error loading event details:", error)
    }
  }

  const handleAddPickupWindow = () => {
    setEditingWindow(null)
    setIsModalOpen(true)
  }

  const handleEditPickupWindow = (window: PickupWindow) => {
    setEditingWindow(window)
    setIsModalOpen(true)
    setActiveMenu(null)
  }

  const confirmDeleteWindow = (windowId: string | number) => {
    setWindowToDelete(windowId)
    setShowDeleteConfirm(true)
    setActiveMenu(null)
  }

  const handleDeletePickupWindow = async () => {
    if (!windowToDelete) return

    try {
      setIsDeleting(true)

      const { ok, message } = await api.delete(`/events/${eventId}/pickup-windows/${windowToDelete}`, {
        pointName: "deletePickupWindow",
      })
      if (!ok) throw new Error(message || "Failed to delete pickup window")

      // Remove the deleted window from the state
      setPickupWindows(pickupWindows.filter((window) => window.id !== windowToDelete))

      toast.success("Pickup window deleted successfully", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })
    } catch (error) {
      console.error("Error deleting pickup window:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete pickup window", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
    } finally {
      setIsDeleting(false)
      setWindowToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleModalSave = (newWindow: PickupWindow) => {
    // Find the location details if they're not included
    if (
      (!newWindow.pickupLocation || Object.keys(newWindow.pickupLocation).length === 0) &&
      newWindow.pickup_location_id
    ) {
      const location = pickupLocations.find(
        (loc) => loc.id === newWindow.pickup_location_id || String(loc.id) === String(newWindow.pickup_location_id),
      )

      if (location) {
        newWindow.pickupLocation = location
      }
    }

    if (editingWindow) {
      // Update existing window
      setPickupWindows(pickupWindows.map((window) => (window.id === editingWindow.id ? newWindow : window)))
    } else {
      // Add new window
      setPickupWindows([...pickupWindows, newWindow])
    }

    setIsModalOpen(false)

    // Reload pickup windows to ensure we have the latest data
    setTimeout(() => {
      loadPickupWindows()
    }, 500)
  }

  const handleTimeSlotsOptionChange = async (option: string) => {
    try {
      const { ok, message } = await api.put(`/events/${eventId}`, {
        data: { time_slots_option: option },
        pointName: "updateEventTimeSlotsOption",
      })
      if (!ok) throw new Error(message || "Failed to update time slots option")

      setTimeSlotsOption(option)
    } catch (error) {
      console.error("Error updating time slots option:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update time slots option", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
    }
  }

  // Update toggleMenu to accept string or number
  const toggleMenu = (windowId: string | number) => {
    // Convert windowId to string for comparison with activeMenu
    const windowIdString = String(windowId)

    if (activeMenu === windowIdString) {
      setActiveMenu(null)
    } else {
      setActiveMenu(windowIdString)
    }
  }

  const getLocationName = (locationId: string | number) => {
    const location = pickupLocations.find((loc) => loc.id === locationId || String(loc.id) === String(locationId))

    return location ? location.name : "Location details unavailable"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pickup Windows</h2>
        <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-md">
          {pickupWindows.length} time slot{pickupWindows.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm text-blue-700">
            Pickup windows let customers choose when and where they pickup their order. Add at least one to the event
            using the button below.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#00a0b0] border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading pickup windows...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="py-8 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={loadPickupWindows}
            className="mt-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && pickupWindows.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>No pickup windows added yet</p>
        </div>
      )}

      {/* Pickup Windows List */}
      {!loading && !error && pickupWindows.length > 0 && (
        <div className="space-y-4">
          {pickupWindows.map((window) => {
            const windowId = String(window.id)

            // Create a ref for this button if it doesn't exist
            if (!menuButtonRefs.current[windowId]) {
              menuButtonRefs.current[windowId] = React.createRef()
            }

            return (
              <div key={windowId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-lg font-medium">
                      <Calendar className="mr-2 text-gray-500" size={18} />
                      {window.formatted_date || new Date(window.pickup_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2 text-gray-500" size={18} />
                      {window.time_range || `${window.start_time} - ${window.end_time}`}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="mr-2 text-gray-500" size={18} />
                      {window.pickupLocation ? (
                        <>
                          {window.pickupLocation.name}
                          {window.pickupLocation.short_address && (
                            <span className="ml-1 text-gray-400">({window.pickupLocation.short_address})</span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">{getLocationName(window.pickup_location_id)}</span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      ref={menuButtonRefs.current[windowId]}
                      onClick={() => toggleMenu(window.id)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={20} />
                    </button>

                    <DropdownMenu
                      isOpen={activeMenu === windowId}
                      onClose={() => setActiveMenu(null)}
                      onEdit={() => handleEditPickupWindow(window)}
                      onDelete={() => confirmDeleteWindow(window.id)}
                      buttonRef={menuButtonRefs.current[windowId]}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Pickup Window Button */}
      <button
        onClick={handleAddPickupWindow}
        className="w-full py-3 bg-[#1A1625] text-white font-medium rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center"
      >
        <Plus size={18} className="mr-2" />
        Add a pickup window
      </button>

      {/* Time Slots Option */}
      <div className="mt-8">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-medium">Time slots occur</h3>
          <Info className="ml-2 text-gray-400" size={16} />
        </div>
        <select
          value={timeSlotsOption}
          onChange={(e) => handleTimeSlotsOptionChange(e.target.value)}
          className="w-full p-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent"
        >
          <option value="0">Anytime between window start and end</option>
          <option value="5">every 5 minutes</option>
          <option value="10">every 10 minutes</option>
          <option value="12">every 12 minutes</option>
          <option value="15">every 15 minutes</option>
          <option value="20">every 20 minutes</option>
          <option value="30">every 30 minutes</option>
          <option value="45">every 45 minutes</option>
          <option value="60">every 60 minutes</option>
        </select>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Delete Pickup Window</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this pickup window? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePickupWindow}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Window Modal */}
      <PickupWindowModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        eventId={eventId}
        pickupWindow={editingWindow}
      />
    </div>
  )
}
