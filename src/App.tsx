import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Restaurant } from './types';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { RestaurantList } from './components/RestaurantList';
import { RestaurantDetail } from './components/RestaurantDetail';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { UserProfileModal } from './components/UserProfileModal';
import { RestaurantDashboard } from './components/dashboards/RestaurantDashboard';
import { DriverDashboard } from './components/dashboards/DriverDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';

const MainAppContent: React.FC = () => {
  const { activeRole, switchRole, orders, lang } = useApp();

  // Navigation views within Customer Role
  const [currentView, setCurrentView] = useState<'home' | 'restaurant_detail'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Helper to open order tracking
  const handleOpenOrderTracking = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setIsTrackingOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    handleOpenOrderTracking(orderId);
  };

  const activeTrackingOrder = orders.find((o) => o.id === activeTrackingOrderId) || orders[0] || null;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigateHome={() => {
          setCurrentView('home');
          setSelectedRestaurant(null);
        }}
      />

      {/* Main Content Area Based on Active Role */}
      <main className="flex-1">
        {activeRole === 'customer' && (
          <>
            {currentView === 'restaurant_detail' && selectedRestaurant ? (
              <RestaurantDetail
                restaurant={selectedRestaurant}
                onBack={() => {
                  setCurrentView('home');
                  setSelectedRestaurant(null);
                }}
                onOpenCart={() => setIsCartOpen(true)}
              />
            ) : (
              <>
                <LandingHero
                  onSearch={(q) => setSearchQuery(q)}
                  onSelectCategory={(catId) => setSelectedCategory(catId || null)}
                  selectedCategory={selectedCategory}
                  onBecomePartner={() => switchRole('restaurant')}
                  onBecomeDriver={() => switchRole('driver')}
                />

                <RestaurantList
                  onSelectRestaurant={(r) => {
                    setSelectedRestaurant(r);
                    setCurrentView('restaurant_detail');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </>
            )}
          </>
        )}

        {activeRole === 'restaurant' && <RestaurantDashboard />}

        {activeRole === 'driver' && <DriverDashboard />}

        {activeRole === 'admin' && (
          <AdminDashboard
            onInspectOrder={(orderId) => {
              handleOpenOrderTracking(orderId);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectRole={(r) => {
          switchRole(r);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Tracking Live Modal (Leaflet OpenStreetMap) */}
      <OrderTrackingModal
        order={activeTrackingOrder}
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onTrackOrder={(orderId) => handleOpenOrderTracking(orderId)}
      />

      {/* PWA & Low Bandwidth Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
