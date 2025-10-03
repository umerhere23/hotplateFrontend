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

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    async function searchEvents() {
      if (!eventQuery) return setEventResults([]);
      try {
        const events = await getEvents();
        if (!mounted) return;
        const filtered = events.filter((e) => (e.title || '').toLowerCase().includes(eventQuery.toLowerCase()));
        setEventResults(filtered.slice(0, 8));
      } catch (err) {
        console.error(err);
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
      if (!customerQuery) return setCustomerResults([]);
      try {
        const { ok, data } = await api.get(`/customers`, { params: { q: customerQuery } });
        if (!mounted) return;
        if (ok && Array.isArray(data)) setCustomerResults(data.slice(0, 8));
        else setCustomerResults([]);
      } catch (err) {
        console.error(err);
        setCustomerResults([]);
      }
    }
    const t = setTimeout(searchCustomers, 250);
    return () => { mounted = false; clearTimeout(t); };
  }, [customerQuery]);

  const handleSubmit = async () => {
    // Build payload according to backend expectations
    const payload: any = {
      title,
      code,
      type: discountType,
      amount: amount === '' ? 0 : amount,
      max_discount_value: maxDiscountValue === '' ? undefined : maxDiscountValue,
      min_subtotal: minSubtotal === '' ? undefined : minSubtotal,
      max_uses: maxUses === '' ? undefined : maxUses,
      applicability,
      event_id: selectedEvent ? selectedEvent.id : undefined,
      customer_id: selectedCustomer ? selectedCustomer.id : undefined,
      start_date: startDate,
      end_date: showEndDate ? endDate : undefined,
    };

    try {
      const { ok, data, message } = await api.post('/discounts', { data: payload });
      if (!ok) {
        alert(`Failed to create discount: ${message || 'Unknown error'}`);
        return;
      }
      alert('Discount created');
      onClose();
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
          {/* Maximum discount value (only for percentage) */}
          {discountType === 'percentage' && (
            <div className="mb-3">
              <label className="block font-medium mb-1 text-sm">Maximum discount value</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">$</span>
                <input type="number" className="w-full border rounded-lg px-3 py-1.5 text-sm" placeholder="0.00" min="0" />
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
                    <div>
                      <input
                        value={eventQuery}
                        onChange={e => setEventQuery(e.target.value)}
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                        placeholder="Search by event name"
                      />
                      {eventResults.length > 0 && (
                        <div className="border rounded bg-white mt-1 max-h-40 overflow-y-auto">
                          {eventResults.map(ev => (
                            <div key={ev.id} onClick={() => { setSelectedEvent(ev); setEventQuery(''); setEventResults([]); }} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedEvent && <div className="mt-2 text-sm">Selected event: <strong>{selectedEvent.title}</strong></div>}
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
                <div className="border rounded-lg px-3 py-2 mb-2" style={{ boxShadow: '0 0 0 2px #111 inset' }}>
                  <div className="font-medium text-sm mb-1">Customer</div>
                  <input
                    value={customerQuery}
                    onChange={e => setCustomerQuery(e.target.value)}
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                    placeholder="Search by name, email, or phone"
                  />
                  {customerResults.length > 0 && (
                    <div className="border rounded bg-white mt-1 max-h-40 overflow-y-auto">
                      {customerResults.map(c => (
                        <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerQuery(''); setCustomerResults([]); }} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                          {c.firstName || c.name} {c.lastName || ''} {c.email ? `(${c.email})` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedCustomer && <div className="mt-2 text-sm">Selected customer: <strong>{selectedCustomer.email || selectedCustomer.name}</strong></div>}
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
              {/* Minimum subtotal required */}
              <div>
                <label className="block font-medium mb-1 text-sm">Minimum subtotal required</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" min="0" />
                <div className="text-gray-500 text-xs">The discount code will only be useable if the provided cart subtotal is reached</div>
              </div>
              {/* Maximum uses */}
              <div>
                <label className="block font-medium mb-1 text-sm">Maximum uses</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Maximum uses" min="0" />
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

          <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold text-sm">Submit</button>
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
            <input type="text" placeholder="Search..." className="border rounded-lg py-2 px-4 w-48 focus:outline-none" />
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
            <tr>
              <td colSpan={Object.values(columns).filter(Boolean).length} className="py-6 px-6 text-gray-500">No results.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Discount Modal */}
      <AddDiscountModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
