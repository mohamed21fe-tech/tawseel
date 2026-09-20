import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserRole,
  Language,
  User,
  Restaurant,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  DriverProfile,
  Promotion,
  SelectedModifier,
} from '../types';
import {
  INITIAL_RESTAURANTS,
  DEMO_USERS,
  INITIAL_DRIVER_PROFILE,
  INITIAL_PROMOTIONS,
  POPULAR_IDLIB_LOCATIONS,
} from '../data/seedData';
import { generateOrderNumber, generateOTP } from '../utils/formatters';

interface AppContextType {
  lang: Language;
  toggleLanguage: () => void;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  restaurants: Restaurant[];
  updateRestaurantStatus: (id: string, isOpen: boolean) => void;
  toggleRestaurantOpen: (id: string) => void;
  updateMenuItem: (restId: string, item: MenuItem) => void;
  toggleMenuItemAvailability: (restId: string, itemId: string) => void;
  addMenuItem: (restId: string, item: MenuItem) => void;
  cart: CartItem[];
  cartRestaurant: { id: string; name: string; nameAr: string; deliveryFee: number; minOrder: number } | null;
  addToCart: (item: MenuItem, restaurant: Restaurant, modifiers?: SelectedModifier[], instructions?: string) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  appliedPromo: Promotion | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, prepTime?: number) => void;
  cancelOrder: (orderId: string) => void;
  driverProfile: DriverProfile;
  toggleDriverOnline: () => void;
  driverAcceptOrder: (orderId: string) => void;
  driverCompleteDelivery: (orderId: string, inputOtp: string) => { success: boolean; message: string };
  lowBandwidthMode: boolean;
  toggleLowBandwidthMode: () => void;
  promotions: Promotion[];
  addPromotion: (promo: Promotion) => void;
  togglePromotion: (id: string) => void;
  playNotificationSound: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web Audio synthesizer for alert chimes (offline safe, no external files)
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Localization: Arabic (default, RTL) and English (LTR)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('idlib_eats_lang');
    return (saved as Language) || 'ar';
  });

  // User Role & Current Session
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('idlib_eats_role');
    return (saved as UserRole) || 'customer';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => DEMO_USERS[activeRole] || DEMO_USERS.customer);

  // Restaurants State
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('idlib_eats_restaurants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RESTAURANTS;
      }
    }
    return INITIAL_RESTAURANTS;
  });

  // Cart State (Offline Caching)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('idlib_eats_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Active Promo
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);

  // Orders State (Mock persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('idlib_eats_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Initial sample active order for demonstration
    const sampleOrder: Order = {
      id: 'order-demo-1',
      orderNumber: '#IDL-7821',
      customerId: 'user-customer-1',
      customerName: 'Ahmad Al-Halabi',
      customerPhone: '0933123456',
      restaurantId: 'rest-sultan',
      restaurantName: 'Al-Sultan Shawarma & Grills',
      restaurantNameAr: 'شاورما ومشويات السلطان',
      restaurantPhone: '+963 933 112 345',
      restaurantLat: 35.9320,
      restaurantLng: 36.6325,
      driverId: 'user-driver-1',
      driverName: 'Mustafa Al-Khatib',
      driverPhone: '0944778899',
      driverLat: 35.9317,
      driverLng: 36.6328,
      status: 'on_the_way',
      items: [
        {
          id: 'item-1',
          menuItemId: 'item-sh-arabic',
          name: 'Arabic Chicken Shawarma Plate',
          nameAr: 'وجبة شاورما عربي دجاج إكسترا',
          quantity: 2,
          unitPrice: 32000,
          totalPrice: 64000,
          selectedModifiers: [
            {
              groupId: 'mod-sauce',
              groupName: 'Extra Dips',
              optionId: 'opt-garlic',
              optionName: 'Extra Toum',
              optionNameAr: 'ثومية إضافية',
              price: 2500,
            },
          ],
        },
      ],
      subtotal: 66500,
      deliveryFee: 4000,
      discount: 5000,
      total: 65500,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      deliveryAddress: {
        id: 'addr-1',
        userId: 'user-customer-1',
        label: 'المنزل',
        neighborhood: 'شارع الثورة',
        street: 'شارع الثورة الرئيسي، بناء الأمل، ط3',
        lat: 35.9312,
        lng: 36.6335,
      },
      deliveryNotes: 'الاتصال عند الوصول للبناء',
      prepTimeMinutes: 20,
      otpCode: '4829',
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      estimatedDeliveryTime: '8-12 دقيقة',
    };
    return [sampleOrder];
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => orders[0] || null);

  // Driver Fleet State
  const [driverProfile, setDriverProfile] = useState<DriverProfile>(INITIAL_DRIVER_PROFILE);

  // Low Bandwidth Mode (Optimized 3G connectivity in Syria)
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(() => {
    return localStorage.getItem('idlib_eats_low_bw') === 'true';
  });

  // Sync RTL and Document title on language change
  useEffect(() => {
    localStorage.setItem('idlib_eats_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Sync role and active user
  const switchRole = useCallback((newRole: UserRole) => {
    setActiveRole(newRole);
    setCurrentUser(DEMO_USERS[newRole] || DEMO_USERS.customer);
    localStorage.setItem('idlib_eats_role', newRole);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const toggleLowBandwidthMode = useCallback(() => {
    setLowBandwidthMode((prev) => {
      const next = !prev;
      localStorage.setItem('idlib_eats_low_bw', String(next));
      return next;
    });
  }, []);

  // Save Cart to LocalStorage for offline cart caching
  useEffect(() => {
    localStorage.setItem('idlib_eats_cart', JSON.stringify(cart));
  }, [cart]);

  // Save Orders
  useEffect(() => {
    localStorage.setItem('idlib_eats_orders', JSON.stringify(orders));
  }, [orders]);

  // Save Restaurants
  useEffect(() => {
    localStorage.setItem('idlib_eats_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  // Simulated live driver movement for orders in "on_the_way" state
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) => {
        let changed = false;
        const updated = prevOrders.map((ord) => {
          if (ord.status === 'on_the_way' && ord.driverLat && ord.driverLng) {
            changed = true;
            // Linear interpolate toward customer address
            const targetLat = ord.deliveryAddress.lat;
            const targetLng = ord.deliveryAddress.lng;
            const stepLat = (targetLat - ord.driverLat) * 0.15;
            const stepLng = (targetLng - ord.driverLng) * 0.15;

            const nextLat = ord.driverLat + stepLat;
            const nextLng = ord.driverLng + stepLng;

            return {
              ...ord,
              driverLat: nextLat,
              driverLng: nextLng,
            };
          }
          return ord;
        });

        return changed ? updated : prevOrders;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Keep activeOrder in sync with orders list
  useEffect(() => {
    if (activeOrder) {
      const fresh = orders.find((o) => o.id === activeOrder.id);
      if (fresh) setActiveOrder(fresh);
    }
  }, [orders, activeOrder]);

  // Cart Management
  const cartRestaurant = cart.length > 0
    ? {
        id: cart[0].restaurantId,
        name: cart[0].restaurantName,
        nameAr: cart[0].restaurantNameAr,
        deliveryFee: restaurants.find((r) => r.id === cart[0].restaurantId)?.deliveryFee || 3500,
        minOrder: restaurants.find((r) => r.id === cart[0].restaurantId)?.minOrder || 20000,
      }
    : null;

  const addToCart = useCallback(
    (item: MenuItem, restaurant: Restaurant, modifiers: SelectedModifier[] = [], instructions?: string) => {
      playChime();
      setCart((prev) => {
        // If adding from another restaurant, reset cart with confirmation in UI
        if (prev.length > 0 && prev[0].restaurantId !== restaurant.id) {
          // Replace cart with item from new restaurant
          const modTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
          const unitPrice = item.price + modTotal;
          const cartItemId = `${item.id}-${modifiers.map((m) => m.optionId).sort().join('-')}`;
          return [
            {
              cartItemId,
              menuItem: item,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              restaurantNameAr: restaurant.nameAr,
              quantity: 1,
              selectedModifiers: modifiers,
              unitPrice,
              totalPrice: unitPrice,
              specialInstructions: instructions,
            },
          ];
        }

        const modTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
        const unitPrice = item.price + modTotal;
        const cartItemId = `${item.id}-${modifiers.map((m) => m.optionId).sort().join('-')}`;

        const existingIndex = prev.findIndex((ci) => ci.cartItemId === cartItemId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const current = updated[existingIndex];
          const newQty = current.quantity + 1;
          updated[existingIndex] = {
            ...current,
            quantity: newQty,
            totalPrice: newQty * current.unitPrice,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              cartItemId,
              menuItem: item,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              restaurantNameAr: restaurant.nameAr,
              quantity: 1,
              selectedModifiers: modifiers,
              unitPrice,
              totalPrice: unitPrice,
              specialInstructions: instructions,
            },
          ];
        }
      });
    },
    []
  );

  const updateCartItemQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedPromo(null);
  }, []);

  // Promo Code Application
  const applyPromoCode = useCallback(
    (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      const promo = promotions.find((p) => p.code.toUpperCase() === cleanCode && p.isActive);
      if (!promo) {
        return {
          success: false,
          message: lang === 'ar' ? 'رمز الكوبون غير صالح أو منتهي الصلاحية' : 'Invalid or expired coupon code',
        };
      }

      const currentSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
      if (currentSubtotal < promo.minOrder) {
        return {
          success: false,
          message:
            lang === 'ar'
              ? `الحد الأدنى لتطبيق الكوبون هو ${new Intl.NumberFormat('ar-SY').format(promo.minOrder)} ل.س`
              : `Minimum order for this coupon is ${promo.minOrder} SYP`,
        };
      }

      setAppliedPromo(promo);
      playChime();
      return {
        success: true,
        message: lang === 'ar' ? 'تم تطبيق خصم الكوبون بنجاح!' : 'Coupon applied successfully!',
      };
    },
    [cart, promotions, lang]
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  // Order Placement Flow
  const placeOrder = useCallback(
    (orderData: Partial<Order>): Order => {
      const rest = restaurants.find((r) => r.id === orderData.restaurantId);
      const subtotal = cart.reduce((sum, ci) => sum + ci.totalPrice, 0);
      const deliveryFee = rest?.deliveryFee || 3500;
      let discount = 0;

      if (appliedPromo) {
        if (appliedPromo.discountPercentage) {
          discount = Math.round(subtotal * appliedPromo.discountPercentage);
        } else if (appliedPromo.discountAmount) {
          discount = appliedPromo.discountAmount;
        }
      }

      const total = Math.max(0, subtotal + deliveryFee - discount);
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: generateOrderNumber(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        restaurantId: rest?.id || 'rest-sultan',
        restaurantName: rest?.name || 'Al-Sultan',
        restaurantNameAr: rest?.nameAr || 'مطعم السلطان',
        restaurantPhone: rest?.phone || '+963 933 112 345',
        restaurantLat: rest?.lat || 35.9320,
        restaurantLng: rest?.lng || 36.6325,
        status: 'pending',
        items: cart.map((ci) => ({
          id: ci.cartItemId,
          menuItemId: ci.menuItem.id,
          name: ci.menuItem.name,
          nameAr: ci.menuItem.nameAr,
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
          totalPrice: ci.totalPrice,
          selectedModifiers: ci.selectedModifiers,
        })),
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentTransactionId: orderData.paymentTransactionId,
        deliveryAddress:
          orderData.deliveryAddress ||
          currentUser.addresses[0] || {
            id: 'addr-custom',
            userId: currentUser.id,
            label: 'الموقع المحدد',
            street: 'ساحة الساعة، إدلب',
            neighborhood: 'وسط المدينة',
            lat: 35.9306,
            lng: 36.6340,
          },
        deliveryNotes: orderData.deliveryNotes,
        prepTimeMinutes: 25,
        otpCode: generateOTP(),
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: '25-35 دقيقة',
      };

      setOrders((prev) => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      clearCart();
      playChime();
      return newOrder;
    },
    [cart, appliedPromo, currentUser, restaurants, clearCart]
  );

  // Status updates
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, prepTime?: number) => {
    playChime();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            status,
            prepTimeMinutes: prepTime || ord.prepTimeMinutes,
          };
          if (status === 'delivered') {
            updated.deliveredAt = new Date().toISOString();
          }
          return updated;
        }
        return ord;
      })
    );
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
  }, [updateOrderStatus]);

  // Driver actions
  const toggleDriverOnline = useCallback(() => {
    setDriverProfile((prev) => ({
      ...prev,
      isOnline: !prev.isOnline,
    }));
  }, []);

  const driverAcceptOrder = useCallback((orderId: string) => {
    playChime();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            driverId: driverProfile.userId,
            driverName: driverProfile.name,
            driverPhone: driverProfile.phone,
            driverLat: driverProfile.currentLat,
            driverLng: driverProfile.currentLng,
            status: 'ready_for_pickup',
          };
        }
        return ord;
      })
    );
  }, [driverProfile]);

  const driverCompleteDelivery = useCallback(
    (orderId: string, inputOtp: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { success: false, message: 'Order not found' };
      if (inputOtp.trim() !== order.otpCode.trim()) {
        return {
          success: false,
          message: lang === 'ar' ? 'رمز التأكيد (OTP) غير صحيح!' : 'Invalid OTP code!',
        };
      }

      playChime();
      updateOrderStatus(orderId, 'delivered');
      setDriverProfile((prev) => ({
        ...prev,
        completedDeliveries: prev.completedDeliveries + 1,
        todayEarnings: prev.todayEarnings + 4000,
        cashInHand: order.paymentMethod === 'cod' ? prev.cashInHand + order.total : prev.cashInHand,
      }));

      return {
        success: true,
        message: lang === 'ar' ? 'تم تسليم الطلب وإيداع الأجر بنجاح!' : 'Delivery verified and earnings logged!',
      };
    },
    [orders, lang, updateOrderStatus]
  );

  // Restaurant menu updates
  const updateRestaurantStatus = useCallback((id: string, isOpen: boolean) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isOpen } : r))
    );
  }, []);

  const toggleRestaurantOpen = useCallback((id: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isOpen: !r.isOpen } : r))
    );
  }, []);

  const updateMenuItem = useCallback((restId: string, item: MenuItem) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === restId) {
          return {
            ...r,
            menuItems: r.menuItems.map((m) => (m.id === item.id ? item : m)),
          };
        }
        return r;
      })
    );
  }, []);

  const toggleMenuItemAvailability = useCallback((restId: string, itemId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === restId) {
          return {
            ...r,
            menuItems: r.menuItems.map((m) =>
              m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m
            ),
          };
        }
        return r;
      })
    );
  }, []);

  const addMenuItem = useCallback((restId: string, item: MenuItem) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === restId) {
          return {
            ...r,
            menuItems: [item, ...r.menuItems],
          };
        }
        return r;
      })
    );
  }, []);

  // Promotions
  const addPromotion = useCallback((promo: Promotion) => {
    setPromotions((prev) => [promo, ...prev]);
  }, []);

  const togglePromotion = useCallback((id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        toggleLanguage,
        activeRole,
        switchRole,
        currentUser,
        setCurrentUser,
        restaurants,
        updateRestaurantStatus,
        toggleRestaurantOpen,
        updateMenuItem,
        toggleMenuItemAvailability,
        addMenuItem,
        cart,
        cartRestaurant,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        driverProfile,
        toggleDriverOnline,
        driverAcceptOrder,
        driverCompleteDelivery,
        lowBandwidthMode,
        toggleLowBandwidthMode,
        promotions,
        addPromotion,
        togglePromotion,
        playNotificationSound: playChime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
