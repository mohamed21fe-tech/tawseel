import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, POPULAR_IDLIB_LOCATIONS } from '../data/seedData';
import { Search, MapPin, Clock, ShieldCheck, Bike, Sparkles, Store, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface LandingHeroProps {
  onSearch: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
  onOpenLocationFilter?: (loc: string) => void;
  onBecomePartner: () => void;
  onBecomeDriver: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSearch,
  onSelectCategory,
  selectedCategory,
  onBecomePartner,
  onBecomeDriver,
}) => {
  const { lang, lowBandwidthMode } = useApp();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput.trim());
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-stone-50 to-white pb-12 pt-6">
      {/* Decorative Warm Accents */}
      <div className="absolute -top-24 end-0 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />
      <div className="absolute top-48 -start-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Copy & Search */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-bold text-orange-800 border border-orange-200 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-orange-600" />
              <span>
                {lang === 'ar'
                  ? 'المنصة الأولى لتوصيل المطاعم في إدلب وريفها'
                  : 'Leading Multi-Vendor Food Delivery in Idlib'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
              {lang === 'ar' ? (
                <>
                  أشهى أكلات إدلب، <br />
                  <span className="text-orange-600">واصلة لعند باب بيتك</span> طازجة وسريعة
                </>
              ) : (
                <>
                  Taste the Best of Idlib, <br />
                  <span className="text-orange-600">Delivered to Your Door</span> Fast & Fresh
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
              {lang === 'ar'
                ? 'شاورما السلطان، بروستد مقرمش، فلافل أبو أحمد، حلاوة الجبن الأصلية، وأطيب طبخ بيتي مع تتبع مباشر لكابتن التوصيل ودفع محلي مريح.'
                : 'Order Syrian shawarma, crispy broast, fresh falafel, ashta halawa, and homecooked feasts with live OpenStreetMap tracking and local Syrian payments.'}
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl">
              <div className="relative flex items-center rounded-2xl bg-white p-1.5 shadow-lg shadow-orange-950/5 border border-stone-200">
                <Search className="h-5 w-5 text-stone-400 ms-3 shrink-0" />
                <input
                  id="hero-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    onSearch(e.target.value);
                  }}
                  placeholder={
                    lang === 'ar'
                      ? 'ابحث عن مطعم أو وجبة (شاورما، كباب، بروستد، كنافة...)'
                      : 'Search for restaurant or dish (shawarma, broast, knafeh...)'
                  }
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none"
                />
                <button
                  type="submit"
                  id="hero-search-btn"
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-orange-700 transition shrink-0"
                >
                  {lang === 'ar' ? 'بحث' : 'Search'}
                </button>
              </div>
            </form>

            {/* Idlib Popular Neighborhoods Tagline */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 pt-1">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                {lang === 'ar' ? 'توصيل سريع إلى:' : 'Quick delivery to:'}
              </span>
              {POPULAR_IDLIB_LOCATIONS.slice(0, 4).map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => onSearch(lang === 'ar' ? loc.nameAr : loc.name)}
                  className="rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 hover:bg-orange-100 hover:text-orange-700 transition"
                >
                  {lang === 'ar' ? loc.nameAr : loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Visual Card / App Feature Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-1 shadow-2xl shadow-orange-500/20">
              <div className="rounded-[22px] bg-white p-5 space-y-4">
                {/* Visual header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-stone-800">
                      {lang === 'ar' ? 'الطلب نشط الآن في إدلب' : 'Live Ordering in Idlib'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {lang === 'ar' ? '20 - 30 دقيقة متوسط التوصيل' : '20-30 min avg'}
                  </span>
                </div>

                {/* Featured Fast Dishes Image */}
                {!lowBandwidthMode && (
                  <div className="relative h-44 w-full overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
                      alt="Syrian Grills"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 start-3 text-white">
                      <div className="text-xs font-bold">{lang === 'ar' ? 'مشاوي وكباب حلبي أصيل' : 'Authentic Aleppo Grills'}</div>
                      <div className="text-[10px] text-stone-200">{lang === 'ar' ? 'مطعم السلطان - شارع الثورة' : 'Al-Sultan - Al-Thawra'}</div>
                    </div>
                  </div>
                )}

                {/* Syrian Highlights Grid */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="rounded-xl bg-orange-50 p-2.5 border border-orange-100">
                    <Bike className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-stone-800">{lang === 'ar' ? 'تتبع مباشر' : 'Live Map'}</div>
                    <div className="text-[9px] text-stone-500">{lang === 'ar' ? 'OpenStreetMap' : 'No blocks'}</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2.5 border border-emerald-100">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-stone-800">{lang === 'ar' ? 'دفع محلي' : 'Local Pay'}</div>
                    <div className="text-[9px] text-stone-500">{lang === 'ar' ? 'كاش وسيريتل' : 'COD & Cash'}</div>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-100">
                    <Smartphone className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-stone-800">{lang === 'ar' ? 'تطبيق PWA' : 'Fast PWA'}</div>
                    <div className="text-[9px] text-stone-500">{lang === 'ar' ? 'توفير 3G' : 'Low 3G usage'}</div>
                  </div>
                </div>

                {/* Partner CTA */}
                <div className="pt-2 flex items-center justify-between text-xs border-t border-stone-100">
                  <button
                    onClick={onBecomePartner}
                    className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>{lang === 'ar' ? 'سجل مطعمك معنا' : 'Register Restaurant'}</span>
                  </button>
                  <button
                    onClick={onBecomeDriver}
                    className="text-stone-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Bike className="h-3.5 w-3.5" />
                    <span>{lang === 'ar' ? 'انضم كسائق كابتن' : 'Join as Driver'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Horizontal Selector Tabs */}
        <div className="mt-10 border-t border-stone-200/80 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {lang === 'ar' ? 'تصفح الأصناف والمطابخ' : 'Browse Cuisines & Categories'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => onSelectCategory('')}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                {lang === 'ar' ? 'عرض الكل' : 'Show All'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => onSelectCategory('')}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold shrink-0 transition ${
                !selectedCategory
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>🍽️</span>
              <span>{lang === 'ar' ? 'جميع المطاعم' : 'All Restaurants'}</span>
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => onSelectCategory(isSelected ? '' : cat.id)}
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-2 text-xs font-bold shrink-0 transition ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-stone-200"
                  />
                  <span>{lang === 'ar' ? cat.nameAr : cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
