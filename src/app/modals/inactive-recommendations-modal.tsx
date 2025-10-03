"use client";
import React from "react";

export default function InactiveRecommendationsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />

      <aside className="ml-auto w-[640px] h-full bg-white shadow-xl overflow-auto">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-medium">Inactive Recommendations</h2>
            <button onClick={onClose} className="text-gray-500">✕</button>
          </div>

          <div className="mt-6">
            <div className="bg-white border rounded-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="px-6 py-3">Store</th>
                    <th className="px-6 py-3">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} className="px-6 py-6 text-gray-600">No results.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
