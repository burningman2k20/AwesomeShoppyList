import React, { useState, useEffect } from 'react';
import { ShoppingList } from '../types';
import { X, Download, FileJson, Check } from 'lucide-react';

interface SaveAsModalProps {
  isOpen: boolean;
  activeList: ShoppingList;
  onDismiss: () => void;
  onSaveAsFile: (filename: string) => void;
}

export const SaveAsModal: React.FC<SaveAsModalProps> = ({
  isOpen,
  activeList,
  onDismiss,
  onSaveAsFile,
}) => {
  const [filename, setFilename] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const sanitized = activeList.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'shopping_list';
      setFilename(`${sanitized}.json`);
      setDownloaded(false);
    }
  }, [isOpen, activeList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) return;
    onSaveAsFile(filename.trim());
    setDownloaded(true);
    setTimeout(() => {
      onDismiss();
    }, 1200);
  };

  const totalCost = activeList.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <div
      id="save-as-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onDismiss}
    >
      <div
        id="save-as-dialog"
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900">Save List As File</h2>
          </div>
          <button
            id="close-save-as-btn"
            type="button"
            onClick={onDismiss}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-zinc-500">
            Specify a file name to export and download your shopping list to your device storage or Google Drive folder.
          </p>

          <div>
            <label htmlFor="save-as-filename" className="block text-xs font-semibold text-zinc-700 mb-1.5">
              File Name (.json)
            </label>
            <input
              id="save-as-filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="my_shopping_list.json"
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
              autoFocus
            />
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>List Title:</span>
              <strong className="text-zinc-900">{activeList.name}</strong>
            </div>
            <div className="flex justify-between">
              <span>Items Count:</span>
              <strong className="text-zinc-900">{activeList.items.length} items</strong>
            </div>
            <div className="flex justify-between">
              <span>Running Total:</span>
              <strong className="text-emerald-700">${totalCost.toFixed(2)}</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-save-as-btn"
              type="submit"
              disabled={downloaded}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                downloaded
                  ? 'bg-emerald-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save File</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
