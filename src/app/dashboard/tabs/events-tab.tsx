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
import PickupModalFlow from "@/app/modals/create-pickupmodal";
import toast from "react-hot-toast";
import { createEvent, createMenuItem, createPickupWindow, updateEvent } from "@/services/api";

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
  const [showCreatePickupModal, setShowCreatePickupModal] = useState(false)
  const [selectedCloseOption, setSelectedCloseOption] = useState("last");
  const [timeSlotsOption, setTimeSlotsOption] = useState(
    "anytime"
  );
  // New: controlled form state
  const [eventName, setEventName] = useState<string>("New Event");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [walkUpOrdering, setWalkUpOrdering] = useState<boolean>(false);
  const [hideOpenTime, setHideOpenTime] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [createdEventId, setCreatedEventId] = useState<string | number | null>(null);
  const [hideFromStorefront, setHideFromStorefront] = useState<boolean>(false);
  const [checkoutTimeLimit, setCheckoutTimeLimit] = useState<number>(5);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; desc?: string; date?: string; time?: string; image?: string }>({});

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
            <button
              className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-100"
              aria-label="Play walkthrough video"
              title="Play walkthrough video"
            >
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
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full bg-gray-200 rounded p-2"
                      aria-label="Event Name"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div className="mb-4">
                    <label className=" text-sm mb-1">Event Image (optional)</label>
                    <div className="flex items-center gap-3">
                      <label htmlFor="event-image" className="bg-gray-200 w-[150px] rounded p-3 text-center cursor-pointer hover:bg-gray-50">
                        <span className="text-sm text-gray-600">Upload photo</span>
                      </label>
                      <input
                        id="event-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImageFile(file);
                          setErrors((prev) => ({ ...prev, image: undefined }));
                          if (file) {
                            if (!file.type.startsWith("image/")) {
                              setErrors((prev) => ({ ...prev, image: "Only image files are allowed" }));
                              setImagePreview(null);
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              setErrors((prev) => ({ ...prev, image: "Max 5MB image" }));
                              setImagePreview(null);
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => setImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                      />
                      {imagePreview && (
                        <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded" />
                      )}
                    </div>
                    {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-1">Event Description (optional)</label>
                    <textarea
                      placeholder="Describe your event"
                      maxLength={500}
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      className="w-full border rounded p-2 h-24"
                      aria-label="Event Description"
                    ></textarea>
                    <p className="text-xs text-gray-400 text-right">{eventDescription.length}/500</p>
                    {errors.desc && <p className="text-xs text-red-600 mt-1">{errors.desc}</p>}
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
                    {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
                    {errors.time && <p className="text-xs text-red-600">{errors.time}</p>}
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
                      checked={walkUpOrdering}
                      onCheckedChange={setWalkUpOrdering}
                      aria-label="Enable walk-up ordering"
                    >
                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 translate-x-0 data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                    <span className="text-sm">Enable walk-up ordering</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <Switch.Root
                      className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-black transition-colors"
                      id="hide-time-switch"
                      checked={hideOpenTime}
                      onCheckedChange={setHideOpenTime}
                      aria-label="Hide open time"
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
                  <button
                    onClick={async () => {
                      const newErrors: typeof errors = {};
                      if (!eventName.trim()) newErrors.name = "Event name is required";
                      if (eventName.trim().length > 150) newErrors.name = "Max 150 characters";
                      if (eventDescription.length > 500) newErrors.desc = "Max 500 characters";
                      if (!selectedDate) newErrors.date = "Please select a pre-order open date";
                      if (selectedDate) {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        const picked = new Date(selectedDate);
                        picked.setHours(0,0,0,0);
                        if (picked < today) newErrors.date = "Date cannot be in the past";
                      }
                      if (!selectedTime) newErrors.time = "Please select a pre-order open time";
                      setErrors(newErrors);
                      if (Object.keys(newErrors).length) return;
                      try {
                        setIsSaving(true);
                        const form = new FormData();
                        form.append("title", eventName.trim());
                        form.append("description", eventDescription.trim());
                        form.append("pre_order_date", format(selectedDate!, "yyyy-MM-dd"));
                        form.append("pre_order_time", selectedTime);
                        form.append("order_close_data", JSON.stringify({ option: selectedCloseOption }));
                        form.append("walk_up_ordering", String(walkUpOrdering ? 1 : 0));
                        form.append("walk_up_ordering_option", "pickup-windows");
                        form.append("hide_open_time", String(hideOpenTime ? 1 : 0));
                        form.append("disable_drop_notifications", "0");
                        form.append("hide_from_storefront", "0");
                        form.append("status", "draft");
                        if (imageFile) form.append("image", imageFile);
                        const res = await createEvent(form);
                        if (!res.success) {
                          toast.error(res.message || "Failed to create event");
                          return;
                        }
                        const newId = res.data?.id ?? res.data?.data?.id ?? null;
                        if (newId !== null) setCreatedEventId(newId);
                        toast.success("Event created");
                        setActiveTab("pickup");
                      } catch (e: any) {
                        toast.error(e?.message || "Something went wrong");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className={`bg-black text-white text-sm font-medium px-4 py-2 rounded-md ${isSaving ? "opacity-70" : "hover:opacity-90"}`}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save & Continue"}
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
                <button onClick={() => setShowCreatePickupModal(true)} className="w-full bg-black text-white text-sm font-medium rounded-md p-3 hover:bg-gray-800">
                  Add a pickup window
                </button>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="time-slots-select">Time slots occur</label>
                  <select
                    id="time-slots-select"
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
      <AdvancedModal
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        defaultHiddenFromStorefront={hideFromStorefront}
        defaultCheckoutTimeLimit={checkoutTimeLimit}
        onSave={async ({ hide_from_storefront, checkout_time_limit }) => {
          setHideFromStorefront(hide_from_storefront);
          setCheckoutTimeLimit(checkout_time_limit);
          if (createdEventId) {
            const res = await updateEvent(createdEventId, {
              hide_from_storefront: hide_from_storefront,
              checkout_time_limit: checkout_time_limit,
            } as any);
            if (res.success) toast.success("Advanced options saved");
            else toast.error(res.message || "Failed to save advanced options");
          }
        }}
      />
      <PickupModalFlow
        isOpen={showCreatePickupModal}
        onClose={() => setShowCreatePickupModal(false)}
        // @ts-ignore pass event id through global object for the jsx modal (jsx file)
        eventId={createdEventId}
        // @ts-ignore handler to create a pickup window
        onSavePickup={async (data: { date: Date; start: string; end: string; location_name?: string; address?: string }) => {
          if (!createdEventId) {
            toast.error("Create and save event first");
            return { success: false };
          }
          const res = await createPickupWindow({
            event_id: createdEventId,
            date: format(data.date, "yyyy-MM-dd"),
            start_time: data.start,
            end_time: data.end,
            location_name: data.location_name,
            address: data.address,
          });
          if (res.success) toast.success("Pickup window saved");
          else toast.error(res.message || "Failed to save pickup window");
          return res;
        }}
      />
      <PreorderCloseModal
        isOpen={showPremodal}
        onClose={() => setShowPremodal(false)}
        onSelect={setSelectedCloseOption}
        selected={selectedCloseOption}
      />
      {showCreateModal && (
        <MenuItemsModal
          items={items}
          setItems={setItems}
          onClose={async () => {
            // Persist any newly added items to backend if event exists
            if (!createdEventId) {
              setShowCreateModal(false);
              return;
            }
            try {
              const promises = items.map((it) =>
                createMenuItem({
                  event_id: createdEventId,
                  name: it.name,
                  description: it.description,
                  price: it.price,
                  image_url: it.image,
                })
              );
              const results = await Promise.all(promises);
              const ok = results.every((r) => r.success);
              if (ok) toast.success("Menu items saved");
              else toast.error("Some items failed to save");
            } catch (e: any) {
              toast.error(e?.message || "Failed to save items");
            } finally {
              setShowCreateModal(false);
            }
          }}
        />
      )}
    </div>
  );
}
