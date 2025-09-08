"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Wifi,
  CreditCard,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

interface TroubleshootingItem {
  id: string
  problem: string
  category: string
  severity: 'high' | 'medium' | 'low'
  symptoms: string[]
  solutions: string[]
  icon: React.ReactNode
}

const troubleshootingItems: TroubleshootingItem[] = [
  {
    id: "orders-not-received",
    problem: "Orders not being received",
    category: "orders",
    severity: "high",
    symptoms: [
      "No order notifications",
      "Empty orders list despite customer reports",
      "Missing order confirmation emails"
    ],
    solutions: [
      "Check your internet connection and refresh the page",
      "Verify your notification settings in Settings > Notifications",
      "Ensure your restaurant is marked as 'Open' in the dashboard",
      "Check if you have any active pickup windows configured",
      "Contact support if the issue persists"
    ],
    icon: <XCircle className="w-5 h-5 text-red-600" />
  },
  {
    id: "payment-issues",
    problem: "Payment processing failures",
    category: "payments",
    severity: "high",
    symptoms: [
      "Customers reporting failed payments",
      "Orders showing as unpaid",
      "Payment error messages"
    ],
    solutions: [
      "Check your payment processor connection in Settings > Payments",
      "Verify your bank account details are correct",
      "Ensure your payment processing account is active",
      "Check for any outstanding verification requirements",
      "Review transaction limits and daily caps"
    ],
    icon: <CreditCard className="w-5 h-5 text-red-600" />
  },
  {
    id: "menu-not-updating",
    problem: "Menu changes not appearing",
    category: "menu",
    severity: "medium",
    symptoms: [
      "Updated prices not showing",
      "New items not visible to customers",
      "Old menu items still appearing"
    ],
    solutions: [
      "Clear your browser cache and reload the page",
      "Check if changes were properly saved (look for save confirmation)",
      "Verify items are set to 'Available' status",
      "Try logging out and logging back in",
      "Wait a few minutes for changes to propagate"
    ],
    icon: <RefreshCw className="w-5 h-5 text-orange-600" />
  },
  {
    id: "slow-loading",
    problem: "Dashboard loading slowly",
    category: "performance",
    severity: "low",
    symptoms: [
      "Long page load times",
      "Spinning loading indicators",
      "Delayed response to clicks"
    ],
    solutions: [
      "Check your internet connection speed",
      "Close unnecessary browser tabs",
      "Clear browser cache and cookies",
      "Try using a different browser",
      "Restart your browser or device"
    ],
    icon: <Wifi className="w-5 h-5 text-yellow-600" />
  },
  {
    id: "notification-issues",
    problem: "Not receiving notifications",
    category: "notifications",
    severity: "medium",
    symptoms: [
      "Missing order alerts",
      "No email notifications",
      "Push notifications not working"
    ],
    solutions: [
      "Check browser notification permissions",
      "Verify notification settings in your account",
      "Check spam/junk folder for emails",
      "Ensure push notifications are enabled in browser",
      "Update your contact information"
    ],
    icon: <Bell className="w-5 h-5 text-orange-600" />
  },
  {
    id: "login-problems",
    problem: "Cannot login to account",
    category: "account",
    severity: "high",
    symptoms: [
      "Invalid login credentials error",
      "Password reset not working",
      "Account locked message"
    ],
    solutions: [
      "Double-check your email and password",
      "Use the 'Forgot Password' link to reset",
      "Clear browser cookies for the site",
      "Try logging in from an incognito/private window",
      "Contact support for account unlock"
    ],
    icon: <Settings className="w-5 h-5 text-red-600" />
  }
]

const categories = [
  { id: "all", name: "All Issues", count: troubleshootingItems.length },
  { id: "orders", name: "Orders", count: troubleshootingItems.filter(item => item.category === "orders").length },
  { id: "payments", name: "Payments", count: troubleshootingItems.filter(item => item.category === "payments").length },
  { id: "menu", name: "Menu", count: troubleshootingItems.filter(item => item.category === "menu").length },
  { id: "notifications", name: "Notifications", count: troubleshootingItems.filter(item => item.category === "notifications").length },
  { id: "account", name: "Account", count: troubleshootingItems.filter(item => item.category === "account").length },
  { id: "performance", name: "Performance", count: troubleshootingItems.filter(item => item.category === "performance").length }
]

export default function TroubleshootingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const filteredItems = troubleshootingItems.filter(item => {
    const matchesSearch = item.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.symptoms.some(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/help" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Troubleshooting Guide</h1>
        <p className="text-gray-600">
          Find solutions to common problems and get your restaurant running smoothly.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <Card className="mb-8 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Critical Issue?</h3>
              <p className="text-red-700 text-sm">
                If you're experiencing a critical issue affecting orders, contact our emergency support line immediately.
              </p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white ml-auto">
              Emergency Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No issues found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or browse different categories.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{item.problem}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(item.severity)}`}>
                            {item.severity.toUpperCase()} PRIORITY
                          </span>
                          <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                        </div>
                      </div>
                    </div>
                    {expandedItems.has(item.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {expandedItems.has(item.id) && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          Symptoms
                        </h4>
                        <ul className="space-y-1">
                          {item.symptoms.map((symptom, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Solutions
                        </h4>
                        <ol className="space-y-2">
                          {item.solutions.map((solution, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </span>
                              {solution}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Still Need Help */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Still experiencing issues?</h3>
        <p className="text-gray-600 mb-6">
          Our support team is here to help you resolve any problems quickly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button>Contact Support</Button>
          <Button variant="outline">Report a Bug</Button>
        </div>
      </div>
    </div>
  )
}
