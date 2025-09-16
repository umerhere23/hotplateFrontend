"use client"

import React from "react"
import { AlertTriangle, X, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class EventErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Event creation error:", error, errorInfo)
    this.setState({
      errorInfo: errorInfo.componentStack,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg border border-red-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-red-900">Something went wrong</h2>
          </div>
          <button
            onClick={resetError}
            className="p-1 rounded-full hover:bg-red-100 transition-colors"
            title="Close error"
          >
            <X size={20} className="text-red-600" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 mb-2">
            We encountered an error while creating your event. This could be due to:
          </p>
          <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
            <li>Network connectivity issues</li>
            <li>Server temporarily unavailable</li>
            <li>Invalid data format</li>
            <li>File upload problems</li>
          </ul>
        </div>

        {error && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm font-mono text-gray-800">
              {error.message}
            </div>
          </details>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
          <button
            onClick={handleReload}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

// Validation utilities
export const validateEventForm = (data: {
  title: string
  description: string
  pre_order_date: string
  pre_order_time: string
  order_close_data?: any
}) => {
  const errors: Record<string, string> = {}

  // Title validation
  if (!data.title?.trim()) {
    errors.title = "Event title is required"
  } else if (data.title.length > 100) {
    errors.title = "Event title must be less than 100 characters"
  }

  // Description validation
  if (!data.description?.trim()) {
    errors.description = "Event description is required"
  } else if (data.description.length > 500) {
    errors.description = "Event description must be less than 500 characters"
  }

  // Date validation
  if (!data.pre_order_date) {
    errors.pre_order_date = "Pre-order date is required"
  } else {
    const selectedDate = new Date(data.pre_order_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      errors.pre_order_date = "Pre-order date cannot be in the past"
    }
  }

  // Time validation
  if (!data.pre_order_time) {
    errors.pre_order_time = "Pre-order time is required"
  }

  // Order close validation
  if (!data.order_close_data?.option) {
    errors.order_close_data = "Order close option is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateMenuItemForm = (data: {
  name: string
  description: string
  price: string
}) => {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = "Item name is required"
  } else if (data.name.length > 100) {
    errors.name = "Item name must be less than 100 characters"
  }

  if (!data.description?.trim()) {
    errors.description = "Item description is required"
  } else if (data.description.length > 200) {
    errors.description = "Item description must be less than 200 characters"
  }

  if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.price = "Price must be a positive number"
  } else if (Number(data.price) > 9999.99) {
    errors.price = "Price cannot exceed $9,999.99"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// API error handler
export const handleApiError = (error: any): string => {
  // Handle different types of API errors
  if (error?.response?.status === 401) {
    return "Authentication failed. Please log in again."
  }
  
  if (error?.response?.status === 403) {
    return "You don't have permission to perform this action."
  }
  
  if (error?.response?.status === 404) {
    return "The requested resource was not found."
  }
  
  if (error?.response?.status === 422) {
    return "The data provided is invalid. Please check your inputs."
  }
  
  if (error?.response?.status >= 500) {
    return "Server error. Please try again later."
  }
  
  if (error?.message?.includes("network") || error?.code === "NETWORK_ERROR") {
    return "Network error. Please check your internet connection."
  }
  
  if (error?.message?.includes("timeout")) {
    return "Request timeout. Please try again."
  }
  
  return error?.message || "An unexpected error occurred. Please try again."
}

export default EventErrorBoundary
