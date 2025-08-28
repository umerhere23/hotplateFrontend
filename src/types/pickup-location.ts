export interface PickupLocation {
  id: number
  user_id: number
  name: string
  address: string
  apt_suite?: string
  city?: string
  state?: string
  zip_code?: string
  instructions?: string
  photo_path?: string
  hide_address: boolean
  tax_rate: number
  photo_url?: string
  formatted_address?: string
  created_at?: string
  updated_at?: string
}
