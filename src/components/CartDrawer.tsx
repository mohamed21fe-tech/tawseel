import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  X,
  Tag,
  ArrowRight,
  ArrowLeft,
  Store,
  Bike,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    cartRestaurant,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    lang,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = cartRestaurant?.deliveryFee || 3500;
  let discount = 0;

  if (appliedPromo) {
    if (appliedPromo.discountPercentage) {
      discount = Math.round(subtotal * appliedPromo.discountPercentage);
    } else if (appliedPromo.discountAmount) {
      discount = appliedPromo.discountAmount;
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);
  const isBelowMinOrder = cartRestaurant && subtotal < cartRestaurant.minOrder;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) setPromoInput('');
  };

  const CloseArrow = lang === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="fixed inset-y-0 end-0 flex max-w-full">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="border-b border-stone-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <CloseArrow className="h-5 w-5" />
              </button>
              <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
                <span>{lang === 'ar' ? 'سلة الطلبات' : 'Your Food Cart'}</span>
              </h2>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'إفراغ السلة' : 'Clear'}</span>
              </button>
            )}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl">
                  🛒
                </div>
                <h3 className="text-base font-bold text-stone-800">
                  {lang === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  {lang === 'ar'
                    ? 'اختر وجبتك المفضلة من شاورما، بروستد، أو حلويات وأضفها للسلة.'
                    : 'Explore local Idlib restaurants and pick your favorite meal.'}
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
                >
                  {lang === 'ar' ? 'تصفح قائمة المطاعم' : 'Browse Restaurants'}
                </button>
              </div>
            ) : (
              <>
                {/* Active Restaurant Info Banner */}
                {cartRestaurant && (
                  <div className="rounded-xl bg-orange-50 p-3 border border-orange-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-orange-600 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-900 block">
                          {lang === 'ar' ? cartRestaurant.nameAr : cartRestaurant.name}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {lang === 'ar' ? 'توصيل عبر كابتن أكلات إدلب' : 'Delivered by Idlib Eats Captain'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">
                            {lang === 'ar' ? item.menuItem.nameAr : item.menuItem.name}
                          </h4>
                          <span className="text-xs font-extrabold text-stone-800">
                            {formatCurrency(item.unitPrice, lang)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="rounded p-1 text-stone-400 hover:text-rose-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Selected Modifiers chips */}
                      {item.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.selectedModifiers.map((mod) => (
                            <span
                              key={mod.optionId}
                              className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600"
                            >
                              {lang === 'ar' ? mod.optionNameAr : mod.optionName}
                              {mod.price > 0 && ` (+${formatCurrency(mod.price, lang)})`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Special instructions */}
                      {item.specialInstructions && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                          {lang === 'ar' ? 'ملاحظة: ' : 'Note: '}
                          {item.specialInstructions}
                        </p>
                      )}

                      {/* Quantity selector & total item price */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-2 rounded-xl bg-stone-100 p-1 border border-stone-200">
                          <button
                            onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                            className="rounded-lg bg-white p-1 text-stone-600 hover:bg-stone-50 shadow-2xs"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                            className="rounded-lg bg-white p-1 text-stone-600 hover:bg-stone-50 shadow-2xs"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="text-sm font-black text-orange-600">
                          {formatCurrency(item.totalPrice, lang)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200">
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-stone-700">
                    <Tag className="h-3.5 w-3.5 text-orange-600" />
                    <span>{lang === 'ar' ? 'كوبون الخصم' : 'Promo Code'}</span>
                  </div>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 border border-emerald-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>{appliedPromo.code} ({lang === 'ar' ? appliedPromo.descriptionAr : appliedPromo.description})</span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        {lang === 'ar' ? 'إلغاء' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="IDLIB2026 / AHLA"
                        className="flex-1 uppercase rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 outline-none focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-stone-800 px-3 py-2 text-xs font-bold text-white hover:bg-stone-900 transition"
                      >
                        {lang === 'ar' ? 'تطبيق' : 'Apply'}
                      </button>
                    </form>
                  )}

                  {promoMessage && (
                    <div
                      className={`mt-2 flex items-center gap-1 text-[11px] font-medium ${
                        promoMessage.isError ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{promoMessage.text}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer with Totals and Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50 p-5 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'أجور التوصيل (إدلب)' : 'Delivery Fee'}</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(deliveryFee, lang)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>{lang === 'ar' ? 'خصم الكوبون' : 'Coupon Discount'}</span>
                    <span>-{formatCurrency(discount, lang)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>{lang === 'ar' ? 'الإجمالي للدفع' : 'Total Amount'}</span>
                  <span className="text-orange-600">{formatCurrency(grandTotal, lang)}</span>
                </div>
              </div>

              {/* Minimum Order Warning */}
              {isBelowMinOrder && (
                <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    {lang === 'ar'
                      ? `الحد الأدنى للطلب من هذا المطعم هو ${formatCurrency(cartRestaurant.minOrder, lang)}`
                      : `Minimum order is ${formatCurrency(cartRestaurant.minOrder, lang)}`}
                  </span>
                </div>
              )}

              {/* Checkout Button */}
              <button
                id="btn-drawer-checkout"
                disabled={Boolean(isBelowMinOrder)}
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className={`w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-98 ${
                  isBelowMinOrder
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                }`}
              >
                {lang === 'ar' ? 'متابعة إلى تأكيد الطلب' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
