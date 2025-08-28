"use client"

import { useState, useEffect } from "react"

export function FoodLoader() {
  const [dots, setDots] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev < 3 ? prev + 1 : 1))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-4">
        {/* Plate */}
        <div className="absolute inset-0 bg-gray-100 rounded-full border-4 border-gray-200"></div>

        {/* Food items that bounce */}
        <div
          className="absolute top-4 left-4 w-4 h-4 bg-[#ec711e] rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="absolute top-6 left-10 w-5 h-5 bg-[#f59e0b] rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="absolute top-4 right-4 w-6 h-6 bg-[#d97706] rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>

        {/* Fork and knife */}
        <div className="absolute -bottom-2 left-2 w-1 h-10 bg-gray-400 rounded-full transform rotate-12"></div>
        <div className="absolute -bottom-2 right-2 w-1 h-10 bg-gray-400 rounded-full transform -rotate-12"></div>
      </div>

      <p className="text-lg font-medium text-gray-700">Loading your events{".".repeat(dots)}</p>
    </div>
  )
}
