"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  CheckCircle, 
  Upload, 
  DollarSign, 
  Clock, 
  MapPin,
  Camera,
  Users,
  Settings
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    number: 1,
    title: "Complete Your Restaurant Profile",
    description: "Add your restaurant name, description, cuisine type, and contact information",
    icon: <Settings className="w-6 h-6" />,
    details: [
      "Upload your restaurant logo and cover photo",
      "Write a compelling restaurant description",
      "Set your cuisine type and dietary options",
      "Add your address and contact details"
    ]
  },
  {
    number: 2,
    title: "Set Up Your Menu",
    description: "Create menu categories and add your first items",
    icon: <Upload className="w-6 h-6" />,
    details: [
      "Create menu categories (e.g., Appetizers, Main Courses, Desserts)",
      "Add menu items with names, descriptions, and prices",
      "Upload high-quality photos for each item",
      "Set portion sizes and dietary restrictions"
    ]
  },
  {
    number: 3,
    title: "Configure Pricing & Fees",
    description: "Set up your pricing structure and any additional fees",
    icon: <DollarSign className="w-6 h-6" />,
    details: [
      "Review and adjust item prices",
      "Set up tax rates for your location",
      "Configure delivery fees (if applicable)",
      "Set minimum order amounts"
    ]
  },
  {
    number: 4,
    title: "Set Operating Hours",
    description: "Define when your restaurant is open for orders",
    icon: <Clock className="w-6 h-6" />,
    details: [
      "Set daily operating hours",
      "Configure pickup time windows",
      "Set preparation time estimates",
      "Handle holiday schedules"
    ]
  },
  {
    number: 5,
    title: "Configure Pickup Locations",
    description: "Set up where customers can collect their orders",
    icon: <MapPin className="w-6 h-6" />,
    details: [
      "Add pickup locations with addresses",
      "Set pickup instructions and notes",
      "Configure location-specific hours",
      "Add photos of pickup locations"
    ]
  },
  {
    number: 6,
    title: "Test Your Setup",
    description: "Place a test order to ensure everything works properly",
    icon: <CheckCircle className="w-6 h-6" />,
    details: [
      "Review your menu from a customer's perspective",
      "Test the ordering process",
      "Verify payment processing",
      "Check order notifications"
    ]
  }
]

const quickTips = [
  {
    title: "High-Quality Photos",
    description: "Use good lighting and appealing presentation for food photos",
    icon: <Camera className="w-5 h-5" />
  },
  {
    title: "Clear Descriptions",
    description: "Write detailed, appetizing descriptions for your menu items",
    icon: <Users className="w-5 h-5" />
  },
  {
    title: "Competitive Pricing",
    description: "Research local competitors to set competitive prices",
    icon: <DollarSign className="w-5 h-5" />
  }
]

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/help" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Getting Started with Hotplate</h1>
        <p className="text-gray-600">
          Follow this step-by-step guide to set up your restaurant and start accepting orders.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Setup Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Complete these steps to get your restaurant ready to receive orders:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.slice(0, 3).map((step) => (
              <div key={step.number} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-blue-600">{step.icon}</div>
                <div>
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500">Step {step.number}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Steps */}
      <div className="space-y-8">
        {steps.map((step) => (
          <Card key={step.number}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">{step.number}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-blue-600">{step.icon}</div>
                    <h2 className="text-xl font-semibold text-gray-900">{step.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button size="sm">
                      {step.number === 1 ? "Set Up Profile" : 
                       step.number === 2 ? "Add Menu Items" :
                       step.number === 3 ? "Configure Pricing" :
                       step.number === 4 ? "Set Hours" :
                       step.number === 5 ? "Add Locations" :
                       "Run Test Order"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Pro Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickTips.map((tip, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="text-yellow-600">{tip.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to launch?</h3>
        <p className="text-gray-600 mb-4">
          Once you've completed all the setup steps, you're ready to start accepting orders from customers!
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button>Go to Dashboard</Button>
          <Button variant="outline">View Live Menu</Button>
        </div>
      </div>
    </div>
  )
}
