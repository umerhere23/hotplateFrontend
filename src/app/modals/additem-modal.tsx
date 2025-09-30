"use client";
import { useState, useEffect } from "react";
import CreateItemModal from "./createitem-modal";
import { getMenuItems } from "@/services/api";
import toast from "react-hot-toast";

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
    // Additional API fields
    eventId?: number;
    imageUrl?: string;
    available?: boolean;
    category?: string | null;
    position?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface MenuItemsModalProps {
    onClose: () => void;
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    eventId?: string | number | null;
    onItemCreated?: () => void; // Callback to refresh items
}

export default function MenuItemsModal({ onClose, items, setItems, eventId, onItemCreated }: MenuItemsModalProps) {
    const [showCreateItem, setShowCreateItem] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [allMenuItems, setAllMenuItems] = useState<Item[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("createdAt");

    // Load all menu items from API
    const loadAllMenuItems = async () => {
        if (!eventId) {
            console.log("No eventId provided to loadAllMenuItems");
            return;
        }
        
        console.log(`Loading menu items for eventId: ${eventId}`);
        console.log(`API endpoint will be: /events/${eventId}/menu-items`);
        setLoadingItems(true);
        try {
            const menuItems = await getMenuItems(eventId);
            console.log("Raw API response from getMenuItems:", menuItems);
            console.log("Type of response:", typeof menuItems);
            console.log("Is array:", Array.isArray(menuItems));
            console.log("Length:", menuItems?.length);
            
            if (!menuItems || !Array.isArray(menuItems)) {
                console.warn("API returned invalid data format:", menuItems);
                setAllMenuItems([]);
                return;
            }
            
            // Map API response to local Item interface
            const mappedItems: Item[] = menuItems.map((item: any, index: number) => {
                console.log(`Mapping item ${index}:`, item);
                return {
                    id: Number(item.id),
                    name: item.name || 'Unnamed Item',
                    description: item.description || '',
                    price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
                    image: item.imageUrl || item.image_url || item.image || undefined,
                    eventId: item.eventId,
                    imageUrl: item.imageUrl,
                    available: item.available !== false, // Default to true if not specified
                    category: item.category,
                    position: item.position || 0,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt
                };
            });
            
            console.log("Mapped items:", mappedItems);
            console.log("Setting allMenuItems to:", mappedItems);
            setAllMenuItems(mappedItems);
        } catch (error) {
            console.error("Failed to load menu items:", error);
            toast.error(`Failed to load menu items: ${error}`);
        } finally {
            setLoadingItems(false);
        }
    };

    // Load menu items when component mounts or eventId changes
    useEffect(() => {
        if (eventId) {
            loadAllMenuItems();
        }
    }, [eventId]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = e.target.value || "createdAt";
        setSortBy(newSortBy);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value || "";
        setSearchQuery(newQuery);
    };

    // Filter and sort menu items
    const filteredAndSortedItems = allMenuItems
        .filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name") {
                // Sort by name alphabetically (A-Z)
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            } else if (sortBy === "createdAt") {
                // Sort by creation date (newest first)
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA; // Newest first
            }
            return 0;
        });

    const handleAddItem = (item: Item) => {
        setItems((prev) => [...prev, { ...item, id: prev.length + 1 }]);
        setShowCreateItem(false);
        // Refresh the list of all menu items after creating a new one
        loadAllMenuItems();
        // Trigger refresh of items from API if callback is provided
        if (onItemCreated) {
            onItemCreated();
        }
    };

    const handleCheckboxChange = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleAddSelected = () => {
        setItems((prev) => {
            const selectedItems = filteredAndSortedItems.filter((item) => selectedIds.includes(item.id));
            // Only add items that are not already in prev
            const newItems = selectedItems.filter(
                (item) => !prev.some((p) => p.id === item.id)
            );
            return [...prev, ...newItems];
        });
        
        // Clear selections after adding
        setSelectedIds([]);
        onClose();
    };

    return (
        <>
            {!showCreateItem && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
                    <div className="bg-white w-[450px] rounded-lg shadow-lg p-4 relative">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Add Menu Items</h2>
                            <button onClick={onClose} className="text-gray-500">✕</button>
                        </div>

                        {/* Search & Sort */}
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                placeholder="Search your items..." 
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="flex-1 border rounded-md px-3 py-2 text-sm" 
                            />
                            <select 
                                value={sortBy}
                                onChange={handleSortChange}
                                className="border rounded-md px-2 py-2 text-sm"
                                aria-label="Sort by"
                            >
                                <option value="createdAt">Date Created</option>
                                <option value="name">Name</option>
                            </select>
                        </div>

                        {/* Loading State */}
                        {loadingItems && (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-sm text-gray-500">Loading menu items...</div>
                            </div>
                        )}

                        {/* Items List */}
                        {!loadingItems && (
                            <div className="space-y-2 mb-16 max-h-60 overflow-y-auto">
                                {filteredAndSortedItems.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">
                                            {searchQuery ? "No items found matching your search." : "No menu items found."}
                                        </p>
                                    </div>
                                ) : (
                                    filteredAndSortedItems.map((item) => (
                                        <div key={item.id} className={`flex items-center justify-between border rounded-md p-2 ${
                                            item.available ? 'bg-white' : 'bg-gray-50'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={item.image || item.imageUrl || "/cake.png"} 
                                                    alt={item.name} 
                                                    className="w-10 h-10 rounded object-cover" 
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium">{item.name}</p>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            item.available 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {item.available ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600">{item.description}</p>
                                                    <p className="text-xs font-semibold text-green-600">
                                                        ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                                    </p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => handleCheckboxChange(item.id)}
                                                aria-label={`Select ${item.name}`}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowCreateItem(true)}
                                className="bg-black text-white px-4 py-2 rounded-md"
                            >
                                Create
                            </button>
                            <button
                                onClick={handleAddSelected}
                                disabled={selectedIds.length === 0}
                                className={`px-4 py-2 rounded-md ${selectedIds.length === 0 ? "bg-gray-200 text-gray-500" : "bg-red-500 text-white"}`}
                            >
                                Add {selectedIds.length} Item(s)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateItem && (
                <CreateItemModal 
                    onBack={() => setShowCreateItem(false)} 
                    onCreate={handleAddItem}
                    eventId={eventId}
                />
            )}
        </>
    );
}

