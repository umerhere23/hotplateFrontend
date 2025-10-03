"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Download, MoreVertical, User, Award, ChevronDown, ChevronUp } from "lucide-react";


export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState("customers");
  const [openIndex, setOpenIndex] = useState(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sections = [
    {
      title: "For your approval",
      desc: "These reviews will only appear on your storefront if you choose to publish them",
      content: "You have no pending reviews.",
    },
    {
      title: "Featured",
      desc: "These are your all-star reviews, feature reviews for them to always show up first when customers visit your storefront",
      content: "You have not featured any reviews.",
      counter: "0/3",
    },
    {
      title: "Published",
      desc: "All reviews currently visible on your storefront",
      content: "You have no other reviews visible on your storefront.",
      counter: "0",
    },
  ];

  const stats = [
    { title: "Total customers", value: String(customers.length || 0) },
    { title: "Subscribed to SMS", value: "-" },
    { title: "New in the last 30 days", value: "-" },
    { title: "Loyalty points", value: "-" },
  ];

  // Fetch customers
  useEffect(() => {
    let mounted = true;
    async function loadCustomers() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/customers${query ? `?q=${encodeURIComponent(query)}` : ''}`);
        const data = await res.json();
        if (!mounted) return;
        const items = Array.isArray(data) ? data : data?.data ?? [];
        setCustomers(items);
      } catch (err) {
        console.error(err);
        setCustomers([]);
      }
    }
    const t = setTimeout(loadCustomers, 200);
    return () => { mounted = false; clearTimeout(t); };
  }, [query]);

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("customers")}
          className={cn(
            "pb-2 text-sm font-medium",
            activeTab === "customers"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          )}
        >
          Customers
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "pb-2 text-sm font-medium",
            activeTab === "reviews"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          )}
        >
          Reviews
        </button>
      </div>

      {/* Only show Customers tab content */}
      {activeTab === "customers" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-normal text-gray-600">
                      {stat.title}
                    </CardTitle>
                    {i < 3 ? (
                      <User className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Award className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Table */}
          <div className="flex items-center justify-end p-2">
            <Input placeholder="Search..." className="w-64" />
            <Button className="ms-3" variant="outline">Filter</Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon" className="ms-2">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content align="end" className="w-56 bg-white shadow-md rounded-md py-1">
                <DropdownMenu.Item
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => alert("Text customers")}
                >
                  <span>Text customers</span>
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => alert("Export all customers")}
                >
                  <span>Export all customers</span>
                  <Download className="h-4 w-4 flex-shrink-0" />
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => alert("Export filtered customers")}
                >
                  <span>Export all filtered customers</span>
                  <Download className="h-4 w-4 flex-shrink-0" />
                </DropdownMenu.Item>
              </DropdownMenu.Content>


            </DropdownMenu.Root>
          </div>
          <div className="border border-gray-200 rounded-lg  overflow-hidden">
            <table className="w-full text-sm border-t">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">First Name</th>
                  <th className="p-3">Last Name</th>
                  <th className="p-3">Nickname</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Subscribed</th>
                  <th className="p-3">Total Orders</th>
                  <th className="p-3">Total Spent</th>
                  <th className="p-3">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{c.firstName}</td>
                    <td className="p-3">{c.lastName}</td>
                    <td className="p-3">{c.nickname}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">
                      {c.subscribed ? "✔️" : "❌"}
                    </td>
                    <td className="p-3">{c.totalOrders}</td>
                    <td className="p-3">{c.totalSpent}</td>
                    <td className="p-3">{c.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
          <div className="p-3 flex justify-between items-center text-sm text-gray-600">
            <p>1 row • Page 1 of 1</p>
            <div className="flex items-center space-x-2">
              <span>Rows per page</span>
              <select className="border rounded p-1 text-sm">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <button>{"<<"}</button>
              <button>{"<"}</button>
              <button>{">"}</button>
              <button>{">>"}</button>
            </div>
          </div>
        </>
      )}

      {/* Reviews tab (placeholder) */}
      {activeTab === "reviews" && (
        <div className="rounded-md ">
          {sections.map((section, index) => (
            <div
              key={index}
              className="p-4 border-b border-gray-200 last:border-b-0"
            >
              {/* Header */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(index)}
              >
                <h2 className="text-lg font-medium">{section.title}</h2>
                <div className="flex items-center gap-2 text-gray-500">
                  {section.counter && (
                    <span className="text-sm">{section.counter}</span>
                  )}
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{section.desc}</p>
              {openIndex === index && (
                <div className="mt-3 text-sm text-gray-700">{section.content}</div>
              )}
            </div>
          ))}

          {/* Footer Button */}
          <div className="p-4 flex justify-end">
            <button className="px-4 py-2 border rounded-md text-sm">
              View hidden reviews
            </button>
          </div>
        </div>

      )}
    </div>
  );
}
