"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getMenuItems, createOrder } from '@/services/api';

// Helper to normalize various date formats to YYYY-MM-DD WITHOUT UTC shifting
const getDateOnly = (val:any) => {
  if(!val) return '';
  if (typeof val === 'string') {
    const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  if (val instanceof Date) {
    return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}-${String(val.getDate()).padStart(2,'0')}`;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// Local date key helper (no UTC conversion)
const localDateKey = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

interface CheckoutParams { params: { name: string; eventId: string } }

// Compute range of dates between preorder start date and last pickup window end date.
function enumerateDates(start: Date, end: Date) {
  const out: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) { out.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
  return out;
}

export default function CheckoutPage({ params }: CheckoutParams) {
  const eventIdNum = Number(params.eventId);
  const [storefront, setStorefront] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [pickupWindows, setPickupWindows] = useState<any[]>([]);
  const [menuItems,setMenuItems] = useState<any[]>([]);
  const [cart,setCart] = useState<{id:number; name:string; price:number; qty:number; image?:string}[]>([]);
  const [firstName,setFirstName]=useState('');
  const [lastName,setLastName]=useState('');
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [step,setStep]=useState<'info'|'time'|'pay'|'result'>('info');
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // yyyy-MM-dd
  const [selectedSlot,setSelectedSlot]=useState<string | null>(null); // ISO
  const [selectedWindowId,setSelectedWindowId]=useState<number|null>(null);
  const [submitting,setSubmitting]=useState(false);
  const [orderResult,setOrderResult]=useState<{success:boolean; orderId?:number; message?:string}|null>(null);

  const apiBase = useMemo(()=>process.env.NEXT_PUBLIC_API_URL || (process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : 'http://localhost:3000/api'),[]);

  // Load storefront + event
  useEffect(()=>{ (async ()=>{
    try {
      const res = await fetch(`${apiBase}/public/storefront/${encodeURIComponent(params.name)}`);
      const js = await res.json().catch(()=>({}));
      if (res.ok) {
        setStorefront(js.data?.storefront||null);
        const ev = (js.data?.events||[]).find((e:any)=>Number(e.id)===eventIdNum) || null;
        setEvent(ev);
      }
    } catch {}
  })(); },[apiBase, params.name, eventIdNum]);

  // Load pickup windows (public endpoint)
  useEffect(()=>{ if(!eventIdNum) return; (async()=>{ try { const r=await fetch(`${apiBase}/public/events/${eventIdNum}/pickup-windows`); const js=await r.json().catch(()=>({})); if(r.ok){ const arr=Array.isArray(js)?js:Array.isArray(js.data)?js.data:[]; setPickupWindows(arr); if (event?.defaultPickupWindow?.id) setSelectedWindowId(event.defaultPickupWindow.id); }} catch{} })(); },[apiBase,eventIdNum,event?.defaultPickupWindow?.id]);

  // Load menu items for price reference (optional)
  useEffect(()=>{ if(!eventIdNum) return; (async()=>{ try { const items = await getMenuItems(eventIdNum); setMenuItems(items||[]);} catch{} })(); },[eventIdNum]);

  // Restore cart
  useEffect(()=>{ if (typeof window==='undefined') return; try { const raw=localStorage.getItem(`cart_event_${eventIdNum}`); if(raw){ const parsed=JSON.parse(raw); if(Array.isArray(parsed)) setCart(parsed); }} catch{} },[eventIdNum]);

  // Restore profile
  useEffect(()=>{ if (typeof window==='undefined') return; try { const saved=JSON.parse(localStorage.getItem('hp_checkout_profile')||'{}'); if(saved.firstName) setFirstName(saved.firstName); if(saved.lastName) setLastName(saved.lastName); if(saved.email) setEmail(saved.email); if(saved.phone) setPhone(saved.phone);} catch{} },[]);
  useEffect(()=>{ if (typeof window==='undefined') return; try { localStorage.setItem('hp_checkout_profile', JSON.stringify({firstName,lastName,email,phone})); } catch{} },[firstName,lastName,email,phone]);

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const canInfo = firstName.trim() && lastName.trim() && /.+@.+/.test(email) && phone.trim().length>=7;

  // Preorder start & final end (last window end)
  const preOrderDateRaw = event?.preOrderDate || event?.pre_order_date || null;
  const preOrderTimeRaw = event?.preOrderTime || event?.pre_order_time || '00:00';
  const parseTime = (t:string) => {
    if(!t) return {h:0,m:0};
    const ampm = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if(ampm){ let h=parseInt(ampm[1],10); const m=parseInt(ampm[2]||'0',10); const ap=ampm[3].toUpperCase(); if(ap==='PM'&&h<12) h+=12; if(ap==='AM'&&h===12) h=0; return {h,m}; }
    const parts = t.split(':'); return {h:parseInt(parts[0]||'0',10)||0,m:parseInt(parts[1]||'0',10)||0};
  };
  let startDateTime: Date | null = null;
  if(preOrderDateRaw){ const {h,m} = parseTime(preOrderTimeRaw||'00:00'); startDateTime = new Date(preOrderDateRaw + 'T00:00:00'); startDateTime.setHours(h,m,0,0); }

  // Determine last window end datetime
  let endDateTime: Date | null = null;
  for(const w of pickupWindows){
    const dStr = getDateOnly(w.pickupDate||w.pickup_date); if(!dStr) continue;
    const startT = String(w.startTime||w.start_time||'00:00').slice(0,5);
    const endT = String(w.endTime||w.end_time||'00:00').slice(0,5);
    const [eH,eM]=endT.split(':').map(Number);
    const dt = new Date(dStr+ 'T00:00:00'); dt.setHours(eH||0,eM||0,0,0);
    if(!endDateTime || dt > endDateTime) endDateTime = dt;
  }
  // Fallback: if no windows yet, use preorder day + 1 hour window
  if(!endDateTime && startDateTime){ endDateTime = new Date(startDateTime.getTime()+60*60000); }

  // Use local date keys (avoid toISOString UTC shift that caused previous-day display)
  const startDateStr = preOrderDateRaw || (startDateTime ? localDateKey(startDateTime) : null);
  const endDateStr = endDateTime ? localDateKey(endDateTime) : null;

  // Build calendar days inclusive without UTC shift
  const dateRange = (() => {
    if(!startDateTime || !endDateTime) return [] as {label:string; date:string}[];
    const days = enumerateDates(startDateTime, endDateTime);
    return days.map(d=>({
      label: d.toLocaleDateString(undefined,{weekday:'short', month:'numeric', day:'numeric'}),
      date: localDateKey(d)
    }));
  })();
  useEffect(()=>{ if(dateRange.length && !selectedDate) setSelectedDate(dateRange[0].date); if(selectedDate && !dateRange.find(d=>d.date===selectedDate)) setSelectedDate(dateRange[0]?.date||null); },[dateRange, selectedDate]);

  // Helper: find window id covering a slot time (if any)
  const findWindowId = (dt: Date) => {
    for(const w of pickupWindows){
      const dStr = getDateOnly(w.pickupDate||w.pickup_date); if(!dStr) continue;
      const startT = String(w.startTime||w.start_time||'00:00').slice(0,5);
      const endT = String(w.endTime||w.end_time||'00:00').slice(0,5);
      const [sH,sM]=startT.split(':').map(Number); const [eH,eM]=endT.split(':').map(Number);
      const ws = new Date(dStr+'T00:00:00'); ws.setHours(sH||0,sM||0,0,0);
      const we = new Date(dStr+'T00:00:00'); we.setHours(eH||0,eM||0,0,0);
      if(dt >= ws && dt < we) return w.id;
    }
    return null;
  };

  // Generate slots for selectedDate across continuous ordering horizon
  const slots = (() => {
    if(!selectedDate || !startDateTime || !endDateTime) return [] as any[];
    const dayStart = new Date(selectedDate+'T00:00:00');
    let from = new Date(dayStart);
    let to = new Date(dayStart.getTime()+24*3600*1000);
    if(selectedDate === startDateStr) from = new Date(startDateTime);
    if(selectedDate === endDateStr) to = new Date(endDateTime);
    if(from >= to) return [];
    const out:any[]=[];
    for(let t=new Date(from); t<to; t=new Date(t.getTime()+15*60000)){
      const hh=t.getHours(); const mm=t.getMinutes(); const ap=hh<12?'AM':'PM'; const hh12=((hh+11)%12)+1; const label=`${hh12}:${String(mm).padStart(2,'0')} ${ap}`; out.push({ label, iso:t.toISOString(), windowId: findWindowId(t) });
    }
    return out;
  })();

  const slotsGrouped = slots;

  const chooseSlot = (slot:any)=>{ setSelectedSlot(slot.iso); setSelectedWindowId(slot.windowId); };

  const placeOrder = async () => {
    if(!selectedSlot || !cart.length) return; // window optional now
    setSubmitting(true); setOrderResult(null);
    try {
      const payload = { event_id: eventIdNum, pickup_window_id: selectedWindowId || null, pickup_date_time: selectedSlot, first_name:firstName.trim(), last_name:lastName.trim(), email:email.trim(), phone:phone.trim(), items: cart.map(i=>({ menu_item_id: i.id, quantity: i.qty, name: i.name })) };
      const res = await createOrder(payload);
      if(res.success){ setOrderResult({ success:true, orderId: res.data?.id }); setStep('result'); localStorage.removeItem(`cart_event_${eventIdNum}`); }
      else { setOrderResult({ success:false, message: res.message||'Failed to place order'}); setStep('result'); }
    } catch(e:any){ setOrderResult({ success:false, message:e?.message || 'Unexpected error'}); setStep('result'); } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-xs mb-6">
          <Link href={`/${params.name}`} className="text-gray-600 hover:underline">← Back</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Checkout</span>
        </div>

        {/* Step Header */}
        <div className="flex items-center justify-center mb-8 text-[13px] font-medium">
          {['Info','Time','Pay'].map((lbl,idx)=>{ const active = (idx===0 && step==='info')||(idx===1 && step==='time')||(idx===2 && (step==='pay'||step==='result')); const done = (idx===0 && step!=='info')||(idx===1 && (step==='pay'||step==='result')); return (
            <div key={lbl} className={`flex items-center ${idx<2?'flex-1':'w-auto'} justify-center relative`}> 
              <div className={`px-6 py-2 border-b-2 ${active?'border-black':'border-gray-200'} ${active?'text-black':'text-gray-500'}`}>{lbl}</div>
              {idx<2 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-transparent"/>}
            </div>
          ); })}
        </div>

        {/* Panel */}
        {step==='info' && (
          <div className="border rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold mb-1">Your info</h3>
            <p className="text-[11px] text-gray-500 mb-4">To make it easy for you to get your order</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">First name</label>
                <input className="w-full border rounded-md px-3 py-2 text-sm" value={firstName} onChange={e=>setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Last name</label>
                <input className="w-full border rounded-md px-3 py-2 text-sm" value={lastName} onChange={e=>setLastName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Email</label>
                <input type="email" className="w-full border rounded-md px-3 py-2 text-sm" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Phone</label>
                <input type="tel" className="w-full border rounded-md px-3 py-2 text-sm" placeholder="+1 (555) 123-4567" value={phone} onChange={e=>setPhone(e.target.value)} />
              </div>
              <button disabled={!canInfo} onClick={()=>setStep('time')} className={`w-full rounded-md py-3 text-sm font-medium ${canInfo? 'bg-black text-white hover:opacity-90':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Choose your time →</button>
            </div>
          </div>
        )}

        {step==='time' && (
          <div className="border rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold mb-1">Location & Time</h3>
            <p className="text-[11px] text-gray-500 mb-4">Where and when you will get your order</p>
            <div className="mb-5">
              <label className="block text-[11px] text-gray-600 mb-1">Choose date</label>
              <div className="flex gap-2">
                {dateRange.map(d => (
                  <button key={d.date} onClick={()=>{ setSelectedDate(d.date); setSelectedSlot(null); }} className={`flex flex-col items-center border rounded-md px-3 py-2 text-xs min-w-[70px] ${selectedDate===d.date? 'border-black bg-gray-50':'border-gray-200 hover:border-gray-400'}`}>
                    <span className="font-semibold">{new Date(d.date).toLocaleDateString(undefined,{weekday:'short'}).toUpperCase()}</span>
                    <span className="text-sm">{new Date(d.date).toLocaleDateString(undefined,{month:'numeric',day:'numeric'})}</span>
                  </button>
                ))}
                {dateRange.length===0 && <span className="text-xs text-gray-500">No dates</span>}
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[11px] text-gray-600 mb-1">Choose time</label>
              <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto">
                {slotsGrouped.map(s => {
                  const active = selectedSlot===s.iso;
                  return (
                    <button key={s.iso} onClick={()=>chooseSlot(s)} className={`text-[11px] px-2 py-1 border rounded-md ${active? 'bg-black text-white border-black':'border-gray-200 hover:border-gray-400'}`}>{s.label}</button>
                  );
                })}
                {slotsGrouped.length===0 && <div className="col-span-full text-[11px] text-gray-500">No time slots</div>}
              </div>
            </div>
            <button disabled={!selectedSlot} onClick={()=>setStep('pay')} className={`w-full rounded-md py-3 text-sm font-medium ${selectedSlot? 'bg-black text-white hover:opacity-90':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Confirm time →</button>
          </div>
        )}

        {step==='pay' && (
          <div className="border rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold mb-1">Items - {cart.length}</h3>
            <div className="divide-y border rounded-md mb-4">
              {cart.map(i => (
                <div key={i.id} className="flex items-center justify-between px-4 py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden"><img src={i.image || '/abstract-location.png'} alt="" className="w-full h-full object-cover" /></div>
                    <div>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-[11px] text-gray-500">{i.qty}x</div>
                    </div>
                  </div>
                  <div className="tabular-nums font-medium">${(i.price*i.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs mb-2"><span>Subtotal</span><span className="tabular-nums">${total.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs font-semibold border-t pt-2 mb-4"><span>Total</span><span className="tabular-nums">${total.toFixed(2)}</span></div>
            <button disabled={!cart.length || !selectedSlot} onClick={placeOrder} className={`w-full rounded-md py-3 text-sm font-medium ${(!cart.length||!selectedSlot)?'bg-gray-200 text-gray-500 cursor-not-allowed':'bg-black text-white hover:opacity-90'}`}>{submitting? 'Placing…':'Place order'}</button>
            {orderResult && orderResult.success===false && <div className="mt-3 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{orderResult.message}</div>}
          </div>
        )}

        {step==='result' && orderResult && (
          <div className="border rounded-lg p-6 mb-6">
            {orderResult.success ? (
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold text-green-600">Order Confirmed</h3>
                <p className="text[12px] text-gray-600">Order ID: <span className="font-medium">#{orderResult.orderId}</span></p>
                {selectedSlot && <p className="text-[12px] text-gray-600">Pickup: {new Date(selectedSlot).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</p>}
                <Link href={`/${params.name}`} className="inline-block rounded-md bg-black text-white px-4 py-2 text-[12px] font-medium">Done</Link>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold text-red-600">Order Failed</h3>
                <p className="text-[12px] text-gray-600">{orderResult.message || 'There was an error placing your order.'}</p>
                <div className="flex gap-2">
                  <button onClick={()=>{ setStep('pay'); setOrderResult(null); }} className="flex-1 border rounded-md px-3 py-2 text-[12px]">← Back</button>
                  <button onClick={placeOrder} disabled={submitting} className={`flex-1 rounded-md px-3 py-2 text-[12px] font-medium ${submitting? 'bg-gray-300 text-gray-500':'bg-black text-white hover:opacity-90'}`}>{submitting? 'Retrying…':'Retry'}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
