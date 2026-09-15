import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Smartphone,
  Layers,
  Code2,
  FolderTree,
  Terminal,
  ExternalLink,
  Cpu
} from 'lucide-react';
import {
  ANDROID_SOURCE_FILES,
  downloadAndroidProjectZip
} from '../services/androidProjectExporter';
import { triggerHaptic } from '../services/haptics';

interface AndroidProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({
  isOpen,
  onClose,
  onToast
}) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const currentFile = ANDROID_SOURCE_FILES[activeFileIndex];

  const handleCopyCode = async () => {
    triggerHaptic(12);
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onToast('Kotlin source copied to clipboard!');
    } catch {
      onToast('Could not copy code');
    }
  };

  const handleDownloadZip = async () => {
    triggerHaptic(20);
    setDownloading(true);
    try {
      await downloadAndroidProjectZip();
      onToast('Android Studio project (.zip) downloaded!');
    } catch {
      onToast('Failed to download project zip');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      id="android-project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="android-project-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Native Android Project
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                  Jetpack Compose & Room
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Full Kotlin + Material Design 3 source files ready for Android Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-android-zip-btn"
              type="button"
              disabled={downloading}
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Preparing ZIP...' : 'Download Project (.zip)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Spec Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-zinc-900/90 border-b border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/40">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Language</div>
              <div className="font-semibold text-zinc-200">Kotlin 2.0</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/40">
            <Layers className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">UI Framework</div>
              <div className="font-semibold text-zinc-200">Compose & M3</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/40">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Persistence</div>
              <div className="font-semibold text-zinc-200">Room SQLite DB</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/40">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Min SDK</div>
              <div className="font-semibold text-zinc-200">API 26 (Android 8+)</div>
            </div>
          </div>
        </div>

        {/* Code Explorer & Instruction Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[360px]">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/40 p-3 overflow-y-auto shrink-0">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">
              Source Tree
            </div>
            <div className="space-y-1">
              {ANDROID_SOURCE_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setActiveFileIndex(idx);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 ${
                    activeFileIndex === idx
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>

            {/* Quick Android Studio Guide */}
            <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400 space-y-2">
              <div className="font-semibold text-zinc-200 text-[11px]">How to Run in Studio:</div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
                <li>Download or export repo</li>
                <li>Open <code className="text-emerald-400 bg-zinc-800 px-1 py-0.5 rounded">android/</code> in Studio</li>
                <li>Gradle syncs automatically</li>
                <li>Press <kbd className="bg-zinc-800 px-1 py-0.5 rounded">Shift+F10</kbd> to Run</li>
              </ol>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="text-xs font-mono text-zinc-400 truncate">{currentFile.path}</div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="flex-1 p-4 text-xs font-mono text-zinc-300 overflow-auto whitespace-pre leading-relaxed select-text">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400">
            Files are also saved in the repository at <code className="text-emerald-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">/android</code>.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Android Studio Project (.zip)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
