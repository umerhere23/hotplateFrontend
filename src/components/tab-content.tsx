"use client"

import type React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type Tab = {
  label: string
  value: string
}

type TabContentProps = {
  tabs: Tab[]
  defaultTab?: string
  children: React.ReactNode
}

export function TabContent({ tabs, defaultTab, children }: TabContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || defaultTab || tabs[0].value

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <TabItem
            key={tab.value}
            label={tab.label}
            active={currentTab === tab.value}
            onClick={() => handleTabChange(tab.value)}
          />
        ))}
      </div>
      <div className="py-6">{children}</div>
    </div>
  )
}

function TabItem({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium cursor-pointer ${
        active ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {label}
    </button>
  )
}
