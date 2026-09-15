import React, { useState, useEffect, useMemo } from 'react';
import { MasterCatalogItem, ShoppingItem } from '../types';
import { X, Sparkles, Database, Plus, Minus, DollarSign, Store, Folder } from 'lucide-react';

interface ItemInputDialogProps {
  isOpen: boolean;
  itemToEdit: ShoppingItem | null;
  catalog: MasterCatalogItem[];
  onDismiss: () => void;
  onConfirm: (data: {
    name: string;
    cost: number;
    quantity: number;
    store: string;
    department: string;
  }) => void;
  onOpenCatalog: () => void;
}

const COMMON_STORES = ['Costco', 'Trader Joe\'s', 'Safeway', 'Target', 'Walmart', 'Whole Foods'];
const COMMON_DEPTS = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry', 'Frozen', 'Household', 'Deli'];

export const ItemInputDialog: React.FC<ItemInputDialogProps> = ({
  isOpen,
  itemToEdit,
  catalog,
  onDismiss,
  onConfirm,
  onOpenCatalog,
}) => {
  const [name, setName] = useState('');
  const [costText, setCostText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [store, setStore] = useState('');
  const [department, setDepartment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCostText(itemToEdit.cost.toFixed(2));
      setQuantity(itemToEdit.quantity || 1);
      setStore(itemToEdit.store || 'General');
      setDepartment(itemToEdit.department || 'General');
    } else {
      setName('');
      setCostText('');
      setQuantity(1);
      setStore('Costco');
      setDepartment('Produce');
    }
    setErrorMessage('');
  }, [itemToEdit, isOpen]);

  // Filter master catalog items based on typed name
  const suggestions = useMemo(() => {
    if (!name.trim()) return [];
    const query = name.toLowerCase().trim();
    return catalog
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [name, catalog]);

  if (!isOpen) return null;

  const handleSelectSuggestion = (suggestedItem: MasterCatalogItem) => {
    setName(suggestedItem.name);
    setCostText(suggestedItem.defaultCost.toFixed(2));
    if (suggestedItem.store) setStore(suggestedItem.store);
    if (suggestedItem.department) setDepartment(suggestedItem.department);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cost = parseFloat(costText);

    if (!cleanName) {
      setErrorMessage('Please enter an item name.');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setErrorMessage('Please enter a valid cost (e.g. 3.99).');
      return;
    }
    if (quantity < 1) {
      setErrorMessage('Quantity must be at least 1.');
      return;
    }

    onConfirm({
      name: cleanName,
      cost,
      quantity,
      store: store.trim() || 'General',
      department: department.trim() || 'General',
    });
  };

  return (
    <div
      id="item-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onDismiss}
    >
      <div
        id="item-input-dialog"
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              {itemToEdit ? 'Edit Shopping Item' : 'Add Shopping Item'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Items are automatically remembered in your local database catalog
            </p>
          </div>
          <button
            id="close-dialog-btn"
            type="button"
            onClick={onDismiss}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Item Name & Catalog Autocomplete */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="item-name-input" className="text-xs font-semibold text-zinc-700">
                Item Name *
              </label>
              <button
                type="button"
                id="open-catalog-shortcut"
                onClick={onOpenCatalog}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                Pick from Catalog ({catalog.length})
              </button>
            </div>
            <input
              id="item-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage('');
              }}
              placeholder="e.g. Honeycrisp Apples, Whole Milk..."
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              autoFocus
            />

            {/* Suggestions from Local Database */}
            {suggestions.length > 0 && (
              <div className="mt-2 p-2 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 mb-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Found in Database:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      id={`suggestion-${item.id}`}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-zinc-800 border border-emerald-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{item.name}</span>
                      <span className="text-emerald-700 font-semibold">${item.defaultCost.toFixed(2)}</span>
                      <span className="text-[10px] text-zinc-500 bg-zinc-100 px-1 py-0.5 rounded">
                        {item.store}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cost and Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-cost-input" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Unit Cost ($) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  id="item-cost-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costText}
                  onChange={(e) => setCostText(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Quantity
              </label>
              <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden bg-zinc-50">
                <button
                  type="button"
                  id="dialog-qty-minus"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  id="item-quantity-input"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full text-center py-2 bg-transparent text-sm font-bold text-zinc-800 focus:outline-hidden"
                />
                <button
                  type="button"
                  id="dialog-qty-plus"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Store Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="item-store-input" className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-zinc-400" />
                Store Category
              </label>
            </div>
            <input
              id="item-store-input"
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="e.g. Costco, Trader Joe's, Safeway..."
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <div className="flex items-center gap-1.5 overflow-x-auto mt-1.5 pb-0.5 no-scrollbar">
              {COMMON_STORES.map((s) => (
                <button
                  key={`quick-store-${s}`}
                  type="button"
                  onClick={() => setStore(s)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium shrink-0 border ${
                    store.toLowerCase() === s.toLowerCase()
                      ? 'bg-zinc-800 text-white border-zinc-800'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Department Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="item-dept-input" className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-zinc-400" />
                Department Category
              </label>
            </div>
            <input
              id="item-dept-input"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Produce, Dairy, Bakery, Meat..."
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <div className="flex items-center gap-1.5 overflow-x-auto mt-1.5 pb-0.5 no-scrollbar">
              {COMMON_DEPTS.map((d) => (
                <button
                  key={`quick-dept-${d}`}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium shrink-0 border ${
                    department.toLowerCase() === d.toLowerCase()
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Live Subtotal Preview */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">Estimated Item Subtotal:</span>
            <span className="text-sm font-bold text-zinc-900">
              ${((parseFloat(costText) || 0) * quantity).toFixed(2)}
            </span>
          </div>

          {/* Dialog Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              id="cancel-item-btn"
              type="button"
              onClick={onDismiss}
              className="px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-item-btn"
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors"
            >
              {itemToEdit ? 'Save Changes' : 'Add to List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
