import React, { useState, useRef, useEffect } from "react";
import { getEvents } from "@/services/api";
import api from "@/lib/api-client";
function AddDiscountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [restrictFirstTime, setRestrictFirstTime] = useState(false);
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState("");
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [applicability, setApplicability] = useState<'general' | 'event' | 'customer'>('general');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [showEndDate, setShowEndDate] = useState(false);
  const [endDate, setEndDate] = useState<string>("");

  // Form fields
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState<number | ''>("");
  const [maxDiscountValue, setMaxDiscountValue] = useState<number | ''>("");
  const [minSubtotal, setMinSubtotal] = useState<number | ''>("");
  const [maxUses, setMaxUses] = useState<number | ''>("");

  // Event search
  const [eventQuery, setEventQuery] = useState("");
  const [eventResults, setEventResults] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [eventLoading, setEventLoading] = useState(false);

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function searchEvents() {
      if (!eventQuery) {
        setEventResults([]);
        setEventLoading(false);
        return;
      }
      try {
        setEventLoading(true);
        console.log('[Event Search] Searching for:', eventQuery);
        const events = await getEvents();
        console.log('[Event Search] Got events:', events);
        if (!mounted) return;
        const filtered = events.filter((e) => (e.title || '').toLowerCase().includes(eventQuery.toLowerCase()));
        console.log('[Event Search] Filtered events:', filtered);
        setEventResults(filtered.slice(0, 8));
      } catch (err) {
        console.error('[Event Search] Error:', err);
      } finally {
        if (mounted) setEventLoading(false);
      }
    }
    const t = setTimeout(searchEvents, 250);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [eventQuery]);

  useEffect(() => {
    let mounted = true;
    async function searchCustomers() {
      if (!customerQuery) {
        setCustomerResults([]);
        setCustomerLoading(false);
        return;
      }
      try {
        setCustomerLoading(true);
        const { ok, data } = await api.get(`/customers`, { params: { q: customerQuery } });
        if (!mounted) return;
        if (ok && Array.isArray(data)) setCustomerResults(data.slice(0, 8));
        else setCustomerResults([]);
      } catch (err) {
        console.error(err);
        setCustomerResults([]);
      } finally {
        if (mounted) setCustomerLoading(false);
      }
    }
    const t = setTimeout(searchCustomers, 250);
    return () => { mounted = false; clearTimeout(t); };
  }, [customerQuery]);

  const handleSubmit = async () => {
    if (!title.trim() || !code.trim() || amount === '' || amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const payload: any = {
      title: title.trim(),
      code: code.trim().toUpperCase(),
      type: discountType,
      amount: Number(amount),
      max_discount_value: maxDiscountValue !== '' ? Number(maxDiscountValue) : undefined,
      min_subtotal: minSubtotal !== '' ? Number(minSubtotal) : undefined,
      max_uses: maxUses !== '' ? Number(maxUses) : undefined,
      max_uses_per_customer: maxUsesPerCustomer !== '' ? Number(maxUsesPerCustomer) : undefined,
      restrict_first_time: restrictFirstTime,
      applicability,
      event_id: applicability === 'event' && selectedEvent ? selectedEvent.id : undefined,
      customer_id: applicability === 'customer' && selectedCustomer ? selectedCustomer.id : undefined,
      start_date: startDate || undefined,
      end_date: showEndDate && endDate ? endDate : undefined,
    };

    if (applicability === 'event' && !selectedEvent) {
      alert('Please select an event for event discount');
      return;
    }

    if (applicability === 'customer' && !selectedCustomer) {
      alert('Please select a customer for customer discount');
      return;
    }

    try {
      const { ok, data, message } = await api.post('/discounts', { data: payload });
      if (!ok) {
        alert(`Failed to create discount: ${message || 'Unknown error'}`);
        return;
      }
      alert('Discount created successfully');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error creating discount');
    }
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 flex justify-end">
        <div className="w-full max-w-md h-full bg-white shadow-xl p-6 overflow-y-auto relative animate-slidein rounded-l-xl">
          <button
            className="absolute top-4 right-4 text-xl text-gray-400 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-lg font-bold mb-4">Add a discount code</h2>
          {/* Title */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-sm">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full border rounded-lg px-3 py-1.5 mb-1 text-sm" placeholder="Title" />
            <div className="text-gray-500 text-xs">Discount title for internal use and reference</div>
          </div>
          {/* Code */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-sm">Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} type="text" className="w-full border rounded-lg px-3 py-1.5 mb-1 text-sm" placeholder="Code" />
            <div className="text-gray-500 text-xs">Discount code that customers will enter at checkout</div>
          </div>
          {/* Discount type */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-sm">Discount type</label>
            <div className="flex rounded-lg overflow-hidden bg-gray-100">
              <button
                type="button"
                className={`flex-1 py-2 font-semibold text-sm text-center transition-all duration-150 border ${discountType === 'percentage' ? 'bg-white text-gray-900 border-gray-900 shadow' : 'text-gray-500 border-transparent'}`}
                onClick={() => setDiscountType('percentage')}
              >
                Percentage (%)
              </button>
              <button
                type="button"
                className={`flex-1 py-2 font-semibold text-sm text-center transition-all duration-150 border ${discountType === 'flat' ? 'bg-white text-gray-900 border-gray-900 shadow' : 'text-gray-500 border-transparent'}`}
                onClick={() => setDiscountType('flat')}
              >
                Flat ($)
              </button>
            </div>
          </div>
          {/* Discount amount */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-sm">Discount amount</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">{discountType === 'percentage' ? '%' : '$'}</span>
              <input value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="0.00" min="0" />
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {discountType === 'percentage'
                ? 'Amount of the discount, expressed as a percent of the order subtotal'
                : 'Amount of the discount, expressed as a flat dollar amount'}
            </div>
          </div>
          {discountType === 'percentage' && (
            <div className="mb-3">
              <label className="block font-medium mb-1 text-sm">Maximum discount value</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">$</span>
                <input value={maxDiscountValue} onChange={e => setMaxDiscountValue(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="0.00" min="0" />
              </div>
              <div className="text-gray-500 text-xs mt-1">The value of the applied discount will be capped at the provided amount</div>
            </div>
          )}
          {/* Code applicability */}
          <div className="mb-5">
            <label className="block font-medium mb-2 text-sm">Code applicability</label>
            <div className="space-y-2">
              <div className={`border rounded-lg px-3 py-2 flex items-center justify-between ${applicability === 'general' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                <div>
                  <div className="font-semibold text-sm">General discount</div>
                  <div className="text-gray-500 text-xs">Code will be useable by all customers and for all events</div>
                </div>
                <input type="radio" name="applicability" checked={applicability === 'general'} onChange={() => setApplicability('general')} className="accent-black" />
              </div>
              <div className={`border rounded-lg px-3 py-2 ${applicability === 'event' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'} mb-2`}
                style={{ boxShadow: applicability === 'event' ? '0 0 0 2px #111 inset' : undefined }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Event discount</div>
                    <div className="text-gray-500 text-xs">Code will only be useable for a specific event</div>
                  </div>
                  <input type="radio" name="applicability" checked={applicability === 'event'} onChange={() => setApplicability('event')} className="accent-black" />
                </div>
                {applicability === 'event' && (
                  <>
                    <hr className="my-3" />
                    <div className="relative">
                      {!selectedEvent ? (
                        <div className="relative z-50">
                          <input
                            value={eventQuery}
                            onChange={e => setEventQuery(e.target.value)}
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="Search by event name"
                          />
                          {eventLoading && (
                            <div className="absolute z-[9999] w-full border rounded-lg bg-white mt-1 px-3 py-2 shadow-2xl text-sm text-gray-500">
                              Loading events...
                            </div>
                          )}
                          {!eventLoading && eventQuery && eventResults.length === 0 && (
                            <div className="absolute z-[9999] w-full border rounded-lg bg-white mt-1 px-3 py-2 shadow-2xl text-sm text-gray-500">
                              No events found
                            </div>
                          )}
                          {!eventLoading && eventResults.length > 0 && (
                            <div className="absolute z-[9999] w-full border rounded-lg bg-white mt-1 max-h-40 overflow-y-auto shadow-2xl">
                              {eventResults.map(ev => (
                                <div 
                                  key={ev.id} 
                                  onClick={() => { 
                                    setSelectedEvent(ev); 
                                    setEventQuery(''); 
                                    setEventResults([]); 
                                  }} 
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                >
                                  {ev.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
                          <div className="text-sm">
                            <span className="text-gray-600">Selected event:</span>
                            <span className="font-medium ml-2">{selectedEvent.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedEvent(null)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className={`border rounded-lg px-3 py-2 flex items-center justify-between ${applicability === 'customer' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                <div>
                  <div className="font-semibold text-sm">Customer discount</div>
                  <div className="text-gray-500 text-xs">Code will only be useable by a specific customer</div>
                </div>
                <input type="radio" name="applicability" checked={applicability === 'customer'} onChange={() => setApplicability('customer')} className="accent-black" />
              </div>
            </div>
          </div>

          {/* Extra fields for General, Event, or Customer discount */}
          {(applicability === 'general' || applicability === 'event' || applicability === 'customer') && (
            <div className="mb-5 space-y-3">
              {/* Event discount: show event search */}
              {/* {applicability === 'event' && (
                <div className="border rounded-lg px-3 py-2 mb-2" style={{ boxShadow: '0 0 0 2px #111 inset' }}>
                  <div className="font-medium text-sm mb-1">Customer</div>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                    placeholder="Search by event name"
                  />
                </div>
              )} */}
              {/* Customer discount: show customer search */}
              {applicability === 'customer' && (
                <div className="border rounded-lg px-3 py-2 mb-2 relative z-40" style={{ boxShadow: '0 0 0 2px #111 inset' }}>
                  <div className="font-medium text-sm mb-1">Customer</div>
                  {!selectedCustomer ? (
                    <div className="relative">
                      <input
                        value={customerQuery}
                        onChange={e => setCustomerQuery(e.target.value)}
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                        placeholder="Search by name, email, or phone"
                      />
                      {customerLoading && (
                        <div className="absolute z-[9999] w-full border rounded-lg bg-white mt-1 px-3 py-2 shadow-2xl text-sm text-gray-500">
                          Loading customers...
                        </div>
                      )}
                      {!customerLoading && customerQuery && customerResults.length === 0 && (
                        <div className="absolute z-[9999] w-full border rounded-lg bg-white mt-1 px-3 py-2 shadow-2xl text-sm text-gray-500">
                          No customers found
                        </div>
                      )}
                      {!customerLoading && customerResults.length > 0 && (
                        <div className="absolute z-[9999] w-full border rounded bg-white mt-1 max-h-40 overflow-y-auto shadow-2xl">
                          {customerResults.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => { 
                                setSelectedCustomer(c); 
                                setCustomerQuery(''); 
                                setCustomerResults([]); 
                              }} 
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              {c.firstName || c.name} {c.lastName || ''} {c.email ? `(${c.email})` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Selected customer:</span>
                        <span className="font-medium ml-2">{selectedCustomer.email || selectedCustomer.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Start/end date for general and customer discount */}
              {(applicability === 'general' || applicability === 'customer') && (
                <div>
                  <label className="block font-medium mb-1 text-sm">Start date</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="date"
                      className="border rounded-lg px-3 py-2 text-sm font-medium"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                    {!showEndDate ? (
                      <button
                        className="text-gray-700 text-sm font-medium"
                        type="button"
                        onClick={() => setShowEndDate(true)}
                      >
                        Add end date
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          className="border rounded-lg px-3 py-2 text-sm font-medium"
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                        />
                        <button
                          className="text-gray-500 text-xs px-2 py-1 border rounded"
                          type="button"
                          onClick={() => { setShowEndDate(false); setEndDate(""); }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label className="block font-medium mb-1 text-sm">Minimum subtotal required</label>
                <input value={minSubtotal} onChange={e => setMinSubtotal(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" min="0" />
                <div className="text-gray-500 text-xs">The discount code will only be useable if the provided cart subtotal is reached</div>
              </div>
              <div>
                <label className="block font-medium mb-1 text-sm">Maximum uses</label>
                <input value={maxUses} onChange={e => setMaxUses(e.target.value === '' ? '' : Number(e.target.value))} type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Maximum uses" min="0" />
                <div className="text-gray-500 text-xs">Code will only be able to be used the provided number of times</div>
              </div>
              {/* Customer options (only for general/event) */}
              {(applicability === 'general' || applicability === 'event') && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">Customer options</div>
                    <button className="bg-gray-900 text-white rounded-lg px-4 py-2 font-semibold text-sm" type="button" onClick={() => setShowCustomerModal(v => !v)}>{showCustomerModal ? 'Close' : 'Edit'}</button>
                  </div>
                  <div className="text-gray-500 text-xs mb-2">Current: All customers; Unlimited uses</div>
                  {showCustomerModal && (
                    <>
                      <hr className="mb-4" />
                      <div className="flex items-center mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="relative inline-block w-10 h-6">
                            <input type="checkbox" checked={restrictFirstTime} onChange={() => setRestrictFirstTime(v => !v)} className="sr-only peer" />
                            <span className={`absolute left-0 top-0 w-10 h-6 rounded-full transition bg-gray-200 peer-checked:bg-gray-900`}></span>
                            <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition peer-checked:translate-x-4 border border-gray-300`}></span>
                          </span>
                          <span className="font-semibold text-sm">Restrict to first-time customers</span>
                        </label>
                      </div>
                      <div className="text-gray-500 text-xs mb-4">Discount code will only be usable by customers who haven't yet placed an order with you</div>
                      {!restrictFirstTime && (
                        <div className="mb-2">
                          <label className="block font-medium mb-1 text-sm">Maximum uses per customer</label>
                          <input
                            type="number"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="Maximum uses per customer"
                            min="0"
                            value={maxUsesPerCustomer}
                            onChange={e => setMaxUsesPerCustomer(e.target.value)}
                          />
                          <div className="text-gray-500 text-xs">Each customer will only be able to use this code the provided number of times</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <button onClick={handleSubmit} className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold text-sm">Submit</button>
        </div>
      </div>
    </>
  );
}
const columnOptions = [
  { key: 'code', label: 'Code' },
  { key: 'title', label: 'Title' },
  { key: 'amount', label: 'Amount' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'minSubtotal', label: 'Minimum Subtotal' },
  { key: 'maxDiscount', label: 'Max Discount Value' },
  { key: 'usesRemaining', label: 'Uses Remaining' },
  { key: 'status', label: 'Status' },
  { key: 'menu', label: 'Menu' },
];

export default function DiscountsTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [showDropdown, setShowDropdown] = useState(false);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [columns, setColumns] = useState<Record<string, boolean>>({
    code: true,
    title: false,
    amount: true,
    startDate: false,
    endDate: false,
    minSubtotal: false,
    maxDiscount: false,
    usesRemaining: false,
    status: true,
    menu: true,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDiscounts();
  }, [activeTab]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const { ok, data } = await api.get('/discounts', { params: { status: activeTab, search: searchQuery } });
      if (ok && Array.isArray(data)) {
        setDiscounts(data);
      } else {
        setDiscounts([]);
      }
    } catch (err) {
      console.error(err);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) fetchDiscounts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  function handleToggleColumn(key: string) {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleResetColumns() {
    setColumns({
      code: true,
      title: false,
      amount: true,
      startDate: false,
      endDate: false,
      minSubtotal: false,
      maxDiscount: false,
      usesRemaining: false,
      status: true,
      menu: true,
    });
  }
  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex w-[500px] bg-gray-100 rounded-lg overflow-hidden">
          <button
            className={`flex-1 py-3 text-lg font-medium transition-colors duration-150 ${activeTab === 'active' ? 'bg-white text-gray-800 shadow-sm' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button
            className={`flex-1 py-3 text-lg font-medium transition-colors duration-150 ${activeTab === 'inactive' ? 'bg-white text-gray-800 shadow-sm' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setActiveTab('inactive')}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Heading and Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {activeTab === 'active' ? 'Active Discount Codes' : 'Inactive Discount Codes'}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Search..." className="border rounded-lg py-2 px-4 w-48 focus:outline-none" />
          </div>
          <div className="relative">
            <button
              className="border rounded-lg py-2 px-4 font-medium flex items-center gap-1"
              onClick={() => setShowDropdown((v) => !v)}
            >
              <span>View</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12s4-8 9-8 9 8 9 8-4 8-9 8-9-8-9-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            {showDropdown && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10 p-3 text-sm">
                <div className="font-medium text-gray-500 mb-2">Toggle columns</div>
                <ul className="mb-2">
                  {columnOptions.map((col) => (
                    <li key={col.key} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={columns[col.key]}
                        onChange={() => handleToggleColumn(col.key)}
                        className="accent-black"
                        id={`col-${col.key}`}
                      />
                      <label htmlFor={`col-${col.key}`} className={columns[col.key] ? "font-semibold" : "text-gray-700"}>
                        {col.label}
                      </label>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full text-center py-2 text-sm font-semibold text-gray-900 border-t mt-2"
                  onClick={handleResetColumns}
                >
                  Reset columns
                </button>
              </div>
            )}
          </div>
          <button
            className="bg-gray-900 text-white rounded-lg py-2 px-6 font-semibold flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <span>+ Add</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {columnOptions.map((col) =>
                columns[col.key] ? (
                  <th key={col.key} className="py-3 px-6 text-left font-medium text-gray-700">
                    {col.label} {['amount', 'status'].includes(col.key) && <span className="inline-block align-middle">&#8597;</span>}
                  </th>
                ) : null
              )}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={Object.values(columns).filter(Boolean).length} className="py-6 px-6 text-gray-500 text-center">Loading...</td>
              </tr>
            )}
            {!loading && discounts.length === 0 && (
              <tr>
                <td colSpan={Object.values(columns).filter(Boolean).length} className="py-6 px-6 text-gray-500">No results.</td>
              </tr>
            )}
            {!loading && discounts.map((discount) => (
              <tr key={discount.id} className="border-t hover:bg-gray-50">
                {columns.code && <td className="py-4 px-6 font-medium">{discount.code}</td>}
                {columns.title && <td className="py-4 px-6">{discount.title}</td>}
                {columns.amount && <td className="py-4 px-6">{discount.type === 'percentage' ? `${discount.amount}%` : `$${parseFloat(discount.amount).toFixed(2)}`}</td>}
                {columns.startDate && <td className="py-4 px-6">{discount.startDate ? new Date(discount.startDate).toLocaleDateString() : '-'}</td>}
                {columns.endDate && <td className="py-4 px-6">{discount.endDate ? new Date(discount.endDate).toLocaleDateString() : '-'}</td>}
                {columns.minSubtotal && <td className="py-4 px-6">{discount.minSubtotal ? `$${parseFloat(discount.minSubtotal).toFixed(2)}` : '-'}</td>}
                {columns.maxDiscount && <td className="py-4 px-6">{discount.maxDiscountValue ? `$${parseFloat(discount.maxDiscountValue).toFixed(2)}` : '-'}</td>}
                {columns.usesRemaining && <td className="py-4 px-6">{discount.maxUses ? `${discount.maxUses - discount.usesCount}` : '∞'}</td>}
                {columns.status && <td className="py-4 px-6"><span className={`px-2 py-1 rounded text-xs font-medium ${discount.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{discount.status}</span></td>}
                {columns.menu && (
                  <td className="py-4 px-6">
                    <button className="text-gray-500 hover:text-gray-700">⋮</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Discount Modal */}
      <AddDiscountModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
