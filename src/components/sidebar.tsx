"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ShoppingBag,
  Mail,
  Users,
  Wallet,
  Settings,
  ChevronLeft,
  HelpCircle,
  MessageSquare,
  Users2,
} from "lucide-react"

type SidebarItem = {
  icon: React.ReactNode
  label: string
  href: string
  badge?: number
}

const mainNavItems: SidebarItem[] = [
  { icon: <ShoppingBag size={20} />, label: "Store", href: "/dashboard" },
  { icon: <BarChart3 size={20} />, label: "Orders", href: "/orders" },
  { icon: <Mail size={20} />, label: "Inbox", href: "/inbox" },
  { icon: <BarChart3 size={20} />, label: "Insights", href: "/insights" },
  { icon: <Users size={20} />, label: "Customers", href: "/customers" },
  { icon: <Wallet size={20} />, label: "Payout", href: "/payout" },
]

const bottomNavItems: SidebarItem[] = [
  { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  { icon: <Users2 size={20} />, label: "Refer a chef", href: "/refer" },
  { icon: <BarChart3 size={20} />, label: "What's new", href: "/whats-new", badge: 2 },
  { icon: <Users size={20} />, label: "Community", href: "/community" },
  { icon: <MessageSquare size={20} />, label: "Feedback", href: "/feedback" },
  { icon: <HelpCircle size={20} />, label: "Help Center", href: "/help" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[100px] border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        {/* <Image src="/placeholder-j1i2e.png" alt="Hotplate Logo" width={50} height={30} className="mx-auto" /> */}
     <h2 className="text-lg p-1 font-semibold">Hotplate</h2>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1">
        {mainNavItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            badge={item.badge}
            active={pathname === item.href}
          />
        ))}
      </nav>

      <div className="mt-auto py-4 flex flex-col gap-1">
        {bottomNavItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            badge={item.badge}
            active={pathname === item.href}
          />
        ))}
      </div>

      <div className="p-4 flex justify-center">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} />
        </button>
      </div>
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  href,
  active = false,
  badge,
}: {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
  badge?: number
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-3 text-xs rounded-md transition-colors
        ${
          active
            ? "text-white bg-[var(--primary-color,#1A1625)] hover:bg-[var(--primary-color-hover,#2a2435)]"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="mt-1">{label}</span>
    </Link>
  )
}
