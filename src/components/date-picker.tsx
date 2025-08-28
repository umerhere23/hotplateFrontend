"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function DatePicker({ value, onChange, placeholder = "Select date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Format the date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Parse the value string to a Date object
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Handle clicking outside to close the calendar
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

  // Handle selecting a date
  const handleSelectDate = (date: Date) => {
    onChange(formatDate(date))
    setIsOpen(false)
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if a date is selected
  const isSelected = (date: Date) => {
    const selectedDate = parseDate(value)
    if (!selectedDate) return false

    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const calendarDays = generateCalendarDays()
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center border border-gray-300 rounded-md p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent cursor-pointer"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64">
          <div className="flex justify-between items-center mb-2">
            <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-medium">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => (
              <div key={index} className="text-center">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                      ${isToday(day) ? "bg-gray-100" : ""}
                      ${isSelected(day) ? "bg-[#1A1625] text-white" : "hover:bg-gray-100"}
                    `}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <div className="w-8 h-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
