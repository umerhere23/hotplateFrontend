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
    <div className="w-56 border-r border-gray-200 flex flex-col h-screen sticky top-0 bg-white shadow-sm">
      {/* Logo / Brand */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500 text-white font-bold shadow">HP</div>
        <div>
          <h2 className="text-sm font-semibold">Hotplate</h2>
          <div className="text-xs text-gray-500">Chef dashboard</div>
        </div>
      </div>

      {/* Unified nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
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
      <div className="p-3 border-t border-gray-100 space-y-2">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700 text-sm w-full"
          aria-label="Collapse sidebar"
          title="Collapse"
        >
          <ChevronLeft size={14} /> <span>Collapse</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-sm w-full justify-center border border-red-100"
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
    <Link href={href} className={`group block`}>
      <div
        className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors duration-150
        ${active ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
      >
        {/* left indicator */}
        <span className={`w-1.5 h-8 rounded-r-md ${active ? 'bg-orange-700' : 'bg-transparent'}`} />

        {/* icon + label */}
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${active ? 'bg-orange-600 text-white' : 'text-gray-600'}`}>
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>

        {/* badge */}
        {badge && (
          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs rounded-full ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
            {badge}
          </span>
        )}
      </div>
    </Link>
  )
}
