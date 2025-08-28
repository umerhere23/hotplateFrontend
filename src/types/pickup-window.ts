import type { PickupLocation } from "./pickup-location"

export interface PickupWindow {
  id: number
  event_id: number
  pickup_location_id: number
  pickup_date: string
  start_time: string
  end_time: string
  timezone: string
  pickup_location?: PickupLocation
  time_range?: string
  formatted_date?: string
  created_at?: string
  updated_at?: string
}
