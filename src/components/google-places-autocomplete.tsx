"use client"

import { useState, useEffect, useRef } from "react"
import Script from "next/script"

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void
  placeholder?: string
  className?: string
  apiKey?: string
}

declare global {
  interface Window {
    initGooglePlacesAutocomplete: () => void
    google: any
  }
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Enter an address",
  className = "",
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isScriptLoadError, setIsScriptLoadError] = useState(false)

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current) return

    try {
      const options = {
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["address"],
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, options)

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.formatted_address) {
          onChange(place.formatted_address, place)
        }
      })
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error)
    }
  }, [isScriptLoaded, onChange])

  // Handle script load
  const handleScriptLoad = () => {
    setIsScriptLoaded(true)
  }

  // Handle script error
  const handleScriptError = () => {
    setIsScriptLoadError(true)
    console.error("Google Maps script failed to load")
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      {isScriptLoadError && (
        <p className="text-red-500 text-sm mt-1">
          Failed to load Google Maps. Please check your internet connection or API key.
        </p>
      )}
    </>
  )
}
