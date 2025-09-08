"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  HelpCircle, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Phone, 
  Mail,
  Book,
  Settings,
  ShoppingBag,
  Users,
  CreditCard,
  Shield,
  Truck,
  Star,
  AlertTriangle,
  FileText
} from "lucide-react"

interface FAQItem {
  question: string
  answer: string
  category: string
}

interface HelpCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  articles: number
}

const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of using Hotplate",
    icon: <Book className="w-6 h-6" />,
    articles: 8
  },
  {
    id: "orders",
    title: "Orders & Menu Management",
    description: "Managing your orders and menu items",
    icon: <ShoppingBag className="w-6 h-6" />,
    articles: 12
  },
  {
    id: "customers",
    title: "Customer Management",
    description: "Handle customer relationships and data",
    icon: <Users className="w-6 h-6" />,
    articles: 6
  },
  {
    id: "payments",
    title: "Payments & Billing",
    description: "Payment processing and billing information",
    icon: <CreditCard className="w-6 h-6" />,
    articles: 10
  },
  {
    id: "delivery",
    title: "Delivery & Pickup",
    description: "Manage delivery and pickup options",
    icon: <Truck className="w-6 h-6" />,
    articles: 5
  },
  {
    id: "account",
    title: "Account & Settings",
    description: "Manage your account and preferences",
    icon: <Settings className="w-6 h-6" />,
    articles: 7
  },
  {
    id: "security",
    title: "Security & Privacy",
    description: "Keep your account safe and secure",
    icon: <Shield className="w-6 h-6" />,
    articles: 4
  }
]

// Popular help articles
const popularArticles = [
  {
    title: "Getting Started Guide",
    description: "Complete setup walkthrough for new restaurants",
    link: "/help/getting-started",
    category: "Getting Started"
  },
  {
    title: "Frequently Asked Questions",
    description: "Quick answers to the most common questions",
    link: "/help/faq",
    category: "FAQ"
  },
  {
    title: "Common Issues & Solutions",
    description: "Troubleshoot the most frequent problems",
    link: "/help/troubleshooting",
    category: "Troubleshooting"
  },
  {
    title: "Setting up Menu Items",
    description: "How to create and manage your menu",
    link: "/help/menu-setup",
    category: "Orders"
  }
]

const faqItems: FAQItem[] = [
  {
    question: "How do I add a new menu item?",
    answer: "To add a new menu item, go to your Dashboard, click on 'Add Item', fill in the item details including name, price, description, and upload an image. Then click 'Save' to add it to your menu.",
    category: "orders"
  },
  {
    question: "How do I process refunds?",
    answer: "You can process refunds from the Orders page. Find the specific order, click on it, and select 'Issue Refund'. The refund will be processed within 3-5 business days.",
    category: "payments"
  },
  {
    question: "Can I customize my pickup windows?",
    answer: "Yes! Go to Settings and select 'Pickup Windows'. You can add, edit, or remove pickup time slots based on your availability.",
    category: "delivery"
  },
  {
    question: "How do I update my restaurant information?",
    answer: "Navigate to Settings > Restaurant Profile to update your restaurant name, description, contact information, and operating hours.",
    category: "account"
  },
  {
    question: "What payment methods are supported?",
    answer: "We support all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like Apple Pay and Google Pay.",
    category: "payments"
  },
  {
    question: "How do I handle customer complaints?",
    answer: "Customer messages appear in your Inbox. Respond promptly and professionally. For order issues, you can offer refunds or discounts directly through the platform.",
    category: "customers"
  },
  {
    question: "Is my data secure on Hotplate?",
    answer: "Yes, we use industry-standard encryption and security measures to protect your data. All payment information is processed through secure, PCI-compliant systems.",
    category: "security"
  },
  {
    question: "How do I set up my first menu?",
    answer: "After signing up, you'll be guided through the setup process. Add your restaurant details, upload a logo, create menu categories, and add your first few items with photos and descriptions.",
    category: "getting-started"
  }
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-xl text-gray-600 mb-8">
          Find answers to your questions and learn how to make the most of Hotplate
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 text-lg"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Get instant help from our support team</p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Send us a detailed message</p>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Call us at (555) 123-4567</p>
            <Button variant="outline" className="w-full">Call Now</Button>
          </CardContent>
        </Card>

        <Link href="/help/troubleshooting">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Troubleshooting</h3>
              <p className="text-gray-600 mb-4">Find solutions to common issues</p>
              <Button variant="outline" className="w-full">Get Help</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Help Categories */}
      {!searchQuery && (
        <>
          {/* Popular Articles */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularArticles.map((article, index) => (
                <Link key={index} href={article.link}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{article.description}</p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {article.category}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category) => (
                <Link 
                  key={category.id}
                  href={category.id === 'getting-started' ? '/help/getting-started' : '#'}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-blue-600">{category.icon}</div>
                          <div>
                            <h3 className="font-semibold text-lg">{category.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                            <p className="text-gray-400 text-xs mt-2">{category.articles} articles</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Category Filter */}
      {selectedCategory && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600"
            >
              ← All Categories
            </Button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {helpCategories.find(cat => cat.id === selectedCategory)?.title}
          </h2>
        </div>
      )}

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Frequently Asked Questions'}
        </h2>
        
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or browse our categories above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">{faq.question}</h3>
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedFAQ === index ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6 pt-2">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Our support team is available 24/7 to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </Button>
            <Link href="/feedback">
              <Button variant="outline" className="inline-flex items-center gap-2">
                <Star className="w-4 h-4" />
                Leave Feedback
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
