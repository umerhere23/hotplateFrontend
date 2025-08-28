// Shared types for pickup-related components

export interface PickupLocation {
  id: string | number
  name: string
  // Support both old and new field names
  street_address?: string
  address?: string
  unit_suite?: string
  apt_suite?: string
  city?: string
  state?: string
  zip_code?: string
  instructions?: string
  photo_url?: string
  image_url?: string
  hide_address: boolean
  tax_rate: number
  formatted_address?: string
  short_address?: string
}

export interface PickupWindow {
  id: string | number
  event_id: string | number
  pickup_location_id: string | number
  pickup_date: string
  start_time: string
  end_time: string
  time_zone: string
  time_slot_interval?: string // Added this field
  time_range?: string
  formatted_date?: string
  duration_minutes?: number
  image_url?: string
  pickupLocation?: PickupLocation | null
}

export interface PickupWindowFormData {
  startTime: string
  endTime: string
  timeSlotInterval: string
}
