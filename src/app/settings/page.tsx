"use client";
import { useRef, useState } from "react";
import { Copy, QrCode, ChevronDown, Info } from "lucide-react";

interface User {
    name: string;
    phone: string;
    role: string;
    isOwner?: boolean;
}


export default function SettingsPage() {

    const [users, setUsers] = useState<User[]>([
        { name: "Account Admin", phone: "+19786159222", role: "Owner", isOwner: true },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<User>({ name: "", phone: "", role: "No permissions" });
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [allowTipping, setAllowTipping] = useState(true);
    const [tipOption, setTipOption] = useState("15% / 20% / 25%");
    const [defaultZero, setDefaultZero] = useState(false);
    const [cash, setCash] = useState(false);
    const [venmo, setVenmo] = useState(false);
    const [zelle, setZelle] = useState(false);
    const [acknowledge, setAcknowledge] = useState(false);
    const [confirmationEnabled, setConfirmationEnabled] = useState(true);
    const [reminder24Enabled, setReminder24Enabled] = useState(false);
    const [reminder2Enabled, setReminder2Enabled] = useState(false);
    const [reminder15Enabled, setReminder15Enabled] = useState(false);
    const [completedEnabled, setCompletedEnabled] = useState(false);
    const links = [
        {
            title: "Storefront",
            url: "www.hotplate.com/astheticproducts",
        },
        {
            title: "SMS Signup",
            url: "www.hotplate.com/astheticproducts?sms_reminder=true",
        },
        {
            title: "Current Event",
            url: "www.hotplate.com/astheticproducts?event=current",
        },
        {
            title: "Buy Gift Card",
            url: "www.hotplate.com/astheticproducts?gift=true",
        },
    ];
    type TabKey =
        | "general"
        | "reviews"
        | "storefront"
        | "team"
        | "drop"
        | "checkout"
        | "loyalty"
        | "notifications"
        | "chat";

    const sectionRefs: Record<TabKey, React.RefObject<HTMLDivElement>> = {
        general: useRef(null),
        reviews: useRef(null),
        storefront: useRef(null),
        team: useRef(null),
        drop: useRef(null),
        checkout: useRef(null),
        loyalty: useRef(null),
        notifications: useRef(null),
        chat: useRef(null),
    };

    const tabs: { key: TabKey; label: string }[] = [
        { key: "general", label: "General" },
        { key: "reviews", label: "Reviews" },
        { key: "storefront", label: "Storefront" },
        { key: "team", label: "Team" },
        { key: "drop", label: "Drop" },
        { key: "checkout", label: "Checkout" },
        { key: "loyalty", label: "Loyalty points" },
        { key: "notifications", label: "Notifications" },
        { key: "chat", label: "Chat" },
    ];

    const scrollToSection = (key: TabKey) => {
        sectionRefs[key].current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSave = () => {
        if (!form.name || !form.phone) return;

        if (editIndex !== null) {
            // update user
            const updated = [...users];
            updated[editIndex] = form;
            setUsers(updated);
            setEditIndex(null);
        } else {
            // add to TOP
            setUsers([{ ...form }, ...users]);
        }

        setForm({ name: "", phone: "", role: "No permissions" });
        setShowForm(false);
    };

    const handleEdit = (index: number) => {
        setForm(users[index]);
        setEditIndex(index);
        setShowForm(true);
    };

    const handleDelete = (index: number) => {
        setUsers(users.filter((_, i) => i !== index));
    };

    const [controls, setControls] = useState({
        hideChat: false,
        hideViewers: false,
        capCart: false,
        hideActive: false,
    });

    const toggle = (key: keyof typeof controls) => {
        setControls((prev) => ({ ...prev, [key]: !prev[key] }));
    };


    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Settings Title */}
            <h1 className="text-2xl font-semibold mb-6">Settings</h1>

            {/* Links Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-medium">Links</h2>
                {links.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                        {/* Title */}
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-gray-800">{item.title}</p>
                            <Info className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* URL + Buttons in same border */}
                        <div className="flex items-center justify-between gap-2  rounded-md p-2 bg-gray-200">
                            {/* URL as plain text */}
                            <span className="flex-1 text-sm text-gray-700 truncate">{item.url}</span>

                            {/* Buttons */}
                            <button className="px-3 py-2 border border-gray-200 bg-white rounded-md text-sm flex items-center gap-1 hover:bg-gray-50">
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                            <button className="px-3 py-2 border border-gray-200 bg-white rounded-md text-sm flex items-center gap-1 hover:bg-gray-50">
                                <QrCode className="w-4 h-4" /> QR
                            </button>
                            <button className="px-2 py-2 border border-gray-200 bg-white rounded-md hover:bg-gray-50">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs (Navigation) */}
            <div className="border-b mt-8 sticky top-0 bg-white z-10">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => scrollToSection(tab.key)}
                            className="flex-1 px-4 py-2 text-sm text-gray-400 hover:text-black hover:font-medium border-b-2 border-transparent cursor-pointer transition whitespace-nowrap"
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>



            {/* Tab Sections (Content) */}
            <div className="space-y-10 mt-6">
                {/* General tab starts */}
                <div ref={sectionRefs.general} className="p-6 bg-white  rounded-xl shadow-lg border border-gray-200 w-full ">
                    {/* General Heading */}
                    <h3 className="text-lg font-semibold mb-4">General</h3>
                    {/* Business Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name
                        </label>
                        <input
                            type="text"
                            defaultValue="Asthetic products"
                            className="w-full px-3 py-2 border rounded-md text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    {/* Default Tax Rate */}
                    <div className="mb-6">
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                            Default Tax Rate
                            <Info className="w-4 h-4 text-gray-400" />
                        </label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                defaultValue="0.00"
                                className="w-32 px-3 py-2 border rounded-md text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <span className="ml-2 text-gray-600">%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Learn more about how taxes work in our{" "}
                            <a href="#" className="text-indigo-600 underline">
                                help center
                            </a>
                            .
                        </p>
                    </div>
                    {/* Change Fee Section */}
                    <div className="mb-4 border border-gray-200 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                Change how much you pay for Hotplate
                            </p>
                            <p className="text-xs text-gray-500">
                                You currently pay 0% of Hotplate fees and you pay Payment Processing
                                fees.
                            </p>
                        </div>
                        <button className="px-4 py-1 bg-black text-white rounded-md text-sm">
                            Update
                        </button>
                    </div>
                    {/* Update URL Section */}
                    <div className="mb-4 border border-gray-200 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Update your URL</p>
                            <p className="text-xs text-gray-500">
                                Change the URL of your storefront to a new one.
                            </p>
                        </div>
                        <button className="px-4 py-1 bg-black text-white rounded-md text-sm">
                            Update
                        </button>
                    </div>
                    {/* QR Code Pickups */}
                    <div className="border border-gray-200 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">QR Code Pickups</p>
                            <p className="text-xs text-gray-500">
                                Display a QR code on customer receipt page for a more efficient
                                pickup{" "}
                                <a href="#" className="text-indigo-600 underline">
                                    Learn more
                                </a>
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                    </div>
                </div>
                {/* General tab Ends */}

                {/* Reviews tab starts */}
                <div ref={sectionRefs.reviews} className="p-6 bg-white  rounded-xl shadow-lg border border-gray-200 w-full ">
                    {/* General Heading */}
                    <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                    {/* QR Code Pickups */}
                    <div className="border border-gray-200 mb-4 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Customer reviews</p>
                            <p className="text-xs text-gray-500">
                                Get feedback and reviews from customers after they receive their order
                                <a href="#" className="text-indigo-600 underline">
                                    Learn more
                                </a>
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                    </div>
                    <div className="border border-gray-200 mb-4 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Display review score on storefront</p>
                            <p className="text-xs text-gray-500">
                                Show average review rating and total number of approved reviews on your storefront profile
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                    </div>
                    <div className="border border-gray-200 mb-4 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Automatically approve all new reviews</p>
                            <p className="text-xs text-gray-500">
                                All new reviews received will be automatically approved and will be immediately available on your storefront
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                    </div>
                    <div className="border border-gray-200 mb-4 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Send review request text messages</p>
                            <p className="text-xs text-gray-500">
                                A text will be sent to customers 24-hours after pick-up time inviting them to leave a review
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                    </div>
                    <div className="border border-gray-200 mb-4 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Only send review requests if customer hasn't previously left a review</p>
                            <p className="text-xs text-gray-500">
                                Review texts will only be sent if the customer has never left a review before - all customers can still leave a review by revisiting their order confirmation page
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                    </div>
                    <div className="border border-gray-200 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Only send review requests once</p>
                            <p className="text-xs text-gray-500">
                                Review texts will only be sent to a customer once, even if they have not left a review yet
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                    </div>
                </div>
                {/* Reviews tab Ends */}

                {/* Storefront tab Start */}
                <div ref={sectionRefs.storefront} className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 w-full">
                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-4">Storefront</h3>

                    {/* Info Banner */}
                    <div className="bg-blue-50 text-sm text-gray-700 border border-blue-100 rounded-md p-3 mb-6 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                        <p>
                            You can configure your storefront from the{" "}
                            <a href="#" className="text-blue-600 underline">
                                Storefront tab on your Hotplate Store page
                            </a>.
                        </p>
                    </div>
                    {/* Toggles */}
                    <div className="space-y-4">

                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                            <span className="ml-2 text-sm text-gray-700">Show my past sales on my storefront</span>
                        </div>
                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                            <span className="ml-2 text-sm text-gray-700">Allow customers to buy gift cards on my storefront</span>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="mt-6">
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            Custom Name for Drops
                            <Info className="w-4 h-4 text-gray-400" />
                        </label>
                        <input
                            type="text"
                            placeholder="Custom drop name"
                            className="w-[170px] px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>
                {/* Storefront tab End */}

                {/* team tab Start */}
                <div ref={sectionRefs.team} className="p-6 bg-white  rounded-xl shadow-lg border border-gray-200 w-full">
                    <h3 className="text-lg font-semibold mb-4">Your Team</h3>
                    {users.map((user, idx) => (
                        <div
                            key={idx}
                            className="flex items-center w-[500px] justify-between p-3 rounded-lg border border-gray-200 shadow-sm mb-3 bg-white"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.phone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-2 py-1 text-xs rounded-md ${user.role === "Owner"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {user.role}
                                </span>
                                {!user.isOwner && (
                                    <>
                                        <button
                                            onClick={() => handleEdit(idx)}
                                            className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(idx)}
                                            className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {showForm ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="+1 US Phone number"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="flex-1 px-3 py-2 border rounded-md text-sm border-red-300"
                                />
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="px-3 py-2 border rounded-md text-sm"
                                >
                                    <option>No permissions</option>
                                    <option>Editor</option>
                                    <option>Viewer</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 rounded-md bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition"
                                >
                                    {editIndex !== null ? "Update" : "Save"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditIndex(null);
                                        setForm({ name: "", phone: "", role: "No permissions" });
                                    }}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
                        >
                            Add User
                        </button>
                    )}
                </div>
                {/* team tab End */}

                {/* drop tab Start */}
                <div ref={sectionRefs.drop} className="p-6 bg-white  rounded-xl shadow-lg border border-gray-200 w-full">
                    <h3 className="text-lg font-semibold mb-4">Drop Controls</h3>
                    <p className="text-sm text-gray-500 mt-3 mb-4">
                        We recommend keeping these features enabled to boost your sales and offer a unique
                        shopping experience to your customers
                    </p>

                    {/* Row 1 */}
                    <div className="flex items-center  py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                        <span className="text-sm ms-4 text-black">
                            Hide the customer chat that is displayed the 30 mins leading up to a sale opening
                        </span>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-center  py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                        <span className="text-sm ms-4 text-black">
                            Do not display the number of customers currently viewing my sale
                        </span>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-center  py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                        <span className="text-sm ms-4 text-black">
                            Cap the amount of an item 'in cart' displayed to customers at 500
                        </span>
                    </div>

                    {/* Row 4 */}
                    <div className="flex items-center  py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                        <span className="text-sm ms-4 text-black">
                            Hide the amount of an item actively in all customers' carts
                        </span>
                    </div>
                </div>
                {/* drop tab End */}

                {/* checkout tab Start */}
                <div ref={sectionRefs.checkout} className="p-6 bg-white  rounded-xl shadow-lg border border-gray-200 w-full">
                    <div>
                        <h2 className="text-lg font-semibold">Checkout</h2>
                        <div className="flex items-center mt-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                            <span className="text-gray-700 ms-3">Allow Tipping</span>

                        </div>

                        {/* Tip Options */}
                        {allowTipping && (
                            <div className="mt-4 space-y-3">
                                <label className="block text-gray-700 text-sm mb-1">
                                    Tip Options
                                </label>
                                <select
                                    value={tipOption}
                                    onChange={(e) => setTipOption(e.target.value)}
                                    className="w-60 border border-gray-200 shadow-sm rounded-md px-3 py-2 text-gray-700"
                                >
                                    <option>15% / 20% / 25%</option>
                                    <option>10% / 15% / 20%</option>
                                    <option>10% / 20% / 30%</option>
                                </select>

                                <div className="flex items-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                                    </label>
                                    <span className="text-sm text-gray-700">
                                        Make $0.00 the default
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* External Payments */}
                    <div className=" border rounded-md border-gray-300 p-4 mt-4">
                        <h3 className="font-semibold text-gray-800">External Payments</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Besides Cards, Apple Pay, and Google Pay, you can allow customers to
                            pay you outside of Hotplate with these methods. You are responsible
                            for ensuring your customers complete payment.
                        </p>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="145.25 145.25 221.5 221.5"
                                        className="mr-[1.45rem] h-4 w-4"
                                    >
                                        {/* Outer Circle */}
                                        <circle
                                            cx="256"
                                            cy="256"
                                            r="100.75"
                                            fill="none"
                                            stroke="rgb(8, 59, 67)"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="20"
                                        />

                                        {/* Inner Path */}
                                        <path
                                            d="M283.87 254.81c-3.46-2.72-8.61-4.9-15.32-6.48l-14.72-3.47c-2.37-.55-4.3-1.05-5.91-1.52a23.6 23.6 0 0 1-4.73-1.76 5.17 5.17 0 0 1-3-4.91 6.57 6.57 0 0 1 3.22-5.91 13.8 13.8 0 0 1 4.42-1.82 24.5 24.5 0 0 1 5.54-.57 22 22 0 0 1 9.06 1.66l.45.22a9.6 9.6 0 0 1 4.67 4.74 10.34 10.34 0 0 0 9.36 6.25h.62a10.14 10.14 0 0 0 8.58-4.72 10 10 0 0 0 .64-9.64 25.4 25.4 0 0 0-8-9.76 37 37 0 0 0-13.36-6.21v-2.78a10 10 0 0 0-20 0v2.26c-6.79 1.11-12.32 3.55-16.47 7.28a26.22 26.22 0 0 0-9 20.26c0 8.91 3.15 15.59 9.37 19.85 3.39 2.35 9.17 4.45 17.65 6.41l1.48.34 9.09 2c2 .44 3.75.87 5.25 1.33a26 26 0 0 1 5.74 2.33 5.15 5.15 0 0 1 2.71 4.69c0 3.86-1.95 6.33-6.12 7.79a19 19 0 0 1-2.17.59 36.3 36.3 0 0 1-7.45.67 27.5 27.5 0 0 1-7.48-.91 11.74 11.74 0 0 1-5.88-3.54 9.9 9.9 0 0 1-1.54-2.73 10.52 10.52 0 1 0-19.19 8.57 26.3 26.3 0 0 0 7.45 9.08 36.75 36.75 0 0 0 16.54 7v2.46a10 10 0 0 0 20 0v-2.24c7-1.12 12.75-3.6 17.21-7.41a26.17 26.17 0 0 0 9.6-20.66c-.03-8.09-2.81-14.4-8.31-18.74"
                                            fill="rgb(8, 59, 67)"
                                        />
                                    </svg>

                                    <span className="text-gray-800">Cash</span>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div
                                        className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                                </label>

                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 64 64"
                                        className="h-4 w-4 "
                                    >
                                        <rect width="64" height="64" rx="8" fill="#3396cd" />
                                        <path
                                            fill="#fff"
                                            transform="translate(0,5) scale(0.90)"
                                            d="M47.9 18.8c1.4 2.3 2 4.7 2 7.7 0 9.6-8.2 22.1-14.8 30.9H22.2l-6.1-36.5 13.3-1.3 3.2 26c4.1-7.6 7.7-15 7.7-20 0-2.9-.5-4.9-1.3-6.6z"
                                        />
                                    </svg>
                                    <span className="ml-2 text-gray-800">Venmo</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 48 48"
                                        className="h-5 w-5 mr-[1.45rem]"
                                    >
                                        {/* Purple background */}
                                        <rect width="48" height="48" rx="8" fill="#a0f" />

                                        {/* White "Z" with cuts */}
                                        <path
                                            fill="#fff"
                                            d="M30 12h-14v3h9l-10 18h15v-3h-10l10-18z"
                                        />
                                    </svg>

                                    <span className="text-gray-800">Zelle</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">
                                Customers will be provided payment instructions after they confirm
                                their order
                            </p>
                        </div>
                    </div>
                    <div className="border rounded-md mt-4 border-gray-300 p-4">
                        <h3 className="font-semibold text-gray-800">
                            Checkout Acknowledgement
                        </h3>
                        <div className="flex justify-between">
                            <p className="text-sm text-gray-500">
                                Display a message at checkout that customers must acknowledge before
                                placing their order{" "}
                                <a href="#" className="text-blue-600">
                                    Learn more
                                </a>
                            </p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                        </div>
                    </div>
                </div>
                {/* checkout tab End */}

                <div ref={sectionRefs.loyalty} className="p-6 bg-white  rounded-xl shadow-lg border border-gray-200 w-full">
                    <h2 className="text-lg font-semibold">Loyalty points</h2>
                    <div className="border rounded-md mt-4 border-gray-300 p-4">
                        <h3 className="font-semibold text-gray-800">
                            Checkout Acknowledgement
                        </h3>
                        <div className="flex justify-between">
                            <p className="text-sm text-gray-500">
                                Display a message at checkout that customers must acknowledge before
                                placing their order{" "}
                                <a href="#" className="text-blue-600">
                                    Learn more
                                </a>
                            </p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div ref={sectionRefs.notifications} className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 w-full">
                    <h2 className="text-lg font-semibold mb-4">Order Notifications</h2>

                    {/* Confirmation Message */}
                    <div className="mb-6 w-[450px]">
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            Confirmation Message
                            <Info className="ml-1 h-4 w-4 text-gray-400" />
                        </label>
                        <textarea
                            defaultValue={`Asthetic products has received your order!\n\nView your order time, location, and additional details here:\nhttps://www.hotplate.com/confirmation?orderId=XXXXXX&phone=+11111111111`}
                            maxLength={172}
                            disabled={!confirmationEnabled}
                            className={`w-[450px] h-45 p-3 text-sm border rounded-md focus:outline-none focus:ring-2
                                ${confirmationEnabled
                                    ? "bg-white border-gray-300 text-gray-700 focus:ring-indigo-500"
                                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        />
                        <div className="text-right text-xs text-gray-400">0/172</div>
                    </div>

                    {/* 24hr Reminder */}
                    <div className="mb-6 w-[450px]">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                24hr Reminder
                                <Info className="ml-1 h-4 w-4 text-gray-400" />
                            </label>
                            {/* Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={reminder24Enabled}
                                    onChange={() => setReminder24Enabled(!reminder24Enabled)}
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-black transition-colors"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                        </div>
                        <textarea
                            defaultValue={`Don't forget about your order from Asthetic products tomorrow!\n\nView your order time, location, and additional details here:\nhttps://www.hotplate.com/confirmation?orderId=XXXXXX&phone=+11111111111`}
                            maxLength={172}
                            disabled={!reminder24Enabled}
                            className={`w-full h-45 p-3 text-sm border rounded-md focus:outline-none focus:ring-2
                                ${reminder24Enabled
                                    ? "bg-white border-gray-300 text-gray-700 focus:ring-indigo-500"
                                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        />
                        <div className="text-right text-xs text-gray-400">0/172</div>
                    </div>

                    {/* 2hr Reminder */}
                    <div className="mb-6 w-[450px]">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                2hr Reminder
                                <Info className="ml-1 h-4 w-4 text-gray-400" />
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={reminder2Enabled}
                                    onChange={() => setReminder2Enabled(!reminder2Enabled)}
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-black transition-colors"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                        </div>
                        <textarea
                            defaultValue={`Don't forget about your order from Asthetic products today!\n\nView your order time, location, and additional details here:\nhttps://www.hotplate.com/confirmation?orderId=XXXXXX&phone=+11111111111`}
                            maxLength={172}
                            disabled={!reminder2Enabled}
                            className={`w-full h-45 p-3 text-sm border rounded-md focus:outline-none focus:ring-2
                                ${reminder2Enabled
                                    ? "bg-white border-gray-300 text-gray-700 focus:ring-indigo-500"
                                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        />
                        <div className="text-right text-xs text-gray-400">0/172</div>
                    </div>

                    {/* 15min Reminder */}
                    <div className="mb-6 w-[450px]">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                15min Reminder
                                <Info className="ml-1 h-4 w-4 text-gray-400" />
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={reminder15Enabled}
                                    onChange={() => setReminder15Enabled(!reminder15Enabled)}
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-black transition-colors"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                        </div>
                        <textarea
                            defaultValue={`Your order is almost ready! Don’t forget about it.\n\nCheck details:\nhttps://www.hotplate.com/confirmation?orderId=XXXXXX&phone=+11111111111`}
                            maxLength={172}
                            disabled={!reminder15Enabled}
                            className={`w-full h-45 p-3 text-sm border rounded-md focus:outline-none focus:ring-2
                                ${reminder15Enabled
                                    ? "bg-white border-gray-300 text-gray-700 focus:ring-indigo-500"
                                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        />
                        <div className="text-right text-xs text-gray-400">0/172</div>
                    </div>

                    {/* Order Completed */}
                    <div className="mb-6 w-[450px]">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                Order Completed
                                <Info className="ml-1 h-4 w-4 text-gray-400" />
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={completedEnabled}
                                    onChange={() => setCompletedEnabled(!completedEnabled)}
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-black transition-colors"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                            </label>
                        </div>
                        <textarea
                            defaultValue={`Your order from Asthetic products has been completed!\n\nView confirmation here:\nhttps://www.hotplate.com/confirmation?orderId=XXXXXX&phone=+11111111111`}
                            maxLength={172}
                            disabled={!completedEnabled}
                            className={`w-full h-45 p-3 text-sm border rounded-md focus:outline-none focus:ring-2
                                ${completedEnabled
                                    ? "bg-white border-gray-300 text-gray-700 focus:ring-indigo-500"
                                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        />
                        <div className="text-right text-xs text-gray-400">0/172</div>
                    </div>

                    <div className="bg-blue-100 text-sm text-gray-700 border border-blue-100 rounded-md p-3 mb-6 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                        <p>
                            All SMS notifications have the customer's confirmation link appended to the end of the
                            text. Additionally, updates to notifications will be automatically applied to all messages
                            that have not yet been sent.
                        </p>
                    </div>
                </div>

                <div ref={sectionRefs.chat} className="p-6 bg-white  rounded-xl shadow-lg border border-gray-200 w-full">
                    <h2 className="text-lg font-semibold mb-4">Chat</h2>
                    <div className="flex items-center mt-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition"></div>
                        </label>
                        <span className="text-black ms-3">Allow customers to start a chat with you after they place an order</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
