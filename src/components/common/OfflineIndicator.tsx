import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { Lang } from '../../lib/types';

export const OfflineIndicator: React.FC<{ lang: Lang }> = ({ lang }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/40">
      <WifiOff size={15} className="animate-pulse" />
      <span>
        {lang === 'hi'
          ? 'ऑफ़लाइन मोड — स्थानीय डेटा सुरक्षित रूप से सुरक्षित है।'
          : 'Offline Mode — Local data is safely saved on your device.'}
      </span>
    </div>
  );
};
