import React from 'react';
import { ShoppingItem } from '../types';
import { Store, Folder, Edit2, Trash2, Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { triggerHaptic } from '../services/haptics';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  allCount: number;
  onToggleCheck: (item: ShoppingItem) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (item: ShoppingItem) => void;
  onQuantityChange: (item: ShoppingItem, newQty: number) => void;
  onOpenAddModal: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  allCount,
  onToggleCheck,
  onEdit,
  onDelete,
  onQuantityChange,
  onOpenAddModal,
}) => {
  if (items.length === 0) {
    return (
      <div
        id="empty-list-state"
        className="flex flex-col items-center justify-center py-16 px-4 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-300 my-4"
      >
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-zinc-800">
          {allCount === 0 ? 'Your shopping list is empty' : 'No items match your filter'}
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-4">
          {allCount === 0
            ? 'Tap the + button to add items, or select items from your saved database catalog.'
            : 'Try selecting "All" stores and departments to see all items in your list.'}
        </p>
        <button
          id="empty-state-add-btn"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Your First Item
        </button>
      </div>
    );
  }

  // Group by Store -> then by Department
  const storeMap: Record<string, Record<string, ShoppingItem[]>> = {};

  items.forEach((item) => {
    const store = item.store || 'General';
    const dept = item.department || 'General';

    if (!storeMap[store]) {
      storeMap[store] = {};
    }
    if (!storeMap[store][dept]) {
      storeMap[store][dept] = [];
    }
    storeMap[store][dept].push(item);
  });

  const sortedStores = Object.keys(storeMap).sort();

  return (
    <div id="shopping-list-grouped" className="space-y-6 pb-24">
      {sortedStores.map((store) => {
        const departments = storeMap[store];
        const storeItems = Object.values(departments).flat();
        const storeTotal = storeItems.reduce((acc, i) => acc + i.cost * i.quantity, 0);
        const storeCheckedCount = storeItems.filter((i) => i.isChecked).length;

        return (
          <div key={`store-group-${store}`} className="space-y-3">
            {/* Store Header Banner */}
            <div className="flex items-center justify-between bg-zinc-100 px-3.5 py-2.5 rounded-xl border border-zinc-200/80">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-zinc-800 tracking-tight">{store}</span>
                <span className="text-xs text-zinc-500 font-medium">
                  ({storeCheckedCount}/{storeItems.length})
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-700">
                ${storeTotal.toFixed(2)}
              </span>
            </div>

            {/* Department Groups */}
            <div className="space-y-3 pl-2 sm:pl-3">
              {Object.keys(departments).sort().map((dept) => {
                const deptItems = departments[dept];
                const deptTotal = deptItems.reduce((acc, i) => acc + i.cost * i.quantity, 0);

                return (
                  <div key={`dept-group-${store}-${dept}`} className="space-y-2">
                    {/* Department Subheader */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-medium px-2 pt-1">
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        <Folder className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-semibold">{dept}</span>
                        <span className="text-zinc-400">({deptItems.length})</span>
                      </div>
                      <span className="text-zinc-500 font-medium">${deptTotal.toFixed(2)}</span>
                    </div>

                    {/* Department Items */}
                    <div className="space-y-2">
                      {deptItems.map((item) => {
                        const lineTotal = item.cost * item.quantity;

                        return (
                          <div
                            key={item.id}
                            id={`item-card-${item.id}`}
                            className={`group relative flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 ${
                              item.isChecked
                                ? 'bg-zinc-50/70 border-zinc-200 text-zinc-400'
                                : 'bg-white border-zinc-200/90 shadow-xs hover:border-zinc-300 text-zinc-900'
                            }`}
                          >
                            {/* Left: Checkbox & Name info */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                id={`check-toggle-${item.id}`}
                                onClick={() => {
                                  triggerHaptic(15);
                                  onToggleCheck(item);
                                }}
                                aria-label={`Toggle check for ${item.name}`}
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors border ${
                                  item.isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-zinc-300 hover:border-emerald-500 bg-white'
                                }`}
                              >
                                {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <div
                                className="min-w-0 flex-1 cursor-pointer"
                                onClick={() => {
                                  triggerHaptic(10);
                                  onEdit(item);
                                }}
                              >
                                <div
                                  className={`text-sm font-semibold truncate transition-colors ${
                                    item.isChecked ? 'line-through text-zinc-400 font-normal' : 'text-zinc-900'
                                  }`}
                                >
                                  {item.name}
                                </div>
                                <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                  <span>
                                    {item.quantity} × ${item.cost.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Quantity Controls, Subtotal & Actions */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              {/* Quantity Stepper */}
                              <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50/50">
                                <button
                                  type="button"
                                  id={`qty-minus-${item.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic(12);
                                    if (item.quantity > 1) {
                                      onQuantityChange(item, item.quantity - 1);
                                    } else {
                                      onDelete(item);
                                    }
                                  }}
                                  className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-zinc-700">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  id={`qty-plus-${item.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic(12);
                                    onQuantityChange(item, item.quantity + 1);
                                  }}
                                  className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Item Total */}
                              <div
                                className={`text-sm font-bold min-w-[3.75rem] text-right ${
                                  item.isChecked ? 'line-through text-zinc-400' : 'text-zinc-800'
                                }`}
                              >
                                ${lineTotal.toFixed(2)}
                              </div>

                              {/* Edit & Delete Action Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  id={`edit-item-${item.id}`}
                                  onClick={() => onEdit(item)}
                                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                                  title="Edit item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  id={`delete-item-${item.id}`}
                                  onClick={() => onDelete(item)}
                                  className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
