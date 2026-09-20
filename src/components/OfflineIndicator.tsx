import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import { WifiOff, Zap } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { lang, lowBandwidthMode } = useApp();

  return (
    <>
      {!isOnline && (
        <div
          id="offline-banner"
          className="fixed bottom-4 start-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/30 backdrop-blur-md animate-bounce"
        >
          <WifiOff className="w-4 h-4 text-white" />
          <span>
            {lang === 'ar'
              ? 'أنت غير متصل بالإنترنت — وضع الحفظ المحلي قيد العمل'
              : 'Offline Mode — Local cached data is active'}
          </span>
        </div>
      )}

      {lowBandwidthMode && isOnline && (
        <div
          id="low-bandwidth-badge"
          className="fixed bottom-4 end-4 z-40 flex items-center gap-1.5 rounded-full bg-stone-900/85 px-3 py-1 text-[11px] font-medium text-amber-300 shadow-md border border-stone-700 backdrop-blur-xs"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ar' ? 'وضع توفير البيانات (3G)' : 'Data Saver 3G Mode'}</span>
        </div>
      )}
    </>
  );
};
