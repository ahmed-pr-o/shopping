import Link from "next/link";
import { db } from "@/db";
import { malls } from "@/db/schema";
import { eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Store, MapPin, Phone, ArrowLeft } from "lucide-react";

const mallColors = [
  "from-red-500 to-orange-400",
  "from-blue-600 to-blue-400",
  "from-green-600 to-emerald-400",
  "from-purple-600 to-pink-400",
  "from-yellow-500 to-amber-400",
  "from-cyan-600 to-teal-400",
];

const mallIcons = ["🏪", "🛒", "🏬", "🛍️", "🏦", "🏢"];

export default async function MallsPage() {
  let allMalls: typeof malls.$inferSelect[] = [];
  try {
    allMalls = await db.select().from(malls).where(eq(malls.isActive, true));
  } catch {
    allMalls = [];
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-10">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Store className="w-8 h-8" />
              جميع المولات والمحلات
            </h1>
            <p className="text-blue-200">
              {allMalls.length} مول ومحل متاح للتسوق
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {allMalls.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                لا توجد مولات
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                قم بتهيئة البيانات من لوحة الإدارة
              </p>
              <Link
                href="/admin"
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600"
              >
                لوحة الإدارة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allMalls.map((mall, idx) => (
                <Link
                  key={mall.id}
                  href={`/malls/${mall.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover shadow-sm"
                >
                  <div
                    className={`bg-gradient-to-br ${mallColors[idx % mallColors.length]} h-36 flex items-center justify-center`}
                  >
                    <span className="text-7xl">
                      {mallIcons[idx % mallIcons.length]}
                    </span>
                  </div>
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
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {mall.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400" />
                        {mall.address}
                      </div>
                      {mall.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-400" />
                          {mall.phone}
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex justify-between text-xs">
                      <div>
                        <span className="text-gray-400">توصيل داخلي</span>
                        <div className="font-bold text-green-600 text-sm">
                          {mall.internalDeliveryFee}₪
                        </div>
                      </div>
                      <div className="w-px bg-gray-200"></div>
                      <div>
                        <span className="text-gray-400">توصيل خارجي</span>
                        <div className="font-bold text-orange-500 text-sm">
                          {mall.externalDeliveryFee}₪
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-red-500 font-medium text-sm">
                      تسوق الآن
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
