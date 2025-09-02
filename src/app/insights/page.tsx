"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const overviewData = [
  { name: "Week 1", value: 10 },
  { name: "Week 2", value: 30 },
  { name: "Week 3", value: 50 },
  { name: "Week 4", value: 20 },
]

const eventsData = [
  { name: "Week 1", value: 2 },
  { name: "Week 2", value: 5 },
  { name: "Week 3", value: 3 },
  { name: "Week 4", value: 8 },
]

const subscribersData = [
  { name: "Week 1", value: 0 },
  { name: "Week 2", value: 1 },
  { name: "Week 3", value: 4 },
  { name: "Week 4", value: 6 },
]

const recommendationsData = [
  { name: "Week 1", value: 7 },
  { name: "Week 2", value: 12 },
  { name: "Week 3", value: 18 },
  { name: "Week 4", value: 9 },
]

function ChartCard({ title, value, data }: { title: string; value: string; data: any[] }) {
  return (
    <Card className="border border-gray-300">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <p className="text-lg font-semibold">{value}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={data}>
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#000"
              fill="#8884d8"
              strokeWidth={2}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default function Insights() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Insights</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 border-b border-gray-300 w-full justify-start">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black 
                       rounded-none px-4 py-2 text-gray-600 data-[state=active]:text-black"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black 
                       rounded-none px-4 py-2 text-gray-600 data-[state=active]:text-black"
          >
            Events
          </TabsTrigger>
          <TabsTrigger
            value="subscribers"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black 
                       rounded-none px-4 py-2 text-gray-600 data-[state=active]:text-black"
          >
            Subscribers
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black 
                       rounded-none px-4 py-2 text-gray-600 data-[state=active]:text-black"
          >
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <ChartCard title="Revenue" value="$1200" data={overviewData} />
            <ChartCard title="Orders" value="23" data={overviewData} />
            <ChartCard title="Items Sold" value="110" data={overviewData} />
            <ChartCard title="Storefront visitors" value="110" data={overviewData} />
            <ChartCard title="Tips" value="110" data={overviewData} />
            <ChartCard title="Average subtotal" value="110" data={overviewData} />
            <ChartCard title="Average tip" value="110" data={overviewData} />
            <ChartCard title="Taxes" value="110" data={overviewData} />
          </div>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <ChartCard title="Total Events" value="8" data={eventsData} />
            <ChartCard title="Active Events" value="3" data={eventsData} />
            <ChartCard title="Past Events" value="5" data={eventsData} />
          </div>
        </TabsContent>

        {/* Subscribers */}
        <TabsContent value="subscribers">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <ChartCard title="Subscribers" value="550" data={subscribersData} />
            <ChartCard title="New This Month" value="25" data={subscribersData} />
            <ChartCard title="Churned" value="5" data={subscribersData} />
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <ChartCard title="Recommendations Sent" value="40" data={recommendationsData} />
            <ChartCard title="Accepted" value="12" data={recommendationsData} />
            <ChartCard title="Rejected" value="5" data={recommendationsData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
