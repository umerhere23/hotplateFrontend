import Link from "next/link"
import { useState } from "react"
import RecommendationModal from "@/app/modals/recommendation-modal"
import InactiveRecommendationsModal from "@/app/modals/inactive-recommendations-modal"

export default function RecommendationsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"your" | "recommending">("your")

  const handleAdd = (username: string) => {
    // TODO: wire to API to save recommendation
    console.log("Add recommendation for:", username)
  }
  const [isInactiveOpen, setIsInactiveOpen] = useState(false)

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Recommendations</h2>
        <p className="text-sm text-gray-500">Highlight other Hotplate stores on your storefront and manage who recommends you.</p>
      </div>

      {/* Toggle control (order: Recommending you | Your recommendations) */}
      <div className="mb-6">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("recommending")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === "recommending" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
          >
            Recommending you
          </button>
          <button
            onClick={() => setActiveTab("your")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === "your" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
          >
            Your recommendations
          </button>
        </div>
      </div>

  {activeTab === "your" ? (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* top preview area: mimic small cards image */}
      <div className="w-full h-36 bg-gradient-to-r from-gray-100 to-gray-50 flex items-center justify-center">
        <div className="w-11/12 h-28 bg-[url('/next.svg')] bg-cover bg-center rounded-md border border-gray-100 shadow-inner flex items-center justify-between px-4">
          {/* left small card */}
          <div className="flex items-start gap-3">
            <div className="w-20 h-16 bg-cover bg-center rounded-md" style={{ backgroundImage: `url('/food-festival.png')` }} />
            <div className="flex flex-col text-left">
              <span className="text-xs text-gray-500">Other stores Bella Bakes thinks you'll love:</span>
              <span className="font-medium">Best Bakery</span>
              <span className="text-xs text-gray-400">Baking up only the finest baked goods!</span>
            </div>
          </div>

          {/* right small card (simplified) */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-16 bg-cover bg-center rounded-md" style={{ backgroundImage: `url('/outdoor-bbq-feast.png')` }} />
            <div className="flex flex-col text-left">
              <span className="font-medium">Incredible Ice Cream</span>
              <span className="text-xs text-gray-400">Ice cream is them most delicious thing in the world.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l.345 1.062a1 1 0 00.95.69h1.117c.969 0 1.372 1.24.588 1.81l-.902.652a1 1 0 00-.364 1.118l.345 1.062c.3.921-.755 1.688-1.541 1.118l-.902-.652a1 1 0 00-1.176 0l-.902.652c-.786.57-1.841-.197-1.541-1.118l.345-1.062a1 1 0 00-.364-1.118l-.902-.652c-.784-.57-.38-1.81.588-1.81h1.117a1 1 0 00.95-.69l.345-1.062z" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-medium">Chef Recommendations</h3>
            <p className="text-sm text-gray-500 mt-1">Highlight your fellow Hotplate stores directly on your storefront, helping everyone discover more amazing food!</p>

            <ul className="mt-4 ml-4 list-disc text-sm text-gray-600 space-y-2">
              <li>You can select up to 5 stores to recommend at any given time</li>
              <li>These stores will appear on your storefront for visitors to explore</li>
              <li>On the "Your recommendations" tab you can view and manage the stores that you are currently recommending, and view the impact of your recommendation</li>
              <li>"Recommending you" will show the stores that are currently recommending you</li>
              <li>To add your first recommendation, grab their chef username (e.g. "bellabakes" in "www.hotplate.com/bellabakes") and click the button below!</li>
            </ul>

            <p className="mt-4 text-sm">
              Read more about recommendations on our{' '}
              <Link href="/help-center" className="text-primary-600 underline">help center</Link>
            </p>
          </div>

          <div className="flex-shrink-0 pl-4">
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-sm hover:bg-black">
              <span className="text-lg">+</span>
              <span className="text-sm font-medium">Add your first recommendation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>
      {/* stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-500">Total revenue</div>
          <div className="mt-4 text-3xl font-bold">$0.00</div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-500">Customers referred</div>
          <div className="mt-4 text-3xl font-bold">0</div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-500">Active recommendations</div>
          <div className="mt-4 text-3xl font-bold">0</div>
        </div>
      </div>

      {/* Active Recommendations table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Active Recommendations</h3>
        <div className="bg-white border rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3">Revenue Generated</th>
                <th className="px-6 py-3">Active Since</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="px-6 py-6 text-gray-600">No results.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={() => setIsInactiveOpen(true)} className="border rounded-md px-4 py-2 text-sm">View Inactive →</button>
        </div>
      </div>
    </div>
  )}
      <RecommendationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAdd} />
      <InactiveRecommendationsModal isOpen={isInactiveOpen} onClose={() => setIsInactiveOpen(false)} />
    </div>
  )
}
