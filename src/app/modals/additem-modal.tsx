"use client";
import { useState } from "react";
import CreateItemModal from "./createitem-modal";

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
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

    const handleAddItem = (item: Item) => {
        setItems((prev) => [...prev, { ...item, id: prev.length + 1 }]);
        setShowCreateItem(false);
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
            const selectedItems = items.filter((item) => selectedIds.includes(item.id));
            // Only add items that are not already in prev
            const newItems = selectedItems.filter(
                (item) => !prev.some((p) => p.id === item.id)
            );
            return [...prev, ...newItems];
        });
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
                            <input type="text" placeholder="Search your items..." className="flex-1 border rounded-md px-3 py-2 text-sm" />
                            <select className="border rounded-md px-2 py-2 text-sm">
                                <option>Date Created</option>
                                <option>Name</option>
                            </select>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 mb-16 max-h-60 overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border rounded-md p-2">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image || "/cake.png"} alt={item.name} className="w-10 h-10 rounded object-cover" />
                                        <p className="text-sm">{item.name}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleCheckboxChange(item.id)}
                                    />
                                </div>
                            ))}
                        </div>

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

