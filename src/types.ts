export interface ShoppingItem {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  store: string;
  department: string;
  isChecked: boolean;
}

export interface MasterCatalogItem {
  id: string;
  name: string;
  defaultCost: number;
  store: string;
  department: string;
  lastUsedAt?: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: number;
  updatedAt: number;
}

export interface FilterState {
  store: string; // "All" or specific store name
  department: string; // "All" or specific department name
}
