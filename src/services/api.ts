// API service for fetching data from the backend
import { mockEvents } from "@/app/dashboard/mock-data"
import { store } from "@/store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

function getAuth() {
  const state = store.getState?.()
  const token = state?.auth?.token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null)
  const tokenType = state?.auth?.tokenType || "Bearer"
  return { token, tokenType }
}

export type Event = {
  id: string | number
  user_id?: number
  title: string
  description: string
  image_path?: string | null
  image_url?: string | null
  pre_order_date: string
  pre_order_time: string
  order_close_data: {
    option: string
    [key: string]: any
  }
  walk_up_ordering: boolean
  walk_up_ordering_option: "pickup-windows" | "asap"
  hide_open_time: boolean
  disable_drop_notifications: boolean
  hide_from_storefront: boolean
  checkout_time_limit?: number
  status: "draft" | "published" | "upcoming" | "active" | "completed"
  created_at?: string
  updated_at?: string
  // Legacy fields for compatibility with mock data
  date?: string
  startTime?: string
  endTime?: string
  location?: string
  address?: string
  city?: string
  pickupOption?: "pickup" | "delivery" | "both"
  timeOption?: "asap" | "scheduled"
}

export async function getEvents(): Promise<Event[]> {
  try {
    // For development/testing, return mock data
    // Remove this condition when connecting to your real API
    // if (process.env.NODE_ENV === "development" && !localStorage.getItem("auth_token")) {
    //   // Simulate API delay
    //   await new Promise((resolve) => setTimeout(resolve, 1000))
    //   console.log("Using mock data for events")
    //   return mockEvents
    // }

  const { token, tokenType } = getAuth()

    if (!token) {
      console.warn("No authentication token found, using mock data")
      return mockEvents
    }

    console.log("Fetching events from API:", `${API_URL}/events`)
  const response = await fetch(`${API_URL}/events`, {
      headers: {
    Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("API response:", data)

    if (data.success && Array.isArray(data.data)) {
      // Map the API response to match our Event type
      return data.data.map((event: any) => ({
        ...event,
        // Convert id to string if needed for consistency
        id: event.id.toString(),
        // Map status for display purposes if needed
        status: event.status || mapEventStatus(event.status, event.pre_order_date),
      }))
    }

    return []
  } catch (error) {
    console.error("Error fetching events:", error)
    // For development, return mock data even if there's an error
    if (process.env.NODE_ENV === "development") {
      return mockEvents
    }
    return []
  }
}

// Helper function to map backend status to frontend status
function mapEventStatus(
  status: string,
  preOrderDate: string,
): "upcoming" | "active" | "completed" | "draft" | "published" {
  if (status === "draft" || status === "published") {
    return status as "draft" | "published"
  }

  // If status is not explicitly set, determine based on date
  const eventDate = new Date(preOrderDate)
  const now = new Date()

  // Set time to midnight for date comparison
  eventDate.setHours(0, 0, 0, 0)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (eventDate < today) {
    return "completed"
  } else if (eventDate.getTime() === today.getTime()) {
    return "active"
  } else {
    return "upcoming"
  }
}

// Create a new event
export async function createEvent(payload: Partial<Event> | FormData): Promise<{
  success: boolean
  data?: any
  message?: string
}> {
  try {
  const { token, tokenType } = getAuth()
    if (!token) {
      return { success: false, message: "Not authenticated" }
    }

    const isForm = typeof FormData !== "undefined" && payload instanceof FormData

    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: isForm
        ? { Authorization: `${tokenType} ${token}` }
        : { Authorization: `${tokenType} ${token}`, "Content-Type": "application/json" },
      body: isForm ? (payload as FormData) : JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || `Failed to create event (${response.status})`,
      }
    }

    // Some backends return { success, data }, others just the created row
    if (data?.success !== undefined) {
      return { success: !!data.success, data: data.data, message: data?.message }
    }
    return { success: true, data }
  } catch (err: any) {
    console.error("createEvent error", err)
    return { success: false, message: err?.message || "Unknown error" }
  }
}

export async function updateEvent(
  eventId: string | number,
  payload: Partial<Event>
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
  const { token, tokenType } = getAuth()
    if (!token) return { success: false, message: "Not authenticated" }

    const res = await fetch(`${API_URL}/events/${eventId}`, {
      method: "PATCH",
      headers: {
    Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { success: false, message: data?.message || "Failed to update event" }
    if (data?.success !== undefined) return { success: !!data.success, data: data.data, message: data?.message }
    return { success: true, data }
  } catch (err: any) {
    console.error("updateEvent error", err)
    return { success: false, message: err?.message || "Unknown error" }
  }
}

// Pickup Windows
export type PickupWindow = {
  id?: number | string
  event_id: number | string
  date: string // yyyy-MM-dd
  start_time: string // e.g., 09:00 AM or 09:00
  end_time: string
  location_name?: string
  address?: string
}

export async function createPickupWindow(payload: PickupWindow): Promise<{
  success: boolean
  data?: any
  message?: string
}> {
  try {
  const { token, tokenType } = getAuth()
    if (!token) return { success: false, message: "Not authenticated" }

    const res = await fetch(`${API_URL}/pickup-windows`, {
      method: "POST",
      headers: {
    Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { success: false, message: data?.message || "Failed to create pickup window" }
    if (data?.success !== undefined) return { success: !!data.success, data: data.data, message: data?.message }
    return { success: true, data }
  } catch (err: any) {
    console.error("createPickupWindow error", err)
    return { success: false, message: err?.message || "Unknown error" }
  }
}

// Menu Items
export type MenuItemPayload = {
  event_id: number | string
  name: string
  description?: string
  price: number
  image_url?: string
}

export async function createMenuItem(payload: MenuItemPayload): Promise<{
  success: boolean
  data?: any
  message?: string
}> {
  try {
  const { token, tokenType } = getAuth()
    if (!token) return { success: false, message: "Not authenticated" }

    const res = await fetch(`${API_URL}/menu-items`, {
      method: "POST",
      headers: {
    Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { success: false, message: data?.message || "Failed to create menu item" }
    if (data?.success !== undefined) return { success: !!data.success, data: data.data, message: data?.message }
    return { success: true, data }
  } catch (err: any) {
    console.error("createMenuItem error", err)
    return { success: false, message: err?.message || "Unknown error" }
  }
}
