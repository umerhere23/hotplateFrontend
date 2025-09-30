"use client"

import React, { useState, useEffect } from "react"
import { Eye, Globe, Users, Calendar, Clock, MapPin, Share2, Copy, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"
import { updateEvent } from "@/services/api"
import type { Event } from "@/services/api"

interface PublishTabProps {
  eventId: string | number
  eventData: Partial<Event>
  onEventUpdate?: (updatedEvent: Partial<Event>) => void
}

const PublishTab: React.FC<PublishTabProps> = ({ eventId, eventData, onEventUpdate }) => {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [eventUrl, setEventUrl] = useState("")

  useEffect(() => {
    // Generate event URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    setEventUrl(`${baseUrl}/events/${eventId}`)
  }, [eventId])

  const isPublished = eventData.status === "published"

  // Publish event
  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const response = await updateEvent(eventId, { status: "published" })
      
      if (response.success) {
        const updatedEvent = { ...eventData, status: "published" as const }
        onEventUpdate?.(updatedEvent)
        toast.success("Event published successfully! 🎉")
      } else {
        throw new Error(response.message || "Failed to publish event")
      }
    } catch (error) {
      console.error("Error publishing event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to publish event")
    } finally {
      setIsPublishing(false)
    }
  }

  // Unpublish event
  const handleUnpublish = async () => {
    if (!confirm("Are you sure you want to unpublish this event? It will no longer be visible to customers.")) {
      return
    }

    setIsUnpublishing(true)
    try {
      const response = await updateEvent(eventId, { status: "draft" })
      
      if (response.success) {
        const updatedEvent = { ...eventData, status: "draft" as const }
        onEventUpdate?.(updatedEvent)
        toast.success("Event unpublished successfully")
      } else {
        throw new Error(response.message || "Failed to unpublish event")
      }
    } catch (error) {
      console.error("Error unpublishing event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to unpublish event")
    } finally {
      setIsUnpublishing(false)
    }
  }

  // Copy event URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      toast.success("Event URL copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy URL:", error)
      toast.error("Failed to copy URL")
    }
  }

  // Share event
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventData.title || "Event",
          text: eventData.description || "Check out this event!",
          url: eventUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying URL
      handleCopyUrl()
    }
  }

  return (
    <div className="space-y-8">
      {/* Event Preview */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Eye className="mr-2" size={20} />
            Event Preview
          </h3>
          <p className="text-sm text-gray-500 mt-1">This is how your event will appear to customers</p>
        </div>

        <div className="p-6">
          {/* Event Image */}
          {eventData.image_url && (
            <div className="mb-6">
              <img
                src={eventData.image_url}
                alt={eventData.title || "Event"}
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Event Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {eventData.title || "Event Title"}
              </h2>
              {eventData.description && (
                <p className="text-gray-600 mt-2 leading-relaxed">
                  {eventData.description}
                </p>
              )}
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              {eventData.pre_order_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span>
                    Pre-orders open: {new Date(eventData.pre_order_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {eventData.pre_order_time && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>
                    Time: {eventData.pre_order_time}
                  </span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2 text-gray-400" />
                <span>
                  Walk-up ordering: {eventData.walk_up_ordering ? "Enabled" : "Disabled"}
                </span>
              </div>

              {eventData.order_close_data && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>
                    Orders close: {getOrderCloseText(eventData.order_close_data)}
                  </span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="pt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Actions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Globe className="mr-2" size={20} />
          Publishing Options
        </h3>

        <div className="space-y-6">
          {/* Publish/Unpublish */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">
                {isPublished ? "Event is Live" : "Publish Event"}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {isPublished 
                  ? "Your event is visible to customers and accepting orders"
                  : "Make your event visible to customers and start accepting orders"
                }
              </p>
            </div>
            <div className="flex gap-2">
              {isPublished ? (
                <button
                  onClick={handleUnpublish}
                  disabled={isUnpublishing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUnpublishing ? "Unpublishing..." : "Unpublish"}
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isPublishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe size={16} className="mr-2" />
                      Publish Event
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Share Event */}
          {isPublished && (
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Share2 size={16} className="mr-2" />
                Share Your Event
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={eventUrl}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    title="Event URL"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                    title="Copy URL"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => window.open(eventUrl, "_blank")}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Share2 size={16} className="mr-2" />
                  Share Event
                </button>
              </div>
            </div>
          )}

          {/* Event Settings Summary */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Event Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hide from storefront:</span>
                <span className={eventData.hide_from_storefront ? "text-red-600" : "text-green-600"}>
                  {eventData.hide_from_storefront ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hide open time:</span>
                <span className={eventData.hide_open_time ? "text-red-600" : "text-green-600"}>
                  {eventData.hide_open_time ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drop notifications:</span>
                <span className={eventData.disable_drop_notifications ? "text-red-600" : "text-green-600"}>
                  {eventData.disable_drop_notifications ? "Disabled" : "Enabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Walk-up ordering:</span>
                <span className={eventData.walk_up_ordering ? "text-green-600" : "text-red-600"}>
                  {eventData.walk_up_ordering ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Publishing Checklist</h3>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center ${eventData.title ? "text-green-700" : "text-red-700"}`}>
            <div className={`w-2 h-2 rounded-full mr-3 ${eventData.title ? "bg-green-500" : "bg-red-500"}`}></div>
            Event title is set
          </div>
          <div className={`flex items-center ${eventData.description ? "text-green-700" : "text-red-700"}`}>
            <div className={`w-2 h-2 rounded-full mr-3 ${eventData.description ? "bg-green-500" : "bg-red-500"}`}></div>
            Event description is provided
          </div>
          <div className={`flex items-center ${eventData.pre_order_date ? "text-green-700" : "text-red-700"}`}>
            <div className={`w-2 h-2 rounded-full mr-3 ${eventData.pre_order_date ? "bg-green-500" : "bg-red-500"}`}></div>
            Pre-order date is set
          </div>
          <div className={`flex items-center ${eventData.order_close_data ? "text-green-700" : "text-red-700"}`}>
            <div className={`w-2 h-2 rounded-full mr-3 ${eventData.order_close_data ? "bg-green-500" : "bg-red-500"}`}></div>
            Order closing time is configured
          </div>
          <div className="flex items-center text-blue-700">
            <div className="w-2 h-2 rounded-full mr-3 bg-blue-500"></div>
            Pickup windows configured (optional)
          </div>
          <div className="flex items-center text-blue-700">
            <div className="w-2 h-2 rounded-full mr-3 bg-blue-500"></div>
            Menu items added (optional)
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to format order close data
function getOrderCloseText(orderCloseData: any): string {
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

export default PublishTab
