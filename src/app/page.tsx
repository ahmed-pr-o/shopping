import Link from "next/link";
import { db } from "@/db";
import { malls, products, discounts } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Store,
  ShoppingBag,
  Truck,
  Star,
  ChevronLeft,
  Tag,
  MapPin,
  Phone,
  ArrowLeft,
} from "lucide-react";

async function getMalls() {
  try {
    return await db.select().from(malls).where(eq(malls.isActive, true));
  } catch {
    return [];
  }
}

async function getActiveDiscounts() {
  try {
    return await db
      .select()
      .from(discounts)
      .where(eq(discounts.isActive, true))
      .limit(6);
  } catch {
    return [];
  }
}

const mallColors = [
  "from-red-500 to-orange-400",
  "from-blue-600 to-blue-400",
  "from-green-600 to-emerald-400",
  "from-purple-600 to-pink-400",
  "from-yellow-500 to-amber-400",
  "from-cyan-600 to-teal-400",
];

const mallIcons = ["🏪", "🛒", "🏬", "🛍️", "🏦", "🏢"];

export default async function HomePage() {
  const [allMalls, allDiscounts] = await Promise.all([
    getMalls(),
    getActiveDiscounts(),
  ]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-red-600 text-white pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-10 left-20 w-20 h-20 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-red-300"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              🛒 منصة التسوق الأولى في غزة
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              تسوق من أشهر
              <br />
              <span className="text-yellow-300">المولات في غزة</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              قارن الأسعار، اطلب من أي مول، ونوصل لباب بيتك. كل ما تحتاجه في
              مكان واحد.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/malls"
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
              >
                <Store className="w-5 h-5" />
                استعرض المولات
              </Link>
              <Link
                href="/orders/track"
                className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-3 rounded-xl font-medium transition-all border border-white/30"
              >
                تتبع طلبي
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { label: "مول ومحل", value: allMalls.length.toString() + "+" },
              { label: "منتج متوفر", value: "100+" },
              { label: "توصيل سريع", value: "⚡" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-300">
                  {stat.value}
                </div>
                <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Store className="w-6 h-6" />,
                title: "أشهر المولات",
                desc: "تصفح منتجات أشهر المولات والمحلات في غزة بسهولة",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <Truck className="w-6 h-6" />,
                title: "توصيل سريع",
                desc: "توصيل داخلي وخارجي بأسعار واضحة ومعلنة",
                color: "bg-red-100 text-red-600",
              },
              {
                icon: <Tag className="w-6 h-6" />,
                title: "أفضل الأسعار",
                desc: "قارن الأسعار بين المولات المختلفة ووفر أكثر",
                color: "bg-green-100 text-green-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-sm transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center shrink-0`}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Discounts */}
      {allDiscounts.length > 0 && (
        <section className="py-12 bg-red-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-red-500" />
                  العروض والتخفيضات
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  أحدث العروض من المولات
                </p>
              </div>
              <Link
                href="/malls"
                className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium text-sm"
              >
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="bg-white rounded-xl p-5 border border-red-100 shadow-sm card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">🏷️</span>
                    {discount.discountPercent && (
                      <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        -{discount.discountPercent}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {discount.title}
                  </h3>
                  {discount.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {discount.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Malls Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                المولات والمحلات
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                اختر من أشهر المولات في غزة
              </p>
            </div>
            <Link
              href="/malls"
              className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {allMalls.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                لا توجد مولات بعد
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                قم بتهيئة قاعدة البيانات لعرض المولات
              </p>
              <a
                href="/admin"
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                الذهاب للإدارة
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allMalls.map((mall, idx) => (
                <Link
                  key={mall.id}
                  href={`/malls/${mall.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover shadow-sm"
                >
                  {/* Mall Header */}
                  <div
                    className={`bg-gradient-to-br ${mallColors[idx % mallColors.length]} h-32 flex items-center justify-center`}
                  >
                    <span className="text-6xl">{mallIcons[idx % mallIcons.length]}</span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-500 transition-colors">
                        {mall.name}
                      </h3>
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        مفتوح
                      </span>
                    </div>

                    {mall.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {mall.description}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {mall.address}
                      </div>
                      {mall.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-400" />
                          {mall.phone}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div>
                        توصيل داخلي:{" "}
                        <span className="font-bold text-green-600">
                          {mall.internalDeliveryFee}₪
                        </span>
                      </div>
                      <div>
                        خارجي:{" "}
                        <span className="font-bold text-orange-500">
                          {mall.externalDeliveryFee}₪
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">كيف يعمل سوقي؟</h2>
            <p className="text-gray-400">أربع خطوات بسيطة للحصول على طلبك</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: "🏪", title: "اختر المول", desc: "تصفح المولات واختر ما يناسبك" },
              { step: "2", icon: "🛒", title: "أضف للسلة", desc: "اختر المنتجات وأضفها للسلة" },
              { step: "3", icon: "💳", title: "أكمل الطلب", desc: "أدخل بياناتك وحول المبلغ" },
              { step: "4", icon: "🚚", title: "استلم طلبك", desc: "نوصل لباب بيتك بسرعة" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
