import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { formatCurrency, getStatusDetails, getPaymentMethodDetails } from '../utils/formatters';
import { LeafletMap } from './LeafletMap';
import {
  X,
  Phone,
  Clock,
  MapPin,
  Bike,
  Store,
  KeyRound,
  AlertTriangle,
  CheckCircle,
  Share2,
  RefreshCw,
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAnotherOrder?: (orderId: string) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { lang, updateOrderStatus, cancelOrder } = useApp();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !order) return null;

  const statusInfo = getStatusDetails(order.status, lang);
  const paymentDetails = getPaymentMethodDetails(order.paymentMethod, lang);

  // Stepper items
  const steps: { key: OrderStatus; labelAr: string; labelEn: string }[] = [
    { key: 'pending', labelAr: 'إرسال الطلب', labelEn: 'Sent' },
    { key: 'confirmed', labelAr: 'موافقة المطعم', labelEn: 'Confirmed' },
    { key: 'preparing', labelAr: 'جاري الطهي', labelEn: 'Cooking' },
    { key: 'ready_for_pickup', labelAr: 'جاهز للاستلام', labelEn: 'Ready' },
    { key: 'on_the_way', labelAr: 'في الطريق', labelEn: 'On the Way' },
    { key: 'delivered', labelAr: 'تم التسليم', labelEn: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  // Construct Map markers
  const markers: {
    id: string;
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    type: 'restaurant' | 'customer' | 'driver';
  }[] = [
    {
      id: 'restaurant-pin',
      lat: order.restaurantLat,
      lng: order.restaurantLng,
      title: lang === 'ar' ? order.restaurantNameAr : order.restaurantName,
      subtitle: lang === 'ar' ? 'موقع استلام الوجبة' : 'Pickup Restaurant',
      type: 'restaurant',
    },
    {
      id: 'customer-pin',
      lat: order.deliveryAddress.lat,
      lng: order.deliveryAddress.lng,
      title: order.customerName,
      subtitle: order.deliveryAddress.street,
      type: 'customer',
    },
  ];

  // If order has an assigned driver with location
  if (order.driverLat && order.driverLng && order.status !== 'delivered' && order.status !== 'cancelled') {
    markers.push({
      id: 'driver-pin',
      lat: order.driverLat,
      lng: order.driverLng,
      title: order.driverName || 'كابتن التوصيل',
      subtitle: lang === 'ar' ? 'موقع دراجة الكابتن المباشر' : 'Live Driver Position',
      type: 'driver',
    });
  }

  // Quick Simulation Action (for demo and client testing of statuses)
  const advanceStatusForDemo = () => {
    if (order.status === 'pending') updateOrderStatus(order.id, 'confirmed');
    else if (order.status === 'confirmed') updateOrderStatus(order.id, 'preparing');
    else if (order.status === 'preparing') updateOrderStatus(order.id, 'ready_for_pickup');
    else if (order.status === 'ready_for_pickup') updateOrderStatus(order.id, 'on_the_way');
    else if (order.status === 'on_the_way') updateOrderStatus(order.id, 'delivered');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-orange-600">{order.orderNumber}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'ar' ? order.restaurantNameAr : order.restaurantName} • {new Date(order.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Leaflet OpenStreetMap */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-orange-600" />
              <span>{lang === 'ar' ? 'خريطة التتبع الحي (OpenStreetMap إدلب)' : 'Live OpenStreetMap Tracking'}</span>
            </span>
            {order.status === 'on_the_way' && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {lang === 'ar' ? 'الكابتن يتحرك الآن باتجاهك' : 'Courier in transit'}
              </span>
            )}
          </div>

          <LeafletMap
            centerLat={order.driverLat || order.deliveryAddress.lat}
            centerLng={order.driverLng || order.deliveryAddress.lng}
            zoom={14}
            markers={markers}
            showRoute
            height="240px"
          />
        </div>

        {/* Status Stepper */}
        <div className="mt-5 rounded-2xl bg-stone-50 p-4 border border-stone-200">
          <div className="text-xs font-bold text-stone-800 mb-3">
            {lang === 'ar' ? 'مراحل تجهيز وتوصيل طلبك:' : 'Order Progress Timeline:'}
          </div>

          <div className="grid grid-cols-6 gap-1 relative">
            {steps.map((step, idx) => {
              const isPastOrCurrent = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step.key} className="text-center flex flex-col items-center">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                      isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-200 scale-110'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] line-clamp-1 font-semibold ${
                      isCurrent
                        ? 'text-orange-700 font-extrabold'
                        : isPastOrCurrent
                        ? 'text-stone-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {lang === 'ar' ? step.labelAr : step.labelEn}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-stone-600 text-center font-medium">
            {statusInfo.description}
          </p>
        </div>

        {/* Delivery OTP Security Code */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="mt-4 rounded-2xl bg-orange-50 p-4 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {lang === 'ar' ? 'رمز تسليم الطلب (OTP للأمان)' : 'Delivery Verification OTP'}
                </span>
                <span className="text-[11px] text-stone-600">
                  {lang === 'ar'
                    ? 'أعطِ هذا الرمز للكابتن عند استلام الوجبة لتأكيد التسليم'
                    : 'Provide this 4-digit code to courier upon arrival'}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-white px-4 py-2 text-center border border-orange-300 shadow-xs">
              <span className="text-xs text-stone-500 block">{lang === 'ar' ? 'كود التسليم' : 'Code'}</span>
              <span className="font-mono text-xl font-black text-orange-600 tracking-widest">
                {order.otpCode}
              </span>
            </div>
          </div>
        )}

        {/* Driver & Restaurant Contacts */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Restaurant Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Store className="h-5 w-5 text-orange-600" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {lang === 'ar' ? order.restaurantNameAr : order.restaurantName}
                </span>
                <span className="text-[11px] text-stone-500">{order.restaurantPhone}</span>
              </div>
            </div>
            <a
              href={`tel:${order.restaurantPhone}`}
              className="rounded-xl bg-stone-100 p-2 text-stone-700 hover:bg-orange-100 hover:text-orange-700 transition"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>

          {/* Driver Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bike className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {order.driverName || (lang === 'ar' ? 'جاري تعيين كابتن' : 'Assigning Courier')}
                </span>
                <span className="text-[11px] text-stone-500">
                  {order.driverPhone || (lang === 'ar' ? 'سيتصل بك فور انطلاقه' : 'Will call upon dispatch')}
                </span>
              </div>
            </div>
            {order.driverPhone && (
              <a
                href={`tel:${order.driverPhone}`}
                className="rounded-xl bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 transition"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="mt-4 rounded-2xl bg-stone-50 p-4 border border-stone-200 space-y-2">
          <div className="text-xs font-bold text-stone-800 mb-2">
            {lang === 'ar' ? 'محتويات الوجبة:' : 'Order Items:'}
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-stone-700">
              <div>
                <span>{item.quantity}x </span>
                <span className="font-semibold">{lang === 'ar' ? item.nameAr : item.name}</span>
                {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                  <span className="text-stone-500 text-[10px] block">
                    {item.selectedModifiers.map((m) => (lang === 'ar' ? m.optionNameAr : m.optionName)).join(' • ')}
                  </span>
                )}
              </div>
              <span className="font-bold text-stone-900">{formatCurrency(item.totalPrice, lang)}</span>
            </div>
          ))}

          <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-stone-900">
            <span>{lang === 'ar' ? 'المجموع المدفوع' : 'Total Paid'}</span>
            <span className="text-orange-600">{formatCurrency(order.total, lang)}</span>
          </div>
          <div className="text-[11px] text-stone-500 flex justify-between">
            <span>{lang === 'ar' ? 'طريقة الدفع:' : 'Payment:'}</span>
            <span className="font-bold text-stone-700">{lang === 'ar' ? paymentDetails.nameAr : paymentDetails.name}</span>
          </div>
        </div>

        {/* Demo Fast-Forward Status Simulation Button */}
        <div className="mt-5 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={advanceStatusForDemo}
            className="flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-orange-600" />
            <span>{lang === 'ar' ? 'محاكاة تقدم الحالة (Demo Next Step)' : 'Advance Demo Status'}</span>
          </button>

          {order.status === 'pending' && (
            <button
              onClick={() => cancelOrder(order.id)}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition"
          >
            {lang === 'ar' ? 'إغلاق ومتابعة' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
