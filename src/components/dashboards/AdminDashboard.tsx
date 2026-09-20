import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, Order, Restaurant, Promotion } from '../../types';
import { formatCurrency, getStatusDetails, getPaymentMethodDetails } from '../../utils/formatters';
import {
  ShieldAlert,
  Users,
  Store,
  Bike,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onInspectOrder?: (orderId: string) => void }> = ({
  onInspectOrder,
}) => {
  const { restaurants, orders, promotions, updateOrderStatus, lang } = useApp();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'orders' | 'restaurants' | 'promos'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Total Platform GMV
  const totalGMV = orders.reduce((sum: number, o: Order) => sum + o.total, 0);
  const deliveredOrders = orders.filter((o: Order) => o.status === 'delivered');
  const deliveredGMV = deliveredOrders.reduce((sum: number, o: Order) => sum + o.total, 0);
  const platformRevenue = Math.round(deliveredGMV * 0.1); // 10% platform commission

  const filteredOrders = orders.filter((o: Order) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-stone-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-2xl shadow-lg">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">
                {lang === 'ar' ? 'لوحة القيادة المركزية — أكلات إدلب' : 'Idlib Eats Command Center'}
              </h1>
              <span className="rounded bg-orange-500/30 text-orange-400 border border-orange-500/40 px-2 py-0.5 text-[10px] font-bold">
                Admin
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              {lang === 'ar'
                ? 'إدارة المطاعم الشريكة، كباتن التوصيل، العمليات المالية والمراقبة المباشرة'
                : 'Manage restaurant partners, courier fleet, cash flow, and live operations'}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              selectedTab === 'overview'
                ? 'bg-orange-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
          </button>
          <button
            onClick={() => setSelectedTab('orders')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              selectedTab === 'orders'
                ? 'bg-orange-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {lang === 'ar' ? 'مراقبة الطلبات' : 'All Orders'} ({orders.length})
          </button>
          <button
            onClick={() => setSelectedTab('restaurants')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              selectedTab === 'restaurants'
                ? 'bg-orange-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {lang === 'ar' ? 'المطاعم الشريكة' : 'Restaurants'} ({restaurants.length})
          </button>
          <button
            onClick={() => setSelectedTab('promos')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              selectedTab === 'promos'
                ? 'bg-orange-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {lang === 'ar' ? 'كوبونات الخصم' : 'Coupons'}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{lang === 'ar' ? 'حجم التعاملات الإجمالي (GMV)' : 'Total Gross Volume'}</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-xl font-black text-stone-900">{formatCurrency(totalGMV, lang)}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">{orders.length} {lang === 'ar' ? 'طلب مسجل' : 'total orders'}</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{lang === 'ar' ? 'عمولة المنصة (10%)' : 'Platform Revenue (10%)'}</span>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div className="mt-2 text-xl font-black text-orange-600">{formatCurrency(platformRevenue, lang)}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{lang === 'ar' ? 'من الطلبات المكتملة' : 'from delivered'}</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{lang === 'ar' ? 'المطاعم المسجلة' : 'Registered Restaurants'}</span>
                <Store className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-stone-900">{restaurants.length}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">{restaurants.filter((r) => r.isOpen).length} {lang === 'ar' ? 'مفتوح الآن' : 'open now'}</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{lang === 'ar' ? 'كباتن التوصيل النشطين' : 'Active Drivers'}</span>
                <Bike className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-stone-900">12</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{lang === 'ar' ? 'في إدلب وسرمدا' : 'Idlib & Sarmada'}</div>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-3">
              {lang === 'ar' ? 'توزيع طرق الدفع المحلية في إدلب:' : 'Local Syrian Payment Distribution:'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-orange-50 p-3 border border-orange-100">
                <div className="text-base font-black text-orange-950">
                  {orders.filter((o) => o.paymentMethod === 'cod').length}
                </div>
                <div className="text-xs font-bold text-orange-700 mt-0.5">{lang === 'ar' ? 'الدفع نقداً (COD)' : 'Cash on Delivery'}</div>
                <div className="text-[10px] text-stone-500">65% من الطلبات</div>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
                <div className="text-base font-black text-blue-950">
                  {orders.filter((o) => o.paymentMethod === 'syriatel_cash').length}
                </div>
                <div className="text-xs font-bold text-blue-700 mt-0.5">{lang === 'ar' ? 'سيريتل كاش' : 'Syriatel Cash'}</div>
                <div className="text-[10px] text-stone-500">20% من الطلبات</div>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                <div className="text-base font-black text-emerald-950">
                  {orders.filter((o) => o.paymentMethod === 'sham_cash').length}
                </div>
                <div className="text-xs font-bold text-emerald-700 mt-0.5">{lang === 'ar' ? 'شام كاش' : 'Sham Cash'}</div>
                <div className="text-[10px] text-stone-500">10% من الطلبات</div>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
                <div className="text-base font-black text-amber-950">
                  {orders.filter((o) => o.paymentMethod === 'mtn_cash').length}
                </div>
                <div className="text-xs font-bold text-amber-700 mt-0.5">{lang === 'ar' ? 'كاش إم تي إن' : 'MTN Cash'}</div>
                <div className="text-[10px] text-stone-500">5% من الطلبات</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {selectedTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-stone-900">
              {lang === 'ar' ? 'جميع طلبات المنصة الحية' : 'Live Platform Orders'}
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {['all', 'pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition ${
                      statusFilter === st
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st === 'all'
                      ? lang === 'ar'
                        ? 'الكل'
                        : 'All'
                      : getStatusDetails(st as OrderStatus, lang).label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-start text-xs text-stone-600">
              <thead className="border-b border-stone-200 bg-stone-50 font-bold text-stone-800">
                <tr>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'المطعم' : 'Restaurant'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'الزبون والموقع' : 'Customer & Area'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'طريقة الدفع' : 'Payment'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-3.5 text-center">{lang === 'ar' ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order: Order) => {
                  const statusInfo = getStatusDetails(order.status, lang);
                  const payInfo = getPaymentMethodDetails(order.paymentMethod, lang);
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition">
                      <td className="p-3.5 font-mono font-bold text-orange-600">{order.orderNumber}</td>
                      <td className="p-3.5 font-bold text-stone-900">
                        {lang === 'ar' ? order.restaurantNameAr : order.restaurantName}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-800">{order.customerName}</div>
                        <div className="text-[11px] text-stone-400">{order.deliveryAddress.neighborhood}</div>
                      </td>
                      <td className="p-3.5 font-black text-stone-900">{formatCurrency(order.total, lang)}</td>
                      <td className="p-3.5 font-semibold text-stone-700">
                        {lang === 'ar' ? payInfo.nameAr : payInfo.name}
                      </td>
                      <td className="p-3.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {onInspectOrder && (
                          <button
                            onClick={() => onInspectOrder(order.id)}
                            className="rounded-lg bg-stone-100 p-1.5 text-stone-700 hover:bg-orange-100 hover:text-orange-700"
                            title={lang === 'ar' ? 'تتبع على الخريطة' : 'Inspect'}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restaurants Tab */}
      {selectedTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              {lang === 'ar' ? 'المطاعم المعتمدة على منصة أكلات إدلب' : 'Approved Partner Restaurants'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((r: Restaurant) => (
              <div
                key={r.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={r.logo} alt={r.name} className="h-14 w-14 rounded-2xl object-cover border" />
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{lang === 'ar' ? r.nameAr : r.name}</h3>
                    <p className="text-xs text-stone-500">{r.addressAr} • {r.phone}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-stone-600">
                      <span>⭐ {r.rating}</span>
                      <span>•</span>
                      <span>{r.menuItems.length} {lang === 'ar' ? 'وجبة' : 'items'}</span>
                      <span>•</span>
                      <span className="text-emerald-600">10% {lang === 'ar' ? 'عمولة' : 'commission'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      r.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {r.isOpen ? (lang === 'ar' ? 'مفتوح' : 'Open') : (lang === 'ar' ? 'مغلق' : 'Closed')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promos Tab */}
      {selectedTab === 'promos' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            {lang === 'ar' ? 'كوبونات الخصم والعروض الترويجية' : 'Promotional Coupons'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {promotions.map((p: Promotion) => (
              <div
                key={p.code}
                className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-orange-700 bg-white px-2.5 py-1 rounded-lg border border-orange-200">
                    {p.code}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {p.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'منتهي' : 'Expired')}
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-800">
                  {lang === 'ar' ? p.descriptionAr : p.description}
                </p>
                <div className="text-[11px] text-stone-500">
                  {lang === 'ar' ? 'الحد الأدنى للطلب:' : 'Min Order:'} {formatCurrency(p.minOrder, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
