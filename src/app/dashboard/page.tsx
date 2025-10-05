"use client"

import { useSearchParams } from "next/navigation"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { useSelector } from "react-redux"
import { TabContent } from "@/components/tab-content"
import { ThemeSwitcher } from "@/components/theme-switcher"

// Tab content components
import EventsTab from "./tabs/events-tab"
import StorefrontTab from "./tabs/storefront-tab"
import DiscountsTab from "./tabs/discounts-tab"
import RecommendationsTab from "./tabs/recommendations-tab"
import Products from "./tabs/products"

const tabs = [
  { label: "Events", value: "events" },
  { label: "Products", value: "Products" },
  { label: "Storefront", value: "storefront" },
  { label: "Recommendations", value: "recommendations" },
  { label: "Discounts", value: "discounts" },
]

export default function Dashboard() {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "events"
  const username = useSelector((state: any) => state?.user?.currentUser?.business?.username || state?.user?.currentUser?.username || (typeof window !== 'undefined' ? localStorage.getItem('username') : null))

  return (
    <div>
      {/* Header */}
      <header className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Store</h1>
            <ExternalLink size={16} className="ml-2 text-gray-500" />
          </div>
          <div>
            <Link href={`/${username || ''}`} className="px-3 py-2 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-white">
              Go to my storefront
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <TabContent tabs={tabs} defaultTab="events">
          {currentTab === "events" && <EventsTab />}
          {currentTab === "Products" && <Products />}
          {currentTab === "storefront" && <StorefrontTab />}
          {currentTab === "recommendations" && <RecommendationsTab />}
          {currentTab === "discounts" && <DiscountsTab />}
        </TabContent>
      </header>
    </div>
  )
}
