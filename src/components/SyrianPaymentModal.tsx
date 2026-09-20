import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { formatCurrency, getPaymentMethodDetails } from '../utils/formatters';
import { Check, Copy, AlertCircle, ShieldCheck, Wallet, X } from 'lucide-react';

interface SyrianPaymentModalProps {
  method: PaymentMethod;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionId?: string) => void;
}

export const SyrianPaymentModal: React.FC<SyrianPaymentModalProps> = ({
  method,
  amount,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { lang } = useApp();
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const details = getPaymentMethodDetails(method, lang);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method !== 'cod' && !transactionId.trim()) {
      setError(lang === 'ar' ? 'يرجى إدخال رقم العملية أو الإشعار للتأكيد' : 'Please enter the transaction reference ID');
      return;
    }
    onConfirm(transactionId.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">{lang === 'ar' ? details.nameAr : details.name}</h3>
              <span className="text-xs text-orange-600 font-semibold">{details.badge}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-stone-50 p-4 border border-stone-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-stone-500">{lang === 'ar' ? 'المبلغ الإجمالي للدفع' : 'Total Amount'}</span>
            <span className="text-base font-extrabold text-stone-900">{formatCurrency(amount, lang)}</span>
          </div>

          {details.merchantNumber && (
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-stone-200 mt-2">
              <div>
                <div className="text-[11px] text-stone-500">{lang === 'ar' ? 'حساب تاجر أكلات إدلب المعتمد' : 'Merchant ID'}</div>
                <div className="font-mono text-sm font-bold text-stone-800">{details.merchantNumber}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(details.merchantNumber || '')}
                className="flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-orange-100 hover:text-orange-700 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2 text-xs text-stone-600">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{lang === 'ar' ? details.instructionsAr : details.instructionsEn}</p>
          </div>
          {details.ussd && (
            <div className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs">
              {lang === 'ar' ? `الكود المباشر عبر الهاتف: ${details.ussd}` : `Direct USSD code: ${details.ussd}`}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {method !== 'cod' ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'ar' ? 'رقم الإشعار / كود العملية من رسالة التحويل' : 'Transaction / Transfer Reference'}
              </label>
              <input
                id="input-transaction-id"
                type="text"
                value={transactionId}
                onChange={(e) => {
                  setTransactionId(e.target.value);
                  setError('');
                }}
                placeholder={lang === 'ar' ? 'مثال: TXN-839210 أو رقم الإشعار' : 'e.g. TXN-839210'}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
              />
              {error && (
                <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
              {lang === 'ar'
                ? 'سيقوم الكابتن بتحصيل المبلغ المطلوب عند وصوله لباب منزلك مع إعطائك الفاتورة.'
                : 'The courier will collect the exact amount in cash upon delivery.'}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              {lang === 'ar' ? 'تغيير الطريقة' : 'Change Method'}
            </button>
            <button
              type="submit"
              id="btn-confirm-payment-stub"
              className="flex-1 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-700 transition active:scale-95"
            >
              {method === 'cod'
                ? lang === 'ar'
                  ? 'متابعة بالدفع نقداً'
                  : 'Continue with COD'
                : lang === 'ar'
                ? 'تأكيد التحويل ومتابعة الطلب'
                : 'Confirm & Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
