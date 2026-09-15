import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingItem,
  MasterCatalogItem,
  ShoppingList,
  FilterState,
} from './types';
import {
  getMasterCatalog,
  saveMasterCatalog,
  upsertMasterItem,
  deleteMasterItem,
  getSavedLists,
  saveLists,
  getActiveListId,
  setActiveListId,
  exportListToJson,
  parseListFromJson,
} from './services/storage';
import { TopBar } from './components/TopBar';
import { RunningTotalCard } from './components/RunningTotalCard';
import { FilterChips } from './components/FilterChips';
import { ShoppingListView } from './components/ShoppingListView';
import { ItemInputDialog } from './components/ItemInputDialog';
import { CatalogModal } from './components/CatalogModal';
import { SaveAsModal } from './components/SaveAsModal';
import { ListManagerModal } from './components/ListManagerModal';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Check, Info } from 'lucide-react';

export default function App() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [catalog, setCatalog] = useState<MasterCatalogItem[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    store: 'All',
    department: 'All',
  });

  // Modal dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [isListManagerOpen, setIsListManagerOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Non-intrusive Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const loadedLists = getSavedLists();
    const loadedActiveId = getActiveListId();
    const loadedCatalog = getMasterCatalog();

    setLists(loadedLists);
    setActiveId(loadedActiveId);
    setCatalog(loadedCatalog);
  }, []);

  // Sync lists to localStorage whenever lists change
  const updateListsState = useCallback((newLists: ShoppingList[]) => {
    setLists(newLists);
    saveLists(newLists);
  }, []);

  // Active list lookup
  const activeList = useMemo(() => {
    const found = lists.find((l) => l.id === activeId);
    if (found) return found;
    if (lists.length > 0) return lists[0];
    return {
      id: 'default-list',
      name: 'Weekly Groceries',
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }, [lists, activeId]);

  // Update active list items helper
  const updateActiveListItems = useCallback(
    (newItems: ShoppingItem[]) => {
      const updatedLists = lists.map((l) => {
        if (l.id === activeList.id) {
          return {
            ...l,
            items: newItems,
            updatedAt: Date.now(),
          };
        }
        return l;
      });
      updateListsState(updatedLists);
    },
    [lists, activeList.id, updateListsState]
  );

  // Toggle item checked state
  const handleToggleCheck = (item: ShoppingItem) => {
    const updated = activeList.items.map((i) =>
      i.id === item.id ? { ...i, isChecked: !i.isChecked } : i
    );
    updateActiveListItems(updated);
  };

  // Add or Edit Item
  const handleAddOrUpdateItem = (data: {
    name: string;
    cost: number;
    quantity: number;
    store: string;
    department: string;
  }) => {
    // 1. Upsert into local database master catalog (satisfies requirement)
    const updatedCatalogItem = upsertMasterItem({
      name: data.name,
      defaultCost: data.cost,
      store: data.store,
      department: data.department,
    });
    // Refresh catalog state
    setCatalog(getMasterCatalog());

    // 2. Add or update in active list
    if (editingItem) {
      const updatedItems = activeList.items.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              name: data.name,
              cost: data.cost,
              quantity: data.quantity,
              store: data.store,
              department: data.department,
            }
          : i
      );
      updateActiveListItems(updatedItems);
      showToast(`Updated "${data.name}" & saved to catalog`);
    } else {
      const newItem: ShoppingItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: data.name,
        cost: data.cost,
        quantity: data.quantity,
        store: data.store,
        department: data.department,
        isChecked: false,
      };
      updateActiveListItems([...activeList.items, newItem]);
      showToast(`Added "${data.name}" to list & saved to catalog`);
    }

    setIsItemDialogOpen(false);
    setEditingItem(null);
  };

  // Delete item from active list
  const handleDeleteItem = (item: ShoppingItem) => {
    const updated = activeList.items.filter((i) => i.id !== item.id);
    updateActiveListItems(updated);
    showToast(`Removed "${item.name}"`);
  };

  // Change item quantity
  const handleQuantityChange = (item: ShoppingItem, newQty: number) => {
    const updated = activeList.items.map((i) =>
      i.id === item.id ? { ...i, quantity: newQty } : i
    );
    updateActiveListItems(updated);
  };

  // Check / Uncheck all items
  const handleCheckAll = (checked: boolean) => {
    const updated = activeList.items.map((i) => ({ ...i, isChecked: checked }));
    updateActiveListItems(updated);
    showToast(checked ? 'All items checked' : 'All items unchecked');
  };

  // Clear list items
  const handleClearList = () => {
    if (activeList.items.length === 0) return;
    if (window.confirm(`Clear all items from "${activeList.name}"?`)) {
      updateActiveListItems([]);
      showToast('List items cleared');
    }
  };

  // Rename list
  const handleRenameList = (newName: string) => {
    const updated = lists.map((l) =>
      l.id === activeList.id ? { ...l, name: newName, updatedAt: Date.now() } : l
    );
    updateListsState(updated);
    showToast(`Renamed list to "${newName}"`);
  };

  // Create new list
  const handleCreateList = (name: string) => {
    const newList: ShoppingList = {
      id: `list-${Date.now()}`,
      name,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...lists, newList];
    updateListsState(updated);
    setActiveId(newList.id);
    setActiveListId(newList.id);
    showToast(`Created new list "${name}"`);
  };

  // Duplicate list
  const handleDuplicateList = (sourceList: ShoppingList) => {
    const duplicated: ShoppingList = {
      id: `list-${Date.now()}`,
      name: `${sourceList.name} (Copy)`,
      items: sourceList.items.map((item) => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...lists, duplicated];
    updateListsState(updated);
    setActiveId(duplicated.id);
    setActiveListId(duplicated.id);
    showToast(`Duplicated "${sourceList.name}"`);
  };

  // Delete list
  const handleDeleteList = (id: string) => {
    if (lists.length <= 1) {
      showToast('You must keep at least one list.');
      return;
    }
    const target = lists.find((l) => l.id === id);
    if (!window.confirm(`Delete shopping list "${target?.name}"?`)) return;

    const updated = lists.filter((l) => l.id !== id);
    updateListsState(updated);
    if (activeId === id) {
      setActiveId(updated[0].id);
      setActiveListId(updated[0].id);
    }
    showToast('List deleted');
  };

  // Add an item directly from the master catalog into active list
  const handleAddItemFromCatalog = (catalogItem: MasterCatalogItem) => {
    // Check if item already exists in active list
    const existing = activeList.items.find(
      (i) => i.name.toLowerCase() === catalogItem.name.toLowerCase()
    );
    if (existing) {
      // Increment quantity
      const updated = activeList.items.map((i) =>
        i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      updateActiveListItems(updated);
      showToast(`Increased quantity for "${existing.name}"`);
    } else {
      const newItem: ShoppingItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: catalogItem.name,
        cost: catalogItem.defaultCost,
        quantity: 1,
        store: catalogItem.store,
        department: catalogItem.department,
        isChecked: false,
      };
      updateActiveListItems([...activeList.items, newItem]);
      showToast(`Added "${catalogItem.name}" from catalog`);
    }
  };

  // Save new catalog item directly
  const handleSaveCatalogItem = (itemData: {
    name: string;
    defaultCost: number;
    store: string;
    department: string;
  }) => {
    upsertMasterItem(itemData);
    setCatalog(getMasterCatalog());
    showToast(`Saved "${itemData.name}" to database catalog`);
  };

  // Delete catalog item
  const handleDeleteCatalogItem = (id: string) => {
    deleteMasterItem(id);
    setCatalog(getMasterCatalog());
    showToast('Item deleted from catalog');
  };

  // Export list to JSON file (SAF / Custom filename)
  const handleSaveAsFile = (filename: string) => {
    exportListToJson(activeList, filename);
    showToast(`Exported "${filename}"`);
  };

  // Import list from JSON file
  const handleImportFile = (fileContent: string) => {
    try {
      const parsed = parseListFromJson(fileContent);
      if (!parsed.items || parsed.items.length === 0) {
        showToast('No valid items found in JSON file.');
        return;
      }

      // Upsert imported items into master catalog as well
      parsed.items.forEach((item) => {
        upsertMasterItem({
          name: item.name,
          defaultCost: item.cost,
          store: item.store,
          department: item.department,
        });
      });
      setCatalog(getMasterCatalog());

      // Create new list or populate active list
      const importedList: ShoppingList = {
        id: `list-${Date.now()}`,
        name: parsed.name || 'Imported List',
        items: parsed.items,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updated = [...lists, importedList];
      updateListsState(updated);
      setActiveId(importedList.id);
      setActiveListId(importedList.id);
      showToast(`Imported ${parsed.items.length} items into "${importedList.name}"`);
    } catch (e) {
      console.error(e);
      showToast('Error importing file: Invalid JSON format.');
    }
  };

  // Apply filters
  const filteredItems = useMemo(() => {
    return activeList.items.filter((item) => {
      const matchStore =
        filterState.store === 'All' ||
        item.store.toLowerCase() === filterState.store.toLowerCase();
      const matchDept =
        filterState.department === 'All' ||
        item.department.toLowerCase() === filterState.department.toLowerCase();
      return matchStore && matchDept;
    });
  }, [activeList.items, filterState]);

  return (
    <div id="shopping-app-root" className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top App Bar */}
      <TopBar
        activeList={activeList}
        catalogCount={catalog.length}
        onOpenCatalog={() => setIsCatalogModalOpen(true)}
        onOpenSaveAs={() => setIsSaveAsModalOpen(true)}
        onImportFile={handleImportFile}
        onOpenListManager={() => setIsListManagerOpen(true)}
        onRenameList={handleRenameList}
        onCheckAll={handleCheckAll}
        onClearList={handleClearList}
        onOpenAndroidProject={() => setIsAndroidModalOpen(true)}
        onToast={showToast}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6 space-y-4 pb-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))]">
        {/* Running Total Card */}
        <RunningTotalCard items={activeList.items} />

        {/* Filter Chips (Store & Department) */}
        {activeList.items.length > 0 && (
          <FilterChips
            items={activeList.items}
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        )}

        {/* Hierarchical Grouped List View (Store -> Department -> Items) */}
        <ShoppingListView
          items={filteredItems}
          allCount={activeList.items.length}
          onToggleCheck={handleToggleCheck}
          onEdit={(item) => {
            setEditingItem(item);
            setIsItemDialogOpen(true);
          }}
          onDelete={handleDeleteItem}
          onQuantityChange={handleQuantityChange}
          onOpenAddModal={() => {
            setEditingItem(null);
            setIsItemDialogOpen(true);
          }}
        />
      </main>

      {/* Floating Action Button (FAB) */}
      <FloatingActionButton
        onClick={() => {
          setEditingItem(null);
          setIsItemDialogOpen(true);
        }}
      />

      {/* Item Input / Edit Pop-up Dialog */}
      <ItemInputDialog
        isOpen={isItemDialogOpen}
        itemToEdit={editingItem}
        catalog={catalog}
        onDismiss={() => {
          setIsItemDialogOpen(false);
          setEditingItem(null);
        }}
        onConfirm={handleAddOrUpdateItem}
        onOpenCatalog={() => {
          setIsItemDialogOpen(false);
          setIsCatalogModalOpen(true);
        }}
      />

      {/* Database Master Catalog Modal */}
      <CatalogModal
        isOpen={isCatalogModalOpen}
        catalog={catalog}
        onDismiss={() => setIsCatalogModalOpen(false)}
        onAddItemToList={handleAddItemFromCatalog}
        onSaveCatalogItem={handleSaveCatalogItem}
        onDeleteCatalogItem={handleDeleteCatalogItem}
      />

      {/* Save As JSON Modal with Custom Filename */}
      <SaveAsModal
        isOpen={isSaveAsModalOpen}
        activeList={activeList}
        onDismiss={() => setIsSaveAsModalOpen(false)}
        onSaveAsFile={handleSaveAsFile}
      />

      {/* Switch & Manage Lists Modal */}
      <ListManagerModal
        isOpen={isListManagerOpen}
        lists={lists}
        activeListId={activeList.id}
        onDismiss={() => setIsListManagerOpen(false)}
        onSelectList={(id) => {
          setActiveId(id);
          setActiveListId(id);
        }}
        onCreateList={handleCreateList}
        onDuplicateList={handleDuplicateList}
        onDeleteList={handleDeleteList}
      />

      {/* Native Android Project Modal */}
      <AndroidProjectModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onToast={showToast}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed bottom-6 left-6 z-50 bg-zinc-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
