import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeafletMap } from '../LeafletMap';
import { Order } from '../../types';
import { formatCurrency, getPaymentMethodDetails } from '../../utils/formatters';
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle,
  Navigation,
  DollarSign,
  Power,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DriverDashboard: React.FC = () => {
  const { orders, updateOrderStatus, lang } = useApp();

  const [isOnline, setIsOnline] = useState(true);
  const [driverLat, setDriverLat] = useState(35.9320);
  const [driverLng, setDriverLng] = useState(36.6360);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Orders available for drivers to claim:
  const availableDeliveries = orders.filter(
    (o) => o.status === 'ready_for_pickup' && !o.driverId
  );

  // Active delivery currently assigned to this driver:
  const currentActiveDelivery = orders.find(
    (o) => (o.status === 'on_the_way' || (o.status === 'ready_for_pickup' && o.driverId))
  );

  // Completed deliveries for driver stats:
  const completedDeliveries = orders.filter((o) => o.status === 'delivered');
  const totalDriverEarnings = completedDeliveries.reduce((sum, o) => sum + o.deliveryFee, 0);

  // Accept a delivery
  const handleAcceptDelivery = (order: Order) => {
    updateOrderStatus(order.id, 'on_the_way');
  };

  // Complete delivery with OTP verification
  const handleVerifyOtpAndDeliver = (order: Order) => {
    if (otpInput.trim() !== order.otpCode) {
      setOtpError(lang === 'ar' ? 'رمز OTP غير صحيح، اطلبه من الزبون' : 'Invalid OTP code from customer');
      return;
    }

    setOtpError('');
    updateOrderStatus(order.id, 'delivered');
    setOtpInput('');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // safe fallback
    }
  };

  // Map markers for active delivery
  const mapMarkers = currentActiveDelivery
    ? [
        {
          id: 'driver-pos',
          lat: driverLat,
          lng: driverLng,
          title: lang === 'ar' ? 'موقعي الحالي' : 'My Current Position',
          type: 'driver' as const,
        },
        {
          id: 'rest-pos',
          lat: currentActiveDelivery.restaurantLat,
          lng: currentActiveDelivery.restaurantLng,
          title: currentActiveDelivery.restaurantNameAr,
          subtitle: lang === 'ar' ? 'استلام الطلب' : 'Pickup',
          type: 'restaurant' as const,
        },
        {
          id: 'cust-pos',
          lat: currentActiveDelivery.deliveryAddress.lat,
          lng: currentActiveDelivery.deliveryAddress.lng,
          title: currentActiveDelivery.customerName,
          subtitle: currentActiveDelivery.deliveryAddress.street,
          type: 'customer' as const,
        },
      ]
    : [
        {
          id: 'driver-pos',
          lat: driverLat,
          lng: driverLng,
          title: lang === 'ar' ? 'موقعي الحالي' : 'My Position',
          type: 'driver' as const,
        },
      ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Driver Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-stone-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl shadow-lg">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">
                {lang === 'ar' ? 'كابتن محمد الإدلبي' : 'Captain Mohammad (Driver)'}
              </h1>
              <span className="rounded bg-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                {lang === 'ar' ? 'دراجة نارية مسجلة' : 'Motorcycle'}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              {lang === 'ar' ? 'نطاق التغطية: مدينة إدلب، سرمدا، وأريحا' : 'Zone: Idlib City, Sarmada, Ariha'}
            </p>
          </div>
        </div>

        {/* Online / Offline Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition shadow-md ${
              isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/30'
                : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
            }`}
          >
            <Power className="h-4 w-4" />
            <span>
              {isOnline
                ? lang === 'ar'
                  ? 'أنا متاح للطلبات الآن'
                  : 'You are Online'
                : lang === 'ar'
                ? 'غير متصل (استراحة)'
                : 'You are Offline'}
            </span>
          </button>
        </div>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-stone-500">{lang === 'ar' ? 'أرباح التوصيل اليوم' : "Today's Earnings"}</div>
          <div className="mt-2 text-xl font-black text-stone-900">{formatCurrency(totalDriverEarnings, lang)}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{lang === 'ar' ? 'تحصيل كاش ومحفظة' : 'Cash & Wallet'}</div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-stone-500">{lang === 'ar' ? 'التوصيلات المكتملة' : 'Completed Deliveries'}</div>
          <div className="mt-2 text-2xl font-black text-stone-900">{completedDeliveries.length}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">{lang === 'ar' ? 'اليوم' : 'Today'}</div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-stone-500">{lang === 'ar' ? 'تقييم الكابتن' : 'Driver Rating'}</div>
          <div className="mt-2 text-2xl font-black text-stone-900">4.9 ⭐</div>
          <div className="text-[11px] text-stone-500 mt-0.5">{lang === 'ar' ? '128 تقييم 5 نجوم' : 'Top performer'}</div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-stone-500">{lang === 'ar' ? 'متوسط وقت الرحلة' : 'Avg Delivery Time'}</div>
          <div className="mt-2 text-2xl font-black text-stone-900">22 {lang === 'ar' ? 'دقيقة' : 'min'}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">{lang === 'ar' ? 'سريع وملتزم' : 'Fast'}</div>
        </div>
      </div>

      {/* Driver Map View */}
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-stone-900">
              {lang === 'ar' ? 'خريطة الملاحة الحية (OpenStreetMap إدلب)' : 'Driver Live GPS Navigation'}
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            {lang === 'ar' ? 'إحداثياتك: 35.9320° N, 36.6360° E' : 'GPS Connected'}
          </span>
        </div>

        <LeafletMap
          centerLat={driverLat}
          centerLng={driverLng}
          zoom={14}
          markers={mapMarkers}
          showRoute={Boolean(currentActiveDelivery)}
          height="280px"
        />
      </div>

      {/* Active Current Task (if any) */}
      {currentActiveDelivery ? (
        <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50/40 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-emerald-900 text-sm">
                {lang === 'ar' ? 'طلب قيد التوصيل الآن' : 'Active Delivery in Progress'}
              </span>
              <span className="font-mono font-black text-stone-800 text-xs bg-white px-2 py-0.5 rounded-md border border-stone-200">
                {currentActiveDelivery.orderNumber}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {lang === 'ar' ? 'أجرك من هذا الطلب: ' : 'Your fee: '}
              {formatCurrency(currentActiveDelivery.deliveryFee, lang)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Pickup */}
            <div className="rounded-2xl bg-white p-4 border border-stone-200">
              <div className="text-stone-400 font-bold mb-1">{lang === 'ar' ? '1. استلم الوجبة من المطعم:' : '1. Pickup Restaurant:'}</div>
              <div className="font-extrabold text-stone-900 text-sm">
                {lang === 'ar' ? currentActiveDelivery.restaurantNameAr : currentActiveDelivery.restaurantName}
              </div>
              <div className="text-stone-500 mt-1">{currentActiveDelivery.restaurantAddress}</div>
              <a
                href={`tel:${currentActiveDelivery.restaurantPhone}`}
                className="mt-3 inline-flex items-center gap-1 font-bold text-orange-600 hover:underline"
              >
                <Phone className="h-3 w-3" />
                <span>{currentActiveDelivery.restaurantPhone}</span>
              </a>
            </div>

            {/* Dropoff */}
            <div className="rounded-2xl bg-white p-4 border border-stone-200">
              <div className="text-stone-400 font-bold mb-1">{lang === 'ar' ? '2. سلّم الوجبة للزبون:' : '2. Dropoff Customer:'}</div>
              <div className="font-extrabold text-stone-900 text-sm">
                {currentActiveDelivery.customerName}
              </div>
              <div className="text-stone-500 mt-1">
                {currentActiveDelivery.deliveryAddress.street} - {currentActiveDelivery.deliveryAddress.neighborhood}
              </div>
              {currentActiveDelivery.deliveryNotes && (
                <div className="mt-1 text-amber-700 bg-amber-50 p-1 rounded">
                  {currentActiveDelivery.deliveryNotes}
                </div>
              )}
              <a
                href={`tel:${currentActiveDelivery.customerPhone}`}
                className="mt-3 inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline"
              >
                <Phone className="h-3 w-3" />
                <span>{currentActiveDelivery.customerPhone}</span>
              </a>
            </div>
          </div>

          {/* Payment & OTP verification */}
          <div className="rounded-2xl bg-white p-4 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-500 block">{lang === 'ar' ? 'التحصيل المالي المطلوب:' : 'Amount to Collect:'}</span>
              <span className="text-base font-black text-stone-900">
                {currentActiveDelivery.paymentMethod === 'cod'
                  ? `${formatCurrency(currentActiveDelivery.total, lang)} (نقداً عند الباب)`
                  : `${formatCurrency(currentActiveDelivery.total, lang)} (مدفوع إلكترونياً)`}
              </span>
            </div>

            {/* OTP input */}
            <div className="flex items-center gap-2">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError('');
                  }}
                  placeholder={lang === 'ar' ? 'كود OTP' : 'OTP'}
                  className="w-24 rounded-xl border border-stone-300 p-2.5 text-center font-mono text-sm font-black tracking-widest outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={() => handleVerifyOtpAndDeliver(currentActiveDelivery)}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                {lang === 'ar' ? 'تأكيد التسليم' : 'Complete Delivery'}
              </button>
            </div>
          </div>

          {otpError && (
            <div className="text-xs text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{otpError}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Available Jobs to Accept */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {lang === 'ar' ? 'طلبات جاهزة للاستلام من المطاعم' : 'Available Delivery Jobs'}
          </h2>
          <span className="text-xs text-stone-500">
            {availableDeliveries.length} {lang === 'ar' ? 'طلب متاح' : 'jobs available'}
          </span>
        </div>

        {availableDeliveries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-xs text-stone-500">
              {lang === 'ar'
                ? 'لا توجد طلبات جديدة بانتظار سائق في هذه اللحظة. عندما يقوم مطعم بتجهيز وجبة ستظهر هنا.'
                : 'No pending orders waiting for a driver right now.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDeliveries.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-mono text-xs font-bold text-orange-600">{order.orderNumber}</span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +{formatCurrency(order.deliveryFee, lang)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-stone-700">
                    <div className="font-bold">{lang === 'ar' ? order.restaurantNameAr : order.restaurantName}</div>
                    <div className="text-stone-500">
                      {lang === 'ar' ? 'التسليم إلى: ' : 'To: '}{order.deliveryAddress.neighborhood}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    {order.items.length} {lang === 'ar' ? 'وجبة' : 'dishes'}
                  </span>
                  <button
                    onClick={() => handleAcceptDelivery(order)}
                    className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition active:scale-95"
                  >
                    {lang === 'ar' ? 'قبول وتوصيل الطلب' : 'Accept Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
