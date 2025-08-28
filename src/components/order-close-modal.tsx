"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import DatePicker from "./date-picker"
import TimePicker from "./time-picker"

type OrderCloseOption = "last-window" | "time-before" | "specific-time"

interface OrderCloseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: OrderCloseData) => void
  initialData?: OrderCloseData // Make this optional
}

export interface OrderCloseData {
  option: OrderCloseOption
  hours?: number
  minutes?: number
  date?: string
  time?: string
}

export default function OrderCloseModal({ isOpen, onClose, onSave, initialData }: OrderCloseModalProps) {
  const [selectedOption, setSelectedOption] = useState<OrderCloseOption>("last-window")
  const [hours, setHours] = useState<number>(1)
  const [minutes, setMinutes] = useState<number>(0)
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")

  // Initialize state with initialData if provided
  useEffect(() => {
    if (initialData) {
      setSelectedOption(initialData.option)

      if (initialData.hours !== undefined) {
        setHours(initialData.hours)
      }

      if (initialData.minutes !== undefined) {
        setMinutes(initialData.minutes)
      }

      if (initialData.date) {
        setDate(initialData.date)
      }

      if (initialData.time) {
        setTime(initialData.time)
      }
    }
  }, [initialData])

  // Format today's date as a default
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const handleSave = () => {
    const data: OrderCloseData = {
      option: selectedOption,
    }

    if (selectedOption === "time-before") {
      data.hours = hours
      data.minutes = minutes
    } else if (selectedOption === "specific-time") {
      data.date = date || formattedDate
      data.time = time || "4:40 PM"
    }

    onSave(data)
  }

  const handleDiscard = () => {
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? "block" : "hidden"}`}
    >
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Set when orders close</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Cutoff orders ahead of each pickup window, at a specific time, or when the event ends.
          </p>

          {/* Option 1: When the last pickup window ends */}
          <div className={`border rounded-md mb-3 ${selectedOption === "last-window" ? "border-[#1A1625]" : ""}`}>
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="close-option"
                checked={selectedOption === "last-window"}
                onChange={() => setSelectedOption("last-window")}
                className="h-5 w-5 text-[#1A1625] border-gray-300 focus:ring-[#1A1625]"
              />
              <div className="ml-3">
                <div className="font-medium">When the last pickup window ends</div>
                <div className="text-sm text-gray-500">Orders do not close until the last pickup window ends</div>
              </div>
            </label>
          </div>

          {/* Option 2: Time before each pickup window */}
          <div className={`border rounded-md mb-3 ${selectedOption === "time-before" ? "border-[#1A1625]" : ""}`}>
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="close-option"
                checked={selectedOption === "time-before"}
                onChange={() => setSelectedOption("time-before")}
                className="h-5 w-5 text-[#1A1625] border-gray-300 focus:ring-[#1A1625]"
              />
              <div className="ml-3 w-full">
                <div className="font-medium">Time before each pickup window</div>
                <div className="text-sm text-gray-500">
                  Set the number of hours and minutes you want pre-orders to close before each pickup window
                </div>

                {selectedOption === "time-before" && (
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(e) => setHours(Number.parseInt(e.target.value) || 0)}
                      className="w-16 p-2 border border-gray-300 rounded-md"
                    />
                    <span className="text-sm text-gray-600">hrs</span>

                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(Number.parseInt(e.target.value) || 0)}
                      className="w-16 p-2 border border-gray-300 rounded-md"
                    />
                    <span className="text-sm text-gray-600">mins</span>

                    <span className="text-sm text-gray-600 ml-2">before each pickup window</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Option 3: At a specific time */}
          <div className={`border rounded-md mb-3 ${selectedOption === "specific-time" ? "border-[#1A1625]" : ""}`}>
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="close-option"
                checked={selectedOption === "specific-time"}
                onChange={() => setSelectedOption("specific-time")}
                className="h-5 w-5 text-[#1A1625] border-gray-300 focus:ring-[#1A1625]"
              />
              <div className="ml-3 w-full">
                <div className="font-medium">At a specific time</div>
                <div className="text-sm text-gray-500">Set an exact day and time you want orders to close</div>

                {selectedOption === "specific-time" && (
                  <div className="mt-4">
                    <div className="font-medium mb-2 text-sm">Orders close at</div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <DatePicker value={date || formattedDate} onChange={setDate} placeholder="Fri, May 16th" />
                      </div>
                      <div className="w-32">
                        <TimePicker value={time || "4:40 PM"} onChange={setTime} placeholder="4:40 PM" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Selling times in GMT+5</div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#1A1625] text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleDiscard}
            className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
