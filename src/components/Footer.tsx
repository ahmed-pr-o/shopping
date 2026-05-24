import Link from "next/link";
import { Store, Phone, MapPin, Heart } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-900 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">سوقي</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              منصة التسوق الإلكتروني الأولى في غزة. نجمع أشهر المولات
              والمحلات في مكان واحد لتسوق أسهل وأوفر.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/malls", label: "جميع المولات" },
                { href: "/cart", label: "سلة التسوق" },
                { href: "/orders/track", label: "تتبع الطلب" },
                { href: "/admin", label: "لوحة الإدارة" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-black-400 shrink-0" />
                <span>قطاع غزة، فلسطين</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span><a href="tel:0591234567">0591234567</a></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaWhatsapp className="w-4 h-4 text-green-500 shrink-0" />

                <a
                  href="https://wa.me/972567714904"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  تواصل واتساب
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex items-center justify-center gap-1 text-sm text-gray-500">
          <p className="text-gray-100 text-sm md:text-base font-light tracking-wider">
            Designed & Developed by{" "}

            <span className="text-white font-bold">
              Ahmed Saidam
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
