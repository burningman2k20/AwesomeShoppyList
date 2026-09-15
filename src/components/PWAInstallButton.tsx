import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, X, Share2, HelpCircle } from 'lucide-react';
import { triggerHaptic } from '../services/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleInstallClick = async () => {
    triggerHaptic(20);
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowAndroidGuide(true);
      }
    } else {
      if (isIOS) {
        setShowIOSGuide(true);
      } else {
        setShowAndroidGuide(true);
      }
    }
  };

  // If already installed and running standalone in Android/Chrome, show subtle badge
  if (isInstalled) {
    return (
      <div
        id="android-pwa-active-badge"
        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium"
        title="Running as native Android standalone app"
      >
        <Smartphone className="w-3 h-3 text-emerald-400" />
        <span>Android App Active</span>
      </div>
    );
  }

  return (
    <>
      <button
        id="install-android-app-btn"
        onClick={handleInstallClick}
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all border border-emerald-500/50 cursor-pointer"
        title="Install as Android App on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="truncate">Install App</span>
      </button>

      {/* Android Installation Instructions Sheet / Modal */}
      {showAndroidGuide && (
        <div
          id="android-install-guide-backdrop"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowAndroidGuide(false)}
        >
          <div
            id="android-install-guide-sheet"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Install on Android</h3>
                  <p className="text-xs text-zinc-400">Add to your home screen or app drawer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="mt-4 space-y-3.5 text-xs text-zinc-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-zinc-100">Open in Chrome or Samsung Internet</p>
                  <p className="text-zinc-400 mt-0.5">Make sure you are opening this link in your Android mobile browser.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-zinc-100">Tap Browser Menu (⋮)</p>
                  <p className="text-zinc-400 mt-0.5">Tap the three vertical dots in the top right corner of Chrome.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-zinc-100">Select &quot;Install app&quot; or &quot;Add to Home screen&quot;</p>
                  <p className="text-zinc-400 mt-0.5">Android creates a native WebAPK with full offline support and homescreen icon.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex gap-2">
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowAndroidGuide(false);
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Install Now
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guide */}
      {showIOSGuide && (
        <div
          id="ios-install-guide-backdrop"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            id="ios-install-guide-sheet"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">Install on iOS / Safari</h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-xs text-zinc-300">
              <p>1. Tap the <strong>Share</strong> icon in the Safari toolbar.</p>
              <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
