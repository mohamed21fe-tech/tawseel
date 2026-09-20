import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, MenuItem, Restaurant, Order, OrderItem } from '../../types';
import { formatCurrency, getStatusDetails } from '../../utils/formatters';
import {
  Store,
  Clock,
  DollarSign,
  ShoppingBag,
  Bell,
  CheckCircle,
  XCircle,
  ChefHat,
  Plus,
  Power,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const RestaurantDashboard: React.FC = () => {
  const {
    restaurants,
    orders,
    updateOrderStatus,
    toggleRestaurantOpen,
    toggleMenuItemAvailability,
    lang,
  } = useApp();

  // For this partner view, let's select Al-Sultan Restaurant as the managed restaurant
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(restaurants[0]?.id || '');
  const activeRestaurant = restaurants.find((r: Restaurant) => r.id === selectedRestaurantId) || restaurants[0];

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'stats'>('orders');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filter orders belonging to this restaurant
  const restaurantOrders = orders.filter((o: Order) => o.restaurantId === activeRestaurant?.id);
  const activeIncomingOrders = restaurantOrders.filter(
    (o: Order) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  // Revenue metrics
  const totalRevenue = restaurantOrders
    .filter((o: Order) => o.status === 'delivered')
    .reduce((sum: number, o: Order) => sum + o.subtotal, 0);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  if (!activeRestaurant) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Restaurant Partner Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-stone-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={activeRestaurant.logo}
            alt={activeRestaurant.name}
            className="h-16 w-16 rounded-2xl border-2 border-orange-500 object-cover bg-white"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">
                {lang === 'ar' ? activeRestaurant.nameAr : activeRestaurant.name}
              </h1>
              <span className="rounded bg-orange-600 px-2 py-0.5 text-[10px] font-bold">
                {lang === 'ar' ? 'بوابة الشريك' : 'Partner Portal'}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              {lang === 'ar' ? activeRestaurant.addressAr : activeRestaurant.address} • {activeRestaurant.phone}
            </p>
          </div>
        </div>

        {/* Quick Restaurant Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Switch Active Restaurant Demo */}
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="rounded-xl bg-stone-800 px-3 py-2 text-xs font-semibold text-white border border-stone-700 outline-none"
          >
            {restaurants.map((r: Restaurant) => (
              <option key={r.id} value={r.id}>
                {lang === 'ar' ? r.nameAr : r.name}
              </option>
            ))}
          </select>

          {/* Open/Close Store Toggle */}
          <button
            onClick={() => toggleRestaurantOpen(activeRestaurant.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeRestaurant.isOpen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
          >
            <Power className="h-4 w-4" />
            <span>
              {activeRestaurant.isOpen
                ? lang === 'ar'
                  ? 'المطعم يستقبل الطلبات'
                  : 'Open for Orders'
                : lang === 'ar'
                ? 'المطعم مغلق حالياً'
                : 'Store Closed'}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{lang === 'ar' ? 'الطلبات النشطة' : 'Active Orders'}</span>
            <ShoppingBag className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900">{activeIncomingOrders.length}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">{lang === 'ar' ? 'تحتاج لتحضير ومتابعة' : 'In kitchen pipeline'}</div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{lang === 'ar' ? 'إجمالي المبيعات' : 'Delivered Sales'}</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-black text-stone-900">{formatCurrency(totalRevenue, lang)}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{lang === 'ar' ? 'المكتملة اليوم' : 'Total today'}</div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{lang === 'ar' ? 'متوسط وقت الطهي' : 'Avg Prep Time'}</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900">18 {lang === 'ar' ? 'دقيقة' : 'min'}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">{lang === 'ar' ? 'كفاءة ممتازة' : 'On schedule'}</div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{lang === 'ar' ? 'تقييم الزبائن' : 'Rating'}</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900">{activeRestaurant.rating} ⭐</div>
          <div className="text-[11px] text-stone-500 mt-0.5">{activeRestaurant.reviewCount} {lang === 'ar' ? 'تقييم' : 'reviews'}</div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>{lang === 'ar' ? 'شاشة استقبال وتجهيز الطلبات' : 'Kitchen Live Orders'}</span>
          {activeIncomingOrders.length > 0 && (
            <span className="rounded-full bg-white px-1.5 py-0.2 text-[10px] font-black text-orange-600">
              {activeIncomingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'menu'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <ChefHat className="h-4 w-4" />
          <span>{lang === 'ar' ? 'إدارة المنيو وتوفر الوجبات' : 'Menu & Item Availability'}</span>
        </button>
      </div>

      {/* TAB 1: Kitchen Orders Pipeline */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              {lang === 'ar' ? 'الطلبات الجارية للمطعم' : 'Incoming Restaurant Orders'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{lang === 'ar' ? 'تحديث تلقائي عبر السوكت' : 'Real-time WebSocket active'}</span>
            </div>
          </div>

          {activeIncomingOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-xl">
                🍳
              </div>
              <h3 className="text-sm font-bold text-stone-800">
                {lang === 'ar' ? 'لا توجد طلبات جديدة معلقة حالياً' : 'No active pending orders right now'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {lang === 'ar'
                  ? 'عندما يقوم أي زبون بطلب وجبة، ستظهر فوراً هنا مع جرس التنبيه.'
                  : 'New customer orders will appear here in real time.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeIncomingOrders.map((order: Order) => {
                const statusInfo = getStatusDetails(order.status, lang);
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <span className="font-mono text-sm font-black text-orange-600">
                            {order.orderNumber}
                          </span>
                          <div className="text-xs text-stone-500">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Customer info */}
                      <div className="mt-3 text-xs text-stone-700 space-y-1">
                        <div className="font-bold">{order.customerName} ({order.customerPhone})</div>
                        <div className="text-stone-500">{order.deliveryAddress.street} - {order.deliveryAddress.neighborhood}</div>
                        {order.deliveryNotes && (
                          <div className="rounded bg-amber-50 p-1.5 text-amber-800 text-[11px] border border-amber-200">
                            {lang === 'ar' ? 'ملاحظة خاصة: ' : 'Note: '}{order.deliveryNotes}
                          </div>
                        )}
                      </div>

                      {/* Items list */}
                      <div className="mt-3 rounded-xl bg-stone-50 p-3 border border-stone-200 space-y-1.5">
                        {order.items.map((item: OrderItem) => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="font-bold text-stone-800">
                              {item.quantity}x {lang === 'ar' ? item.nameAr : item.name}
                            </span>
                            <span className="text-stone-600">{formatCurrency(item.totalPrice, lang)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-stone-200 flex justify-between font-extrabold text-stone-900 text-xs">
                          <span>{lang === 'ar' ? 'المجموع' : 'Total'}</span>
                          <span>{formatCurrency(order.total, lang)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons depending on state */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                          >
                            {lang === 'ar' ? 'اعتذار / رفض' : 'Reject'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'confirmed')}
                            className="rounded-xl bg-orange-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700"
                          >
                            {lang === 'ar' ? 'قبول وتأكيد الطلب' : 'Accept Order'}
                          </button>
                        </>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                        >
                          {lang === 'ar' ? 'بدء الطهي والتجهيز' : 'Start Cooking'}
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'ready_for_pickup')}
                          className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          {lang === 'ar' ? 'جاهز للاستلام من الكابتن' : 'Ready for Pickup'}
                        </button>
                      )}

                      {order.status === 'ready_for_pickup' && (
                        <span className="text-xs font-bold text-blue-600">
                          {lang === 'ar' ? 'في انتظار وصول كابتن الدراجة' : 'Waiting for Courier'}
                        </span>
                      )}

                      {order.status === 'on_the_way' && (
                        <span className="text-xs font-bold text-emerald-600">
                          {lang === 'ar' ? 'مع الكابتن في الطريق' : 'En route with courier'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Menu Items & Stock Availability */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {lang === 'ar' ? 'قائمة وجبات المطعم' : 'Restaurant Menu Items'}
              </h2>
              <p className="text-xs text-stone-500">
                {lang === 'ar'
                  ? 'يمكنك إيقاف أو تفعيل أي وجبة عند نفاد المكونات بنقرة زر واحدة.'
                  : 'Toggle item availability instantly if ingredients run out.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRestaurant.menuItems.map((item: MenuItem) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {lang === 'ar' ? item.nameAr : item.name}
                    </h4>
                    <span className="text-xs font-extrabold text-orange-600">
                      {formatCurrency(item.price, lang)}
                    </span>
                  </div>
                </div>

                {/* Toggle Availability */}
                <button
                  onClick={() => toggleMenuItemAvailability(activeRestaurant.id, item.id)}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    item.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border border-rose-300'
                  }`}
                >
                  <span>
                    {item.isAvailable
                      ? lang === 'ar'
                        ? 'متوفر'
                        : 'In Stock'
                      : lang === 'ar'
                      ? 'نفذ'
                      : 'Out of Stock'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
