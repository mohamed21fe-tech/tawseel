import { Language, OrderStatus, PaymentMethod } from '../types';

export function formatCurrency(amount: number, lang: Language = 'ar'): string {
  const formattedNumber = new Intl.NumberFormat(lang === 'ar' ? 'ar-SY' : 'en-US').format(amount);
  return lang === 'ar' ? `${formattedNumber} ل.س` : `${formattedNumber} SYP`;
}

export function generateOrderNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `#IDL-${randomSuffix}`;
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function getStatusDetails(status: OrderStatus, lang: Language = 'ar'): {
  label: string;
  color: string;
  bg: string;
  stepIndex: number;
  description: string;
} {
  switch (status) {
    case 'pending':
      return {
        label: lang === 'ar' ? 'بانتظار موافقة المطعم' : 'Pending Confirmation',
        color: 'text-amber-700',
        bg: 'bg-amber-100 border-amber-300',
        stepIndex: 0,
        description: lang === 'ar' ? 'تم إرسال طلبك للمطعم وبانتظار التأكيد' : 'Sent to the kitchen, waiting for confirmation',
      };
    case 'confirmed':
      return {
        label: lang === 'ar' ? 'تم تأكيد الطلب' : 'Order Confirmed',
        color: 'text-blue-700',
        bg: 'bg-blue-100 border-blue-300',
        stepIndex: 1,
        description: lang === 'ar' ? 'قبل المطعم طلبك وبدأ في جدولته' : 'Restaurant accepted your order',
      };
    case 'preparing':
      return {
        label: lang === 'ar' ? 'جاري تحضير الوجبة' : 'Preparing Food',
        color: 'text-orange-700',
        bg: 'bg-orange-100 border-orange-300',
        stepIndex: 2,
        description: lang === 'ar' ? 'الشيف يقوم الآن بطهي وتحضير الوجبة الطازجة' : 'Chef is preparing your fresh meal',
      };
    case 'ready_for_pickup':
      return {
        label: lang === 'ar' ? 'جاهز للاستلام من السائق' : 'Ready for Pickup',
        color: 'text-indigo-700',
        bg: 'bg-indigo-100 border-indigo-300',
        stepIndex: 3,
        description: lang === 'ar' ? 'تم تجهيز وتغليف الطلب وبانتظار استلام مندوب التوصيل' : 'Packed and waiting for the courier',
      };
    case 'on_the_way':
      return {
        label: lang === 'ar' ? 'الطلب في الطريق إليك' : 'Out for Delivery',
        color: 'text-emerald-700',
        bg: 'bg-emerald-100 border-emerald-300',
        stepIndex: 4,
        description: lang === 'ar' ? 'الكابتن انطلق بدراجته النارية باتجاه موقعك' : 'Driver is on the motorcycle heading to your pin',
      };
    case 'delivered':
      return {
        label: lang === 'ar' ? 'تم التوصيل بنجاح' : 'Delivered',
        color: 'text-green-800',
        bg: 'bg-green-100 border-green-300',
        stepIndex: 5,
        description: lang === 'ar' ? 'صحتين وهنا! تم تسليم الطلب باليد' : 'Enjoy your meal! Order hand-delivered',
      };
    case 'cancelled':
      return {
        label: lang === 'ar' ? 'تم إلغاء الطلب' : 'Cancelled',
        color: 'text-rose-700',
        bg: 'bg-rose-100 border-rose-300',
        stepIndex: -1,
        description: lang === 'ar' ? 'تم إلغاء الطلب' : 'Order was cancelled',
      };
  }
}

export function getPaymentMethodDetails(method: PaymentMethod, lang: Language = 'ar'): {
  name: string;
  nameAr: string;
  badge: string;
  ussd?: string;
  merchantNumber?: string;
  instructionsAr: string;
  instructionsEn: string;
} {
  switch (method) {
    case 'cod':
      return {
        name: 'Cash on Delivery',
        nameAr: 'الدفع نقداً عند الاستلام',
        badge: 'الخيار الأسهل',
        instructionsAr: 'ادفع المبلغ المطلوب نقداً لكابتن التوصيل عند استلام الوجبة.',
        instructionsEn: 'Pay cash directly to the courier upon delivery.',
      };
    case 'syriatel_cash':
      return {
        name: 'Syriatel Cash',
        nameAr: 'سيريتل كاش',
        badge: '*3040#',
        ussd: '*3040#',
        merchantNumber: '0933-882-190',
        instructionsAr: 'أرسل المبلغ لرقم تاجر سيريتل كاش: 0933882190 أو عبر الكود السريع *3040# مع إدخال رقم العملية.',
        instructionsEn: 'Transfer to merchant wallet 0933882190 or dial *3040# and enter transaction ref.',
      };
    case 'sham_cash':
      return {
        name: 'Sham Cash',
        nameAr: 'شام كاش (محفظة محلية)',
        badge: 'تحويل فوري',
        merchantNumber: 'SHAM-IDL-4091',
        instructionsAr: 'تحويل فوري عبر وكلاء شام كاش أو التطبيق إلى معرف التاجر: SHAM-IDL-4091.',
        instructionsEn: 'Instant transfer via Sham Cash app or agent to ID: SHAM-IDL-4091.',
      };
    case 'mtn_cash':
      return {
        name: 'MTN Cash',
        nameAr: 'كاش إم تي إن',
        badge: '*2020#',
        ussd: '*2020#',
        merchantNumber: '0944-991-220',
        instructionsAr: 'اتصل على *2020# واختر تحويل أموال إلى رقم التاجر: 0944991220.',
        instructionsEn: 'Dial *2020# and transfer to merchant number 0944991220.',
      };
  }
}
