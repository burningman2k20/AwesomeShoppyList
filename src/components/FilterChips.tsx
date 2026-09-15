import React from 'react';
import { Store, Folder, X } from 'lucide-react';
import { FilterState, ShoppingItem } from '../types';

interface FilterChipsProps {
  items: ShoppingItem[];
  filterState: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  items,
  filterState,
  onFilterChange,
}) => {
  // Extract distinct stores and counts
  const storeCounts: Record<string, number> = {};
  items.forEach((item) => {
    storeCounts[item.store] = (storeCounts[item.store] || 0) + 1;
  });
  const stores = ['All', ...Object.keys(storeCounts).sort()];

  // Extract distinct departments and counts (filtered by active store if any, or general)
  const deptCounts: Record<string, number> = {};
  items.forEach((item) => {
    if (filterState.store === 'All' || item.store.toLowerCase() === filterState.store.toLowerCase()) {
      deptCounts[item.department] = (deptCounts[item.department] || 0) + 1;
    }
  });
  const departments = ['All', ...Object.keys(deptCounts).sort()];

  const isFilterActive = filterState.store !== 'All' || filterState.department !== 'All';

  return (
    <div id="filter-chips-container" className="space-y-2.5">
      {/* Store Filter Row */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Store className="w-3.5 h-3.5 text-zinc-400" />
            <span>Store Filter</span>
          </div>
          {isFilterActive && (
            <button
              id="clear-filter-btn"
              onClick={() => onFilterChange({ store: 'All', department: 'All' })}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
          {stores.map((store) => {
            const count = store === 'All' ? items.length : storeCounts[store] || 0;
            const isSelected = filterState.store.toLowerCase() === store.toLowerCase();

            return (
              <button
                key={`store-${store}`}
                id={`filter-store-${store.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onFilterChange({ ...filterState, store })}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200/80 hover:bg-zinc-200/70 hover:border-zinc-300'
                }`}
              >
                <span>{store}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Department Filter Row */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 px-0.5">
          <Folder className="w-3.5 h-3.5 text-zinc-400" />
          <span>Department Filter</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {departments.map((dept) => {
            const count =
              dept === 'All'
                ? items.filter(
                    (i) => filterState.store === 'All' || i.store.toLowerCase() === filterState.store.toLowerCase()
                  ).length
                : deptCounts[dept] || 0;
            const isSelected = filterState.department.toLowerCase() === dept.toLowerCase();

            return (
              <button
                key={`dept-${dept}`}
                id={`filter-dept-${dept.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onFilterChange({ ...filterState, department: dept })}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200/80 hover:bg-zinc-200/70 hover:border-zinc-300'
                }`}
              >
                <span>{dept}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
