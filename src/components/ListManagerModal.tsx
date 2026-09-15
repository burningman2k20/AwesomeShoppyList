import React, { useState } from 'react';
import { ShoppingList } from '../types';
import { X, Plus, Trash2, Copy, Check, ListFilter, Calendar } from 'lucide-react';

interface ListManagerModalProps {
  isOpen: boolean;
  lists: ShoppingList[];
  activeListId: string;
  onDismiss: () => void;
  onSelectList: (id: string) => void;
  onCreateList: (name: string) => void;
  onDuplicateList: (list: ShoppingList) => void;
  onDeleteList: (id: string) => void;
}

export const ListManagerModal: React.FC<ListManagerModalProps> = ({
  isOpen,
  lists,
  activeListId,
  onDismiss,
  onSelectList,
  onCreateList,
  onDuplicateList,
  onDeleteList,
}) => {
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName.trim());
    setNewListName('');
    setIsCreating(false);
  };

  return (
    <div
      id="list-manager-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onDismiss}
    >
      <div
        id="list-manager-dialog"
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900">Manage Lists</h2>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New List Button / Form */}
        <div className="p-4 border-b border-zinc-100 bg-white">
          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-2.5">
              <input
                id="new-list-name-input"
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name (e.g. Costco Bulk Run, Camping Trip)"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                >
                  Create List
                </button>
              </div>
            </form>
          ) : (
            <button
              id="create-new-list-btn"
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 border-dashed rounded-xl text-xs font-semibold text-zinc-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Shopping List</span>
            </button>
          )}
        </div>

        {/* Lists Container */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {lists.map((list) => {
            const isActive = list.id === activeListId;
            const total = list.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

            return (
              <div
                key={list.id}
                id={`list-item-${list.id}`}
                onClick={() => {
                  onSelectList(list.id);
                  onDismiss();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-zinc-50 hover:bg-zinc-100/80 border-zinc-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900 truncate">
                      {list.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span>{list.items.length} items</span>
                    <span>•</span>
                    <span className="font-medium text-zinc-700">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onDuplicateList(list)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
                    title="Duplicate list"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {lists.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteList(list.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
