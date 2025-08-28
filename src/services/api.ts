// API service for fetching data from the backend
import { mockEvents } from "@/app/dashboard/mock-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

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

    // Get the auth token from localStorage
    const token = localStorage.getItem("auth_token")

    if (!token) {
      console.warn("No authentication token found, using mock data")
      return mockEvents
    }

    console.log("Fetching events from API:", `${API_URL}/events`)
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
