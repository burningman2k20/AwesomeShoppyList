import React from 'react';
import { Plus } from 'lucide-react';
import { triggerHaptic } from '../services/haptics';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      id="fab-add-item"
      onClick={() => {
        triggerHaptic(18);
        onClick();
      }}
      type="button"
      aria-label="Add item to shopping list"
      className="fixed bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] right-6 z-30 w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 focus:outline-hidden focus:ring-4 focus:ring-emerald-300 cursor-pointer"
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  );
};
