"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

interface PreorderCloseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (option: string) => void;
    selected: string;
}

export default function PreorderCloseModal({

    isOpen,
    onClose,
    onSelect,
    selected,
}: PreorderCloseModalProps) {
    const [selectedOption, setSelectedOption] = useState(selected);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedTime, setSelectedTime] = useState<string>("");
    const times = [
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold mb-4">Set when orders close</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Cutoff orders ahead of each pickup window, at a specific time, or when the event ends.
                </p>

                {/* Options */}
                <div className="space-y-3">
                    {/* Option 1 */}
                    <div
                        className={`p-3 border rounded cursor-pointer ${selectedOption === "last" ? "border-black" : "hover:border-gray-400"
                            }`}
                        onClick={() => setSelectedOption("last")}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">When the last pickup window ends</span>
                            <input
                                type="radio"
                                checked={selectedOption === "last"}
                                onChange={() => setSelectedOption("last")}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Orders do not close until the last pickup window ends
                        </p>
                    </div>

                    {/* Option 2 */}
                    <div
                        className={`p-3 border rounded cursor-pointer ${selectedOption === "before" ? "border-black" : "hover:border-gray-400"
                            }`}
                        onClick={() => setSelectedOption("before")}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Time before each pickup window</span>
                            <input
                                type="radio"
                                checked={selectedOption === "before"}
                                onChange={() => setSelectedOption("before")}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Set the number of hours and minutes before pre-orders close
                        </p>
                    </div>

                    {/* Option 3 */}
                    <div
                        className={`p-3 border rounded cursor-pointer ${selectedOption === "specific" ? "border-black" : "hover:border-gray-400"
                            }`}
                        onClick={() => setSelectedOption("specific")}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">At a specific time</span>
                            <input
                                type="radio"
                                checked={selectedOption === "specific"}
                                onChange={() => setSelectedOption("specific")}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Set an exact day and time when orders close
                        </p>

                        {selectedOption === "specific" && (
                            <div className="mt-3 p-3">
                                <div className="space-y-3 flex gap-3 relative">
                                    {/* Date Picker */}
                                    <div className="relative">
                                        <div
                                            className="bg-gray-200 w-[150px] rounded p-3 text-center cursor-pointer"
                                            onClick={() => {
                                                setShowDate(!showDate);
                                                setShowTime(false);
                                            }}
                                        >
                                            <span className="text-sm text-gray-600">
                                                {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
                                            </span>
                                        </div>
                                        {showDate && (
                                            <div className="absolute left-0 mt-2 bg-white p-2 rounded shadow z-50">
                                                <DayPicker
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={setSelectedDate}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Time Picker */}
                                    <div className="relative">
                                        <div
                                            className="bg-gray-200 w-[150px] rounded p-3 text-center cursor-pointer"
                                            onClick={() => {
                                                setShowTime(!showTime);
                                                setShowDate(false);
                                            }}
                                        >
                                            <span className="text-sm text-gray-600">
                                                {selectedTime ? selectedTime : "Select Time"}
                                            </span>
                                        </div>
                                        {showTime && (
                                            <div className="absolute left-0 mt-2 bg-white p-2 rounded shadow max-h-40 overflow-y-auto z-50 w-full">
                                                {times.map((t) => (
                                                    <div
                                                        key={t}
                                                        className="p-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                                                        onClick={() => {
                                                            setSelectedTime(t);
                                                            setShowTime(false);
                                                        }}
                                                    >
                                                        {t}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <label className="block text-sm mb-1">Setting times in GMT+5</label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                    >
                        Discard
                    </button>
                    <button
                        onClick={() => {
                            onSelect(selectedOption);
                            onClose();
                        }}
                        className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
