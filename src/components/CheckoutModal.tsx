import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Address, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/formatters';
import { LeafletMap } from './LeafletMap';
import { SyrianPaymentModal } from './SyrianPaymentModal';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Phone,
  FileText,
  CreditCard,
  ShieldCheck,
  X,
  AlertCircle,
  Building,
  Check,
  Bike,
} from 'lucide-react';
import { POPULAR_IDLIB_LOCATIONS } from '../data/seedData';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    cartRestaurant,
    currentUser,
    lang,
    appliedPromo,
    placeOrder,
  } = useApp();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [useMapPicker, setUseMapPicker] = useState<boolean>(false);
  const [customLat, setCustomLat] = useState<number>(35.9306);
  const [customLng, setCustomLng] = useState<number>(36.6340);
  const [customStreet, setCustomStreet] = useState<string>('');
  const [customNeighborhood, setCustomNeighborhood] = useState<string>('شارع الثورة');
  const [recipientPhone, setRecipientPhone] = useState<string>(currentUser.phone);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [showPaymentStubModal, setShowPaymentStubModal] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || cart.length === 0) return null;

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

  const handleLocationSelectOnMap = (lat: number, lng: number) => {
    setCustomLat(lat);
    setCustomLng(lng);
  };

  const handlePlaceOrderSubmit = () => {
    // If not COD and no transaction reference was confirmed, show payment guide first
    if (paymentMethod !== 'cod' && !transactionId) {
      setShowPaymentStubModal(true);
      return;
    }

    setIsSubmitting(true);

    let addressToUse: Address;
    if (useMapPicker || currentUser.addresses.length === 0) {
      addressToUse = {
        id: `addr-custom-${Date.now()}`,
        userId: currentUser.id,
        label: lang === 'ar' ? 'موقع محدد على الخريطة' : 'Map Pin Location',
        neighborhood: customNeighborhood,
        street: customStreet.trim() || customNeighborhood,
        lat: customLat,
        lng: customLng,
        notes: deliveryNotes,
      };
    } else {
      addressToUse = currentUser.addresses[selectedAddressIndex];
    }

    const order = placeOrder({
      restaurantId: cartRestaurant?.id,
      deliveryAddress: addressToUse,
      deliveryNotes: deliveryNotes.trim() || undefined,
      paymentMethod,
      paymentTransactionId: transactionId,
    });

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#16a34a', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // safe fallback
    }

    setIsSubmitting(false);
    onClose();
    onOrderSuccess(order.id);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-stone-900">
                {lang === 'ar' ? 'تأكيد الطلب وعنوان التوصيل' : 'Checkout & Delivery Location'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'ar'
                  ? `الطلب من ${cartRestaurant?.nameAr || 'المطعم'} • المجموع ${formatCurrency(grandTotal, lang)}`
                  : `Order from ${cartRestaurant?.name || 'Restaurant'} • Total ${formatCurrency(grandTotal, lang)}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-6">
            {/* 1. Address Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span>{lang === 'ar' ? 'اختر موقع التوصيل في إدلب' : 'Delivery Address in Idlib'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseMapPicker(!useMapPicker)}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  {useMapPicker
                    ? lang === 'ar'
                      ? 'استخدام العناوين المحفوظة'
                      : 'Use Saved Addresses'
                    : lang === 'ar'
                    ? 'تحديد موقع جديد بالخريطة'
                    : 'Pick on OpenStreetMap'}
                </button>
              </div>

              {!useMapPicker && currentUser.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentUser.addresses.map((addr, idx) => {
                    const isSelected = selectedAddressIndex === idx;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900">{addr.label}</span>
                          {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                        </div>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">{addr.street}</p>
                        <span className="mt-2 inline-block rounded bg-stone-200/60 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                          {addr.neighborhood}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl bg-stone-50 p-4 border border-stone-200">
                  <div className="text-xs text-stone-600 mb-1">
                    {lang === 'ar'
                      ? 'انقر على الخريطة لتحديد موقع منزلك أو مكان التسليم بدقة:'
                      : 'Click anywhere on OpenStreetMap to drop a delivery pin:'}
                  </div>

                  <LeafletMap
                    centerLat={customLat}
                    centerLng={customLng}
                    zoom={15}
                    interactivePicker
                    onLocationSelect={handleLocationSelectOnMap}
                    height="200px"
                  />

                  {/* Neighborhood Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        {lang === 'ar' ? 'الحي / المنطقة' : 'Neighborhood'}
                      </label>
                      <select
                        value={customNeighborhood}
                        onChange={(e) => setCustomNeighborhood(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-medium outline-none focus:border-orange-500"
                      >
                        {POPULAR_IDLIB_LOCATIONS.map((loc) => (
                          <option key={loc.name} value={lang === 'ar' ? loc.nameAr : loc.name}>
                            {lang === 'ar' ? loc.nameAr : loc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        {lang === 'ar' ? 'الشارع ورقم البناء / الطابق' : 'Street / Building Details'}
                      </label>
                      <input
                        type="text"
                        value={customStreet}
                        onChange={(e) => setCustomStreet(e.target.value)}
                        placeholder={lang === 'ar' ? 'مثال: مقابل صيدلية السلام، ط2' : 'e.g. Opposite pharmacy, 2nd fl'}
                        className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Contact Phone & Delivery Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-orange-600" />
                  <span>{lang === 'ar' ? 'رقم هاتف المستلم (للاتصال والتسليم)' : 'Recipient Phone Number'}</span>
                </label>
                <input
                  id="checkout-phone-input"
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="0933123456"
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-mono font-bold text-stone-800 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-orange-600" />
                  <span>{lang === 'ar' ? 'ملاحظات للسائق (اختياري)' : 'Delivery Notes (Optional)'}</span>
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: الاتصال عند الباب الخارجي' : 'e.g. Call upon arrival'}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-800 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* 3. Payment Method Selection (Syrian local options) */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <span>{lang === 'ar' ? 'طريقة الدفع المحلية' : 'Local Syrian Payment Method'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cash On Delivery */}
                <div
                  onClick={() => {
                    setPaymentMethod('cod');
                    setTransactionId(undefined);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      💵 {lang === 'ar' ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery'}
                    </span>
                    {paymentMethod === 'cod' && <Check className="h-4 w-4 text-orange-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {lang === 'ar' ? 'الدفع مباشرة لمندوب التوصيل بعد استلام الوجبة' : 'Pay cash to driver on delivery'}
                  </p>
                </div>

                {/* Syriatel Cash */}
                <div
                  onClick={() => {
                    setPaymentMethod('syriatel_cash');
                    setShowPaymentStubModal(true);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'syriatel_cash'
                      ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      📲 {lang === 'ar' ? 'سيريتل كاش (*3040#)' : 'Syriatel Cash'}
                    </span>
                    {paymentMethod === 'syriatel_cash' && <Check className="h-4 w-4 text-orange-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {transactionId ? `معرف العملية: ${transactionId}` : lang === 'ar' ? 'تحويل فوري لرقم تاجر سيريتل كاش' : 'Instant mobile wallet transfer'}
                  </p>
                </div>

                {/* Sham Cash */}
                <div
                  onClick={() => {
                    setPaymentMethod('sham_cash');
                    setShowPaymentStubModal(true);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'sham_cash'
                      ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      💳 {lang === 'ar' ? 'شام كاش (محفظة محلية)' : 'Sham Cash Wallet'}
                    </span>
                    {paymentMethod === 'sham_cash' && <Check className="h-4 w-4 text-orange-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {transactionId ? `معرف العملية: ${transactionId}` : lang === 'ar' ? 'تحويل عبر شبكة شام كاش المعتمدة في إدلب' : 'Local northern Syria wallet transfer'}
                  </p>
                </div>

                {/* MTN Cash */}
                <div
                  onClick={() => {
                    setPaymentMethod('mtn_cash');
                    setShowPaymentStubModal(true);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'mtn_cash'
                      ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      📱 {lang === 'ar' ? 'كاش إم تي إن (*2020#)' : 'MTN Cash'}
                    </span>
                    {paymentMethod === 'mtn_cash' && <Check className="h-4 w-4 text-orange-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {transactionId ? `معرف العملية: ${transactionId}` : lang === 'ar' ? 'تحويل سريع عبر كود MTN' : 'MTN mobile money code'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Order Bill Summary */}
            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{lang === 'ar' ? 'الوجبات المحددة' : 'Items'}</span>
                <span>{cart.length} {lang === 'ar' ? 'وجبة' : 'items'}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-semibold text-stone-800">{formatCurrency(subtotal, lang)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{lang === 'ar' ? 'أجور التوصيل للكابتن' : 'Courier Delivery Fee'}</span>
                <span className="font-semibold text-stone-800">{formatCurrency(deliveryFee, lang)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{lang === 'ar' ? 'خصم الكوبون' : 'Coupon Discount'}</span>
                  <span>-{formatCurrency(discount, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>{lang === 'ar' ? 'المبلغ النهائي المطلوب' : 'Grand Total to Pay'}</span>
                <span className="text-orange-600">{formatCurrency(grandTotal, lang)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-stone-300 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              id="btn-submit-order"
              disabled={isSubmitting}
              onClick={handlePlaceOrderSubmit}
              className="flex-2 rounded-2xl bg-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Bike className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? lang === 'ar'
                    ? 'جاري إرسال الطلب...'
                    : 'Sending Order...'
                  : lang === 'ar'
                  ? 'تأكيد وإرسال الطلب الآن'
                  : 'Confirm & Place Order'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Stub Modal */}
      <SyrianPaymentModal
        method={paymentMethod}
        amount={grandTotal}
        isOpen={showPaymentStubModal}
        onClose={() => setShowPaymentStubModal(false)}
        onConfirm={(tid) => {
          setTransactionId(tid);
          setShowPaymentStubModal(false);
        }}
      />
    </>
  );
};
