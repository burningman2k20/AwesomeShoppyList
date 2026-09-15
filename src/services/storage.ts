import { MasterCatalogItem, ShoppingItem, ShoppingList } from '../types';

const MASTER_CATALOG_KEY = 'shopping_app_master_catalog';
const LISTS_KEY = 'shopping_app_saved_lists';
const ACTIVE_LIST_ID_KEY = 'shopping_app_active_list_id';

const DEFAULT_CATALOG: MasterCatalogItem[] = [
  { id: 'cat-1', name: 'Whole Milk', defaultCost: 3.89, store: 'Costco', department: 'Dairy', lastUsedAt: Date.now() },
  { id: 'cat-2', name: 'Eggs (18 count)', defaultCost: 4.49, store: 'Costco', department: 'Dairy', lastUsedAt: Date.now() },
  { id: 'cat-3', name: 'Organic Bananas', defaultCost: 1.99, store: 'Trader Joe\'s', department: 'Produce', lastUsedAt: Date.now() },
  { id: 'cat-4', name: 'Honeycrisp Apples', defaultCost: 4.99, store: 'Whole Foods', department: 'Produce', lastUsedAt: Date.now() },
  { id: 'cat-5', name: 'Sourdough Bread', defaultCost: 4.29, store: 'Trader Joe\'s', department: 'Bakery', lastUsedAt: Date.now() },
  { id: 'cat-6', name: 'Chicken Breast (2 lb)', defaultCost: 8.99, store: 'Costco', department: 'Meat', lastUsedAt: Date.now() },
  { id: 'cat-7', name: 'Ground Beef 85/15', defaultCost: 6.49, store: 'Safeway', department: 'Meat', lastUsedAt: Date.now() },
  { id: 'cat-8', name: 'Organic Spinach', defaultCost: 2.99, store: 'Trader Joe\'s', department: 'Produce', lastUsedAt: Date.now() },
  { id: 'cat-9', name: 'Paper Towels (12 roll)', defaultCost: 19.99, store: 'Costco', department: 'Household', lastUsedAt: Date.now() },
  { id: 'cat-10', name: 'Extra Virgin Olive Oil', defaultCost: 12.49, store: 'Costco', department: 'Pantry', lastUsedAt: Date.now() },
  { id: 'cat-11', name: 'Greek Yogurt (32 oz)', defaultCost: 5.29, store: 'Safeway', department: 'Dairy', lastUsedAt: Date.now() },
  { id: 'cat-12', name: 'Almond Milk', defaultCost: 3.49, store: 'Target', department: 'Dairy', lastUsedAt: Date.now() },
  { id: 'cat-13', name: 'Avocados (4 pack)', defaultCost: 3.99, store: 'Costco', department: 'Produce', lastUsedAt: Date.now() },
  { id: 'cat-14', name: 'Dish Soap', defaultCost: 3.19, store: 'Target', department: 'Household', lastUsedAt: Date.now() },
];

const DEFAULT_ITEMS: ShoppingItem[] = [
  { id: 'item-1', name: 'Whole Milk', cost: 3.89, quantity: 1, store: 'Costco', department: 'Dairy', isChecked: false },
  { id: 'item-2', name: 'Organic Bananas', cost: 1.99, quantity: 2, store: 'Trader Joe\'s', department: 'Produce', isChecked: true },
  { id: 'item-3', name: 'Honeycrisp Apples', cost: 4.99, quantity: 1, store: 'Trader Joe\'s', department: 'Produce', isChecked: false },
  { id: 'item-4', name: 'Chicken Breast (2 lb)', cost: 8.99, quantity: 1, store: 'Costco', department: 'Meat', isChecked: false },
  { id: 'item-5', name: 'Paper Towels (12 roll)', cost: 19.99, quantity: 1, store: 'Costco', department: 'Household', isChecked: false },
];

export function getMasterCatalog(): MasterCatalogItem[] {
  try {
    const raw = localStorage.getItem(MASTER_CATALOG_KEY);
    if (!raw) {
      localStorage.setItem(MASTER_CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG));
      return DEFAULT_CATALOG;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load master catalog', e);
    return DEFAULT_CATALOG;
  }
}

export function saveMasterCatalog(items: MasterCatalogItem[]): void {
  try {
    localStorage.setItem(MASTER_CATALOG_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save master catalog', e);
  }
}

export function upsertMasterItem(itemData: {
  name: string;
  defaultCost: number;
  store: string;
  department: string;
}): MasterCatalogItem {
  const catalog = getMasterCatalog();
  const normalizedName = itemData.name.trim();
  const existingIndex = catalog.findIndex(
    (c) => c.name.toLowerCase() === normalizedName.toLowerCase()
  );

  const updatedItem: MasterCatalogItem = {
    id: existingIndex >= 0 ? catalog[existingIndex].id : 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: normalizedName,
    defaultCost: Number(itemData.defaultCost) || 0,
    store: itemData.store.trim() || 'General',
    department: itemData.department.trim() || 'General',
    lastUsedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    catalog[existingIndex] = updatedItem;
  } else {
    catalog.push(updatedItem);
  }

  saveMasterCatalog(catalog);
  return updatedItem;
}

export function deleteMasterItem(id: string): void {
  const catalog = getMasterCatalog().filter((c) => c.id !== id);
  saveMasterCatalog(catalog);
}

export function getSavedLists(): ShoppingList[] {
  try {
    const raw = localStorage.getItem(LISTS_KEY);
    if (!raw) {
      const initialList: ShoppingList = {
        id: 'default-list',
        name: 'Weekly Groceries',
        items: DEFAULT_ITEMS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      localStorage.setItem(LISTS_KEY, JSON.stringify([initialList]));
      localStorage.setItem(ACTIVE_LIST_ID_KEY, initialList.id);
      return [initialList];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved lists', e);
    return [];
  }
}

export function saveLists(lists: ShoppingList[]): void {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error('Failed to save lists', e);
  }
}

export function getActiveListId(): string {
  const stored = localStorage.getItem(ACTIVE_LIST_ID_KEY);
  if (stored) return stored;
  const lists = getSavedLists();
  return lists[0]?.id || 'default-list';
}

export function setActiveListId(id: string): void {
  localStorage.setItem(ACTIVE_LIST_ID_KEY, id);
}

export function exportListToJson(list: ShoppingList, filename: string): void {
  const cleanFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    listName: list.name,
    items: list.items,
  };
  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = cleanFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseListFromJson(jsonString: string): { name: string; items: ShoppingItem[] } {
  const parsed = JSON.parse(jsonString);
  let name = 'Imported List';
  let rawItems: any[] = [];

  if (Array.isArray(parsed)) {
    // Array of items
    rawItems = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (parsed.listName) name = parsed.listName;
    else if (parsed.name) name = parsed.name;

    if (Array.isArray(parsed.items)) {
      rawItems = parsed.items;
    }
  }

  const items: ShoppingItem[] = rawItems.map((item, idx) => ({
    id: item.id || `imported-${Date.now()}-${idx}`,
    name: String(item.name || 'Unnamed Item').trim(),
    cost: typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0,
    quantity: typeof item.quantity === 'number' ? Math.max(1, item.quantity) : parseInt(item.quantity, 10) || 1,
    store: String(item.store || 'General').trim(),
    department: String(item.department || 'General').trim(),
    isChecked: Boolean(item.isChecked),
  }));

  return { name, items };
}
