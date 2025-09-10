"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
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

const navItems: SidebarItem[] = [
  { icon: <ShoppingBag size={18} />, label: "Store", href: "/dashboard" },
  { icon: <BarChart3 size={18} />, label: "Orders", href: "/orders" },
  { icon: <Mail size={18} />, label: "Inbox", href: "/inbox" },
  { icon: <BarChart3 size={18} />, label: "Insights", href: "/insights" },
  { icon: <Users size={18} />, label: "Customers", href: "/customers" },
  { icon: <Wallet size={18} />, label: "Payout", href: "/payout" },
  { icon: <Settings size={18} />, label: "Settings", href: "/settings" },
  { icon: <Users2 size={18} />, label: "Refer a chef", href: "/refer" },
  { icon: <BarChart3 size={18} />, label: "What's new", href: "/whats-new", badge: 2 },
  { icon: <Users size={18} />, label: "Community", href: "/community" },
  { icon: <MessageSquare size={18} />, label: "Feedback", href: "/feedback" },
  { icon: <HelpCircle size={18} />, label: "Help Center", href: "/help" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  // Lazy import hooks to avoid circulars
  const clearReduxUser = () => {
    try {
      // Dynamically import to avoid SSR issues
  const userMod = require("@/store/userSlice")
  const authMod = require("@/store/authSlice")
  const storeMod = require("@/store")
  const dispatch = storeMod.store.dispatch
  dispatch(userMod.clearUser())
  dispatch(authMod.clearAuth())
    } catch {}
  }

  const handleLogout = () => {
    try {
      // Clear local storage auth and user artifacts
      localStorage.removeItem("authToken")
      localStorage.removeItem("userId")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userPhone")
    } catch {}
  clearReduxUser()
    router.push("/login")
  }

  return (
    <div className="w-[160px] border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-bold">Hotplate</h2>
      </div>

      {/* Unified nav */}
      <nav className="flex-1 flex flex-col">
        {navItems.map((item) => (
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

      {/* Bottom actions */}
      <div className="p-2 border-t border-gray-200 space-y-2">
        <button
          className="flex items-center gap-1 px-2 py-2 rounded-md hover:bg-gray-100 text-gray-600 text-xs w-full justify-center"
          aria-label="Collapse sidebar"
          title="Collapse"
        >
          <ChevronLeft size={14} /> Collapse
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-2 py-2 rounded-md hover:bg-red-50 text-red-600 text-xs w-full justify-center border border-red-200"
          aria-label="Log out"
          title="Log out"
        >
          Log out
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
      className={`flex items-center gap-2 justify-start px-3 text-xs flex-1 
      ${
        active
          ? "text-white bg-[var(--primary-color,#1A1625)] hover:bg-[var(--primary-color-hover,#2a2435)] rounded-lg"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }
      ${label === "Payout" ? "border-b border-gray-200" : ""}`}
    >
      <div className="relative flex items-center">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span>{label}</span>
    </Link>
  )
}
