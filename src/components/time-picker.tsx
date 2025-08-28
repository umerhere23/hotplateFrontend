"use client"

import { useState, useEffect, useRef } from "react"
import { Clock } from "lucide-react"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function TimePicker({ value, onChange, placeholder = "Select time" }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate time options (30 min intervals)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour % 12 || 12
        const m = minute.toString().padStart(2, "0")
        const period = hour < 12 ? "AM" : "PM"
        options.push(`${h}:${m} ${period}`)
      }
    }
    return options
  }

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const timeOptions = generateTimeOptions()

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center border border-gray-300 rounded-md p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className="mr-2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent cursor-pointer"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-1 w-32 max-h-60 overflow-y-auto">
          {timeOptions.map((time, index) => (
            <div
              key={index}
              className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${time === value ? "bg-gray-100" : ""}`}
              onClick={() => {
                onChange(time)
                setIsOpen(false)
              }}
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
