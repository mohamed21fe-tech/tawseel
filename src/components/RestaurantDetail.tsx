import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Restaurant, MenuItem, SelectedModifier } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  Bike,
  Phone,
  MapPin,
  Plus,
  Minus,
  Sparkles,
  Check,
  Search,
  X,
} from 'lucide-react';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onBack: () => void;
  onOpenCart: () => void;
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurant,
  onBack,
  onOpenCart,
}) => {
  const { lang, addToCart, cart, lowBandwidthMode } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dishSearch, setDishSearch] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  // Modifier state inside the customization modal
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;

  // Filter items
  const displayItems = restaurant.menuItems.filter((item) => {
    if (activeCategory !== 'all' && item.categoryId !== activeCategory) return false;
    if (dishSearch.trim()) {
      const q = dishSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.nameAr.includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.descriptionAr.includes(q)
      );
    }
    return true;
  });

  const openCustomizeModal = (item: MenuItem) => {
    setSelectedItemForModal(item);
    setSpecialInstructions('');

    // Pre-select required modifiers if any
    const initialMods: SelectedModifier[] = [];
    item.modifierGroups?.forEach((group) => {
      if (group.required && group.options.length > 0) {
        const first = group.options[0];
        initialMods.push({
          groupId: group.id,
          groupName: group.name,
          optionId: first.id,
          optionName: first.name,
          optionNameAr: first.nameAr,
          price: first.price,
        });
      }
    });
    setSelectedModifiers(initialMods);
  };

  const handleModifierToggle = (
    groupId: string,
    groupName: string,
    optId: string,
    optName: string,
    optNameAr: string,
    price: number,
    isSingleChoice: boolean
  ) => {
    setSelectedModifiers((prev) => {
      if (isSingleChoice) {
        const filtered = prev.filter((m) => m.groupId !== groupId);
        return [
          ...filtered,
          {
            groupId,
            groupName,
            optionId: optId,
            optionName: optName,
            optionNameAr: optNameAr,
            price,
          },
        ];
      } else {
        const exists = prev.some((m) => m.optionId === optId);
        if (exists) {
          return prev.filter((m) => m.optionId !== optId);
        } else {
          return [
            ...prev,
            {
              groupId,
              groupName,
              optionId: optId,
              optionName: optName,
              optionNameAr: optNameAr,
              price,
            },
          ];
        }
      }
    });
  };

  const handleConfirmAddToCart = () => {
    if (!selectedItemForModal) return;
    addToCart(selectedItemForModal, restaurant, selectedModifiers, specialInstructions);
    setSelectedItemForModal(null);
  };

  // Calculate current modal total
  const modalItemTotal = selectedItemForModal
    ? selectedItemForModal.price + selectedModifiers.reduce((s, m) => s + m.price, 0)
    : 0;

  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Restaurant Banner Header */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stone-900">
        {!lowBandwidthMode && (
          <img
            src={restaurant.banner}
            alt={restaurant.name}
            className="h-full w-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        {/* Top bar back button */}
        <div className="absolute top-4 start-4 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-stone-800 shadow-lg hover:bg-white transition backdrop-blur-xs"
          >
            <BackIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'الرجوع للمطاعم' : 'Back to Restaurants'}</span>
          </button>
        </div>

        {/* Restaurant Header Details */}
        <div className="absolute bottom-4 start-4 end-4 mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="flex items-end gap-3.5">
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-20 w-20 rounded-2xl border-2 border-white object-cover shadow-xl bg-white shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {lang === 'ar' ? restaurant.nameAr : restaurant.name}
                  </h1>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      restaurant.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {restaurant.isOpen
                      ? lang === 'ar'
                        ? 'مفتوح'
                        : 'Open'
                      : lang === 'ar'
                      ? 'مغلق'
                      : 'Closed'}
                  </span>
                </div>
                <p className="text-xs text-stone-200 mt-1 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span>{lang === 'ar' ? restaurant.addressAr : restaurant.address}</span>
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-stone-300">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-orange-400" />
                    {lang === 'ar' ? restaurant.estimatedTimeAr : restaurant.estimatedTime}
                  </span>
                  <span>•</span>
                  <span>{restaurant.hours}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Phone className="h-3 w-3" />
                    {restaurant.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating Box */}
            <div className="flex items-center gap-2 rounded-xl bg-white/20 px-3.5 py-2 backdrop-blur-md self-start sm:self-auto">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <div className="text-end">
                <div className="text-sm font-black">{restaurant.rating} / 5.0</div>
                <div className="text-[10px] text-stone-200">{restaurant.reviewCount} {lang === 'ar' ? 'تقييم موثق' : 'reviews'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu & Filters Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Delivery info alert */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-orange-50 p-3.5 border border-orange-200 text-xs text-orange-950 mb-6">
          <div className="flex items-center gap-2">
            <Bike className="h-4 w-4 text-orange-600" />
            <span>
              {lang === 'ar' ? 'رسوم التوصيل لباب بيتك:' : 'Delivery fee to your door:'}{' '}
              <strong className="font-extrabold">{formatCurrency(restaurant.deliveryFee, lang)}</strong>
            </span>
          </div>
          <div>
            <span>
              {lang === 'ar' ? 'الحد الأدنى للطلب:' : 'Minimum order:'}{' '}
              <strong className="font-extrabold">{formatCurrency(restaurant.minOrder, lang)}</strong>
            </span>
          </div>
        </div>

        {/* Menu Search and Categories Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold shrink-0 transition ${
                activeCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {lang === 'ar' ? 'كل الوجبات' : 'All Dishes'}
            </button>
            {restaurant.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold shrink-0 transition ${
                  activeCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {lang === 'ar' ? cat.nameAr : cat.name}
              </button>
            ))}
          </div>

          {/* Search inside menu */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في قائمة المطعم...' : 'Search menu...'}
              className="w-full rounded-xl border border-stone-200 bg-white py-2 ps-9 pe-3 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayItems.map((item) => {
            const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;
            return (
              <div
                key={item.id}
                id={`menu-item-${item.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs hover:border-orange-200 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900">
                      {lang === 'ar' ? item.nameAr : item.name}
                    </h3>
                    {item.isPopular && (
                      <span className="flex items-center gap-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-extrabold text-orange-700">
                        <Sparkles className="h-2.5 w-2.5" />
                        {lang === 'ar' ? 'الأكثر طلباً' : 'Popular'}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {lang === 'ar' ? item.descriptionAr : item.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-black text-stone-900">
                      {formatCurrency(item.price, lang)}
                    </span>

                    {/* Add to Cart button */}
                    <button
                      id={`btn-add-item-${item.id}`}
                      disabled={!restaurant.isOpen || !item.isAvailable}
                      onClick={() => {
                        if (hasModifiers) {
                          openCustomizeModal(item);
                        } else {
                          addToCart(item, restaurant);
                        }
                      }}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        !restaurant.isOpen || !item.isAvailable
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs'
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>
                        {hasModifiers
                          ? lang === 'ar'
                            ? 'تخصيص وإضافة'
                            : 'Customize'
                          : lang === 'ar'
                          ? 'إضافة للسلة'
                          : 'Add'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dish Image */}
                <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  {!lowBandwidthMode ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-stone-400 font-bold">
                      🍲
                    </div>
                  )}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold text-center p-1">
                      {lang === 'ar' ? 'نفذت الكمية' : 'Sold Out'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating View Cart bar on mobile when cart has items */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-30 mx-auto max-w-lg">
          <button
            onClick={onOpenCart}
            className="flex w-full items-center justify-between rounded-2xl bg-orange-600 px-5 py-3.5 text-white shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-orange-600">
                {totalCartCount}
              </span>
              <span className="text-sm font-bold">{lang === 'ar' ? 'عرض السلة وإتمام الطلب' : 'View Cart & Checkout'}</span>
            </div>
            <span className="text-sm font-black">
              {formatCurrency(cart.reduce((s, ci) => s + ci.totalPrice, 0), lang)}
            </span>
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  {lang === 'ar' ? selectedItemForModal.nameAr : selectedItemForModal.name}
                </h3>
                <span className="text-xs text-orange-600 font-extrabold">
                  {formatCurrency(selectedItemForModal.price, lang)}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modifiers List */}
            <div className="mt-4 space-y-5">
              {selectedItemForModal.modifierGroups?.map((group) => {
                const isSingleChoice = group.maxSelection === 1;
                return (
                  <div key={group.id} className="border-b border-stone-100 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-800">
                        {lang === 'ar' ? group.nameAr : group.name}
                      </span>
                      {group.required && (
                        <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                          {lang === 'ar' ? 'إجباري' : 'Required'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {group.options.map((opt) => {
                        const isChecked = selectedModifiers.some((m) => m.optionId === opt.id);
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-medium cursor-pointer border transition ${
                              isChecked
                                ? 'bg-orange-50/70 border-orange-300 text-orange-900 font-bold'
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type={isSingleChoice ? 'radio' : 'checkbox'}
                                name={group.id}
                                checked={isChecked}
                                onChange={() =>
                                  handleModifierToggle(
                                    group.id,
                                    group.name,
                                    opt.id,
                                    opt.name,
                                    opt.nameAr,
                                    opt.price,
                                    isSingleChoice
                                  )
                                }
                                className="accent-orange-600 h-4 w-4"
                              />
                              <span>{lang === 'ar' ? opt.nameAr : opt.name}</span>
                            </div>
                            {opt.price > 0 && (
                              <span className="text-stone-600 font-semibold">
                                +{formatCurrency(opt.price, lang)}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'ar' ? 'ملاحظات خاصة للشيف (مثال: بدون بصل، ثوم زيادة)' : 'Special Instructions for Chef'}
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={lang === 'ar' ? 'أضف أي تعليمات ترغب بها...' : 'Any preferences...'}
                  rows={2}
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">{lang === 'ar' ? 'المجموع النهائي' : 'Total'}</span>
                <span className="text-base font-extrabold text-stone-900">
                  {formatCurrency(modalItemTotal, lang)}
                </span>
              </div>
              <button
                id="btn-confirm-add-customized"
                onClick={handleConfirmAddToCart}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition active:scale-95"
              >
                {lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
