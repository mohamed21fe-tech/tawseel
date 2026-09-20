export type UserRole = 'customer' | 'restaurant' | 'driver' | 'admin';

export type Language = 'ar' | 'en';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // e.g. "المنزل", "العمل", "مكتب الثورة"
  street: string;
  neighborhood: string; // e.g. "شارع الثورة", "حي الضبيط", "حي القصور", "سرمدا"
  building?: string;
  floor?: string;
  notes?: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  image: string;
  sortOrder: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  nameAr: string;
  price: number; // SYP
}

export interface ModifierGroup {
  id: string;
  name: string;
  nameAr: string;
  required: boolean;
  maxSelection: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number; // in Syrian Pounds (SYP)
  image: string;
  isAvailable: boolean;
  isPopular?: boolean;
  prepTimeMinutes?: number;
  modifierGroups?: ModifierGroup[];
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  cuisine: string;
  cuisineAr: string;
  logo: string;
  banner: string;
  address: string;
  addressAr: string;
  neighborhood: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  deliveryFee: number; // in SYP
  minOrder: number; // in SYP
  estimatedTime: string; // e.g. "25 - 35 min"
  estimatedTimeAr: string;
  commissionRate: number; // e.g. 0.12 (12%)
  isActive: boolean;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  categories: Category[];
  menuItems: MenuItem[];
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'syriatel_cash' | 'sham_cash' | 'mtn_cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  optionNameAr: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // unique combo of menuItemId + modifiers
  menuItem: MenuItem;
  restaurantId: string;
  restaurantName: string;
  restaurantNameAr: string;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  nameAr: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedModifiers?: SelectedModifier[];
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #IDL-8492
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantNameAr: string;
  restaurantPhone: string;
  restaurantLat: number;
  restaurantLng: number;
  restaurantAddress?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLat?: number;
  driverLng?: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  deliveryAddress: Address;
  deliveryNotes?: string;
  prepTimeMinutes?: number;
  otpCode: string; // 4-digit code customer gives to driver for proof of delivery
  createdAt: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car';
  vehiclePlate?: string;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  rating: number;
  completedDeliveries: number;
  todayEarnings: number;
  cashInHand: number;
}

export interface Promotion {
  id: string;
  code: string;
  discountAmount?: number;
  discountPercentage?: number;
  minOrder: number;
  description: string;
  descriptionAr: string;
  isActive: boolean;
  expiryDate: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  driverId?: string;
  restaurantRating: number;
  driverRating?: number;
  comment?: string;
  createdAt: string;
}
