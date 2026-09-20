import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { lang } = useApp();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{lang === 'ar' ? 'التطبيق مثبت' : 'App Installed'}</span>
      </span>
    );
  }

  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-orange-600 text-white font-medium shadow-sm hover:bg-orange-700 transition active:scale-95 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
      >
        <Download className="w-4 h-4" />
        <span>{lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تثبيت آيفون' : 'Install iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900">
                  {lang === 'ar' ? 'تثبيت تطبيق أكلات إدلب على آيفون' : 'Install Idlib Eats on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600 text-xs">
                    1
                  </span>
                  <p>
                    {lang === 'ar'
                      ? 'اضغط على زر المشاركة (Share) في شريط متصفح Safari السفلي.'
                      : 'Tap the Share button in Safari toolbar at the bottom.'}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600 text-xs">
                    2
                  </span>
                  <p>
                    {lang === 'ar'
                      ? 'انزل للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : 'Scroll down and select "Add to Home Screen".'}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600 text-xs">
                    3
                  </span>
                  <p>
                    {lang === 'ar'
                      ? 'اضغط على "إضافة" في الزاوية العلوية، واستمتع بتجربة تطبيق سريع بدون استهلاك باقة الإنترنت.'
                      : 'Tap "Add" in top right corner. Enjoy instant offline-capable app!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
              >
                {lang === 'ar' ? 'فهمت ذلك' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
