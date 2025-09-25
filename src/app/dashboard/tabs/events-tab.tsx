"use client";
import { useState, useEffect } from "react";
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
import api from "@/lib/api-client";
import { createEvent, createMenuItem, createPickupWindow, updateEvent, getMenuItems } from "@/services/api";

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string;
  // Additional fields from API
  eventId?: number;
  available?: boolean;
  category?: string | null;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  
  // Debug log whenever items change
  useEffect(() => {
    console.log("Menu items state updated:", items);
    console.log("Total items count:", items.length);
  }, [items]);
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
  const [selectedPickupWindowId, setSelectedPickupWindowId] = useState<string | number | null>(null);
  const [pickupWindows, setPickupWindows] = useState<any[]>([]);
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | number | null>(typeof window !== 'undefined' ? localStorage.getItem('selectedPickupLocationId') ?? null : null);
  const [loadingPickupWindows, setLoadingPickupWindows] = useState(false);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  // New: controlled form state
  const [eventName, setEventName] = useState<string>("New Event");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [walkUpOrdering, setWalkUpOrdering] = useState<boolean>(false);
  const [hideOpenTime, setHideOpenTime] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [createdEventId, setCreatedEventId] = useState<string | number | null>(null);
  const [hideFromStorefront, setHideFromStorefront] = useState<boolean>(false);

  // Function to remove item from selected menu items
  const removeMenuItem = (itemId: number) => {
    console.log(`Removing menu item with ID: ${itemId}`);
    setItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      console.log(`Menu items after removal:`, updated);
      return updated;
    });
  };
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

  // Load pickup windows and locations for the created event
  const loadPickupLocations = async () => {
    try {
      const { ok, data, message } = await api.get<any>(`/pickup-locations`, { pointName: "getPickupLocations" })
      if (!ok) throw new Error(message || "Failed to fetch pickup locations")
      setPickupLocations(Array.isArray(data) ? data : (data?.data ?? []))
    } catch (err) {
      console.error("Failed to load pickup locations", err)
    }
  }

  const loadPickupWindows = async () => {
    if (!createdEventId) {
      console.log("No event ID available for loading pickup windows")
      return
    }
    
    console.log(`Loading pickup windows for event ID: ${createdEventId}`)
    try {
      setLoadingPickupWindows(true)
      const { ok, data, message } = await api.get<any>(`/events/${createdEventId}/pickup-windows`, { pointName: "getPickupWindows" })
      console.log("Pickup windows API response:", { ok, data, message })
      
      if (!ok) throw new Error(message || "Failed to fetch pickup windows")
      const items = Array.isArray(data) ? data : (data?.data ?? [])
      console.log("Processed pickup windows:", items)
      setPickupWindows(items)
    } catch (err) {
      console.error("Failed to load pickup windows", err)
      toast.error("Failed to load pickup windows")
    } finally {
      setLoadingPickupWindows(false)
    }
  }

  const loadMenuItems = async () => {
    if (!createdEventId) {
      console.log("No event ID available for loading menu items")
      return
    }
    
    console.log(`Loading menu items for event ID: ${createdEventId}`)
    try {
      setLoadingMenuItems(true)
      const menuItems = await getMenuItems(createdEventId)
      console.log("Menu items API response:", menuItems)
      
      // Map API response to local Item interface
      const mappedItems: Item[] = menuItems.map((item: any) => ({
        id: Number(item.id),
        name: item.name,
        description: item.description,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        image: item.imageUrl || item.image_url || item.image || undefined,
        // Add additional fields for reference
        eventId: item.eventId,
        available: item.available,
        category: item.category,
        position: item.position,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
      
      console.log("Mapped menu items:", mappedItems)
      setItems(mappedItems)
    } catch (err) {
      console.error("Failed to load menu items", err)
      toast.error("Failed to load menu items")
    } finally {
      setLoadingMenuItems(false)
    }
  }

  // Load pickup windows when the pickup tab becomes active or when eventId changes
  useEffect(() => {
    console.log("useEffect triggered:", { activeTab, createdEventId })
    if (activeTab === 'pickup' && createdEventId) {
      console.log("Loading pickup data...")
      loadPickupLocations()
      loadPickupWindows()
    }
    if (activeTab === 'menu' && createdEventId) {
      console.log("Loading menu data...")
      loadMenuItems()
    }
  }, [activeTab, createdEventId])

  // Also load pickup windows immediately when an event is created
  useEffect(() => {
    if (createdEventId) {
      console.log("Event created, loading pickup windows for ID:", createdEventId)
      loadPickupWindows()
    }
  }, [createdEventId])

  // Load menu items when an event is created
  useEffect(() => {
    if (createdEventId) {
      console.log("Event created, loading menu items for ID:", createdEventId)
      loadMenuItems()
    }
  }, [createdEventId])

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
                  <span className="text-xs text-gray-500">{pickupWindows.length} time slot{pickupWindows.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="bg-cyan-100 text-sm text-gray-700 p-3 rounded">
                  Pickup windows let customers choose when and where they pickup their
                  order. Add at least one to the event using the button below.
                </div>
                <button onClick={() => setShowCreatePickupModal(true)} className="w-full bg-black text-white text-sm font-medium rounded-md p-3 hover:bg-gray-800">
                  Add a pickup window
                </button>
                
                {/* List saved pickup windows */}
                {loadingPickupWindows ? (
                  <div className="text-sm text-gray-500 mt-2">Loading pickup windows...</div>
                ) : pickupWindows.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">Select a pickup window</label>
                    <div className="space-y-2">
                      {pickupWindows.map((pw) => {
                        const isSelected = String(selectedPickupWindowId) === String(pw.id);
                        // Format the date from ISO string
                        const pickupDate = pw.pickupDate ? new Date(pw.pickupDate).toLocaleDateString() : 'N/A';
                        // Use the nested pickupLocation object
                        const locationName = pw.pickupLocation?.name || `Location ID: ${pw.pickupLocationId}`;
                        
                        return (
                          <button
                            key={pw.id}
                            onClick={() => setSelectedPickupWindowId(pw.id)}
                            className={`w-full text-left p-3 rounded border transition-colors ${
                              isSelected
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-400'
                            } `}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{pickupDate} • {pw.startTime} - {pw.endTime}</div>
                                <div className="text-sm text-gray-600">{locationName}</div>
                                {pw.pickupLocation?.address && (
                                  <div className="text-xs text-gray-500">{pw.pickupLocation.address}</div>
                                )}
                              </div>
                              {isSelected && <div className="text-sm font-semibold text-black">Selected</div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">No pickup windows created yet.</div>
                )}

                <div className="mt-4">
                  <label className="text-sm text-gray-700" htmlFor="time-slots-select">Time slots occur</label>
                  <select
                    id="time-slots-select"
                    value={timeSlotsOption}
                    onChange={(e) => setTimeSlotsOption(e.target.value)}
                    className="mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="anytime">Anytime between window start and end</option>
                      <option value="5">Every 5 minutes</option>
            <option value="10">Every 10 minutes</option>
            <option value="12">Every 12 minutes</option>
            <option value="15">Every 15 minutes</option>
            <option value="20">Every 20 minutes</option>
            <option value="30">Every 30 minutes</option>
            <option value="45">Every 45 minutes</option>
            <option value="60">Every 60 minutes</option>
            <option value="90">Every 90 minutes</option>
            <option value="120">Every 2 hours</option>
                  </select>
                </div>
                <div>
                  <button
                    onClick={async () => {
                      if (!createdEventId) {
                        toast.error('Please save the event first');
                        return;
                      }
                      if (!selectedPickupWindowId) {
                        toast.error('Select a pickup window to continue');
                        return;
                      }
                      try {
                        setIsSaving(true);
                        // Find the selected pickup window to get its location ID
                        const selectedWindow = pickupWindows.find(pw => String(pw.id) === String(selectedPickupWindowId));
                        const locationId = selectedWindow?.pickupLocationId || selectedWindow?.pickupLocation?.id || null;
                        
                        // Save the selected pickup window as default on the event along with time slots option
                        const res = await updateEvent(createdEventId, { 
                          default_pickup_window_id: selectedPickupWindowId, 
                          default_pickup_location_id: locationId,
                          time_slots_option: timeSlotsOption
                        } as any);
                        if (!res.success) {
                          toast.error(res.message || 'Failed to save pickup selection');
                          return;
                        }
                        toast.success('Pickup window selected');
                        // Proceed to next tab (menu)
                        setActiveTab('menu');
                      } catch (err: any) {
                        toast.error(err?.message || 'Failed to save pickup selection');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={selectedPickupWindowId == null}
                    className={`w-full text-sm font-medium px-4 py-2 rounded-md ${selectedPickupWindowId != null ? 'bg-black text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isSaving ? 'Saving...' : 'Save & Continue'}
                  </button>
                </div>

              </div>
            )}

            {activeTab === "menu" && (
              <div className="relative bg-white min-h-[500px] w-full p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Menu Items</h2>
                    <span className="text-xs text-gray-500">
                      {loadingMenuItems ? "Loading..." : `${items.length} item${items.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  
                  {loadingMenuItems ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-sm text-gray-500">Loading menu items...</div>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-gray-600 mb-4 text-sm">
                        Your menu is empty, let&apos;s change that
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
                      >
                        Add Items
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 mb-2">
                        Selected items for this event: ({items.length} items)
                      </div>
                      {items.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className={`flex items-center gap-4 border rounded-lg p-4 ${
                            item.available !== false ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <img
                            src={item.image || item.imageUrl || "/cake.png"}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.available !== false
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {item.available !== false ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm font-semibold text-green-600">
                                ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                              </p>
                              <div className="flex items-center gap-2">
                                {item.createdAt && (
                                  <p className="text-xs text-gray-400">
                                    Added: {new Date(item.createdAt).toLocaleDateString()}
                                  </p>
                                )}
                                <button
                                  onClick={() => removeMenuItem(item.id)}
                                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                                  title="Remove item"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                      >
                        + Add More Items
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom-right Save button */}
                <button
                  onClick={() => {
                    if (items.length > 0) {
                      console.log("Saving menu items and continuing...", items);
                      toast.success(`Saved ${items.length} menu items successfully!`);
                      setActiveTab("publish");
                    }
                  }}
                  className={`absolute bottom-4 right-4 px-6 py-2 rounded-md ${
                    items.length > 0
                      ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={items.length === 0}
                >
                  Save & Continue
                </button>
              </div>
            )}



            {activeTab === "publish" && (
              <div className="relative bg-white min-h-[500px] w-full p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-6">Notifications</h2>
                  
                  {/* Settings Button */}
                  <div className="flex justify-end mb-4">
                    <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-600 hover:bg-gray-200">
                      <span>⚙️</span>
                      Settings
                    </button>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-6">
                    {/* Now - Event Details Check */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${eventName && eventDescription ? 'bg-green-500' : 'bg-gray-300'} flex-shrink-0`}></div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${eventName && eventDescription ? 'text-green-600' : 'text-gray-400'}`}>
                            {eventName && eventDescription ? '✓ Event Details Complete' : '○ Event Details Required'}
                          </span>
                          <span className="text-sm text-blue-600 font-medium">Now</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    </div>

                    {/* Draft Notification */}
                    <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Event is ready to publish!</h4>
                          <div className="text-sm text-gray-600">
                            {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Draft</span>
                      </div>
                    </div>

                    {/* Menu Items Check */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${items.length > 0 ? 'bg-green-500' : 'bg-gray-300'} flex-shrink-0`}></div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${items.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {items.length > 0 ? `✓ Menu Items (${items.length} items)` : '○ Menu Items Required'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    </div>

                    {/* Pickup Windows Check */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${pickupWindows.length > 0 ? 'bg-green-500' : 'bg-gray-300'} flex-shrink-0`}></div>
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${pickupWindows.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {pickupWindows.length > 0 ? `✓ Pickup Windows (${pickupWindows.length} windows)` : '○ Pickup Windows Required'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    </div>

                    {/* Add Notification Button */}
                    <button className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      Add notification
                    </button>

                    {/* Orders Close Timeline */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-600">📋 Orders close</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-3">
                    {/* Publish Button */}
                    <button
                      onClick={() => {
                        const canPublish = eventName && eventDescription && items.length > 0 && pickupWindows.length > 0;
                        if (canPublish) {
                          toast.success("Event published successfully!");
                          console.log("Publishing event with:", {
                            eventName,
                            eventDescription,
                            menuItems: items,
                            pickupWindows
                          });
                        } else {
                          toast.error("Please complete all required sections before publishing");
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        eventName && eventDescription && items.length > 0 && pickupWindows.length > 0
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!(eventName && eventDescription && items.length > 0 && pickupWindows.length > 0)}
                    >
                      Publish Event
                    </button>

                    {/* Send Email Notifications */}
                    <button className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Send Email Notifications
                    </button>

                    {/* Add Discount Code */}
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Add a discount code</h4>
                          <p className="text-sm text-gray-600">Optionally add one or more discount codes for this event</p>
                        </div>
                        <button className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800">
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
    onSavePickup={async (data: { date: Date; start: string; end: string; pickup_location_id: string | number }) => {
          if (!createdEventId) {
            toast.error("Create and save event first");
            return { success: false };
          }
          const res = await createPickupWindow(
            createdEventId,
            {
              pickup_date: format(data.date, "yyyy-MM-dd"),
              start_time: data.start,
      end_time: data.end,
      pickup_location_id: data.pickup_location_id,
              time_zone: "GMT+8",
            }
          );
          if (res.success) toast.success("Pickup window saved");
          else toast.error(res.message || "Failed to save pickup window");
          // Refresh list of pickup windows so newly created window shows up
          if (res.success) {
            // Try to extract new window id from response
            const newId = res.data?.id ?? res.data?.data?.id ?? null;
            // Reload windows then mark the newly created one as selected
            try {
              await loadPickupWindows();
            } catch {}
            if (newId !== null) setSelectedPickupWindowId(newId);
          }
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
          eventId={createdEventId}
          onItemCreated={loadMenuItems} // Refresh items after creation
          onClose={async () => {
            // Close the modal
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
