import React from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { MapPin, Phone, Heart, ShieldCheck, Bike, Store, Smartphone } from 'lucide-react';

export const Footer: React.FC<{
  onSelectRole: (role: 'restaurant' | 'driver') => void;
}> = ({ onSelectRole }) => {
  const { lang } = useApp();

  return (
    <footer className="border-t border-stone-200 bg-white pt-12 pb-8 text-stone-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-200">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white font-black text-base shadow-sm">
                🍲
              </div>
              <span className="text-lg font-black text-stone-900">
                {lang === 'ar' ? 'أكلات إدلب' : 'Idlib Eats'}
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              {lang === 'ar'
                ? 'المنصة الرائدة لتوصيل الطعام والحلويات في محافظة إدلب. نوصل أشهى الأطباق من المطاعم المعتمدة إلى باب منزلك بسرعة وأمان.'
                : 'The premier multi-vendor food delivery app in Idlib, Syria. Delivering delicious meals from top restaurants straight to your doorstep.'}
            </p>
            <div className="pt-1">
              <PWAInstallButton compact />
            </div>
          </div>

          {/* Col 2: Neighborhoods & Coverage */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider">
              {lang === 'ar' ? 'مناطق التغطية والتوصيل' : 'Coverage Areas'}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-500">
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
                <span>{lang === 'ar' ? 'مدينة إدلب (شارع الثورة، الضبيط، القصور)' : 'Idlib City Center'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
                <span>{lang === 'ar' ? 'سرمدا والمنطقة التجارية' : 'Sarmada Commercial District'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
                <span>{lang === 'ar' ? 'أريحا وجبل الأربعين' : 'Ariha & Jabal Al-Arbaeen'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
                <span>{lang === 'ar' ? 'بنش ومعرة مصرين' : 'Binnish & Maarrat Misrin'}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Partnerships */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider">
              {lang === 'ar' ? 'انضم إلى شبكتنا' : 'Join Our Network'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectRole('restaurant')}
                  className="flex items-center gap-1.5 font-bold text-orange-600 hover:underline"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>{lang === 'ar' ? 'سجل مطعمك كشريك معتمد' : 'Register Restaurant'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRole('driver')}
                  className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-orange-600 hover:underline"
                >
                  <Bike className="h-3.5 w-3.5" />
                  <span>{lang === 'ar' ? 'انضم لأسطول كباتن الدراجات' : 'Drive with Idlib Eats'}</span>
                </button>
              </li>
              <li className="text-[11px] text-stone-400">
                {lang === 'ar' ? 'عمولة مرنة وأرباح يومية مضمونة' : 'Flexible earnings & fast payouts'}
              </li>
            </ul>
          </div>

          {/* Col 4: Local Payments */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider">
              {lang === 'ar' ? 'طرق الدفع السورية المعتمدة' : 'Local Payment Methods'}
            </h4>
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{lang === 'ar' ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{lang === 'ar' ? 'سيريتل كاش (*3040#)' : 'Syriatel Cash'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{lang === 'ar' ? 'شام كاش (Sham Cash)' : 'Sham Cash Wallet'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>{lang === 'ar' ? 'كاش إم تي إن (*2020#)' : 'MTN Cash'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} {lang === 'ar' ? 'أكلات إدلب (Idlib Eats). صُمم بكل فخر لأهل الشمال السوري.' : 'Idlib Eats. Crafted with care for northern Syria.'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>OpenStreetMap</span>
            <span>•</span>
            <span>PWA Offline Capable</span>
            <span>•</span>
            <span>SYP Currency</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
