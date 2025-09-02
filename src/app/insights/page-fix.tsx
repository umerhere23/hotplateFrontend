import type React from "react"
import { Calendar, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconForNav } from "@/components/ui/icons-fix"

export default function OrderPage() {
  return (
    <div className="flex min-h-screen bg-[#f6f6f6]">
      {/* Sidebar */}
      <div className="w-[160px] bg-white border-r border-[#e1e1e1] flex flex-col">
        <div className="h-16 bg-[#ec711e] flex items-center justify-center">
          <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={40} height={40} className="text-white" />
        </div>

        <nav className="flex flex-col flex-1 p-2 space-y-1">
          <NavItem href="/dashboard" icon="layout-dashboard" active>
            Dashboard
          </NavItem>
          <NavItem href="/store" icon="store">
            Store
          </NavItem>
          <NavItem href="/orders" icon="clipboard-list">
            Orders
          </NavItem>
          <NavItem href="/inbox" icon="inbox">
            Inbox
          </NavItem>
          <NavItem href="/insights" icon="bar-chart">
            Insights
          </NavItem>
          <NavItem href="/customers" icon="users">
            Customers
          </NavItem>
          <NavItem href="/payout" icon="credit-card">
            Payout
          </NavItem>

          <div className="flex-1"></div>

          <NavItem href="/settings" icon="settings">
            Settings
          </NavItem>
          <NavItem href="/logout" icon="log-out">
            Logout
          </NavItem>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="p-6 bg-white border-b border-[#e1e1e1]">
          <h1 className="text-2xl font-bold text-[#000000]">Dashboard</h1>
        </header>

        <div className="p-6">
          <Tabs defaultValue="events">
            <TabsList className="bg-white mb-6">
              <TabsTrigger value="overview" className="data-[state=inactive]:text-[#707070]">
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:text-[#ec711e] data-[state=active]:border-b-2 data-[state=active]:border-[#ec711e]"
              >
                Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="bg-white p-6 rounded-md border border-[#e1e1e1]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Breakdown for events that opened during the date range.</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last 4 weeks
                </Button>
              </div>

              <div className="relative mb-8 w-[400px]">
                <select className="w-full p-2 border border-[#d9d9d9] rounded-md bg-white appearance-none pl-4 pr-10">
                  <option>Select an event</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-[#707070]" />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <MetricCard title="Revenue" value="$0.00" />
                <MetricCard title="Orders" value="0" valueColor="#ec711e" />
                <MetricCard title="Event Visitor" value="0" />
                <MetricCard title="Tips" value="$0.00" />
                <MetricCard title="Average Subtotal" value="$0.00" />
                <MetricCard title="Average Tips" value="$0.00" />
                <MetricCard title="Taxes" value="$0.00" />
              </div>
            </TabsContent>

            <TabsContent value="overview">
              <div className="bg-white p-6 rounded-md border border-[#e1e1e1]">
                <h2 className="text-lg font-medium mb-4">Overview Content</h2>
                <p className="text-[#707070]">This is the overview tab content.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  active = false,
  children,
}: {
  href: string
  icon: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
        active ? "bg-[#fff5f0] text-[#ec711e] font-medium" : "text-[#707070] hover:bg-[#f2f2f2]"
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        <IconForNav name={icon} />
      </span>
      <span>{children}</span>
    </Link>
  )
}

function MetricCard({
  title,
  value,
  valueColor = "#000000",
}: {
  title: string
  value: string
  valueColor?: string
}) {
  return (
    <Card className="p-4 border border-[#e1e1e1]">
      <div className="text-sm text-[#707070] mb-2">{title}</div>
      <div className="text-2xl font-semibold" style={{ color: valueColor }}>
        {value}
      </div>
    </Card>
  )
}
