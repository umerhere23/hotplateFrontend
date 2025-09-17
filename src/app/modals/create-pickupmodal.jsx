"use client";
import { useState } from "react";
import { createPickupWindow } from "@/services/api";
import { DayPicker } from "react-day-picker";
import LocationSelector from "@/components/location-selector";
import "react-day-picker/dist/style.css";

export default function PickupModalFlow({ isOpen, onClose, eventId, onSavePickup }) {
  const [step, setStep] = useState("pickup"); // single-step UI; location selection handled via modal
  const [pickupDate, setPickupDate] = useState(null);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [selectedLocation, setSelectedLocation] = useState(null); // { id, name, short_address }
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!isOpen) return null;

  // Close everything
  const closeModal = () => {
    setStep("pickup");
    onClose();
  };

  // Go back one step
  const goBack = () => closeModal();

  return (
    <>
      {step === "pickup" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[500px] h-[95vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-xl font-semibold mb-6"> Create Pickup Window</h2>

            <div className="grid grid-cols-3 gap-4 mb-6 relative">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Pickup Date</label>
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
                <label className="block text-sm font-medium mb-1">Pickups Begin</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pickups End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">Setting times in GMT+8</p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Pickup Location</label>
              {selectedLocation ? (
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="text-sm">
                    <div className="font-medium">{selectedLocation.name}</div>
                    {selectedLocation.short_address && (
                      <div className="text-gray-500">{selectedLocation.short_address}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsLocationSelectorOpen(true)} className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50">Change</button>
                    <button onClick={() => setSelectedLocation(null)} className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50">Remove</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-3">Add a location so customers know where to pickup</p>
                  <button onClick={() => setIsLocationSelectorOpen(true)} className="border rounded-md px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200">Add Location</button>
                </>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={closeModal} className="text-gray-600 text-sm hover:underline">Discard</button>
              <button
                onClick={async () => {
                  if (!pickupDate) return;
                  if (!selectedLocation) {
                    alert("Please select a pickup location");
                    return;
                  }
                    const toApiDate = (d) => {
                      const yyyy = d.getFullYear();
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const dd = String(d.getDate()).padStart(2, '0');
                      return `${yyyy}-${mm}-${dd}`;
                    };

                    const payload = {
                      pickup_date: toApiDate(pickupDate),
                      start_time: startTime,
                      end_time: endTime,
                      pickup_location_id: selectedLocation.id,
                    };

                    let res = { success: false };
                    if (eventId) {
                      res = await createPickupWindow(eventId, payload);
                    } else if (onSavePickup) {
                      res = await onSavePickup(payload);
                    }

                  if (res?.success) closeModal();
                }}
                className="bg-black text-white font-medium px-6 py-2 rounded-md text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isLocationSelectorOpen && (
        <LocationSelector
          isOpen={isLocationSelectorOpen}
          onClose={() => setIsLocationSelectorOpen(false)}
          onSelect={(loc) => {
            setSelectedLocation({ id: loc.id, name: loc.name, short_address: loc.short_address });
            setIsLocationSelectorOpen(false);
          }}
          selectedLocationId={selectedLocation?.id}
        />
      )}
    </>
  );
}
