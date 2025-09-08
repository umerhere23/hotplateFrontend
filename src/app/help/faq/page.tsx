"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageSquare
} from "lucide-react"
import Link from "next/link"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "How do I get started with Hotplate?",
    answer: "Getting started is easy! First, complete your restaurant profile by adding your name, description, and photos. Then, set up your menu by creating categories and adding items with prices and images. Configure your operating hours and pickup locations, and you're ready to start receiving orders!",
    category: "Getting Started",
    tags: ["setup", "profile", "menu", "beginner"]
  },
  {
    id: "2",
    question: "How much does Hotplate cost?",
    answer: "Hotplate charges a competitive commission rate on each order. There are no setup fees, monthly fees, or hidden costs. You only pay when you make sales. Contact our sales team for detailed pricing information specific to your restaurant size and needs.",
    category: "Pricing",
    tags: ["cost", "commission", "fees", "pricing"]
  },
  {
    id: "3",
    question: "How do I add or edit menu items?",
    answer: "To manage your menu, go to your Dashboard and click on 'Add Item' or click on an existing item to edit it. You can update the name, description, price, add photos, set availability, and organize items into categories. Changes are reflected immediately on your live menu.",
    category: "Menu Management",
    tags: ["menu", "items", "edit", "add", "photos"]
  },
  {
    id: "4",
    question: "When and how do I get paid?",
    answer: "Payments are processed automatically and deposited to your linked bank account. You'll typically receive payments within 2-3 business days after an order is completed. You can track all your earnings and payment history in the Payout section of your dashboard.",
    category: "Payments",
    tags: ["payout", "payment", "earnings", "bank"]
  },
  {
    id: "5",
    question: "How do customers place orders?",
    answer: "Customers can find your restaurant through the Hotplate app or website, browse your menu, add items to their cart, and place orders for pickup. They can pay online and receive notifications about order status and pickup instructions.",
    category: "Orders",
    tags: ["customers", "ordering", "pickup", "process"]
  },
  {
    id: "6",
    question: "Can I set my own pickup times and locations?",
    answer: "Yes! You have full control over your pickup windows and locations. You can set specific time slots when orders are available for pickup, add multiple pickup locations, and customize instructions for each location. This helps you manage your preparation time and customer flow.",
    category: "Pickup",
    tags: ["pickup", "times", "locations", "windows", "schedule"]
  },
  {
    id: "7",
    question: "What if a customer doesn't show up for pickup?",
    answer: "If a customer doesn't arrive during their scheduled pickup window, you can mark the order as 'No Show' in your dashboard. Depending on your policy, you may offer to reschedule or process a refund. We recommend setting clear pickup policies and communicating them to customers.",
    category: "Orders",
    tags: ["no-show", "pickup", "policy", "refund"]
  },
  {
    id: "8",
    question: "How do I handle refunds and cancellations?",
    answer: "You can process refunds directly from the Orders page. Find the specific order, click on it, and select 'Issue Refund'. Full refunds are typically processed within 3-5 business days. You can also set your own cancellation policy and timeframes.",
    category: "Payments",
    tags: ["refund", "cancellation", "policy", "process"]
  },
  {
    id: "9",
    question: "Can I customize my restaurant's appearance?",
    answer: "Yes! You can upload your logo, cover photos, customize your restaurant description, and showcase your best dishes. High-quality photos and detailed descriptions help attract more customers and increase orders.",
    category: "Profile",
    tags: ["customization", "photos", "logo", "appearance", "branding"]
  },
  {
    id: "10",
    question: "How do I communicate with customers?",
    answer: "Customer messages and inquiries appear in your Inbox. You can respond to questions, provide updates about orders, and handle any issues directly through the platform. Quick, friendly communication helps build customer relationships.",
    category: "Customer Service",
    tags: ["communication", "inbox", "messages", "customer service"]
  },
  {
    id: "11",
    question: "What payment methods do customers use?",
    answer: "Customers can pay using all major credit cards (Visa, MasterCard, American Express), debit cards, and popular digital wallets like Apple Pay and Google Pay. All transactions are processed securely through our payment partners.",
    category: "Payments",
    tags: ["payment methods", "credit cards", "digital wallet", "security"]
  },
  {
    id: "12",
    question: "How do I track my sales and analytics?",
    answer: "The Insights section of your dashboard provides detailed analytics including sales reports, popular items, peak ordering times, customer data, and revenue trends. Use these insights to optimize your menu and business operations.",
    category: "Analytics",
    tags: ["analytics", "sales", "insights", "reports", "data"]
  },
  {
    id: "13",
    question: "Can I temporarily close my restaurant or pause orders?",
    answer: "Yes, you can easily toggle your restaurant status between 'Open' and 'Closed' from your dashboard. When closed, customers won't be able to place new orders, but you can still manage existing orders and update your menu.",
    category: "Operations",
    tags: ["close", "pause", "status", "operations", "toggle"]
  },
  {
    id: "14",
    question: "How do I set up delivery instead of just pickup?",
    answer: "Currently, Hotplate focuses on pickup orders to help restaurants manage logistics efficiently. However, we're exploring delivery options for the future. You can set multiple pickup locations to make it convenient for customers to collect their orders.",
    category: "Delivery",
    tags: ["delivery", "pickup", "logistics", "locations"]
  },
  {
    id: "15",
    question: "What support is available if I need help?",
    answer: "We offer multiple support channels: live chat for immediate assistance, email support for detailed queries, phone support for urgent issues, and a comprehensive help center with guides and troubleshooting. Our team is available 24/7 to help you succeed.",
    category: "Support",
    tags: ["support", "help", "chat", "email", "phone", "assistance"]
  }
]

const categories = Array.from(new Set(faqData.map(item => item.category)))

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/help" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-600">
          Find answers to the most common questions about using Hotplate for your restaurant.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Questions ({faqData.length})
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category} ({faqData.filter(item => item.category === category).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {(searchQuery || selectedCategory) && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} 
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or browse different categories.
              </p>
              <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                Show All Questions
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{faq.question}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                        <div className="flex gap-1">
                          {faq.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {expandedItems.has(faq.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
                
                {expandedItems.has(faq.id) && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Still Need Help */}
      <div className="mt-16 p-6 bg-blue-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">
          Can't find what you're looking for? Our support team is here to help!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contact Support
          </Button>
          <Link href="/help/troubleshooting">
            <Button variant="outline">
              View Troubleshooting Guide
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
