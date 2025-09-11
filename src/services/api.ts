// API service for fetching data from the backend
import { mockEvents } from "@/app/dashboard/mock-data"
import api from "@/lib/api-client"

// Endpoints handled by generic client in src/lib/api-client

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

    const { ok, data } = await api.get<any>("/events", { pointName: "getEvents" })
    if (ok && Array.isArray((data as any)?.data)) {
      // Map the API response to match our Event type
      return (data as any).data.map((event: any) => ({
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
    const isForm = typeof FormData !== "undefined" && payload instanceof FormData
    const { ok, data, message } = await api.post("/events", {
      formData: isForm ? (payload as FormData) : undefined,
      data: !isForm ? payload : undefined,
      pointName: "createEvent",
    })
    if (!ok) return { success: false, message }
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
    const { ok, data, message } = await api.patch(`/events/${eventId}`, {
      data: payload,
      pointName: "updateEvent",
    })
    if (!ok) return { success: false, message }
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
    const { ok, data, message } = await api.post(`/pickup-windows`, {
      data: payload,
      pointName: "createPickupWindow",
    })
    if (!ok) return { success: false, message }
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
    const { ok, data, message } = await api.post(`/menu-items`, {
      data: payload,
      pointName: "createMenuItem",
    })
    if (!ok) return { success: false, message }
    return { success: true, data }
  } catch (err: any) {
    console.error("createMenuItem error", err)
    return { success: false, message: err?.message || "Unknown error" }
  }
}
