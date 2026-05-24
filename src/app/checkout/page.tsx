"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart, MapPin, Phone, User, Truck, Copy,
  CheckCircle, AlertCircle, ArrowRight, Package,
  Building, Bell, Store,
} from "lucide-react";
import Navbar from "@/components/Navbar";

type CartItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  mallId: number;
  mallName: string;
};

type MallGroup = {
  mallId: number;
  mallName: string;
  items: CartItem[];
};

type Order = {
  id: number;
  orderNumber: string;
  total: string;
  subtotal: string;
  deliveryFee: string;
  status: string;
};

type FormData = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: "internal" | "external";
  notes: string;
  transferRef: string;
};

function groupByMall(items: CartItem[]): MallGroup[] {
  const map = new Map<number, MallGroup>();
  for (const item of items) {
    if (!map.has(item.mallId)) map.set(item.mallId, { mallId: item.mallId, mallName: item.mallName, items: [] });
    map.get(item.mallId)!.items.push(item);
  }
  return Array.from(map.values());
}

function CheckoutContent() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // رسوم التوصيل ثابتة — الـ delivery هو من يدفع للمولات
  const DELIVERY_INTERNAL = 5;
  const DELIVERY_EXTERNAL = 10;

  const [form, setForm] = useState<FormData>({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryType: "internal",
    notes: "",
    transferRef: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("unifiedCart");
      if (raw) setCart(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const grouped = groupByMall(cart);
  const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
  const deliveryFee = form.deliveryType === "internal" ? DELIVERY_INTERNAL : DELIVERY_EXTERNAL;
  const total = subtotal + deliveryFee;

  if (cart.length === 0 && step === "form") {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">السلة فارغة</h2>
          <p className="text-gray-400 mb-6">يجب إضافة منتجات أولاً</p>
          <Link href="/malls" className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">
            تسوق الآن
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async () => {
    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          deliveryAddress: form.deliveryAddress,
          deliveryType: form.deliveryType,
          notes: form.notes,
          deliveryFee,
          // السلة مجمّعة بالمولات — الـ API يعرف من أي مول كل منتج
          carts: grouped.map((g) => ({
            mallId: g.mallId,
            mallName: g.mallName,
            items: g.items,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedOrder(data.order);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!form.transferRef.trim()) { setError("يرجى إدخال رقم مرجعي للتحويل"); return; }
    if (!createdOrder) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "payment_pending", paymentTransferRef: form.transferRef }),
      });
      if (!res.ok) throw new Error("فشل في التحديث");
      // مسح السلة كلها بعد الطلب الناجح
      localStorage.removeItem("unifiedCart");
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["بيانات الطلب", "الدفع", "تم الطلب"].map((s, i) => {
            const isActive = (step === "form" && i === 0) || (step === "payment" && i === 1) || (step === "success" && i === 2);
            const isDone = (step === "payment" && i === 0) || (step === "success" && i <= 1);
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isDone ? "bg-green-500 text-white" : isActive ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? "text-red-500 font-medium" : "text-gray-400"}`}>{s}</span>
                </div>
                {i < 2 && <div className={`w-12 h-0.5 mx-1 mb-4 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Form */}
        {step === "form" && (
          <div className="space-y-5 animate-fade-in-up">

            {/* ملخص السلة — مجمّعة بالمولات */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-blue-900 text-white p-4 flex items-center gap-3">
                <Package className="w-5 h-5" />
                <div>
                  <h2 className="font-bold">ملخص طلبك</h2>
                  <p className="text-blue-200 text-sm">
                    {cart.length} منتج من {grouped.length} {grouped.length === 1 ? "مول" : "مولات"}
                  </p>
                </div>
              </div>

              {grouped.map((group) => (
                <div key={group.mallId}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <Store className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">{group.mallName}</span>
                  </div>
                  <div className="px-4 py-1">
                    {group.items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                        <span className="font-bold text-gray-700">{item.totalPrice.toFixed(2)}₪</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>مجموع المنتجات</span>
                  <span>{subtotal.toFixed(2)}₪</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>رسوم التوصيل</span>
                  <span className="text-orange-500">{deliveryFee.toFixed(2)}₪</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-blue-900">
                  <span>الإجمالي</span>
                  <span>{total.toFixed(2)}₪</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />بيانات العميل
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                  <input type="text" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    placeholder="أدخل اسمك الكامل"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
                  <input type="tel" value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                    placeholder="05X-XXX-XXXX" dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />معلومات التوصيل
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => setForm((f) => ({ ...f, deliveryType: "internal" }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${form.deliveryType === "internal" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="text-2xl mb-1">🏘️</div>
                  <div className="font-semibold text-sm">داخلي</div>
                  <div className="text-green-600 font-bold text-sm">{DELIVERY_INTERNAL}₪</div>
                </button>
                <button onClick={() => setForm((f) => ({ ...f, deliveryType: "external" }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${form.deliveryType === "external" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="font-semibold text-sm">خارجي</div>
                  <div className="text-orange-500 font-bold text-sm">{DELIVERY_EXTERNAL}₪</div>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان التوصيل *</label>
                <textarea value={form.deliveryAddress} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
                  placeholder="الحي، الشارع، رقم المنزل..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none" />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
                <input type="text" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="أي تعليمات إضافية..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button onClick={handleSubmitOrder} disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
              {loading ? "جاري الإرسال..." : <><ShoppingCart className="w-5 h-5" />تأكيد الطلب — {total.toFixed(2)}₪</>}
            </button>
          </div>
        )}

        {/* STEP 2: Payment */}
        {step === "payment" && createdOrder && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-blue-900">تم إنشاء طلبك!</h2>
                  <p className="text-blue-600 text-sm">رقم الطلب: <strong>{createdOrder.orderNumber}</strong></p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <Building className="w-5 h-5 text-blue-600" />تعليمات الدفع
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-amber-800 text-sm font-medium">
                  ⚠️ يرجى تحويل المبلغ للـ Delivery — هو من سيشتري من المولات وينقل طلبك
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">المبلغ الإجمالي</div>
                    <div className="text-3xl font-bold text-blue-900">{createdOrder.total}₪</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">مجموع المنتجات</div>
                    <div className="text-sm text-gray-600">{createdOrder.subtotal}₪</div>
                    <div className="text-xs text-gray-400">+ {createdOrder.deliveryFee}₪ توصيل</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    1. تواصل مع الـ Delivery على الرقم المتفق عليه<br />
                    2. حوّل المبلغ <strong>{createdOrder.total}₪</strong><br />
                    3. احتفظ برقم العملية وأدخله أدناه
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />تأكيد التحويل
              </h2>
              <p className="text-sm text-gray-500 mb-3">بعد إتمام التحويل، أدخل رقم العملية المرجعي</p>
              <input type="text" value={form.transferRef} onChange={(e) => setForm((f) => ({ ...f, transferRef: e.target.value }))}
                placeholder="مثال: TXN123456789" dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 mb-3" />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <button onClick={handleConfirmPayment} disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
                {loading ? "جاري التأكيد..." : <><CheckCircle className="w-5 h-5" />تأكيد التحويل وإرسال الطلب</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === "success" && createdOrder && (
          <div className="animate-fade-in-up text-center">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم تقديم طلبك! 🎉</h2>
              <p className="text-gray-500 mb-6">سيتم مراجعة طلبك وتأكيد الدفع قريباً</p>
              <div className="bg-blue-50 rounded-2xl p-5 mb-6 text-right">
                <div className="text-sm text-blue-600 mb-1">رقم طلبك</div>
                <div className="text-2xl font-bold text-blue-900 font-mono">{createdOrder.orderNumber}</div>
                <div className="text-sm text-blue-500 mt-2">احتفظ بهذا الرقم لتتبع طلبك</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 mb-6 text-right text-sm text-amber-700">
                <Bell className="w-4 h-4 inline ml-1" />
                سيتم التواصل معك على رقم <strong>{form.customerPhone}</strong> لتأكيد التوصيل
              </div>
              <div className="flex flex-col gap-3">
                <Link href={`/orders/track?orderNumber=${createdOrder.orderNumber}`}
                  className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" />تتبع طلبي
                </Link>
                <Link href="/malls"
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="w-5 h-5" />متابعة التسوق
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">جاري التحميل...</div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
