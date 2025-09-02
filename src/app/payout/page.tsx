"use client";
import { useState } from "react";
import { Download } from "lucide-react";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* ===== Top Balance Summary ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-gray-500">Total balance</p>
            <p className="text-[20px] font-semibold">$0.00</p>
          </div>
          <div className="pl-8 border-l border-gray-300">
            <p className="text-sm text-gray-500">Processing</p>
            <p className="text-lg font-semibold">$0.00</p>
          </div>
          <div className=" border-gray-300">
            <p className="text-sm text-gray-500">Ready to withdraw</p>
            <p className="text-lg font-semibold">$0.00</p>
          </div>
        </div>

        {/* Set up payouts button */}
        <button className="px-4 py-2 bg-black text-white rounded-md">
          Set up payouts
        </button>
      </div>

      {/* ===== Transaction History Section ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4 gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Press ↵ Enter to search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md border border-gray-200 bg-gray-100 text-sm focus:outline-none"
          />

          {/* Date Filter */}
          <button className="px-4 py-2 bg-gray-200 text-sm rounded-md">
            Date Filter
          </button>

          {/* Export */}
          <button className="flex items-center gap-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm">
            Export <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="border-b border-gray-200 text-gray-700">
              <tr>
                <th className="py-2 px-3">NAME</th>
                <th className="py-2 px-3">DATE</th>
                <th className="py-2 px-3">ORDER #</th>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">SUBTOTAL</th>
                <th className="py-2 px-3">TIP</th>
                <th className="py-2 px-3">REVENUE</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty State */}
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-2 mt-4 text-sm">
          <button className="px-3 py-1 border rounded-md text-gray-500">
            Previous
          </button>
          <button className="px-3 py-1 border rounded-md text-gray-500">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
