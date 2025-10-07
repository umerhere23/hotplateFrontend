"use client";

import { useEffect, useMemo, useState } from "react";

type StorefrontPayload = any;

export default function StorefrontPage({ params }: { params: { name: string } }) {
  const [data, setData] = useState<StorefrontPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL || (process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : "http://localhost:3000/api");
  }, []);
  const backendOrigin = useMemo(() => {
    try {
      const url = new URL(apiBase);
      // If apiBase ends with /api, drop it to get origin+base
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
          if (!cancelled) setError(json?.message || "Failed to load storefront");
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

  const businessName = data?.storefront?.businessName || params.name;
  const rawBanner = data?.storefront?.bannerImage || "";
  const banner = typeof rawBanner === 'string' && rawBanner.startsWith('/api/') && backendOrigin
    ? `${backendOrigin}${rawBanner}`
    : rawBanner;
  const rawLogo = data?.storefront?.logoImage || "";
  const logo = typeof rawLogo === 'string' && rawLogo.startsWith('/api/') && backendOrigin
    ? `${backendOrigin}${rawLogo}`
    : rawLogo;
  const events: any[] = Array.isArray(data?.events) ? data!.events : [];
  const getStartTs = (ev: any) => {
    // Countdown should reflect pre-order open time, not pickup window
    const dateStr = ev?.preOrderDate || ev?.pre_order_date || ev?.defaultPickupWindow?.pickupDate;
    if (!dateStr) return 0;
    const timeStr = ev?.preOrderTime || ev?.pre_order_time || ev?.defaultPickupWindow?.startTime || '00:00';
    const d = new Date(dateStr + 'T00:00:00');
    let hh = 0, mm = 0;
    if (/am|pm/i.test(timeStr)) {
      const m = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
      if (m) {
        hh = parseInt(m[1],10); mm = parseInt(m[2]||'0',10); const ap = m[3].toUpperCase();
        if (ap==='PM' && hh<12) hh+=12; if (ap==='AM' && hh===12) hh=0;
      }
    } else {
      const parts = timeStr.split(':');
      hh = parseInt(parts[0]||'0',10)||0; mm = parseInt(parts[1]||'0',10)||0;
    }
    d.setHours(hh, mm, 0, 0);
    return d.getTime();
  };
  const sorted = [...events].sort((a, b) => getStartTs(b) - getStartTs(a));
  const nextEvent = sorted[0] || null;
  const pastEvents = sorted.slice(1);

  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    const target = nextEvent ? getStartTs(nextEvent) : 0;
    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setRemainingMs(diff);
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [nextEvent]);

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
  const fmt2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      <div className="mx-auto max-w-4xl px-4">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm overflow-hidden bg-gray-200 flex items-center justify-center">
              {logo ? (
                <img src={logo} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-gray-700">
                  {businessName?.charAt(0) || 'S'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-white">Gift Card</button>
            <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-white">Share</button>
          </div>
        </header>

        <main className="space-y-10">
          <section className="rounded-md overflow-hidden shadow-sm">
            <div className="w-full h-56 bg-gray-200">
              <img src={banner} alt="banner" className="w-full h-full object-cover" />
            </div>
            <div className="bg-[#FFEFE3] p-5 border-x border-b border-[#f1d7c8]">
              <h1 className="text-xl font-semibold text-gray-900">{businessName}</h1>
              <p className="mt-2 text-sm text-gray-700 max-w-2xl">Hello! Welcome to {businessName}. Don’t forget to subscribe to get notified about my drops!</p>
              <button className="mt-4 w-full sm:w-auto inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-md bg-[#8B74FF] text-white hover:bg-[#7a65f0]">Never miss a drop</button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-700">Next Drop</h2>
              <button className="text-xs text-gray-500 underline">What’s a drop?</button>
            </div>

            {loading && (
              <div className="rounded-lg border border-[#f1d7c8] bg-white p-6 text-sm text-gray-600">Loading…</div>
            )}
            {!loading && error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
            )}
            {!nextEvent ? (
              <div className="rounded-lg border border-[#f1d7c8] bg-white p-6 text-sm text-gray-600">No upcoming drops yet. Check back soon.</div>
            ) : (
              <div className="rounded-lg border border-[#f1d7c8] bg-[#FFEFE3] p-4 shadow-[0_0_0_3px_#FFD9CC_inset]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{nextEvent?.title || 'Upcoming event'}</h3>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-700">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    {(() => {
                      const date = nextEvent?.defaultPickupWindow?.pickupDate || nextEvent?.preOrderDate || '';
                      const time = nextEvent?.defaultPickupWindow?.startTime || nextEvent?.preOrderTime || '';
                      const label = date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD';
                      return `Pickup on ${label}${time ? `, ${time}` : ''}`;
                    })()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {nextEvent?.defaultPickupLocation?.name || 'Pickup location'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-600">{nextEvent?.description || 'Details coming soon.'}</p>

                <div className="mt-4 rounded-md bg-white p-4 border border-gray-200">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-md bg-[#F7F7F7] p-3">
                      <div className="text-xl font-bold text-[#6E62FF]">{fmt2(hours)}</div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500">Hours</div>
                    </div>
                    <div className="rounded-md bg-[#F7F7F7] p-3">
                      <div className="text-xl font-bold text-[#6E62FF]">{fmt2(mins)}</div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500">Mins</div>
                    </div>
                    <div className="rounded-md bg-[#F7F7F7] p-3">
                      <div className="text-xl font-bold text-[#6E62FF]">{fmt2(secs)}</div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500">Secs</div>
                    </div>
                  </div>
                </div>

                <a href={`/${params.name}/${nextEvent?.id}`} className="mt-4 w-full inline-block text-center rounded-md bg-[#E8E8FF] text-[#4B3DF6] hover:bg-[#dedcff] text-sm font-medium py-2">Click to order</a>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Past Drops</h2>
            {pastEvents.length === 0 ? (
              <div className="rounded-lg border border-[#f1d7c8] bg-white p-4 text-sm text-gray-600">No past drops yet.</div>
            ) : (
              pastEvents.map((ev) => {
                const date = ev?.defaultPickupWindow?.pickupDate || ev?.preOrderDate || ev?.pre_order_date || '';
                const label = date ? new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
                const loc = ev?.defaultPickupLocation?.name || '';
                return (
                  <div key={ev.id} className="rounded-lg border border-[#f1d7c8] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">{ev?.title || 'Event'}</div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Dropped on {label}{loc ? ` • ${loc}` : ''}</div>
                    {ev?.description ? (
                      <p className="mt-2 text-xs text-gray-600 line-clamp-2">{ev.description}</p>
                    ) : null}
                  </div>
                );
              })
            )}
          </section>
        </main>

        <footer className="flex items-center justify-between py-10 text-xs text-gray-500">
          <div>
            <span>Powered by Hotplate</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-700">Support</button>
            <button className="hover:text-gray-700">Privacy</button>
            <button className="hover:text-gray-700">Terms</button>
          </div>
        </footer>
      </div>
    </div>
  );
}


