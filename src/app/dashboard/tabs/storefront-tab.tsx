"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Upload, Info, Bell, Share, Gift, Save, Loader2 } from "lucide-react";
import { saveStorefront, getStorefront, type StorefrontPayload } from "@/services/api";

interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
}

const themes: Theme[] = [
  { name: "Tuxedo", primary: "#000000", secondary: "#FFFFFF", background: "#FFFFFF" },
  { name: "Matcha", primary: "#10b981", secondary: "#d1fae5", background: "#FFFFFF" },
  { name: "Lagoon", primary: "#3b82f6", secondary: "#dbeafe", background: "#FFFFFF" },
  { name: "Concord", primary: "#8b5cf6", secondary: "#ede9fe", background: "#FFFFFF" },
  { name: "Ruby", primary: "#ef4444", secondary: "#fecaca", background: "#FFFFFF" },
  { name: "Earth", primary: "#a3a3a3", secondary: "#f3f4f6", background: "#FFFFFF" },
  { name: "Ham & Cheese", primary: "#f59e0b", secondary: "#fef3c7", background: "#FFFFFF" },
  { name: "Kalm", primary: "#06b6d4", secondary: "#cffafe", background: "#FFFFFF" },
  { name: "Foundry", primary: "#1e40af", secondary: "#fbbf24", background: "#FFFFFF" },
  { name: "Ember", primary: "#dc2626", secondary: "#fed7aa", background: "#FFFFFF" },
];

export default function StorefrontTab() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[7]); // Kalm theme default
  const [customTheme, setCustomTheme] = useState<Theme>({
    name: "Custom",
    primary: "#06b6d4",
    secondary: "#cffafe",
    background: "#FFFFFF"
  });
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [links, setLinks] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [businessName, setBusinessName] = useState("Sadiss");
  const [hideBusinessName, setHideBusinessName] = useState(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorefrontData = async () => {
      try {
        const result = await getStorefront();
        if (result.success && result.data) {
          const data = result.data;
          
          setBusinessName(data.businessName || "");
          setAboutText(data.aboutText || "");
          setHideBusinessName(data.hideBusinessName || false);
          
          if (data.theme) {
            if (data.theme.name === "Custom") {
              setCustomTheme(data.theme);
              setSelectedTheme(data.theme);
              setShowCustomTheme(false);
            } else {
              const foundTheme = themes.find(t => t.name === data.theme.name);
              if (foundTheme) {
                setSelectedTheme(foundTheme);
              } else {
                setCustomTheme(data.theme);
                setSelectedTheme(data.theme);
                setShowCustomTheme(false);
              }
            }
          }
          
          if (data.logoImage) {
            // If it's a relative path from backend, make it absolute
            const logoUrl = data.logoImage.startsWith('/') 
              ? `http://localhost:3000${data.logoImage}` 
              : data.logoImage;
            setLogoImage(logoUrl);
          }
          if (data.bannerImage) {
            // If it's a relative path from backend, make it absolute
            const bannerUrl = data.bannerImage.startsWith('/') 
              ? `http://localhost:3000${data.bannerImage}` 
              : data.bannerImage;
            setBannerImage(bannerUrl);
          }
          
          if (data.socialLinks) {
            try {
              const parsedSocialLinks = typeof data.socialLinks === 'string' 
                ? JSON.parse(data.socialLinks) 
                : data.socialLinks;
              setSocialLinks(parsedSocialLinks);
            } catch (e) {
              console.warn('Failed to parse socialLinks:', e);
              setSocialLinks({
                instagram: "",
                facebook: "",
                twitter: "",
                tiktok: ""
              });
            }
          }
          
          if (data.otherLinks) {
            try {
              const parsedOtherLinks = typeof data.otherLinks === 'string' 
                ? JSON.parse(data.otherLinks) 
                : data.otherLinks;
              if (Array.isArray(parsedOtherLinks)) {
                setLinks(parsedOtherLinks);
              }
            } catch (e) {
              console.warn('Failed to parse otherLinks:', e);
              setLinks([]);
            }
          }
          
          if (data.faqs) {
            try {
              const parsedFaqs = typeof data.faqs === 'string' 
                ? JSON.parse(data.faqs) 
                : data.faqs;
              if (Array.isArray(parsedFaqs)) {
                setFaqs(parsedFaqs);
              }
            } catch (e) {
              console.warn('Failed to parse faqs:', e);
              setFaqs([]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading storefront data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorefrontData();
  }, []);

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
      setFaqs([{ question, answer }, ...faqs]);
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

  const handleCustomTheme = () => {
    setSelectedTheme(customTheme);
    setShowCustomTheme(true);
  };

  const handleCustomThemeSave = () => {
    setSelectedTheme(customTheme);
    setShowCustomTheme(false);
  };

  const handleImageUpload = (type: 'logo' | 'banner', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          setLogoImage(result);
          setLogoFile(file);
        } else {
          setBannerImage(result);
          setBannerFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoImage(null);
      setLogoFile(null);
    } else {
      setBannerImage(null);
      setBannerFile(null);
    }
  };

  const handleSocialLinkChange = (platform: keyof typeof socialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const handleSaveStorefront = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload: StorefrontPayload & { logoFile?: File; bannerFile?: File } = {
        businessName,
        aboutText,
        hideBusinessName,
        theme: {
          name: selectedTheme.name,
          primary: selectedTheme.primary,
          secondary: selectedTheme.secondary,
          background: selectedTheme.background,
        },
        socialLinks,
        otherLinks: links.filter(link => link.trim() !== ""),
        faqs,
        logoFile: logoFile || undefined,
        bannerFile: bannerFile || undefined,
      };

      const result = await saveStorefront(payload);
      
      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Storefront saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: result.message || 'Failed to save storefront' });
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error saving storefront:', error);
      setSaveMessage({ type: 'error', text: 'An unexpected error occurred' });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 size={24} className="animate-spin" />
            <span>Loading storefront data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Customization */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Storefront Colors</h2>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-medium">Themes</h3>
              <Info size={16} className="text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTheme.name === theme.name 
                      ? 'border-blue-500 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.secondary }}
                    />
                  </div>
                  <p className="text-sm font-medium text-left">{theme.name}</p>
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleCustomTheme}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Customize Theme
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Storefront Images</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Logo</h3>
                  <Info size={16} className="text-gray-400" />
                </div>
                {logoImage && (
                  <div className="mb-3">
                    <img 
                      src={logoImage} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Upload size={16} />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('logo', e)}
                      className="hidden"
                    />
                  </label>
                  {logoImage && (
                    <button 
                      onClick={() => handleRemoveImage('logo')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  )}
                </div>
                {logoImage && <p className="text-xs text-green-600 mt-1">✓ Logo uploaded</p>}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Banner Image</h3>
                  <Info size={16} className="text-gray-400" />
                </div>
                {bannerImage && (
                  <div className="mb-3">
                    <img 
                      src={bannerImage} 
                      alt="Banner preview" 
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-center">
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('banner', e)}
                      className="hidden"
                    />
                  </label>
                  {bannerImage && (
                    <button 
                      onClick={() => handleRemoveImage('banner')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  )}
                </div>
                {bannerImage && <p className="text-xs text-green-600 mt-1">✓ Banner uploaded</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Store Info</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Business Name</h3>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business name"
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">About Me</h3>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hideBusinessName"
                  checked={hideBusinessName}
                  onChange={(e) => setHideBusinessName(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="hideBusinessName" className="text-sm">
                  Hide my business name in my profile
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm">Instagram Link</h3>
                    <Info size={14} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder="instagram.com/yourprofile" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm">Facebook Link</h3>
                    <Info size={14} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={socialLinks.facebook}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    placeholder="facebook.com/yourprofile" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm">Twitter Link</h3>
                    <Info size={14} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="twitter.com/yourprofile" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm">TikTok Link</h3>
                    <Info size={14} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={socialLinks.tiktok}
                    onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                    placeholder="tiktok.com/@yourprofile" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Other Links</h3>
                <div className="space-y-2">
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
                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex items-center gap-2 text-sm text-blue-600 font-medium mt-2"
                >
                  <PlusCircle size={16} /> Add Link
                </button>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">FAQs</h3>
                {faqs.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <p className="font-medium text-sm">{faq.question}</p>
                        <p className="text-gray-600 text-xs">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 font-medium"
                >
                  <PlusCircle size={16} /> Add FAQ
                </button>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              More Settings
            </button>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-4">
              {saveMessage && (
                <div className={`p-3 rounded-lg ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage.text}
                </div>
              )}
              
              <button
                onClick={handleSaveStorefront}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Storefront
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                This will save all your storefront customizations including images, theme, and content.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Store Preview */}
        <div className="bg-[#F5F5F0] rounded-xl p-8 min-h-[800px]">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Banner Image */}
            {bannerImage && (
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={bannerImage} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Store Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {logoImage ? (
                    <img 
                      src={logoImage} 
                      alt="Logo" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-bold" style={{ color: selectedTheme.primary }}>
                        {businessName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: selectedTheme.primary }}>
                      {businessName}
                    </h1>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Gift size={16} />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Share size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Store Content */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="font-semibold mb-2">About</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{aboutText}</p>
              </div>

              <button 
                className="w-full py-3 px-4 rounded-lg text-white font-medium mb-6 flex items-center justify-center gap-2"
                style={{ backgroundColor: selectedTheme.primary }}
              >
                <Bell size={16} />
                Never miss a drop
              </button>

              {/* Current Drop */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Current Drop</h3>
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-red-500 rounded-lg flex flex-col items-center justify-center">
                      <div className="w-6 h-6 bg-red-500 rounded mb-1"></div>
                      <div className="w-6 h-6 bg-red-500 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Example Drop</h4>
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                <button 
                  className="w-full mt-4 py-2 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: selectedTheme.primary }}
                >
                  Click to order →
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Powered by Hotplate © {businessName} 2025</span>
                <div className="flex gap-4">
                  <span>Support</span>
                  <span>Privacy</span>
                  <span>Terms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Add FAQ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Theme Modal */}
      {showCustomTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Customize Theme</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customTheme.primary}
                    onChange={(e) => setCustomTheme({...customTheme, primary: e.target.value})}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={customTheme.primary}
                    onChange={(e) => setCustomTheme({...customTheme, primary: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customTheme.secondary}
                    onChange={(e) => setCustomTheme({...customTheme, secondary: e.target.value})}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={customTheme.secondary}
                    onChange={(e) => setCustomTheme({...customTheme, secondary: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customTheme.background}
                    onChange={(e) => setCustomTheme({...customTheme, background: e.target.value})}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={customTheme.background}
                    onChange={(e) => setCustomTheme({...customTheme, background: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: customTheme.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: customTheme.secondary }}
                  />
                  <span className="text-sm text-gray-600">Custom Theme</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCustomTheme(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomThemeSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
