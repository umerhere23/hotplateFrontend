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
export type CreatePickupWindowPayload = {
  pickup_location_id?: number | string
  pickup_date: string // yyyy-MM-dd
  start_time: string // HH:mm
  end_time: string // HH:mm
  time_zone?: string
}

export async function createPickupWindow(
  eventId: string | number,
  payload: CreatePickupWindowPayload,
): Promise<{
  success: boolean
  data?: any
  message?: string
}> {
  try {
    const { ok, data, message } = await api.post(`/events/${eventId}/pickup-windows`, {
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
  id?: number | string
  event_id: number | string
  name: string
  description: string
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

export async function updateMenuItem(
  itemId: string | number,
  payload: Partial<MenuItemPayload>
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const { ok, data, message } = await api.patch(`/menu-items/${itemId}`, {
      data: payload,
      pointName: "updateMenuItem",
    })
    if (!ok) return { success: false, message }
    return { success: true, data }
  } catch (err: any) {
    console.error("updateMenuItem error", err)
    return { success: false, message: err?.message || "Unknown error" }
  }
}

export async function deleteMenuItem(
  itemId: string | number
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const { ok, data, message } = await api.delete(`/menu-items/${itemId}`, {
      pointName: "deleteMenuItem",
    })
    if (!ok) return { success: false, message }
    return { success: true, data }
  } catch (err: any) {
    console.error("deleteMenuItem error", err)
    return { success: false, message: err?.message || "Unknown error" }
  }
}

export async function getMenuItems(
  eventId: string | number
): Promise<MenuItemPayload[]> {
  try {
    const { ok, data } = await api.get<any>(`/events/${eventId}/menu-items`, { 
      pointName: "getMenuItems" 
    })
    if (ok && Array.isArray((data as any)?.data)) {
      return (data as any).data
    }
    return []
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return []
  }
}

// Product API interfaces
export interface Product {
  id: number;
  name: string;
  price: string | number;
  description: string;
  date?: string;
  image?: string;
  image_url?: string;
  special_instructions?: boolean;
  option_groups?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductPayload {
  name: string;
  price: string | number;
  description: string;
  image?: string;
  special_instructions?: boolean;
  option_groups?: any[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: number;
}

// Product API functions
export async function getProducts(): Promise<Product[]> {
  try {
  const { ok, data } = await api.get<any>("/products", { pointName: "getProducts" });

  if (!ok) return [];

  // Support both shapes: [{...}] or { success: true, data: [...] }
  const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  // Normalize each product to frontend Product shape
  return items.map(mapServerProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<{ success: boolean; data?: Product; message?: string }> {
  try {
    // Convert frontend payload keys to API expected camelCase payload
    const apiPayload: any = {
      name: payload.name,
      price: typeof payload.price === "number" ? payload.price.toFixed(2) : payload.price,
      description: payload.description,
      image: payload.image,
  specialInstructions: payload.special_instructions ?? false,
  optionGroups: (payload.option_groups ?? []).map((g: any) => ({
        name: g.name,
        required: !!g.required,
        options: (g.options || []).map((o: any) => ({
          name: o.name,
          price: typeof o.price === 'number' ? o.price.toFixed(2) : String(o.price || '0')
        }))
      }))
    };

    const { ok, data, message } = await api.post<any>("/products", {
      data: apiPayload,
      pointName: "createProduct",
    });

    if (!ok) return { success: false, message };

    // Normalize returned product
    return { success: true, data: data ? mapServerProduct(data) : undefined };
  } catch (err: any) {
    console.error("createProduct error", err);
    return { success: false, message: err?.message || "Unknown error" };
  }
}

export async function updateProduct(
  productId: string | number,
  payload: Partial<CreateProductPayload>
): Promise<{ success: boolean; data?: Product; message?: string }> {
  try {
    const apiPayload: any = {};
    if (payload.name !== undefined) apiPayload.name = payload.name;
    if (payload.price !== undefined) apiPayload.price = typeof payload.price === 'number' ? payload.price.toFixed(2) : payload.price;
    if (payload.description !== undefined) apiPayload.description = payload.description;
    if (payload.image !== undefined) apiPayload.image = payload.image;
    if (payload.special_instructions !== undefined) apiPayload.specialInstructions = payload.special_instructions;
    if (payload.option_groups !== undefined) apiPayload.optionGroups = (payload.option_groups || []).map((g: any) => ({
      name: g.name,
      required: !!g.required,
      options: (g.options || []).map((o: any) => ({ name: o.name, price: typeof o.price === 'number' ? o.price.toFixed(2) : String(o.price || '0') }))
    }));

    const { ok, data, message } = await api.put<any>(`/products/${productId}`, {
      data: apiPayload,
      pointName: "updateProduct",
    });

    if (!ok) return { success: false, message };

    return { success: true, data: data ? mapServerProduct(data) : undefined };
  } catch (err: any) {
    console.error("updateProduct error", err);
    return { success: false, message: err?.message || "Unknown error" };
  }
}

export async function deleteProduct(
  productId: string | number
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const { ok, data, message } = await api.delete(`/products/${productId}`, {
      pointName: "deleteProduct",
    });
    
    if (!ok) return { success: false, message };
    return { success: true, data };
  } catch (err: any) {
    console.error("deleteProduct error", err);
    return { success: false, message: err?.message || "Unknown error" };
  }
}

export async function duplicateProduct(
  productId: string | number
): Promise<{ success: boolean; data?: Product; message?: string }> {
  try {
    const { ok, data, message } = await api.post<Product>(`/products/${productId}/duplicate`, {
      pointName: "duplicateProduct",
    });
    
    if (!ok) return { success: false, message };
    return { success: true, data };
  } catch (err: any) {
    console.error("duplicateProduct error", err);
    return { success: false, message: err?.message || "Unknown error" };
  }
}

// Helper to normalize server product object to frontend Product interface
function mapServerProduct(p: any): Product {
  return {
    id: Number(p.id),
    name: p.name,
    price: p.price,
    description: p.description,
    date: p.date,
    image: p.image ?? undefined,
    image_url: p.imageUrl ?? p.image_url ?? undefined,
    special_instructions: p.specialInstructions ?? p.special_instructions ?? false,
    option_groups: (p.optionGroups ?? p.option_groups ?? []).map((g: any) => ({
      id: g.id,
      name: g.name,
      required: !!g.required,
      options: (g.options || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        price: typeof o.price === 'string' ? parseFloat(o.price) : o.price
      }))
    })),
    created_at: p.created_at ?? p.createdAt,
    updated_at: p.updated_at ?? p.updatedAt
  } as Product;
}

