import React from 'react';
import { ShoppingItem } from '../types';
import { CheckCircle2, ShoppingBag, DollarSign } from 'lucide-react';

interface RunningTotalCardProps {
  items: ShoppingItem[];
}

export const RunningTotalCard: React.FC<RunningTotalCardProps> = ({ items }) => {
  const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  const checkedItems = items.filter((item) => item.isChecked);
  const checkedCost = checkedItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  const remainingCost = totalCost - checkedCost;
  const remainingCount = items.length - checkedItems.length;

  const percentComplete = items.length > 0 ? Math.round((checkedItems.length / items.length) * 100) : 0;

  return (
    <div
      id="running-total-card"
      className="bg-emerald-950/40 text-emerald-100 border border-emerald-800/50 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-xs transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-emerald-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Running Total</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-200 tracking-tight mt-0.5">
            ${totalCost.toFixed(2)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-emerald-300/80 font-medium">
            {items.length} {items.length === 1 ? 'item' : 'items'} total
          </div>
          <div className="flex items-center gap-1.5 justify-end mt-1 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {checkedItems.length} in cart (${checkedCost.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Subtotals */}
      {items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-emerald-800/40">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1.5 font-medium">
            <span>Progress: {percentComplete}%</span>
            <span>Remaining: <strong className="text-emerald-100">${remainingCost.toFixed(2)}</strong> ({remainingCount})</span>
          </div>
          <div className="w-full bg-emerald-900/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
