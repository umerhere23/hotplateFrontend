"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  Info,
  ChevronRight,
  CalendarIcon,
  Loader2,
  AlertCircle,
  Eye,
  X,
  Trash2,
  Upload,
} from "lucide-react"
import { useRouter } from "next/navigation"
import OrderCloseModal, { type OrderCloseData } from "./order-close-modal"
import ImageUploader from "./image-uploader"
import PickupWindowsTab from "./pickup-windows-tab"
import toast from "react-hot-toast"

type EventFormTab = "info" | "pickup" | "menu" | "publish"
type WalkUpOrderingOption = "asap" | "pickup-windows"
type EventStatus = "draft" | "published"

interface EventData {
  title: string
  description: string
  image_url?: string
  pre_order_date: string
  pre_order_time: string
  order_close_data: OrderCloseData
  walk_up_ordering: boolean
  walk_up_ordering_option: WalkUpOrderingOption
  hide_open_time: boolean
  disable_drop_notifications: boolean
  hide_from_storefront: boolean
  status: EventStatus
  time_slots_option?: string
}

interface ValidationErrors {
  title?: string
  description?: string
  pre_order_date?: string
  pre_order_time?: string
  [key: string]: string | undefined
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

interface CreateEventFormProps {
  onCancel: () => void
  eventToEdit?: any | null // Using any for now, but ideally should match Event type
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    className={`px-4 py-2 ${
      active ? "bg-gray-100 border-b-2 border-[var(--primary-color,#1A1625)]" : "hover:bg-gray-50"
    } transition-colors`}
    onClick={onClick}
  >
    {children}
  </button>
)

export default function CreateEventForm({ onCancel, eventToEdit }: CreateEventFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<EventFormTab>("info")
  const [description, setDescription] = useState("")
  const [eventName, setEventName] = useState("")
  const [eventImage, setEventImage] = useState("")
  const [preOrderDate, setPreOrderDate] = useState("")
  const [preOrderTime, setPreOrderTime] = useState("")
  const [walkUpOrdering, setWalkUpOrdering] = useState(false)
  const [walkUpOrderingOption, setWalkUpOrderingOption] = useState<WalkUpOrderingOption>("pickup-windows")
  const [hideOpenTime, setHideOpenTime] = useState(false)
  const [disableDropNotifications, setDisableDropNotifications] = useState(false)
  const [hideFromStorefront, setHideFromStorefront] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventStatus, setEventStatus] = useState<EventStatus>("draft")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})
  const [timeSlotsOption, setTimeSlotsOption] = useState("anytime")
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)

  // Order close modal state
  const [isOrderCloseModalOpen, setIsOrderCloseModalOpen] = useState(false)
  const [orderCloseData, setOrderCloseData] = useState<OrderCloseData>({
    option: "last-window",
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  // First, add an eventId state to track the current event
  const [eventId, setEventId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Initialize form with event data if editing
  useEffect(() => {
    if (eventToEdit) {
      console.log("Editing event:", eventToEdit)
      setIsEditMode(true)
      setEventId(eventToEdit.id.toString())
      setEventName(eventToEdit.title || "")
      setDescription(eventToEdit.description || "")

      // Handle image URL properly
      if (eventToEdit.image_url) {
        console.log("Setting event image from:", eventToEdit.image_url)
        setEventImage(eventToEdit.image_url)
        setShowImagePreview(true)
      }

      // Format date for input field (YYYY-MM-DD)
      if (eventToEdit.pre_order_date) {
        const date = new Date(eventToEdit.pre_order_date)
        const formattedDate = date.toISOString().split("T")[0]
        setPreOrderDate(formattedDate)
      }

      setPreOrderTime(eventToEdit.pre_order_time || "")
      setOrderCloseData(eventToEdit.order_close_data || { option: "last-window" })
      setWalkUpOrdering(eventToEdit.walk_up_ordering || false)
      setWalkUpOrderingOption(eventToEdit.walk_up_ordering_option || "pickup-windows")
      setHideOpenTime(eventToEdit.hide_open_time || false)
      setDisableDropNotifications(eventToEdit.disable_drop_notifications || false)
      setHideFromStorefront(eventToEdit.hide_from_storefront || false)
      setEventStatus(eventToEdit.status === "published" ? "published" : "draft")
      setTimeSlotsOption(eventToEdit.time_slots_option || "anytime")
    }
  }, [eventToEdit])

  // Validate form whenever inputs change
  useEffect(() => {
    validateForm()
  }, [eventName, description, preOrderDate, preOrderTime])

  const validateForm = () => {
    const errors: ValidationErrors = {}

    if (!eventName.trim()) {
      errors.title = "Event name is required"
    }

    if (!description.trim()) {
      errors.description = "Event description is required"
    }

    if (!preOrderDate) {
      errors.pre_order_date = "Pre-order date is required"
    }

    if (!preOrderTime) {
      errors.pre_order_time = "Pre-order time is required"
    }

    setValidationErrors(errors)
    setIsFormValid(Object.keys(errors).length === 0)
  }

  const handleTabChange = (tab: EventFormTab) => {
    setActiveTab(tab)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit to 500 characters
    if (e.target.value.length <= 500) {
      setDescription(e.target.value)
    }
  }

  const handleOrderCloseClick = () => {
    setIsOrderCloseModalOpen(true)
  }

  const handleOrderCloseModalClose = () => {
    setIsOrderCloseModalOpen(false)
  }

  const handleOrderCloseModalSave = (data: OrderCloseData) => {
    setOrderCloseData(data)
    setIsOrderCloseModalOpen(false)
  }

  const handleImageSelect = (imageUrl: string) => {
    console.log("Image selected:", imageUrl)
    setEventImage(imageUrl)
    setShowImagePreview(true)
  }

  const handleRemoveImage = () => {
    setEventImage("")
    setShowImagePreview(false)
  }

  // Function to display the selected order close option
  const getOrderCloseText = () => {
    switch (orderCloseData.option) {
      case "last-window":
        return "When last pickup window ends"
      case "time-before":
        return `${orderCloseData.hours || 0}h ${orderCloseData.minutes || 0}m before each pickup window`
      case "specific-time":
        return `${orderCloseData.date || "Date"} at ${orderCloseData.time || "Time"}`
      default:
        return "When last pickup window ends"
    }
  }

  // Replace the saveEvent function with this updated version that handles updates and moves to next tab
  const saveEvent = async (status: EventStatus = "draft") => {
    try {
      // Clear previous server errors
      setServerErrors({})

      // Validate form before submission
      validateForm()
      if (!isFormValid) {
        toast.error("Please fill in all required fields", {
          style: {
            borderRadius: "10px",
            background: "#ef4444",
            color: "#fff",
          },
        })
        return
      }

      setIsSubmitting(true)
      setEventStatus(status)

      // Get the auth token from localStorage
      const token = localStorage.getItem("auth_token")

      if (!token) {
        toast.error("You must be logged in to create an event")
        return
      }

      // Create form data for multipart/form-data submission
      const formData = new FormData()
      formData.append("title", eventName)
      formData.append("description", description)
      formData.append("pre_order_date", preOrderDate)
      formData.append("pre_order_time", preOrderTime)
      formData.append("order_close_data", JSON.stringify(orderCloseData))

      // Explicitly convert boolean values to "1" or "0" strings
      formData.append("walk_up_ordering", walkUpOrdering ? "1" : "0")
      formData.append("walk_up_ordering_option", walkUpOrderingOption)
      formData.append("hide_open_time", hideOpenTime ? "1" : "0")
      formData.append("disable_drop_notifications", disableDropNotifications ? "1" : "0")
      formData.append("hide_from_storefront", hideFromStorefront ? "1" : "0")
      formData.append("status", status)
      formData.append("time_slots_option", timeSlotsOption)

      // If we have an image, add it to the form data
      if (eventImage) {
        console.log("Processing image for upload:", eventImage.substring(0, 50) + "...")

        // Only add the image if it's a new image (starts with data:)
        if (eventImage.startsWith("data:")) {
          console.log("Converting base64 image to blob")
          // Convert base64 to blob
          const base64Response = await fetch(eventImage)
          const blob = await base64Response.blob()
          formData.append("image", blob, "event-image.jpg")
        } else if (isEditMode) {
          // For edit mode with an existing image URL, we need to tell the backend to keep the existing image
          console.log("Using existing image URL")
          formData.append("keep_existing_image", "1")
        }
      } else if (isEditMode && !eventImage) {
        // If editing and the image was removed, tell the backend to remove it
        console.log("Removing existing image")
        formData.append("remove_image", "1")
      }

      // Determine if this is a create or update operation
      const isUpdate = !!eventId
      const url = isUpdate ? `${API_URL}/events/${eventId}` : `${API_URL}/events`
      const method = isUpdate ? "POST" : "POST"

      // If updating, add _method=PUT to the form data (for Laravel)
      if (isUpdate) {
        formData.append("_method", "PUT")
      }

      console.log("Saving event to:", url, "Method:", method)

      // Make API request to save event
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type here, it will be set automatically with the boundary
        },
        body: formData,
      })

      const data = await response.json()
      console.log("API response:", data)

      if (!response.ok) {
        if (data.errors) {
          setServerErrors(data.errors)

          // Create a formatted error message for the toast
          const errorMessages = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`)
            .join("\n")

          throw new Error(`Validation failed:\n${errorMessages}`)
        } else {
          throw new Error(data.message || "Failed to create event")
        }
      }

      // Store the event ID for future updates
      if (!isUpdate && data.data && data.data.id) {
        setEventId(data.data.id.toString())
      }

      // Show success message
      toast.success(isEditMode ? "Event updated successfully!" : "Event saved successfully!", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

      // Move to the next tab automatically if creating a new event
      if (!isEditMode) {
        const nextTab = getNextTab(activeTab)
        if (nextTab) {
          setActiveTab(nextTab)
        } else {
          // If there's no next tab, redirect to events page
          setTimeout(() => {
            router.push("/dashboard?tab=events")
            router.refresh()
          }, 1000)
        }
      } else {
        // If editing, just go back to the events list
        setTimeout(() => {
          onCancel()
        }, 1000)
      }
    } catch (error) {
      console.error("Error saving event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save event. Please try again.", {
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

  // Add a helper function to get the next tab
  const getNextTab = (currentTab: EventFormTab): EventFormTab | null => {
    switch (currentTab) {
      case "info":
        return "pickup"
      case "pickup":
        return "menu"
      case "menu":
        return "publish"
      case "publish":
        return null
      default:
        return null
    }
  }

  // Replace the handleSaveAndContinue function
  const handleSaveAndContinue = () => {
    saveEvent("draft")
  }

  // Display server validation errors
  const getFieldError = (field: string) => {
    return serverErrors[field] ? serverErrors[field][0] : null
  }

  const toggleImagePreview = () => {
    setIsImagePreviewOpen(!isImagePreviewOpen)
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={onCancel} className="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">{isEditMode ? "Edit Event" : "New Event"}</h2>
        </div>
        <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-md">
          {eventStatus === "published" ? "Published" : "Draft"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <TabButton active={activeTab === "info"} onClick={() => handleTabChange("info")}>
          Info
        </TabButton>
        <TabButton active={activeTab === "pickup"} onClick={() => handleTabChange("pickup")}>
          Pickup Windows
        </TabButton>
        <TabButton active={activeTab === "menu"} onClick={() => handleTabChange("menu")}>
          Menu
        </TabButton>
        <TabButton active={activeTab === "publish"} onClick={() => handleTabChange("publish")}>
          Publish
        </TabButton>
      </div>

      {/* Server validation errors summary */}
      {Object.keys(serverErrors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 m-4 rounded-md">
          <h3 className="text-red-700 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="list-disc pl-5 text-red-600 text-sm">
            {Object.entries(serverErrors).map(([field, errors]) => (
              <li key={field}>
                <strong>{field.replace(/_/g, " ")}:</strong> {(errors as string[])[0]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Event Name */}
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className={`w-full p-3 bg-gray-100 border ${
                  validationErrors.title || getFieldError("title") ? "border-red-500" : "border-gray-200"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
              />
              {(validationErrors.title || getFieldError("title")) && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {validationErrors.title || getFieldError("title")}
                </p>
              )}
            </div>

            {/* Event Image */}
            <div>
              <label htmlFor="eventImage" className="block text-sm font-medium text-gray-700 mb-1">
                Event Image (optional)
              </label>

              {showImagePreview && eventImage ? (
                <div className="mb-4">
                  <div className="relative border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={eventImage || "/placeholder.svg"}
                      alt="Event preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.error("Error loading image:", e)
                        ;(e.target as HTMLImageElement).src = "/community-event.png"
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={toggleImagePreview}
                        className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-opacity"
                        title="View full image"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={handleRemoveImage}
                        className="p-2 bg-red-500 bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => setShowImagePreview(false)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                    >
                      <Upload size={14} className="mr-1" /> Change image
                    </button>
                  </div>
                </div>
              ) : (
                <ImageUploader onImageSelect={handleImageSelect} initialImage={eventImage} />
              )}

              {getFieldError("image") && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {getFieldError("image")}
                </p>
              )}
            </div>

            {/* Event Description */}
            <div>
              <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Event Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="eventDescription"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your event"
                  className={`w-full p-3 bg-white border ${
                    validationErrors.description || getFieldError("description") ? "border-red-500" : "border-gray-200"
                  } rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
                ></textarea>
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">{description.length}/500</div>
              </div>
              {(validationErrors.description || getFieldError("description")) && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />{" "}
                  {validationErrors.description || getFieldError("description")}
                </p>
              )}
            </div>

            {/* Pre-orders Open */}
            <div>
              <label htmlFor="preOrdersOpen" className="block text-sm font-medium text-gray-700 mb-1">
                Pre-orders Open <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <CalendarIcon size={18} />
                  </div>
                  <input
                    type="date"
                    id="preOrdersOpen"
                    value={preOrderDate}
                    onChange={(e) => setPreOrderDate(e.target.value)}
                    className={`w-full p-3 pl-10 bg-gray-100 border ${
                      validationErrors.pre_order_date || getFieldError("pre_order_date")
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
                  />
                </div>
                <input
                  type="time"
                  value={preOrderTime}
                  onChange={(e) => setPreOrderTime(e.target.value)}
                  className={`w-24 p-3 bg-gray-100 border ${
                    validationErrors.pre_order_time || getFieldError("pre_order_time")
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent`}
                />
              </div>
              {(validationErrors.pre_order_date ||
                validationErrors.pre_order_time ||
                getFieldError("pre_order_date") ||
                getFieldError("pre_order_time")) && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {validationErrors.pre_order_date ||
                    validationErrors.pre_order_time ||
                    getFieldError("pre_order_date") ||
                    getFieldError("pre_order_time")}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">Selling times in GMT+5</p>
            </div>

            {/* Pre-orders Close */}
            <div>
              <label htmlFor="preOrdersClose" className="block text-sm font-medium text-gray-700 mb-1">
                Pre-orders Close <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleOrderCloseClick}
                className="w-full flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors"
              >
                <span>{getOrderCloseText()}</span>
                <ChevronRight size={18} />
              </button>
              {getFieldError("order_close_data") && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {getFieldError("order_close_data")}
                </p>
              )}
            </div>

            {/* Toggle Options */}
            <div className="space-y-4 pt-2">
              {/* Walk-up ordering with sub-options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Enable walk-up ordering</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Info size={16} />
                    </button>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walkUpOrdering}
                      onChange={() => setWalkUpOrdering(!walkUpOrdering)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ec711e]"></div>
                  </label>
                </div>
                {getFieldError("walk_up_ordering") && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {getFieldError("walk_up_ordering")}
                  </p>
                )}

                {/* Sub-options that appear when walk-up ordering is enabled */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    walkUpOrdering ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pl-6 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="walkup-asap"
                        name="walkup-option"
                        checked={walkUpOrderingOption === "asap"}
                        onChange={() => setWalkUpOrderingOption("asap")}
                        className="h-4 w-4 text-[#00a0b0] border-gray-300 focus:ring-[#00a0b0]"
                      />
                      <label htmlFor="walkup-asap" className="ml-2 text-sm text-gray-700">
                        Walk-ups order ASAP and ignore Pickup Windows
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="walkup-pickup"
                        name="walkup-option"
                        checked={walkUpOrderingOption === "pickup-windows"}
                        onChange={() => setWalkUpOrderingOption("pickup-windows")}
                        className="h-4 w-4 text-[#00a0b0] border-gray-300 focus:ring-[#00a0b0]"
                      />
                      <label htmlFor="walkup-pickup" className="ml-2 text-sm text-gray-700">
                        Walk-ups choose a pickup time from the Pickup Windows I set
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Hide open time</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Info size={16} />
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideOpenTime}
                    onChange={() => setHideOpenTime(!hideOpenTime)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color,#1A1625)]"></div>
                </label>
              </div>
              {getFieldError("hide_open_time") && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {getFieldError("hide_open_time")}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Disable drop notifications</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Info size={16} />
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disableDropNotifications}
                    onChange={() => setDisableDropNotifications(!disableDropNotifications)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color,#1A1625)]"></div>
                </label>
              </div>
              {getFieldError("disable_drop_notifications") && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {getFieldError("disable_drop_notifications")}
                </p>
              )}

              {/* Hide event from storefront */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Hide event from storefront</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Info size={16} />
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideFromStorefront}
                    onChange={() => setHideFromStorefront(!hideFromStorefront)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color,#1A1625)]"></div>
                </label>
              </div>
              {getFieldError("hide_from_storefront") && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {getFieldError("hide_from_storefront")}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "pickup" && (
          <div>
            {eventId ? (
              <PickupWindowsTab eventId={eventId} />
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>Please save the event information first to configure pickup windows.</p>
                <button
                  onClick={handleSaveAndContinue}
                  className="mt-4 px-6 py-2 bg-[var(--primary-color,#1A1625)] text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save Event Information
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "menu" && (
          <div className="py-12 text-center text-gray-500">
            <p>Menu configuration will go here</p>
          </div>
        )}

        {activeTab === "publish" && (
          <div className="py-12 text-center text-gray-500">
            <p>Publishing options will go here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end p-4 border-t border-gray-200">
        <button
          onClick={handleSaveAndContinue}
          disabled={isSubmitting}
          className="px-6 py-3 bg-[var(--primary-color,#1A1625)] text-white font-medium rounded-md hover:bg-[var(--primary-color-hover,#2a2435)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Saving...
            </div>
          ) : isEditMode ? (
            "Save Changes"
          ) : (
            "Save & Continue"
          )}
        </button>
      </div>

      {/* Image Preview Modal */}
      {isImagePreviewOpen && eventImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Event Image Preview</h3>
              <button type="button" onClick={toggleImagePreview} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 max-h-[70vh] overflow-auto flex justify-center">
                <img
                  src={eventImage || "/placeholder.svg"}
                  alt="Event Preview"
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

      {/* Order Close Modal */}
      {isOrderCloseModalOpen && (
        <OrderCloseModal
          isOpen={isOrderCloseModalOpen}
          onClose={handleOrderCloseModalClose}
          onSave={handleOrderCloseModalSave}
          initialData={orderCloseData}
        />
      )}
    </div>
  )
}
