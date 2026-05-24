"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Search,
  Phone,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  status: string;
  paymentTransferRef: string | null;
  notes: string | null;
  createdAt: string;
  mallName: string | null;
  items?: OrderItem[];
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; step: number }
> = {
  pending: {
    label: "في انتظار المراجعة",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
    step: 0,
  },
  payment_pending: {
    label: "في انتظار تأكيد الدفع",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: <AlertCircle className="w-4 h-4" />,
    step: 1,
  },
  payment_confirmed: {
    label: "تم تأكيد الدفع",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    icon: <CheckCircle className="w-4 h-4" />,
    step: 2,
  },
  preparing: {
    label: "جاري التجهيز",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: <Package className="w-4 h-4" />,
    step: 3,
  },
  out_for_delivery: {
    label: "في الطريق إليك",
    color: "text-teal-600 bg-teal-50 border-teal-200",
    icon: <Truck className="w-4 h-4" />,
    step: 4,
  },
  delivered: {
    label: "تم التوصيل",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
    step: 5,
  },
  cancelled: {
    label: "ملغي",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
    step: -1,
  },
};

const trackingSteps = [
  { label: "تم الطلب", icon: <ShoppingBag className="w-4 h-4" /> },
  { label: "تأكيد الدفع", icon: <AlertCircle className="w-4 h-4" /> },
  { label: "الدفع مؤكد", icon: <CheckCircle className="w-4 h-4" /> },
  { label: "التجهيز", icon: <Package className="w-4 h-4" /> },
  { label: "في الطريق", icon: <Truck className="w-4 h-4" /> },
  { label: "تم التوصيل", icon: <CheckCircle className="w-4 h-4" /> },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const [searchType, setSearchType] = useState<"order" | "phone">("order");
  const [query, setQuery] = useState(searchParams.get("orderNumber") ?? "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    const orderNumber = searchParams.get("orderNumber");
    if (orderNumber) {
      setQuery(orderNumber);
      handleSearch(orderNumber, "order");
    }
  }, []);

  const handleSearch = async (q = query, type = searchType) => {
    if (!q.trim()) {
      setError("يرجى إدخال رقم الطلب أو رقم الهاتف");
      return;
    }
    setLoading(true);
    setError("");
    setOrders([]);

    try {
      const params =
        type === "order"
          ? `orderNumber=${encodeURIComponent(q.trim())}`
          : `phone=${encodeURIComponent(q.trim())}`;

      const res = await fetch(`/api/orders/track?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "لم يتم العثور على طلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-blue-200" />
            <h1 className="text-3xl font-bold mb-2">تتبع طلبك</h1>
            <p className="text-blue-200">
              أدخل رقم طلبك أو رقم هاتفك لمعرفة حالة طلبك
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Search Box */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            {/* Type Toggle */}
            <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setSearchType("order")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  searchType === "order"
                    ? "bg-white shadow text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                رقم الطلب
              </button>
              <button
                onClick={() => setSearchType("phone")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  searchType === "phone"
                    ? "bg-white shadow text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                رقم الهاتف
              </button>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={
                  searchType === "order"
                    ? "مثال: SQ-250101-1234"
                    : "مثال: 0599123456"
                }
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                dir={searchType === "order" ? "ltr" : "rtl"}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? "..." : "بحث"}
              </button>
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Orders */}
          {orders.map((order) => {
            const config = statusConfig[order.status] ?? statusConfig.pending;
            const currentStep = config.step;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden animate-fade-in-up"
              >
                {/* Order Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-xl text-gray-900 font-mono">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {order.mallName} •{" "}
                        {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${config.color}`}
                    >
                      {config.icon}
                      {config.label}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {order.status !== "cancelled" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        {trackingSteps.map((s, i) => (
                          <div key={i} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-all ${
                                i <= currentStep
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {i < currentStep ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                s.icon
                              )}
                            </div>
                            <div
                              className={`text-xs text-center hidden sm:block ${
                                i <= currentStep
                                  ? "text-blue-600 font-medium"
                                  : "text-gray-400"
                              }`}
                            >
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {order.deliveryType === "internal" ? "توصيل داخلي" : "توصيل خارجي"}
                      </span>
                    </div>
                    <div className="font-bold text-blue-900 text-lg">
                      {order.total}₪
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full py-3 border-t border-gray-100 text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      إخفاء التفاصيل
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      عرض التفاصيل
                    </>
                  )}
                </button>

                {/* Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          المنتجات
                        </h4>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {item.productName} × {item.quantity}
                              </span>
                              <span className="font-medium text-gray-800">
                                {item.totalPrice}₪
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="border-t border-gray-200 pt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>المجموع الجزئي</span>
                        <span>{order.subtotal}₪</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>التوصيل</span>
                        <span>{order.deliveryFee}₪</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>الإجمالي</span>
                        <span>{order.total}₪</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-xl p-3 text-sm">
                      <div className="text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        عنوان التوصيل
                      </div>
                      <div className="text-gray-700">{order.deliveryAddress}</div>
                    </div>

                    {order.paymentTransferRef && (
                      <div className="bg-white rounded-xl p-3 text-sm">
                        <div className="text-gray-400 mb-1">
                          رقم عملية التحويل
                        </div>
                        <div
                          className="text-gray-700 font-mono font-bold"
                          dir="ltr"
                        >
                          {order.paymentTransferRef}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-400">جاري التحميل...</div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
