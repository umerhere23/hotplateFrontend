"use client";
import { useState } from "react";

export default function RecommendationModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd?: (username: string) => void }) {
  const [value, setValue] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white w-[520px] rounded-lg shadow-lg p-5 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">✕</button>
        <h2 className="text-lg font-semibold mb-2">Add a new recommendation</h2>
        <p className="text-sm text-gray-500 mb-4">Add the store you want to recommend on your storefront:</p>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <div className="px-3 text-gray-500">hotplate.com/</div>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 px-3 py-2 text-sm outline-none"
                placeholder="store"
                aria-label="chef username"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!value || value.trim() === "") return;
              onAdd?.(value.trim());
              setValue("");
              onClose();
            }}
            className="px-4 py-2 bg-gray-100 border rounded-md text-sm hover:bg-gray-200"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
