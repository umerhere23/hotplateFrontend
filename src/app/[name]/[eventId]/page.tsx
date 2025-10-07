"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMenuItems } from "@/services/api"; // removed createOrder import
import { useRouter } from 'next/navigation';

type StorefrontPayload = any;

export default function EventOrderPage({ params }: { params: { name: string; eventId: string } }) {
  const [data, setData] = useState<StorefrontPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  // Cart state
  const [cartItems, setCartItems] = useState<{ id:number; name:string; price:number; qty:number; image:string }[]>([]);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    (async () => {
      setLoading(true); setError(null);
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
    })();
    return () => { cancelled = true; };
  }, [apiBase, params.name]);

  const eventIdNum = Number(params.eventId);

  useEffect(() => {
    if (!eventIdNum || Number.isNaN(eventIdNum)) return;
    setMenuLoading(true);
    (async () => {
      try {
        const items = await getMenuItems(eventIdNum);
        setMenuItems(items || []);
      } catch (e) {
        console.error("Failed to load menu items", e);
        setMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    })();
  }, [eventIdNum]);

  const events: any[] = Array.isArray(data?.events) ? data!.events : [];
  const ev = events.find(e => Number(e.id) === eventIdNum) || null;

  const rawBanner = data?.storefront?.bannerImage || ev?.image || "";
  const banner = typeof rawBanner === 'string' && rawBanner.startsWith('/api/') && backendOrigin ? `${backendOrigin}${rawBanner}` : rawBanner;
  const rawLogo = data?.storefront?.logoImage || "";
  const logo = typeof rawLogo === 'string' && rawLogo.startsWith('/api/') && backendOrigin ? `${backendOrigin}${rawLogo}` : rawLogo;
  const businessName = data?.storefront?.businessName || params.name;

  // Keep pickup window info for display, but countdown should use pre-order open time only
  const pickupDate = ev?.defaultPickupWindow?.pickupDate || ev?.preOrderDate || ev?.pre_order_date || "";
  const pickupTime = ev?.defaultPickupWindow?.startTime || ev?.preOrderTime || ev?.pre_order_time || "";
  const preOrderDate = ev?.preOrderDate || ev?.pre_order_date || ""; // new explicit vars
  const preOrderTime = ev?.preOrderTime || ev?.pre_order_time || "";
  const pickupLabel = pickupDate ? new Date(pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD';
  const locationName = ev?.defaultPickupLocation?.name || '';
  const locationAddress = ev?.defaultPickupLocation?.address || '';

  const computeStart = () => {
    if (!preOrderDate) return 0; // use pre-order open date/time exclusively
    const d = new Date(preOrderDate);
    if (preOrderTime && typeof preOrderTime === 'string') {
      if (/am|pm/i.test(preOrderTime)) {
        const m = preOrderTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
        if (m) {
          let hh = parseInt(m[1], 10); const mm = parseInt(m[2] || '0', 10); const ap = m[3].toUpperCase();
          if (ap === 'PM' && hh < 12) hh += 12; if (ap === 'AM' && hh === 12) hh = 0; d.setHours(hh, mm, 0, 0);
        }
      } else {
        const [hh='0', mm='0', ss='0'] = preOrderTime.split(':');
        d.setHours(+hh||0, +mm||0, +ss||0, 0);
      }
    }
    return d.getTime();
  };
  const [remainingMs, setRemainingMs] = useState(0);
  useEffect(() => {
    const target = computeStart();
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [preOrderDate, preOrderTime, eventIdNum]);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  const hours = Math.floor(remainingMs / 3600000);
  const minutes = Math.floor((remainingMs % 3600000) / 60000);
  const fmt2 = (n: number) => String(n).padStart(2, '0');

  const products = menuItems.map(mi => ({
    id: mi.id,
    name: mi.name,
    price: parseFloat(mi.price || 0),
    description: mi.description || "",
    image: mi.imageUrl || mi.image_url || mi.image || banner || '/abstract-location.png'
  }));

  const openModal = (p: any) => { setModalProduct(p); setQty(1); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModalProduct(null); };
  const canOrder = remainingMs === 0;

  // Persist cart per-event in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `cart_event_${params.eventId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCartItems(parsed.filter(i => typeof i.id === 'number' && typeof i.qty === 'number'));
      }
    } catch {}
  }, [params.eventId]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `cart_event_${params.eventId}`;
    try { localStorage.setItem(key, JSON.stringify(cartItems)); } catch {}
  }, [cartItems, params.eventId]);

  const addToCart = (product:any, quantity:number) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + quantity } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: quantity, image: product.image }];
    });
  };
  const updateQty = (id:number, delta:number) => {
    setCartItems(prev => prev.flatMap(i => {
      if (i.id !== id) return [i];
      const newQty = i.qty + delta;
      if (newQty <= 0) return [];
      return [{ ...i, qty: newQty }];
    }));
  };
  const removeFromCart = (id:number) => setCartItems(prev => prev.filter(i => i.id !== id));
  const totalQuantity = cartItems.reduce((s,i)=>s+i.qty,0);
  const totalPrice = cartItems.reduce((s,i)=>s+i.price*i.qty,0);

  // Prefill basic info from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('hp_checkout_profile') || '{}');
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.lastName) setLastName(saved.lastName);
      if (saved.email) setEmail(saved.email);
      if (saved.phone) setPhone(saved.phone);
    } catch {}
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const profile = { firstName, lastName, email, phone };
    try { localStorage.setItem('hp_checkout_profile', JSON.stringify(profile)); } catch {}
  }, [firstName, lastName, email, phone]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/${params.name}`} className="text-sm text-gray-600 hover:underline">Back</Link>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-white">Share</button>
          </div>
        </div>

        <div className="rounded-md bg-[#E4F9FA] border border-[#b9edef] text-[13px] text-gray-700 px-4 py-3 mb-6">
          You will be able to place an order when the countdown hits zero. Signup to be reminded so you don’t miss it!
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:min-h-[70vh]">
          <aside className="w-full md:w-[360px] flex-shrink-0">
            <div className="w-full rounded-xl border border-[#f1d7c8] bg-white shadow-sm p-6 flex flex-col" style={{boxShadow:'0 4px 12px -2px rgba(0,0,0,0.04)'}}>
              <div>
                <h2 className="text-base font-semibold text-gray-900 leading-tight">{ev?.title || 'Event Title'}</h2>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">{ev?.description || 'Event description coming soon.'}</p>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <button className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F4F2FF] text-[#5845ff] text-sm">🗓️</span>
                    <span className="text-[13px] leading-tight font-medium">Pickup on {pickupLabel}{pickupTime ? `, ${pickupTime}` : ''}</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
                <button className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F4F2FF] text-[#5845ff] text-sm">📍</span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-medium">{locationName || 'Pickup Location'}</div>
                      <div className="text-[11px] text-gray-500 max-w-[210px] truncate">{locationAddress}</div>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>

              <div className="mt-6 flex gap-3 justify-start" aria-label="Countdown">
                {[
                  { label: 'Hours', value: fmt2(hours) },
                  { label: 'Mins', value: fmt2(minutes) },
                  { label: 'Secs', value: fmt2(secs) },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-md bg-[#FFE5DE] flex items-center justify-center">
                      <span className="text-2xl font-semibold text-[#FF6037] tabular-nums">{b.value}</span>
                    </div>
                    <span className="mt-1 text-[11px] font-medium text-gray-600">{b.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected
                </div>
                <div className="flex items-center gap-1 text-xs bg-[#FFF1E8] text-[#EC711E] px-2 py-1 rounded-full">
                  <span>🔥</span>
                  <span>1 here</span>
                </div>
              </div>

              <div className="mt-6 text-center text-[11px] text-gray-600 leading-relaxed">
                <p className="font-medium mb-1">Welcome to the chat!</p>
                <p>Type a message to talk to everyone waiting for the drop 🔥</p>
              </div>

              <div className="mt-5 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  placeholder="Type here..."
                  className="w-full text-sm rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EC711E]/40"
                  disabled={false}
                />
              </div>
            </div>
          </aside>

          <section className="flex-1 space-y-8 mt-10 md:mt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuLoading && (
                <div className="col-span-full text-sm text-gray-500">Loading menu…</div>
              )}
              {!menuLoading && products.length === 0 && (
                <div className="col-span-full text-sm text-gray-500">No menu items yet.</div>
              )}
              {products.map(p => (
                <div key={p.id} className="rounded-xl bg-white border border-[#f1d7c8] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-gray-900">{p.name}</h3>
                      <span className="text-sm font-semibold text-gray-800">${p.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[12px] text-gray-500 line-clamp-2">{p.description}</p>
                    <button className="mt-3 text-xs font-medium bg-[#EFEFFD] text-[#4B3DF6] px-3 py-2 rounded-md hover:bg-[#e2e2fb] disabled:opacity-50" onClick={() => openModal(p)}>Add to cart</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {loading && (
          <div className="mt-8 text-xs text-gray-500">Loading data…</div>
        )}
        {error && !loading && (
          <div className="mt-8 text-xs text-red-600">{error}</div>
        )}
      </div>

      {showModal && modalProduct && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn" role="dialog" aria-modal="true">
            <div className="relative w-full h-56 bg-gray-100">
              <img src={modalProduct.image} alt={modalProduct.name} className="w-full h-full object-cover" />
              <button onClick={closeModal} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-gray-700 text-sm font-semibold hover:bg-white">×</button>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{modalProduct.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{modalProduct.description}</p>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-10 h-10 rounded-md border border-gray-300 text-lg font-medium disabled:opacity-40" disabled={qty<=1}>−</button>
                <span className="text-lg font-medium w-8 text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty(q => q+1)} className="w-10 h-10 rounded-md border border-gray-300 text-lg font-medium">+</button>
              </div>
              {!canOrder && (
                <div className="space-y-4">
                  <div className="rounded-md border border-[#c7ebef] bg-[#e7fafc] text-[13px] text-gray-700 px-4 py-3 flex items-start gap-2">
                    <span className="text-base leading-none">ℹ️</span>
                    <span>This item is not available yet because sales have not begun</span>
                  </div>
                  <button disabled className="w-full cursor-not-allowed rounded-lg bg-[#EEF0FF] text-[#b6bddf] font-medium py-4 text-sm flex items-center justify-between px-4">
                    <span>Available Soon</span>
                    <span className="tabular-nums">${(modalProduct.price*qty).toFixed(2)}</span>
                  </button>
                </div>
              )}
              {canOrder && (
                <div className="space-y-4">
                  <button onClick={() => { addToCart(modalProduct, qty); closeModal(); }} className="w-full rounded-lg bg-[#4B3DF6] hover:bg-[#3f33d9] text-white font-medium py-4 text-sm flex items-center justify-between px-4">
                    <span>Add to cart</span>
                    <span className="tabular-nums">${(modalProduct.price*qty).toFixed(2)}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="mx-auto max-w-[1400px] px-4 pb-4">
            <div className="rounded-full bg-indigo-600 text-white flex items-center justify-between px-5 py-3 shadow-lg">
              <button onClick={() => setShowCartPanel(true)} className="flex-1 text-left flex items-center gap-3">
                <span className="font-medium">Cart</span>
                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{totalQuantity} {totalQuantity===1? 'item':'items'}</span>
              </button>
              <div className="font-semibold tabular-nums">${totalPrice.toFixed(2)}</div>
              <button className="ml-4 text-sm font-medium bg-white text-indigo-700 px-4 py-1.5 rounded-full hover:bg-gray-100" onClick={() => { router.push(`/checkout/${params.name}/${params.eventId}`); }}>Checkout</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slide Up Panel */}
      {showCartPanel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCartPanel(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Your Cart</h3>
              <button onClick={() => setShowCartPanel(false)} className="text-gray-500 text-sm hover:text-gray-700">Close</button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900 truncate pr-2">{item.name}</h4>
                      <button onClick={()=>removeFromCart(item.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button onClick={()=>updateQty(item.id,-1)} className="w-8 h-8 text-sm font-medium disabled:opacity-40" disabled={item.qty<=1}>−</button>
                        <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
                        <button onClick={()=>updateQty(item.id,1)} className="w-8 h-8 text-sm font-medium">+</button>
                      </div>
                      <div className="ml-auto text-sm font-semibold tabular-nums">${(item.price*item.qty).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 && (
                <div className="text-xs text-gray-500">Your cart is empty.</div>
              )}
            </div>
            <div className="p-4 border-t space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold tabular-nums">${totalPrice.toFixed(2)}</span>
              </div>
              <button className="w-full rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3" onClick={() => { setShowCartPanel(false); router.push(`/checkout/${params.name}/${params.eventId}`); }}>Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


