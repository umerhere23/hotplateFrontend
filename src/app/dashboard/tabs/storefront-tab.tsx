"use client";

import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

export default function StorefrontTab() {
  const [links, setLinks] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);


  const addLink = () => setLinks([...links, ""]);
  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) return;

    if (editingIndex !== null) {
      const updated = [...faqs];
      updated[editingIndex] = { question, answer };
      setFaqs(updated);
      setEditingIndex(null);
    } else {
      setFaqs([{ question, answer }, ...faqs]); // new FAQ added on top
    }

    setQuestion("");
    setAnswer("");
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setQuestion(faqs[index].question);
    setAnswer(faqs[index].answer);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
    setEditingIndex(null);
    setQuestion("");
    setAnswer("");
    setShowForm(false);
  };

  return (
    <div className="max-w-8xl mx-auto">
      {/* Grid layout for first two cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
        {/* Storefront Header */}
        <div className="bg-white rounded-xl md:w-[400px] shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Storefront Header</h2>
          <p className="font-medium text-sm mb-1">Logo</p>
          <button className="w-35 py-3 rounded-lg bg-[#FFF5F0] hover:bg-gray-100 mb-3">
            <p className="text-[#EC711E]">Upload Logo</p>
          </button>

          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Header Background Color</p>
            <div className="flex gap-2 flex-wrap">
              {["#000", "#fff", "#f87171", "#facc15"].map((c) => (
                <button
                  key={c}
                  className="w-7 h-7 rounded-full border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-sm mb-1">Header Text Color</p>
            <div className="flex gap-2">
              <button className="w-7 h-7 rounded-full border bg-black" />
              <button className="w-7 h-7 rounded-full border bg-white" />
            </div>
          </div>
        </div>

        {/* Storefront Page */}
        <div className="bg-white rounded-xl md:w-[400px] shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Storefront Page</h2>
          <p className="font-medium text-sm mb-1">Banner Image</p>
          <button className="w-35 py-2 rounded-lg bg-[#FFF5F0] hover:bg-gray-100 mb-3">
            <p className="text-[#EC711E]">Upload Banner</p>
          </button>

          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Theme Color</p>
            <div className="flex gap-2 flex-wrap">
              {[
                "#000000",
                "#f87171",
                "#facc15",
                "#34d399",
                "#60a5fa",
                "#a78bfa",
                "#f472b6",
              ].map((c) => (
                <button
                  key={c}
                  className="w-7 h-7 rounded-full border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-sm mb-1">Background Color</p>
            <div className="flex gap-2 flex-wrap">
              {["#fff", "#f9fafb", "#e5e7eb", "#d1d5db"].map((c) => (
                <button
                  key={c}
                  className="w-7 h-7 rounded-full border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Store Info - full width (matches above two columns combined) */}
      <div className="mt-6 ">
        <div className="bg-white rounded-xl md:w-[830px] shadow-md  p-6">
          <h2 className="text-lg font-semibold mb-4">Store Info</h2>
          <textarea
            placeholder="Tell your customers about your business"
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-400"
            rows={3}
          />
          <div className="grid grid-cols-4 gap-3 mt-4">
            <p className="font-medium text-sm mb-1">Instagram Link</p>
            <p className="font-medium text-sm mb-1">Facebook Link</p>
            <p className="font-medium text-sm mb-1">Twitter Link</p>
            <p className="font-medium text-sm mb-1">TikTok Link</p>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-1">
            <input type="text" placeholder="Instagram Link" className="border border-gray-300 rounded-lg p-2 text-sm" />
            <input type="text" placeholder="Facebook Link" className="border border-gray-300 rounded-lg p-2 text-sm" />
            <input type="text" placeholder="Twitter Link" className="border border-gray-300 rounded-lg p-2 text-sm" />
            <input type="text" placeholder="TikTok Link" className="border border-gray-300 rounded-lg p-2 text-sm" />
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-4 gap-3">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Other Link"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = e.target.value;
                      setLinks(newLinks);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <button
                    onClick={() => removeLink(index)}
                    className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addLink}
              className="flex items-center gap-2 text-sm text-orange-600 font-medium mt-2"
            >
              <PlusCircle size={16} /> Add Link
            </button>
          </div>
          {faqs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">FAQs</h3>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{faq.question}</p>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between my-3">
            <h3 className="font-semibold">FAQs</h3>
            <button
              onClick={() => {
                setEditingIndex(null);
                setQuestion("");
                setAnswer("");
                setShowForm(true);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              Add FAQ
            </button>
          </div>


        </div>

        {showForm && (
          <div className="bg-white shadow-md mt-6 md:w-[830px] rounded-xl p-6 space-y-4 ">
            <h2 className="text-lg font-semibold">Edit FAQ</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-1">
              <button
                onClick={() => {
                  if (editingIndex !== null) handleDelete(editingIndex);
                }}
                disabled={editingIndex === null}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
