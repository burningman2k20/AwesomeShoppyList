import React, { useRef, useState, useEffect } from 'react';
import { ShoppingList } from '../types';
import {
  ShoppingCart,
  FolderOpen,
  Save,
  Database,
  MoreVertical,
  ChevronDown,
  CheckSquare,
  Square,
  Trash2,
  Edit2,
  ListFilter,
  Share2,
  Smartphone,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { triggerHaptic } from '../services/haptics';

interface TopBarProps {
  activeList: ShoppingList;
  catalogCount: number;
  onOpenCatalog: () => void;
  onOpenSaveAs: () => void;
  onImportFile: (fileContent: string) => void;
  onOpenListManager: () => void;
  onRenameList: (newName: string) => void;
  onCheckAll: (checked: boolean) => void;
  onClearList: () => void;
  onOpenAndroidProject: () => void;
  onToast?: (msg: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeList,
  catalogCount,
  onOpenCatalog,
  onOpenSaveAs,
  onImportFile,
  onOpenListManager,
  onRenameList,
  onCheckAll,
  onClearList,
  onOpenAndroidProject,
  onToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(activeList.name);

  useEffect(() => {
    setTitleInput(activeList.name);
  }, [activeList.name]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportFile(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onRenameList(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleShareList = async () => {
    triggerHaptic(15);
    const total = activeList.items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
    const textLines = [
      `🛒 ${activeList.name}`,
      `Total: $${total.toFixed(2)} (${activeList.items.length} items)`,
      '',
      ...activeList.items.map(
        (i) =>
          `${i.isChecked ? '✓' : '□'} ${i.name} (x${i.quantity}) - $${(i.cost * i.quantity).toFixed(2)}${i.store ? ` [${i.store}]` : ''}`
      ),
    ];
    const shareText = textLines.join('\n');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: activeList.name,
          text: shareText,
        });
        return;
      } catch {
        // Ignored if cancelled
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      onToast?.('Shopping list copied to clipboard!');
    } catch {
      onToast?.('Could not copy to clipboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-900 text-white shadow-md pt-[max(0.25rem,env(safe-area-inset-top))]">
      {/* Hidden file input for SAF / File load */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Brand & Active List Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 truncate">
                  Shopping List
                </h1>
              </div>

              {/* Active List Switcher Pill / Inline Edit */}
              {isEditingTitle ? (
                <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleTitleSubmit}
                    autoFocus
                    className="bg-zinc-800 text-white text-xs px-2 py-0.5 rounded border border-zinc-600 focus:outline-hidden focus:border-emerald-400"
                  />
                </form>
              ) : (
                <button
                  id="list-switcher-pill"
                  onClick={() => {
                    triggerHaptic(10);
                    onOpenListManager();
                  }}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 mt-0.5 transition-colors group text-left"
                  title="Switch or manage lists"
                >
                  <span className="font-medium text-emerald-400 group-hover:underline truncate max-w-[130px] sm:max-w-xs">
                    {activeList.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Native Android Project Button */}
            <button
              id="topbar-android-project-btn"
              onClick={() => {
                triggerHaptic(12);
                onOpenAndroidProject();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="View & Download Native Android App (Jetpack Compose & Room)"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Android App</span>
            </button>

            {/* Android Install Button */}
            <PWAInstallButton />

            {/* Android Native Share Button */}
            <button
              id="topbar-share-btn"
              onClick={handleShareList}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
              title="Share shopping list to Android apps"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Share</span>
            </button>

            {/* Database Catalog Button */}
            <button
              id="open-catalog-btn"
              onClick={() => {
                triggerHaptic(10);
                onOpenCatalog();
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
              title="Database Item Catalog"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Catalog</span>
              <span className="text-[10px] bg-zinc-700 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                {catalogCount}
              </span>
            </button>

            {/* Save As JSON */}
            <button
              id="save-as-btn"
              onClick={() => {
                triggerHaptic(10);
                onOpenSaveAs();
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
              title="Save list to file with custom filename"
            >
              <Save className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Save As</span>
            </button>

            {/* Load JSON */}
            <button
              id="load-file-btn"
              onClick={() => {
                triggerHaptic(10);
                fileInputRef.current?.click();
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
              title="Load / Import list from JSON file"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Load</span>
            </button>

            {/* Overflow Options Menu */}
            <div className="relative">
              <button
                id="topbar-overflow-menu-btn"
                onClick={() => {
                  triggerHaptic(10);
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      id="menu-android-project"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenAndroidProject();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2 font-medium"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      Native Android Project
                    </button>

                    <button
                      id="menu-share-list"
                      onClick={() => {
                        setShowMenu(false);
                        handleShareList();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-700/60 flex items-center gap-2 font-medium"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      Share Shopping List
                    </button>

                    <button
                      id="menu-rename-list"
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditingTitle(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-700/60 flex items-center gap-2 font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                      Rename List
                    </button>

                    <button
                      id="menu-manage-lists"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenListManager();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-700/60 flex items-center gap-2 font-medium"
                    >
                      <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
                      Switch / Manage Lists
                    </button>

                    <div className="my-1 border-t border-zinc-700" />

                    <button
                      id="menu-uncheck-all"
                      onClick={() => {
                        setShowMenu(false);
                        onCheckAll(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-700/60 flex items-center gap-2 font-medium"
                    >
                      <Square className="w-3.5 h-3.5 text-zinc-400" />
                      Uncheck All Items
                    </button>

                    <button
                      id="menu-check-all"
                      onClick={() => {
                        setShowMenu(false);
                        onCheckAll(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-zinc-200 hover:bg-zinc-700/60 flex items-center gap-2 font-medium"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
                      Check All Items
                    </button>

                    <div className="my-1 border-t border-zinc-700" />

                    <button
                      id="menu-clear-list"
                      onClick={() => {
                        setShowMenu(false);
                        onClearList();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      Clear List Items
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
