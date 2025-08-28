"use client"

import { useTheme } from "@/components/theme-provider"

export function ThemeSwitcher() {
  const { theme, setTheme, setPrimaryColor } = useTheme()

  const themes = [
    { name: "Light", value: "light" },
    { name: "Dark", value: "dark" },
    { name: "Custom", value: "custom" },
  ]

  const colors = [
    { name: "Default", value: "#1A1625" },
    { name: "Orange", value: "#ec711e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
  ]

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Theme</h3>
      <div className="flex gap-2 mb-4">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value as any)}
            className={`px-3 py-1 rounded-md ${
              theme === t.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <h3 className="font-medium mb-2">Primary Color</h3>
      <div className="flex gap-2 flex-wrap">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => setPrimaryColor(color.value)}
            className="w-8 h-8 rounded-full border"
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  )
}
