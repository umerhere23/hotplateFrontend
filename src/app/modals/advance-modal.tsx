"use client";
import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";

interface AdvancedModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultHiddenFromStorefront?: boolean;
    defaultCheckoutTimeLimit?: number;
    onSave?: (data: { hide_from_storefront: boolean; checkout_time_limit: number }) => Promise<void> | void;
}

export default function AdvancedModal({ isOpen, onClose, defaultHiddenFromStorefront = false, defaultCheckoutTimeLimit = 5, onSave }: AdvancedModalProps) {
    const [hidden, setHidden] = useState<boolean>(defaultHiddenFromStorefront);
    const [checkoutLimit, setCheckoutLimit] = useState<number>(defaultCheckoutTimeLimit);
    const [saving, setSaving] = useState<boolean>(false);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold mb-4">Advanced Options</h2>

                {/* Switch */}
                <div className="flex items-center  mb-4">
                    <Switch.Root
                        className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-black transition-colors"
                        id="walkup-switch"
                        checked={hidden}
                        onCheckedChange={(v) => setHidden(!!v)}
                    >
                        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 translate-x-0 data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                    <label className="text-sm ms-4">
                        Make this event private (hidden from storefront)
                    </label>
                </div>
                {/* Checkout Time Limit */}
                <div className="mb-4">
            <label className="block text-sm mb-1" htmlFor="checkout-time-limit">Checkout Time Limit</label>
                    <div className="flex items-center">
                        <input
                            type="number"
                            value={checkoutLimit}
                            onChange={(e) => setCheckoutLimit(Math.max(1, Number(e.target.value) || 1))}
                id="checkout-time-limit"
                title="Checkout time limit in minutes"
                className="w-16 border border-gray-300 rounded-md p-1 text-center"
                        />
                        <span className="ml-2 text-sm">minutes</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                    >
                        Discard
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                setSaving(true);
                                if (onSave) await onSave({ hide_from_storefront: hidden, checkout_time_limit: checkoutLimit });
                                onClose();
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className={`px-4 py-2 rounded-md ${saving ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'} text-white`}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
