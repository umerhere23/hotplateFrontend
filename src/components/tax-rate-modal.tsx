"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface TaxRateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (rate: number) => void
  currentRate: number
}

export default function TaxRateModal({ isOpen, onClose, onSave, currentRate }: TaxRateModalProps) {
  const [taxRate, setTaxRate] = useState(currentRate)

  const handleReset = () => {
    setTaxRate(0)
  }

  const handleSave = () => {
    onSave(taxRate)
  }

  if (!isOpen) return null

  return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Tax Rate</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            Set a custom tax rate that will be used for any order placed at this location.
          </p>

          <div className="space-y-4">
            <h3 className="font-medium">Custom Rate</h3>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-l-md">%</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                className="flex-1 p-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color,#1A1625)] focus:border-transparent"
              />
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-r-md hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
            <p className="text-sm text-gray-500">
              This rate will be used for any order placed at this location, and will override the default rate set in
              your settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#1A1625] text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
