// components/theme-provider-wrapper.tsx
"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
