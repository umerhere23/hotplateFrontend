"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Search } from "lucide-react";
import ChatModal from "../modals/chatSearch-modal";

export default function Conversations() {
  const [tab, setTab] = useState("all");
  const [showChatModal, setShowChatModal] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-[380px] border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <button className="text-sm text-gray-400 hover:text-black" onClick={() => setShowChatModal(true)}>✏️</button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="outline-none text-sm flex-1"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs.Root
          value={tab}
          onValueChange={setTab}
          className="flex flex-col flex-1"
        >
          {/* Tab headers */}
          <Tabs.List className="flex space-x-6 border-b border-gray-200 px-3">
            <Tabs.Trigger
              value="all"
              className={`py-2 text-sm font-medium ${
                tab === "all"
                  ? "border-b-2 border-gray-400 text-black"
                  : "text-gray-400"
              }`}
            >
              All
            </Tabs.Trigger>
            <Tabs.Trigger
              value="unread"
              className={`py-2 text-sm font-medium ${
                tab === "unread"
                  ? "border-b-2 border-gray-400 text-black"
                  : "text-gray-400"
              }`}
            >
              Unread
            </Tabs.Trigger>
            <Tabs.Trigger
              value="archived"
              className={`py-2 text-sm font-medium ${
                tab === "archived"
                  ? "border-b-2 border-gray-400 text-black"
                  : "text-gray-400"
              }`}
            >
              Archived
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab contents */}
          <Tabs.Content
            value="all"
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-gray-400">Your inbox is clear, great job! 🎉</p>
              <button className="mt-3 px-4 py-2 bg-black text-white rounded-md" onClick={() => setShowChatModal(true)}>
                Send a new message
              </button>
            </div>
          </Tabs.Content>

          <Tabs.Content
            value="unread"
            className="flex-1 flex items-center justify-center"
          >
            <p className="text-gray-400">No unread messages 🎯</p>
          </Tabs.Content>

          <Tabs.Content
            value="archived"
            className="flex-1 flex items-center justify-center"
          >
            <p className="text-gray-400">No archived conversations 📦</p>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation to begin
      </div>
       <ChatModal open={showChatModal} onClose={() => setShowChatModal(false)} />
    </div>
  );
}
