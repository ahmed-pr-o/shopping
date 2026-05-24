"use client";

import Link from "next/link";
import { ShoppingCart, Store, Search, Bell, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-900 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              سو<span className="text-red-500">قي</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-red-500 font-medium transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/malls"
              className="text-gray-600 hover:text-red-500 font-medium transition-colors"
            >
              المولات
            </Link>
            <Link
              href="/orders/track"
              className="text-gray-600 hover:text-red-500 font-medium transition-colors"
            >
              تتبع طلبي
            </Link>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-red-500 font-medium transition-colors"
            >
              الإدارة
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1 animate-fade-in-up">
            {[
              { href: "/", label: "الرئيسية" },
              { href: "/malls", label: "المولات" },
              { href: "/orders/track", label: "تتبع طلبي" },
              { href: "/admin", label: "الإدارة" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
