"use client"

import { useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"

import * as Popover from "@radix-ui/react-popover";
import { MoreVertical, Mail, Send, Download, FileText } from "lucide-react";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("prep")
    const [statusTab, setStatusTab] = useState("open")

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Nav */}
            <header className="border-b border-gray-200">
                <div className="flex items-center justify-between px-6 py-3">
                    
                    {/* Left Tabs (Prep | Packing) */}
                    <div className="flex space-x-6">
                        <button
                            onClick={() => setActiveTab("prep")}
                            className={`pb-1 text-sm font-medium border-b-2 transition ${
                                activeTab === "prep"
                                    ? "border-purple-600 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Prep
                        </button>
                        <button
                            onClick={() => setActiveTab("packing")}
                            className={`pb-1 text-sm font-medium border-b-2 transition ${
                                activeTab === "packing"
                                    ? "border-purple-600 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Packing
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 flex justify-center px-10">
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full rounded-full border border-gray-300 py-2 pl-9 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Three Dot Dropdown (using Popover) */}
                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100">
                                <MoreVertical className="h-5 w-5 text-gray-700" />
                            </button>
                        </Popover.Trigger>

                        <Popover.Portal>
                            <Popover.Content
                                align="end"
                                sideOffset={5}
                                className="w-48 rounded-md border border-gray-200 bg-white shadow-lg"
                            >
                                <div className="flex flex-col p-1">
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Mail size={16} /> Email customers
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Send size={16} /> Text customers
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Download size={16} /> Export orders
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <FileText size={16} /> Print preplist (PDF)
                                    </button>
                                </div>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                </div>
            </header>

            {/* Status Filters (depends on tab) */}
            <div className="px-6 py-4 flex items-center justify-between">
                {activeTab === "prep" ? (
                    <button className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-1">
                        <SlidersHorizontal size={14} className="text-gray-500" />
                        <span>Filter</span>
                    </button>
                ) : (
                    <>
                        {/* Left side: Open/Done + Filter */}
                        <div className="flex items-center space-x-4">
                            {/* Open/Done slider */}
                            <div className="relative flex w-60 rounded-full bg-gray-100 p-1">
                                <div
                                    className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-purple-600 transition-all duration-300 ${
                                        statusTab === "done" ? "left-1/2" : "left-1"
                                    }`}
                                />
                                <button
                                    onClick={() => setStatusTab("open")}
                                    className={`relative z-10 flex-1 text-sm font-medium transition ${
                                        statusTab === "open" ? "text-white" : "text-gray-600"
                                    }`}
                                >
                                    Open 0
                                </button>
                                <button
                                    onClick={() => setStatusTab("done")}
                                    className={`relative z-10 flex-1 text-sm font-medium transition ${
                                        statusTab === "done" ? "text-white" : "text-gray-600"
                                    }`}
                                >
                                    Done 0
                                </button>
                            </div>

                            {/* Filter Button */}
                            <button className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-1">
                                <SlidersHorizontal size={14} className="text-gray-500" />
                                <span>Filter</span>
                            </button>
                        </div>

                        {/* Right side: Sort + Ticket */}
                        <div className="flex items-center space-x-2">
                            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
                                Sort
                            </button>
                            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
                                Ticket
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Content */}
            <main className="flex-1 px-6 py-8">
                <div className="text-center text-gray-400 text-sm">
                    No items to display
                </div>
            </main>
        </div>
    )
}
