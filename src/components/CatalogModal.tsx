import React, { useState, useMemo } from 'react';
import { MasterCatalogItem } from '../types';
import { X, Search, Database, Plus, Trash2, Edit3, ShoppingCart, Check } from 'lucide-react';

interface CatalogModalProps {
  isOpen: boolean;
  catalog: MasterCatalogItem[];
  onDismiss: () => void;
  onAddItemToList: (item: MasterCatalogItem) => void;
  onSaveCatalogItem: (item: { name: string; defaultCost: number; store: string; department: string }) => void;
  onDeleteCatalogItem: (id: string) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  catalog,
  onDismiss,
  onAddItemToList,
  onSaveCatalogItem,
  onDeleteCatalogItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('All');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // New item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newStore, setNewStore] = useState('Costco');
  const [newDept, setNewDept] = useState('Produce');

  const stores = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((i) => set.add(i.store));
    return ['All', ...Array.from(set).sort()];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.store.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStore = selectedStore === 'All' || item.store.toLowerCase() === selectedStore.toLowerCase();
      return matchSearch && matchStore;
    });
  }, [catalog, searchQuery, selectedStore]);

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const cost = parseFloat(newCost) || 0;
    onSaveCatalogItem({
      name: newName.trim(),
      defaultCost: cost,
      store: newStore.trim() || 'General',
      department: newDept.trim() || 'General',
    });
    setNewName('');
    setNewCost('');
    setShowAddForm(false);
  };

  const handleQuickAdd = (item: MasterCatalogItem) => {
    onAddItemToList(item);
    setJustAddedId(item.id);
    setTimeout(() => {
      setJustAddedId((prev) => (prev === item.id ? null : prev));
    }, 1200);
  };

  return (
    <div
      id="catalog-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onDismiss}
    >
      <div
        id="catalog-modal-card"
        className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Database Item Catalog</h2>
              <p className="text-xs text-zinc-500">
                {catalog.length} saved items in your local device catalog
              </p>
            </div>
          </div>
          <button
            id="close-catalog-btn"
            type="button"
            onClick={onDismiss}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Store Filter */}
        <div className="p-4 border-b border-zinc-100 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="catalog-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by name, dept, or store..."
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <button
              id="toggle-add-catalog-item"
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'New Item'}</span>
            </button>
          </div>

          {/* Quick Store Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {stores.map((s) => (
              <button
                key={`cat-store-${s}`}
                type="button"
                onClick={() => setSelectedStore(s)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 border transition-all ${
                  selectedStore.toLowerCase() === s.toLowerCase()
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Add New Catalog Item Drawer Form */}
        {showAddForm && (
          <form onSubmit={handleAddCustom} className="p-4 bg-emerald-50/50 border-b border-emerald-100 space-y-3">
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Add New Item to Master Database</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Item name *"
                className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs"
                required
              />
              <input
                type="number"
                step="0.01"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                placeholder="Default cost ($)"
                className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                placeholder="Default store"
                className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="Default department"
                className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
              >
                Save to Database
              </button>
            </div>
          </form>
        )}

        {/* Catalog Items List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredCatalog.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 text-xs">
              No catalog items match your search or filter.
            </div>
          ) : (
            filteredCatalog.map((item) => {
              const isAdded = justAddedId === item.id;
              return (
                <div
                  key={item.id}
                  id={`catalog-item-${item.id}`}
                  className="flex items-center justify-between gap-3 p-2.5 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 rounded-xl transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-zinc-900 truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                      <span className="font-semibold text-emerald-700">${item.defaultCost.toFixed(2)}</span>
                      <span>•</span>
                      <span className="bg-zinc-200/80 px-1.5 py-0.5 rounded text-[10px] text-zinc-700">
                        {item.store}
                      </span>
                      <span>•</span>
                      <span className="text-zinc-500 text-[11px]">{item.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id={`catalog-add-${item.id}`}
                      type="button"
                      onClick={() => handleQuickAdd(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to List</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCatalogItem(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>Items added to active shopping lists are saved here automatically.</span>
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
