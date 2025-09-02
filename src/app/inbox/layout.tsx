import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </ThemeProvider>
  )
}
