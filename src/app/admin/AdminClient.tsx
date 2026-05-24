"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Bell,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  ChevronDown,
  TrendingUp,
  Users,
  Database,
} from "lucide-react";
import MallManager from "./MallManager";

type Mall = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  isActive: boolean;
  internalDeliveryFee: string;
  externalDeliveryFee: string;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
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
  mallId: number;
};

type Notification = {
  id: number;
  orderId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "في الانتظار", color: "text-yellow-700", bg: "bg-yellow-100" },
  payment_pending: { label: "انتظار الدفع", color: "text-blue-700", bg: "bg-blue-100" },
  payment_confirmed: { label: "دفع مؤكد", color: "text-purple-700", bg: "bg-purple-100" },
  preparing: { label: "جاري التجهيز", color: "text-orange-700", bg: "bg-orange-100" },
  out_for_delivery: { label: "في الطريق", color: "text-teal-700", bg: "bg-teal-100" },
  delivered: { label: "تم التوصيل", color: "text-green-700", bg: "bg-green-100" },
  cancelled: { label: "ملغي", color: "text-red-700", bg: "bg-red-100" },
};

const statusFlow = [
  "pending",
  "payment_pending",
  "payment_confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

interface AdminClientProps {
  initialMalls: Mall[];
  initialOrders: Order[];
  initialNotifications: Notification[];
}

export default function AdminClient({
  initialMalls,
  initialOrders,
  initialNotifications,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "malls" | "notifications">("dashboard");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [malls, setMalls] = useState<Mall[]>(initialMalls);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddMall, setShowAddMall] = useState(false);

  const [newMall, setNewMall] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    bankAccountNumber: "",
    bankAccountName: "",
    internalDeliveryFee: "5",
    externalDeliveryFee: "10",
  });
  const [selectedMallForEdit, setSelectedMallForEdit] = useState<number | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setSeedMsg(data.success ? "✅ تم تهيئة البيانات بنجاح! أعد تحميل الصفحة." : "❌ " + data.error);
      if (data.success) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setSeedMsg("❌ فشل في الاتصال");
    } finally {
      setSeeding(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      }
    } catch { }
  };

  const handleAddMall = async () => {
    if (!newMall.name || !newMall.address) return;
    try {
      const res = await fetch("/api/malls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMall),
      });
      const data = await res.json();
      if (data.mall) {
        setMalls((prev) => [...prev, data.mall]);
        setShowAddMall(false);
        setNewMall({
          name: "",
          address: "",
          phone: "",
          description: "",
          bankAccountNumber: "",
          bankAccountName: "",
          internalDeliveryFee: "5",
          externalDeliveryFee: "10",
        });
      }
    } catch { }
  };

  const handleDeleteMall = async (mallId: number) => {
    if (!confirm("هل أنت متأكد من إلغاء تفعيل هذا المول؟")) return;
    try {
      await fetch(`/api/malls/${mallId}`, { method: "DELETE" });
      setMalls((prev) => prev.filter((m) => m.id !== mallId));
    } catch { }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [ordersRes, notifRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/notifications"),
      ]);
      const [ordersData, notifData] = await Promise.all([
        ordersRes.json(),
        notifRes.json(),
      ]);
      if (ordersData.orders) setOrders(ordersData.orders);
      if (notifData.notifications) setNotifications(notifData.notifications);
    } catch { }
    setLoading(false);
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => ["pending", "payment_pending"].includes(o.status)).length,
    inProgress: orders.filter((o) => ["payment_confirmed", "preparing", "out_for_delivery"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + parseFloat(o.total), 0),
    unreadNotif: notifications.filter((n) => !n.isRead).length,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">سوقي - الإدارة</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "dashboard", label: "الرئيسية", icon: <LayoutDashboard className="w-5 h-5" /> },
            {
              id: "orders",
              label: "الطلبات",
              icon: <ShoppingBag className="w-5 h-5" />,
              badge: stats.pending,
            },
            { id: "malls", label: "المولات", icon: <Store className="w-5 h-5" /> },
            {
              id: "notifications",
              label: "الإشعارات",
              icon: <Bell className="w-5 h-5" />,
              badge: stats.unreadNotif,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                ? "bg-red-500 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {"badge" in item && item.badge && item.badge > 0 && (
                <span className="mr-auto bg-white text-red-500 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors text-sm"
          >
            <Database className="w-4 h-4" />
            {seeding ? "جاري التهيئة..." : "تهيئة البيانات التجريبية"}
          </button>
          {seedMsg && (
            <p className="text-xs mt-2 text-gray-400 text-center">{seedMsg}</p>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 right-0 left-0 bg-gray-900 text-white flex md:hidden z-50 border-t border-gray-800">
        {[
          { id: "dashboard", label: "الرئيسية", icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: "orders", label: "الطلبات", icon: <ShoppingBag className="w-5 h-5" /> },
          { id: "malls", label: "المولات", icon: <Store className="w-5 h-5" /> },
          { id: "notifications", label: "الإشعارات", icon: <Bell className="w-5 h-5" /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as typeof activeTab)}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${activeTab === item.id ? "text-red-400" : "text-gray-500"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-100 pb-16 md:pb-0">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">
            {activeTab === "dashboard" && "لوحة التحكم"}
            {activeTab === "orders" && "إدارة الطلبات"}
            {activeTab === "malls" && "إدارة المولات"}
            {activeTab === "notifications" && "الإشعارات"}
          </h1>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        <div className="p-6">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "إجمالي الطلبات", value: stats.total, icon: <ShoppingBag className="w-5 h-5" />, color: "bg-blue-500" },
                  { label: "في الانتظار", value: stats.pending, icon: <Clock className="w-5 h-5" />, color: "bg-yellow-500" },
                  { label: "قيد التنفيذ", value: stats.inProgress, icon: <Truck className="w-5 h-5" />, color: "bg-orange-500" },
                  { label: "الإيرادات (₪)", value: stats.revenue.toFixed(0), icon: <TrendingUp className="w-5 h-5" />, color: "bg-green-500" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">آخر الطلبات</h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    عرض الكل
                  </button>
                </div>
                <div className="divide-y">
                  {orders.slice(0, 5).map((order) => {
                    const cfg = statusConfig[order.status] ?? statusConfig.pending;
                    return (
                      <div key={order.id} className="px-5 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{order.orderNumber}</div>
                          <div className="text-xs text-gray-400">{order.customerName} • {order.mallName}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        <span className="font-bold text-gray-700 text-sm">{order.total}₪</span>
                      </div>
                    );
                  })}
                  {orders.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      لا توجد طلبات بعد
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Seed */}
              {malls.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                  <Database className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-bold text-amber-800 mb-1">قاعدة البيانات فارغة</h3>
                  <p className="text-amber-600 text-sm mb-3">اضغط على الزر لإضافة بيانات تجريبية</p>
                  <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                  >
                    {seeding ? "جاري التهيئة..." : "تهيئة البيانات التجريبية"}
                  </button>
                  {seedMsg && <p className="text-sm mt-2 text-amber-700">{seedMsg}</p>}
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Filter */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    الكل ({orders.length})
                  </button>
                  {Object.entries(statusConfig).map(([key, cfg]) => {
                    const cnt = orders.filter((o) => o.status === key).length;
                    if (cnt === 0) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === key ? `${cfg.bg} ${cfg.color}` : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {cfg.label} ({cnt})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد طلبات</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const cfg = statusConfig[order.status] ?? statusConfig.pending;
                  const isExpanded = expandedOrder === order.id;
                  const currentStep = statusFlow.indexOf(order.status);
                  const nextStatus = currentStep >= 0 && currentStep < statusFlow.length - 1
                    ? statusFlow[currentStep + 1]
                    : null;

                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 font-mono">{order.orderNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              {order.deliveryType === "internal" ? (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">داخلي</span>
                              ) : (
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">خارجي</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {order.customerName} • {order.mallName} • {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-blue-900">{order.total}₪</div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 mt-1 mr-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-gray-400 text-xs mb-1">الهاتف</div>
                              <div className="font-medium" dir="ltr">{order.customerPhone}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-gray-400 text-xs mb-1">نوع التوصيل</div>
                              <div className="font-medium">{order.deliveryType === "internal" ? "داخلي" : "خارجي"}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 col-span-2">
                              <div className="text-gray-400 text-xs mb-1">العنوان</div>
                              <div className="font-medium">{order.deliveryAddress}</div>
                            </div>
                            {order.paymentTransferRef && (
                              <div className="bg-white rounded-lg p-3 col-span-2">
                                <div className="text-gray-400 text-xs mb-1">رقم التحويل</div>
                                <div className="font-mono font-medium" dir="ltr">{order.paymentTransferRef}</div>
                              </div>
                            )}
                            {order.notes && (
                              <div className="bg-white rounded-lg p-3 col-span-2">
                                <div className="text-gray-400 text-xs mb-1">ملاحظات</div>
                                <div>{order.notes}</div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {order.status !== "delivered" && order.status !== "cancelled" && (
                            <div className="flex gap-2 flex-wrap">
                              {nextStatus && (
                                <button
                                  onClick={() => handleStatusChange(order.id, nextStatus)}
                                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {statusConfig[nextStatus]?.label ?? "التالي"}
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusChange(order.id, "cancelled")}
                                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
                              >
                                <XCircle className="w-4 h-4" />
                                إلغاء
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* MALLS */}
          {activeTab === "malls" && (
            <div className="space-y-4 animate-fade-in-up">
              <button
                onClick={() => setShowAddMall(!showAddMall)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة مول جديد
              </button>

              {showAddMall && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-fade-in-up">
                  <h3 className="font-bold text-gray-900 mb-4">إضافة مول جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "اسم المول *", placeholder: "مثال:  هايبر مول" },
                      { key: "address", label: "العنوان *", placeholder: "غزة - الشجاعية" },
                      { key: "phone", label: "الهاتف", placeholder: "0599-XXX-XXX" },
                      { key: "description", label: "الوصف", placeholder: "وصف مختصر" },
                      { key: "bankAccountNumber", label: "رقم الحساب البنكي", placeholder: "XXXXXXXXXXXX" },
                      { key: "bankAccountName", label: "اسم صاحب الحساب", placeholder: "الاسم الكامل" },
                      { key: "internalDeliveryFee", label: "رسوم التوصيل الداخلي (₪)", placeholder: "5" },
                      { key: "externalDeliveryFee", label: "رسوم التوصيل الخارجي (₪)", placeholder: "10" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type="text"
                          value={newMall[field.key as keyof typeof newMall]}
                          onChange={(e) => setNewMall((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddMall}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                    >
                      حفظ المول
                    </button>
                    <button
                      onClick={() => setShowAddMall(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {malls.map((mall) => (
                  <div key={mall.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{mall.name}</h3>
                          <p className="text-sm text-gray-500">{mall.address}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          مفعّل
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                        {mall.phone && <div>📞 {mall.phone}</div>}
                        {mall.bankAccountNumber && (
                          <div className="col-span-2">🏦 {mall.bankAccountNumber}</div>
                        )}
                        <div className="text-green-600">داخلي: {mall.internalDeliveryFee}₪</div>
                        <div className="text-orange-500">خارجي: {mall.externalDeliveryFee}₪</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedMallForEdit(selectedMallForEdit === mall.id ? null : mall.id)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedMallForEdit === mall.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                            }`}
                        >
                          {selectedMallForEdit === mall.id ? "إخفاء المنتجات" : "إدارة المنتجات"}
                        </button>
                        <a
                          href={`/malls/${mall.id}`}
                          target="_blank"
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          عرض
                        </a>
                        <button
                          onClick={() => handleDeleteMall(mall.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    {/* Mall Manager - Categories & Products */}
                    {selectedMallForEdit === mall.id && (
                      <div className="border-t border-gray-200 bg-gray-50 p-5">
                        <MallManager mall={mall} />
                      </div>
                    )}
                  </div>
                ))}
                {malls.length === 0 && (
                  <div className="bg-white rounded-xl p-10 text-center">
                    <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">لا توجد مولات</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-3 animate-fade-in-up">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${notif.isRead ? "border-gray-100 opacity-70" : "border-blue-200 bg-blue-50"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === "new_order" ? "bg-blue-500" : "bg-green-500"
                        } text-white`}>
                        {notif.type === "new_order" ? (
                          <ShoppingBag className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm font-medium">{notif.message}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(notif.createdAt).toLocaleString("ar-SA")}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
