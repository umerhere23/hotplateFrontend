"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import "react-day-picker/dist/style.css";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import AdvancedModal from "@/app/modals/advance-modal";
import PreorderCloseModal from "@/app/modals/preorder-close-modal";
import MenuItemsModal from "@/app/modals/additem-modal";

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"info" | "pickup" | "menu" | "publish">("info");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPremodal, setShowPremodal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCloseOption, setSelectedCloseOption] = useState("last");
  const [timeSlotsOption, setTimeSlotsOption] = useState(
    "anytime"
  );

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!showForm ? (
        // ---------------- Dashboard (default view) ----------------
        <div>
          {/* Top Bar Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white text-sm font-medium py-2 px-4 rounded hover:opacity-80"
            >
              Create New Event
            </button>
          </div>

          {/* Info Box */}
          <div className="border rounded-md bg-white p-4 flex items-center gap-3 mb-6 shadow-sm">
            <button className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-100">
              <Play size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold">Learn more about Hotplate</h2>
              <p className="text-xs text-gray-500">Watch our walkthrough video</p>
            </div>
          </div>

          {/* Drafts Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Drafts <span className="text-gray-500">• 1</span>
              </h3>
              <button className="text-xs border rounded px-2 py-1 text-gray-600 hover:bg-gray-100">
                Hide
              </button>
            </div>

            {/* Draft Card */}
            <div className="w-40 border rounded-lg shadow-sm p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">New Event</h4>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  Draft
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">No locations</p>
              <span className="text-xs border px-2 py-0.5 rounded bg-gray-50">
                Pickup
              </span>
            </div>
          </div>

          {/* Complete Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Complete <span className="text-gray-500">• 0</span>
              </h3>
              <button className="text-xs border rounded px-2 py-1 text-gray-600 hover:bg-gray-100">
                Show
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Orders closed, click on any event to see the stats on your sale
            </p>
          </div>
        </div>
      ) : (
        // ---------------- Create New Event Form ----------------
        <>
          <div className="flex justify-between items-center max-w-3xl mx-auto mb-4">
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-600 flex items-center hover:text-black"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold">New Event</h2>
            <span className="text-xs border rounded px-2 py-1 bg-gray-100">Draft</span>
          </div>
          <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-4 border-b mb-6 text-sm text-center">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-2 ${activeTab === "info"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab("pickup")}
                className={`py-2 ${activeTab === "pickup"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                Pickup Windows
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`py-2 ${activeTab === "menu"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                Menu
              </button>
              <button
                onClick={() => setActiveTab("publish")}
                className={`py-2 ${activeTab === "publish"
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                Publish
              </button>
            </div>
            {activeTab === "info" && (
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                  {/* ---- Form Content ---- */}
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Event Name</label>
                    <input
                      type="text"
                      defaultValue="New Event"
                      className="w-full bg-gray-200 rounded p-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label className=" text-sm mb-1">Event Image (optional)</label>
                    <div className="bg-gray-200 w-[150px] rounded p-3 text-center cursor-pointer hover:bg-gray-50">
                      <span className="text-sm text-gray-600">Upload photo</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-1">Event Description (optional)</label>
                    <textarea
                      placeholder="Describe your event"
                      maxLength={500}
                      className="w-full border rounded p-2 h-24"
                    ></textarea>
                    <p className="text-xs text-gray-400 text-right">0/500</p>
                  </div>
                  <div>
                    <label className="block text-sm">Pre-Order open</label>
                    {/* ---- Date & Time ---- */}
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
                  <div>
                    <label className="block mt-5 text-sm mb-1 font-medium">Pre-orders Close</label>
                    <button
                      onClick={() => setShowPremodal(true)}
                      className="w-full text-left bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium flex justify-between items-center"
                    >
                      {selectedCloseOption === "last" && "When last pickup window ends"}
                      {selectedCloseOption === "before" && "Time before each pickup window"}
                      {selectedCloseOption === "specific" && "At a specific time"}
                      <span>›</span>
                    </button>
                  </div>
                  {/* ---- Switches ---- */}
                  <div className="flex items-center gap-4 mb-4 mt-6">
                    <Switch.Root
                      className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-black transition-colors"
                      id="walkup-switch"
                    >
                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 translate-x-0 data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                    <span className="text-sm">Enable walk-up ordering</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <Switch.Root
                      className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-black transition-colors"
                      id="hide-time-switch"
                    >
                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 translate-x-0 data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                    <span className="text-sm">Hide open time</span>
                  </div>
                </div>
                <div className="col-span-3 mt-6 flex justify-between w-full">
                  <button
                    onClick={() => setShowAdvanced(true)}
                    className="bg-gray-200 text-sm font-medium px-4 py-2 rounded-md cursor-pointer"
                  >
                    Advanced options
                  </button>
                  <button className="bg-gray-200 text-gray-400 text-sm font-medium px-4 py-2 rounded-md cursor-not-allowed">
                    Save &amp; Continue
                  </button>
                </div>
              </div>

            )}
            {activeTab === "pickup" && (
              <div className="space-y-4 bg-white p-4 ">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Pickup Windows</h2>
                  <span className="text-xs text-gray-500">0 time slots</span>
                </div>
                <div className="bg-cyan-100 text-sm text-gray-700 p-3 rounded">
                  Pickup windows let customers choose when and where they pickup their
                  order. Add at least one to the event using the button below.
                </div>
                <button className="w-full bg-black text-white text-sm font-medium rounded-md p-3 hover:bg-gray-800">
                  Add a pickup window
                </button>
                <div>
                  <label className="text-sm text-gray-700">Time slots occur</label>
                  <select
                    value={timeSlotsOption}
                    onChange={(e) => setTimeSlotsOption(e.target.value)}
                    className="mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="anytime">Anytime between window start and end</option>
                    <option value="fixed">At fixed intervals</option>
                    <option value="custom">Custom time slots</option>
                  </select>
                </div>
                <div>
                  <button className="bg-gray-200 text-gray-400 text-sm font-medium px-4 py-2 rounded-md cursor-not-allowed">
                    Save &amp; Continue
                  </button>
                </div>

              </div>
            )}

            {activeTab === "menu" && (
              <div className="relative flex flex-col items-center justify-center bg-white h-[500px] w-full">
                <div className="flex flex-col items-center">
                  {items.length === 0 ? (
                    <>
                      <p className="text-gray-600 mb-4 text-sm">
                        Your menu is empty, let&apos;s change that
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-red-500 text-white px-6 py-2 rounded-md"
                      >
                        Add Items
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 border rounded-md p-2"
                        >
                          <img
                            src={item.image || "/cake.png"}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <p className="text-sm">{item.name}</p>
                        </div>
                      ))}
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 bg-red-500 text-white px-6 py-2 rounded-md"
                      >
                        Add More Items
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom-right Save button */}
                <button
                  className="absolute bottom-4 right-4 px-6 py-2 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  Save & Continue
                </button>
              </div>
            )}



            {activeTab === "publish" && (
              <div className="text-sm text-gray-500">Publish content goes here...</div>
            )}
          </div>
        </>

      )}
      <AdvancedModal isOpen={showAdvanced} onClose={() => setShowAdvanced(false)} />
      <PreorderCloseModal
        isOpen={showPremodal}
        onClose={() => setShowPremodal(false)}
        onSelect={setSelectedCloseOption}
        selected={selectedCloseOption}
      />
      {showCreateModal && <MenuItemsModal
        items={items}
        setItems={setItems}
        onClose={() => setShowCreateModal(false)} />
      }
    </div>
  );
}
