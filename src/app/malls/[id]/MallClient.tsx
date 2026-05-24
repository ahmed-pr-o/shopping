"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, Plus, Minus, Tag, MapPin, Phone,
  ChevronDown, ChevronUp, ShoppingBag, Trash2, Store,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  price: string;
  unit: string | null;
  description: string | null;
  isAvailable: boolean;
  stock: number | null;
};

type Category = {
  id: number;
  name: string;
  icon: string | null;
  products: Product[];
};

type Mall = {
  id: number;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  internalDeliveryFee: string;
  externalDeliveryFee: string;
};

type Discount = {
  id: number;
  title: string;
  description: string | null;
  discountPercent: string | null;
  newPrice: string | null;
};

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

// السلة الموحدة — كل المنتجات من كل المولات في مصفوفة وحدة
function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("unifiedCart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("unifiedCart", JSON.stringify(items));
}

interface MallClientProps {
  mall: Mall;
  categories: Category[];
  discounts: Discount[];
}

export default function MallClient({ mall, categories, discounts }: MallClientProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(categories.map((c) => c.id))
  );

  useEffect(() => { setCart(loadCart()); }, []);
  useEffect(() => { saveCart(cart); }, [cart]);

  // منتجات هذا المول فقط — للعداد في الواجهة
  const mallItems = cart.filter((i) => i.mallId === mall.id);
  const getQuantity = (productId: number) =>
    mallItems.find((i) => i.productId === productId)?.quantity ?? 0;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id && i.mallId === mall.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id && i.mallId === mall.id
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * parseFloat(product.price) }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: parseFloat(product.price),
        totalPrice: parseFloat(product.price),
        unit: product.unit ?? "قطعة",
        mallId: mall.id,
        mallName: mall.name,
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.mallId === mall.id);
      if (!existing) return prev;
      if (existing.quantity === 1)
        return prev.filter((i) => !(i.productId === productId && i.mallId === mall.id));
      return prev.map((i) =>
        i.productId === productId && i.mallId === mall.id
          ? { ...i, quantity: i.quantity - 1, totalPrice: (i.quantity - 1) * i.unitPrice }
          : i
      );
    });
  };

  const deleteFromCart = (productId: number) =>
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.mallId === mall.id)));

  // إحصائيات هذا المول للعرض في الـ sidebar
  const mallTotalItems = mallItems.reduce((s, i) => s + i.quantity, 0);
  const mallSubtotal = mallItems.reduce((s, i) => s + i.totalPrice, 0);

  // إجمالي كل السلة (كل المولات) — للزر الأسفل
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative">
      {/* Mall Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">🏪</div>
              <div>
                <h1 className="text-2xl font-bold">{mall.name}</h1>
                {mall.description && <p className="text-blue-200 text-sm mt-1 max-w-md">{mall.description}</p>}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-blue-200">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{mall.address}</span>
                  {mall.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{mall.phone}</span>}
                </div>
              </div>
            </div>
            <div className="hidden md:flex gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center">
                <div className="text-xs text-blue-200">توصيل داخلي</div>
                <div className="font-bold text-green-300">{mall.internalDeliveryFee}₪</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center">
                <div className="text-xs text-blue-200">توصيل خارجي</div>
                <div className="font-bold text-orange-300">{mall.externalDeliveryFee}₪</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {discounts.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5 mb-6">
                <h2 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5" />العروض والتخفيضات الحالية
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {discounts.map((d) => (
                    <div key={d.id} className="bg-white rounded-xl p-3 border border-red-100 flex items-center gap-3">
                      <span className="text-2xl">🏷️</span>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{d.title}</div>
                        {d.description && <div className="text-xs text-gray-500">{d.description}</div>}
                      </div>
                      {d.discountPercent && (
                        <span className="mr-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shrink-0">
                          -{d.discountPercent}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categories.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد منتجات في هذا المول</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon ?? "📦"}</span>
                        <div className="text-right">
                          <h3 className="font-bold text-gray-900">{cat.name}</h3>
                          <p className="text-xs text-gray-400">{cat.products.length} منتج</p>
                        </div>
                      </div>
                      {expandedCategories.has(cat.id)
                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                        : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>

                    {expandedCategories.has(cat.id) && (
                      <div className="border-t border-gray-100 p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {cat.products.map((product) => {
                            const qty = getQuantity(product.id);
                            return (
                              <div key={product.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{product.name}</h4>
                                {product.description && (
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                  <div>
                                    <span className="text-lg font-bold text-blue-700">{product.price}₪</span>
                                    <span className="text-xs text-gray-400 mr-1">/ {product.unit}</span>
                                  </div>
                                  {qty === 0 ? (
                                    <button
                                      onClick={() => addToCart(product)}
                                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />أضف
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2 bg-red-50 rounded-lg p-1">
                                      <button onClick={() => removeFromCart(product.id)} className="w-7 h-7 bg-red-500 text-white rounded-md flex items-center justify-center hover:bg-red-600 transition-colors">
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="font-bold text-red-600 w-6 text-center">{qty}</span>
                                      <button onClick={() => addToCart(product)} className="w-7 h-7 bg-red-500 text-white rounded-md flex items-center justify-center hover:bg-red-600 transition-colors">
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Sidebar — منتجات هذا المول */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />من {mall.name}
                </h3>
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">{mallTotalItems}</span>
              </div>

              {mallItems.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">لم تضف شيئاً بعد</p>
                </div>
              ) : (
                <div>
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    {mallItems.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{item.productName}</div>
                          <div className="text-xs text-gray-400">{item.unitPrice}₪ × {item.quantity}</div>
                        </div>
                        <div className="font-bold text-blue-700 shrink-0">{item.totalPrice.toFixed(2)}₪</div>
                        <button onClick={() => deleteFromCart(item.productId)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">من {mall.name}</span>
                      <span className="font-bold">{mallSubtotal.toFixed(2)}₪</span>
                    </div>
                    <Link
                      href="/cart"
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      عرض السلة ({totalItems})
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      {totalItems > 0 && (
        <div className="lg:hidden fixed bottom-6 right-4 left-4 z-50">
          <Link
            href="/cart"
            className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-between px-5"
          >
            <span className="bg-white text-red-500 text-sm font-bold px-2.5 py-0.5 rounded-full">{totalItems}</span>
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />عرض السلة
            </span>
            <span className="font-bold">{cart.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)}₪</span>
          </Link>
        </div>
      )}

      {/* Mobile drawer — اختياري للإبقاء */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 right-0 left-0 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-5 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />من {mall.name} ({mallTotalItems})
              </h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✕</button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 max-h-60">
              {mallItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.productName}</div>
                    <div className="text-sm text-gray-400">{item.unitPrice}₪ × {item.quantity}</div>
                  </div>
                  <div className="font-bold text-blue-700">{item.totalPrice.toFixed(2)}₪</div>
                  <button onClick={() => deleteFromCart(item.productId)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-white">
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />عرض كل السلة ({totalItems})
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
