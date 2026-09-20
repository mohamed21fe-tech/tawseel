import React from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/seedData';
import { User, Order } from '../types';
import { formatCurrency, getStatusDetails } from '../utils/formatters';
import {
  User as UserIcon,
  Phone,
  MapPin,
  Clock,
  Shield,
  ShoppingBag,
  X,
  ExternalLink,
  ChevronRight,
  Globe,
  Zap,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const {
    currentUser,
    setCurrentUser,
    switchRole,
    activeRole,
    orders,
    lang,
    toggleLanguage,
    lowBandwidthMode,
    toggleLowBandwidthMode,
  } = useApp();

  if (!isOpen) return null;

  const userOrders = orders.filter((o: Order) => o.customerId === currentUser.id);

  const handleSelectUser = (u: User) => {
    setCurrentUser(u);
    switchRole(u.role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-base font-black text-stone-900">
            {lang === 'ar' ? 'الملف الشخصي والحساب' : 'User Profile & Account'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="mt-4 flex items-center gap-3.5 rounded-2xl bg-orange-50/60 p-4 border border-orange-200">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
            alt={currentUser.name}
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-orange-400"
          />
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">{currentUser.name}</h3>
            <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5 font-mono">
              <Phone className="h-3 w-3 text-orange-600" />
              <span>{currentUser.phone}</span>
            </p>
            <span className="mt-1 inline-block rounded-md bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              {activeRole}
            </span>
          </div>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-stone-700 mb-2">
            {lang === 'ar' ? 'تبديل الحساب السريع للتجربة (Demo Switcher):' : 'Switch Demo Account:'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(DEMO_USERS).map((u: User) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-2 rounded-xl p-2 text-start transition border ${
                    isCurrent
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate">{u.name}</div>
                    <div className="text-[10px] opacity-70 uppercase">{u.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences Toggles */}
        <div className="mt-5 space-y-2 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-200 text-xs">
            <span className="flex items-center gap-2 font-bold text-stone-800">
              <Globe className="h-4 w-4 text-stone-600" />
              {lang === 'ar' ? 'اللغة الحالية (عربي / English)' : 'Current Language'}
            </span>
            <button
              onClick={toggleLanguage}
              className="rounded-lg bg-white px-3 py-1 font-bold text-orange-600 shadow-2xs border border-stone-200"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-200 text-xs">
            <span className="flex items-center gap-2 font-bold text-stone-800">
              <Zap className="h-4 w-4 text-amber-600" />
              {lang === 'ar' ? 'توفير باقة 3G (إخفاء الصور الثقيلة)' : 'Low Bandwidth Saver'}
            </span>
            <button
              onClick={toggleLowBandwidthMode}
              className={`rounded-lg px-3 py-1 font-bold shadow-2xs border ${
                lowBandwidthMode
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              {lowBandwidthMode ? (lang === 'ar' ? 'مفعّل' : 'Active') : (lang === 'ar' ? 'معطّل' : 'Off')}
            </button>
          </div>
        </div>

        {/* User's Order History */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-600" />
              <span>{lang === 'ar' ? 'سجل طلباتك السابقة' : 'Order History'}</span>
            </h4>
            <span className="text-[11px] text-stone-500">{userOrders.length} {lang === 'ar' ? 'طلب' : 'orders'}</span>
          </div>

          {userOrders.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">
              {lang === 'ar' ? 'لا توجد طلبات سابقة في سجلك' : 'No past orders found.'}
            </p>
          ) : (
            <div className="space-y-2">
              {userOrders.slice(0, 4).map((order: Order) => {
                const statusInfo = getStatusDetails(order.status, lang);
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      onClose();
                      onTrackOrder(order.id);
                    }}
                    className="flex items-center justify-between rounded-xl border border-stone-200 p-3 hover:bg-stone-50 cursor-pointer transition text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900">
                        {lang === 'ar' ? order.restaurantNameAr : order.restaurantName}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {order.orderNumber} • {formatCurrency(order.total, lang)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-stone-400 rtl:rotate-180" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
