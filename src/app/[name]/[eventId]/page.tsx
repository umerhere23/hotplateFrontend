"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type StorefrontPayload = any;

export default function EventOrderPage({ params }: { params: { name: string; eventId: string } }) {
  const [data, setData] = useState<StorefrontPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL || (process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : "http://localhost:3000/api");
  }, []);

  const backendOrigin = useMemo(() => {
    try {
      const url = new URL(apiBase);
      return apiBase.endsWith('/api') ? `${url.origin}` : `${url.origin}`;
    } catch {
      return "";
    }
  }, [apiBase]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/public/storefront/${encodeURIComponent(params.name)}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.success === false) {
          if (!cancelled) setError(json?.message || "Failed to load event");
          return;
        }
        if (!cancelled) setData(json?.data ?? null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [apiBase, params.name]);

  const eventIdNum = Number(params.eventId);
  const events: any[] = Array.isArray(data?.events) ? data!.events : [];
  const ev = events.find((e) => Number(e.id) === eventIdNum) || null;

  const rawBanner = data?.storefront?.bannerImage || "";
  const banner = typeof rawBanner === 'string' && rawBanner.startsWith('/api/') && backendOrigin ? `${backendOrigin}${rawBanner}` : rawBanner;
  const rawLogo = data?.storefront?.logoImage || "";
  const logo = typeof rawLogo === 'string' && rawLogo.startsWith('/api/') && backendOrigin ? `${backendOrigin}${rawLogo}` : rawLogo;
  const businessName = data?.storefront?.businessName || params.name;

  const pickupDate = ev?.defaultPickupWindow?.pickupDate || ev?.preOrderDate || "";
  const pickupTime = ev?.defaultPickupWindow?.startTime || ev?.preOrderTime || "";
  const pickupLabel = pickupDate ? new Date(pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD';
  const locationName = ev?.defaultPickupLocation?.name || '';

  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="flex items-center justify-between py-4">
          <Link href={`/${params.name}`} className="text-sm text-gray-700 hover:underline">Back</Link>
          <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-white">Share</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-8">
          <div>
            <div className="rounded-xl border border-[#f1d7c8] bg-[#FFEFE3] p-5 shadow-[0_0_0_3px_#FFD9CC_inset] sticky top-6">
              <div className="text-base font-semibold text-gray-900">{ev?.title || 'Event'}</div>
              <p className="mt-1 text-xs text-gray-600">{ev?.description || ''}</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="inline-block w-5 h-5 rounded-full bg-[#e9e6ff] text-[#5845ff] text-center leading-5">🗓️</span>
                    <span>Pickup on {pickupLabel}{pickupTime ? `, ${pickupTime}` : ''}</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="inline-block w-5 h-5 rounded-full bg-[#e9e6ff] text-[#5845ff] text-center leading-5">📍</span>
                    <div>
                      <div>{locationName || 'Location'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[220px]">{ev?.defaultPickupLocation?.address || ''}</div>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-xl bg-white border border-[#f1d7c8] p-6 shadow-[0_0_30px_rgba(0,0,0,0.03)]">
              <div className="mb-4">
                <div className="text-base font-semibold text-gray-900">{ev?.title || ''}</div>
                <div className="text-sm text-gray-700">{ev?.price ? `$${Number(ev.price).toFixed(2)}` : ''}</div>
                <div className="mt-2 text-sm text-gray-500">{ev?.description || ''}</div>
              </div>
              {banner ? (
                <div className="w-full h-56 rounded-lg overflow-hidden">
                  <img src={banner} alt="banner" className="w-full h-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


