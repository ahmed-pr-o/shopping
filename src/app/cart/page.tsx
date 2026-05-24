"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShoppingCart, Trash2, Plus, Minus, ShoppingBag,
    Store, Package, Tag, ArrowLeft,
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

function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem("unifiedCart");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

function saveCart(items: CartItem[]) {
    if (items.length === 0) localStorage.removeItem("unifiedCart");
    else localStorage.setItem("unifiedCart", JSON.stringify(items));
}

// تجميع المنتجات حسب المول للعرض البصري
function groupByMall(items: CartItem[]) {
    const map = new Map<number, { mallName: string; items: CartItem[] }>();
    for (const item of items) {
        if (!map.has(item.mallId)) map.set(item.mallId, { mallName: item.mallName, items: [] });
        map.get(item.mallId)!.items.push(item);
    }
    return Array.from(map.entries()).map(([mallId, val]) => ({ mallId, ...val }));
}

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); setCart(loadCart()); }, []);

    const updateQuantity = (productId: number, mallId: number, delta: number) => {
        setCart((prev) => {
            const updated = prev.map((item) => {
                if (item.productId !== productId || item.mallId !== mallId) return item;
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null;
                return { ...item, quantity: newQty, totalPrice: parseFloat((item.unitPrice * newQty).toFixed(2)) };
            }).filter(Boolean) as CartItem[];
            saveCart(updated);
            return updated;
        });
    };

    const removeItem = (productId: number, mallId: number) => {
        setCart((prev) => {
            const updated = prev.filter((i) => !(i.productId === productId && i.mallId === mallId));
            saveCart(updated);
            return updated;
        });
    };

    const clearAll = () => { localStorage.removeItem("unifiedCart"); setCart([]); };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-400 animate-pulse-soft">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const grandTotal = cart.reduce((s, i) => s + i.totalPrice, 0);
    const grouped = groupByMall(cart);

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            <Navbar cartCount={totalItems} />

            <div className="max-w-3xl mx-auto px-4 pt-24 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow">
                            <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">سلة المشتريات</h1>
                            {cart.length > 0 && (
                                <p className="text-sm text-gray-400">
                                    {totalItems} منتج من {grouped.length} {grouped.length === 1 ? "مول" : "مولات"}
                                </p>
                            )}
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors">
                            <Trash2 className="w-4 h-4" />مسح الكل
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="animate-fade-in-up">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                <ShoppingBag className="w-12 h-12 text-gray-300" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-700 mb-2">السلة فارغة</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                لم تقم بإضافة أي منتجات بعد.<br />تصفح المولات واختر ما يناسبك!
                            </p>
                            <Link href="/malls" className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                                <Store className="w-5 h-5" />تسوق الآن
                            </Link>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link href="/malls" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-red-200 hover:shadow-md transition-all card-hover">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                    <Store className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="font-medium text-gray-700">المولات</span>
                            </Link>
                            <Link href="/orders/track" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-blue-200 hover:shadow-md transition-all card-hover">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="font-medium text-gray-700">تتبع طلبي</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in-up space-y-5">
                        {/* المنتجات مجمّعة بالمول — بصرياً فقط، الطلب وحد */}
                        {grouped.map((group) => {
                            const groupSubtotal = group.items.reduce((s, i) => s + i.totalPrice, 0);
                            return (
                                <div key={group.mallId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Mall label */}
                                    <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100">
                                        <Store className="w-4 h-4 text-blue-600" />
                                        <span className="font-bold text-blue-800 text-sm">{group.mallName}</span>
                                        <span className="text-blue-400 text-xs mr-auto">{groupSubtotal.toFixed(2)}₪</span>
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-gray-50">
                                        {group.items.map((item) => (
                                            <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                                    <Tag className="w-5 h-5 text-red-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                                                    <p className="text-sm text-gray-400">{item.unitPrice.toFixed(2)}₪ / {item.unit}</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.mallId, -1)}
                                                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all shadow-sm"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.mallId, 1)}
                                                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all shadow-sm"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="min-w-[60px] text-left">
                                                    <p className="font-bold text-gray-900 text-sm">{item.totalPrice.toFixed(2)}₪</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.productId, item.mallId)}
                                                    className="w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* ملخص وزر طلب وحد */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            {/* تفصيل المولات */}
                            <div className="space-y-2 mb-4">
                                {grouped.map((g) => (
                                    <div key={g.mallId} className="flex justify-between text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5" />{g.mallName}</span>
                                        <span>{g.items.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)}₪</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 pt-3 mb-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">مجموع المنتجات</span>
                                    <span className="font-semibold text-gray-800">{grandTotal.toFixed(2)}₪</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-gray-400 text-xs">رسوم التوصيل تُحسب عند الإتمام</span>
                                    <span className="text-gray-400 text-xs">—</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center mb-5">
                                <span className="font-bold text-gray-800">الإجمالي (قبل التوصيل)</span>
                                <span className="text-xl font-bold text-red-500">{grandTotal.toFixed(2)}₪</span>
                            </div>

                            <button
                                onClick={() => router.push("/checkout")}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                إتمام الطلب — {grandTotal.toFixed(2)}₪
                            </button>

                            <Link href="/malls" className="mt-3 w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 py-2 text-sm font-medium transition-colors">
                                <ArrowLeft className="w-4 h-4" />متابعة التسوق
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
