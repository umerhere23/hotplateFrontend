"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function PickupModalFlow({ isOpen, onClose }) {
  const [step, setStep] = useState("pickup"); // pickup | select-location | create-location
  const [pickupDate, setPickupDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!isOpen) return null;

  // Close everything
  const closeModal = () => {
    setStep("pickup");
    onClose();
  };

  // Go back one step
  const goBack = () => {
    if (step === "create-location") {
      setStep("select-location");
    } else if (step === "select-location") {
      setStep("pickup");
    } else {
      closeModal();
    }
  };

  return (
    <>
      {/* Step 1: Create Pickup Window */}
      {step === "pickup" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[500px] h-[95vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
            <button
              onClick={closeModal} // full exit
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-6">Create Pickup Window</h2>

            <div className="grid grid-cols-3 gap-4 mb-6 relative">
              {/* Pickup Date */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Pickup Date
                </label>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  {pickupDate ? pickupDate.toDateString() : "Select Date"}
                </button>

                {showDatePicker && (
                  <div className="absolute mt-2 bg-white border rounded-md shadow-lg z-50">
                    <DayPicker
                      mode="single"
                      selected={pickupDate}
                      onSelect={(date) => {
                        setPickupDate(date);
                        setShowDatePicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pickups Begin
                </label>
                <input
                  type="time"
                  defaultValue="12:00"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pickups End
                </label>
                <input
                  type="time"
                  defaultValue="12:00"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Setting times in GMT+8
            </p>

            {/* Location Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Pickup Location
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add a location so customers know where to pickup
              </p>
              <button
                onClick={() => setStep("select-location")}
                className="border rounded-md px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Add Location
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="text-gray-600 text-sm hover:underline"
              >
                Discard
              </button>
              <button className="bg-red-100 text-red-400 font-medium px-6 py-2 rounded-md text-sm cursor-not-allowed">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Location */}
      {step === "select-location" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[500px] h-[95vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
            <button
              onClick={goBack} // go back to pickup
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ←
            </button>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Select Location</h2>
              <button
                onClick={() => setStep("create-location")}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Create
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm">
              You haven't saved any locations, create your first by pressing the
              button above
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Create Location */}
      {step === "create-location" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[500px] h-[95vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
            <button
              onClick={goBack} // go back to select-location
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ←
            </button>

            <h2 className="text-xl font-semibold mb-6">Create Location</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Street Store"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="123 Main St"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={goBack} // back to select-location
                className="text-gray-600 text-sm hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("select-location")}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md text-sm"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
