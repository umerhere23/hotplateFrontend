export interface OptionGroup {
  id?: string | number;
  name: string;
  type: 'modifier' | 'variation';
  options: Option[];
  requireSelection: boolean;
  enableInventory: boolean;
}

export interface Option {
  id?: string | number;
  name: string;
  priceAdjustment: number;
}

export interface SpecialInstructions {
  allowCustomerNotes: boolean;
  requireNote: boolean;
}

export interface MenuItemData {
  id?: number | string;
  event_id: number | string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  optionGroups?: OptionGroup[];
  specialInstructions?: SpecialInstructions;
  taxRate?: number;
}
