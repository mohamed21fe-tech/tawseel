import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  ShoppingBag,
  MapPin,
  Globe,
  Zap,
  User as UserIcon,
  Store,
  Bike,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenProfile: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenProfile,
  onNavigateHome,
}) => {
  const {
    lang,
    toggleLanguage,
    activeRole,
    switchRole,
    currentUser,
    cart,
    lowBandwidthMode,
    toggleLowBandwidthMode,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const roleLabels: Record<UserRole, { labelAr: string; labelEn: string; icon: React.ReactNode }> = {
    customer: { labelAr: 'الزبون', labelEn: 'Customer', icon: <UserIcon className="h-4 w-4" /> },
    restaurant: { labelAr: 'شريك المطعم', labelEn: 'Restaurant', icon: <Store className="h-4 w-4" /> },
    driver: { labelAr: 'كابتن التوصيل', labelEn: 'Driver', icon: <Bike className="h-4 w-4" /> },
    admin: { labelAr: 'لوحة الإدارة', labelEn: 'Admin', icon: <ShieldAlert className="h-4 w-4" /> },
  };

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & City Indicator */}
        <div className="flex items-center gap-3">
          <button
            id="nav-logo-btn"
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-start group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              <span className="text-xl">🍲</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-stone-900 font-sans">
                  {lang === 'ar' ? 'أكلات إدلب' : 'Idlib Eats'}
                </span>
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                  {lang === 'ar' ? 'إدلب' : 'IDLIB'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                <span>{lang === 'ar' ? 'سرمدا، إدلب، أريحا' : 'Idlib, Sarmada, Ariha'}</span>
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Role Quick Switcher & Controls */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-stone-100 p-1 border border-stone-200">
            {(['customer', 'restaurant', 'driver', 'admin'] as UserRole[]).map((r) => {
              const active = activeRole === r;
              return (
                <button
                  key={r}
                  id={`role-switch-${r}`}
                  onClick={() => switchRole(r)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? 'bg-white text-orange-600 shadow-xs border border-stone-200/60'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {roleLabels[r].icon}
                  <span>{lang === 'ar' ? roleLabels[r].labelAr : roleLabels[r].labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls: Data Saver, Language, Install, Cart & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Low Bandwidth 3G Mode Toggle */}
          <button
            id="btn-toggle-low-bw"
            onClick={toggleLowBandwidthMode}
            title={lang === 'ar' ? 'توفير استهلاك باقة الإنترنت (3G)' : 'Data Saver Mode'}
            className={`hidden sm:flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold border transition ${
              lowBandwidthMode
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${lowBandwidthMode ? 'text-amber-600 fill-amber-600' : 'text-stone-400'}`} />
            <span className="hidden md:inline">
              {lowBandwidthMode ? (lang === 'ar' ? 'وضع 3G مفعّل' : '3G Active') : (lang === 'ar' ? 'وضع 3G' : '3G Saver')}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            id="btn-toggle-language"
            onClick={toggleLanguage}
            className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
          >
            <Globe className="h-3.5 w-3.5 text-stone-500" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>

          {/* Cart Trigger (Only for Customer Role) */}
          {activeRole === 'customer' && (
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">
                {totalCartCount > 0 ? formatCurrency(totalCartPrice, lang) : lang === 'ar' ? 'السلة' : 'Cart'}
              </span>
              {totalCartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-orange-600">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Avatar */}
          <button
            id="nav-profile-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1.5 sm:px-2.5 sm:py-1.5 hover:bg-stone-100 transition"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
              alt={currentUser.name}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-orange-500/30"
            />
            <span className="hidden md:inline text-xs font-bold text-stone-700 max-w-[90px] truncate">
              {currentUser.name}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            id="nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-xl border border-stone-200 p-2 text-stone-600 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-semibold text-stone-500 mb-1">
            {lang === 'ar' ? 'تبديل دور المستخدم للتجربة:' : 'Switch User Role for Demo:'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['customer', 'restaurant', 'driver', 'admin'] as UserRole[]).map((r) => {
              const active = activeRole === r;
              return (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold transition ${
                    active
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {roleLabels[r].icon}
                  <span>{lang === 'ar' ? roleLabels[r].labelAr : roleLabels[r].labelEn}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <PWAInstallButton />
            <button
              onClick={toggleLowBandwidthMode}
              className="text-xs font-medium text-amber-700 flex items-center gap-1"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{lowBandwidthMode ? (lang === 'ar' ? 'وضع 3G نشط' : '3G Active') : (lang === 'ar' ? 'تفعيل وضع 3G' : 'Enable 3G Saver')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
