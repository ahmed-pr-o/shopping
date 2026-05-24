"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Package, FolderOpen, X, Save, Tag } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: string;
  unit: string | null;
  description: string | null;
  isAvailable: boolean;
};

type Category = {
  id: number;
  name: string;
  icon: string | null;
  sortOrder: number | null;
  products: Product[];
};

type Mall = {
  id: number;
  name: string;
};

export default function MallManager({ mall }: { mall: Mall }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newCategory, setNewCategory] = useState({ name: "", icon: "📦" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    unit: "قطعة",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, [mall.id]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/malls/${mall.id}`);
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mallId: mall.id,
          name: newCategory.name,
          icon: newCategory.icon,
          sortOrder: categories.length,
        }),
      });
      if (res.ok) {
        setNewCategory({ name: "", icon: "📦" });
        setShowAddCategory(false);
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (categoryId: number) => {
    if (!newProduct.name.trim() || !newProduct.price) return;
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mallId: mall.id,
          categoryId,
          name: newProduct.name,
          price: newProduct.price,
          unit: newProduct.unit,
          description: newProduct.description,
        }),
      });
      if (res.ok) {
        setNewProduct({ name: "", price: "", unit: "قطعة", description: "" });
        setShowAddProduct(null);
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          price: editingProduct.price,
          unit: editingProduct.unit,
          description: editingProduct.description,
          isAvailable: editingProduct.isAvailable,
        }),
      });
      if (res.ok) {
        setEditingProduct(null);
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-600" />
          أقسام ومنتجات {mall.name}
        </h3>
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة قسم
        </button>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-900">قسم جديد</h4>
            <button onClick={() => setShowAddCategory(false)}>
              <X className="w-4 h-4 text-blue-600" />
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={newCategory.icon}
              onChange={(e) =>
                setNewCategory((p) => ({ ...p, icon: e.target.value }))
              }
              className="border border-blue-200 rounded-lg px-2 py-2 bg-white text-lg"
            >
              {["📦", "🥩", "🥦", "🥛", "🌰", "🧃", "🥫", "🍞", "🛒", "🥕", "🧹", "👕", "📱", "🏠", "👟"].map(
                (icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                )
              )}
            </select>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="اسم القسم (مثال: اللحوم)"
              className="flex-1 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            <button
              onClick={handleAddCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              إضافة
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">لا توجد أقسام بعد</p>
          <button
            onClick={() => setShowAddCategory(true)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            + أضف أول قسم
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-semibold text-gray-800">
                    {cat.name}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {cat.products.length} منتج
                  </span>
                </div>
                <button
                  onClick={() => setShowAddProduct(showAddProduct === cat.id ? null : cat.id)}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  منتج
                </button>
              </div>

              {/* Add Product Form */}
              {showAddProduct === cat.id && (
                <div className="p-3 bg-green-50 border-b border-green-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="اسم المنتج"
                      className="border border-green-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="السعر"
                      className="border border-green-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                    <input
                      type="text"
                      value={newProduct.unit}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, unit: e.target.value }))
                      }
                      placeholder="الوحدة"
                      className="border border-green-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAddProduct(cat.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded-lg text-xs font-medium"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setShowAddProduct(null)}
                        className="px-2 py-1.5 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="وصف (اختياري)"
                    className="w-full mt-2 border border-green-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
              )}

              {/* Products List */}
              <div className="divide-y divide-gray-100">
                {cat.products.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    لا توجد منتجات في هذا القسم
                  </div>
                ) : (
                  cat.products.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50"
                    >
                      {editingProduct?.id === product.id ? (
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, name: e.target.value })
                            }
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, price: e.target.value })
                            }
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="text"
                            value={editingProduct.unit ?? ""}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, unit: e.target.value })
                            }
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={handleUpdateProduct}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="bg-gray-300 px-2 py-1 rounded text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleAvailability(product)}
                            className={`w-3 h-3 rounded-full shrink-0 ${
                              product.isAvailable ? "bg-green-500" : "bg-gray-300"
                            }`}
                            title={product.isAvailable ? "متوفر" : "غير متوفر"}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-sm font-medium truncate ${!product.isAvailable ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                {product.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                / {product.unit}
                              </span>
                            </div>
                            {product.description && (
                              <div className="text-xs text-gray-400 truncate">
                                {product.description}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-bold text-blue-700 shrink-0">
                            {product.price}₪
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-gray-400 hover:text-blue-600 p-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
