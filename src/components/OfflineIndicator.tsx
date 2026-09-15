import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="android-offline-banner"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/95 text-white px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-xs border border-amber-400 animate-in slide-in-from-bottom-2 duration-200"
    >
      <WifiOff className="w-4 h-4 text-amber-100 animate-pulse" />
      <span>Offline Mode — All items & catalog are saved locally</span>
    </div>
  );
};
