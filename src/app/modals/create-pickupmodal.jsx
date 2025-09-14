"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function PickupModalFlow({ isOpen, onClose }) {
  const [step, setStep] = useState("pickup"); // pickup | select-location | create-location
  const [pickupDate, setPickupDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState("");

  const handleReset = () => {
    setRate("");
  };


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
          <div className="bg-white w-[500px] h-[40vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
            <button
              onClick={goBack}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              X
            </button>
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-semibold">Select Location</h2>
            </div>
            <div className="border border-gray-200 p-5 rounded-md">
              <p className="text-center text-gray-500 text-sm mb-6">
                You haven't saved any locations, create your first by pressing the
                button below
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setStep("create-location")}
                  className="bg-teal-500 hover:bg-teal-600 m-5 text-white px-6 py-2 rounded-md text-sm"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {step === "create-location" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[500px] h-[95vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
            <button
              onClick={goBack}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              X
            </button>
            <h2 className="text-xl font-semibold mb-6">Create Location</h2>
            <div className="space-y-4">
              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Location Name</label>
                <input
                  type="text"
                  placeholder="Sally's Bar, Farmers Market, etc."
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Location Address */}
              <div>
                <label className="block text-sm font-medium mb-1">Location Address</label>
                <input
                  type="text"
                  placeholder="Street Address"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-2"
                />
                <input
                  type="text"
                  placeholder="Apt, unit, suite, etc. (optional)"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Pickup Instructions */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pickup Instructions
                </label>
                <textarea
                  placeholder="No instructions provided"
                  className="w-full h-24 p-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2"
                />
              </div>

              {/* Upload Photo */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload photo</label>
                <div className="flex items-center gap-6 mb-3">
                  {/* From Device */}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="uploadOption"
                      defaultChecked
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center peer-checked:border-orange-500">
                      {/* Inner dot */}
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 scale-0 peer-checked:scale-100 transition-all"></div>
                    </div>
                    <span className="peer-checked:text-black text-gray-600">From device</span>
                  </label>

                  {/* Camera */}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="uploadOption"
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center peer-checked:border-orange-500">
                      {/* Inner dot */}
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 scale-0 peer-checked:scale-100 transition-all"></div>
                    </div>
                    <span className="peer-checked:text-black text-gray-600">Camera</span>
                  </label>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center text-sm text-gray-500">
                  <p className="mb-2">Upload a file or drag and drop here</p>
                  <p className="text-xs text-gray-400">Recommended size is 750px × 750px</p>
                </div>
              </div>

              {/* Hide Address */}
              <div className="flex items-center border rounded-md border-gray-200 p-2 justify-between">
                <div className=" items-center justify-between">
                  <label className="text-sm text-gray-700">Hide Address</label>
                  <p className="text-xs text-gray-400">
                    Only provides customers with the exact address after they have completed checkout.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                </label>
              </div>
              <div className="border rounded-lg border-gray-200 p-4 max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Tax Rate</h3>
                    <p className="text-xs text-gray-500">
                      Set a custom tax rate that will be used for any order placed at this location.
                    </p>
                  </div>

                  <button
                    onClick={() => setOpen(!open)}
                    className="border px-3 py-1 rounded-md text-sm hover:bg-gray-100"
                  >
                    {open ? "Close" : "Set"}
                  </button>
                </div>

                {/* Custom Rate Section (toggle) */}
                {open && (
                  <div className="mt-4 border rounded-lg border-gray-200 p-3">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Custom Rate
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 border rounded-md text-sm text-gray-600">%</span>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="0.00"
                        className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                      <button
                        onClick={handleReset}
                        className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-100"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      This rate will be used for any order placed at this location, and will override the
                      default rate set in your settings.
                    </p>
                  </div>
                )}
              </div>

            </div>
            {/* Footer Buttons */}
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
