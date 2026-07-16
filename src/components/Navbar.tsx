import { ShoppingCart, Compass, FileText, Lock, Menu, Bell, Sun, Moon, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Notification } from "../types";

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  cartCount: number;
  notifications: Notification[];
  clearNotifications: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  onOpenTutorial: () => void;
}

export default function Navbar({
  activeView,
  setActiveView,
  cartCount,
  notifications,
  clearNotifications,
  theme,
  toggleTheme,
  onOpenTutorial,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-all duration-300 ${
      isDark 
        ? "bg-[#17130c]/80 border-[#f0bf5c]/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]" 
        : "bg-white/95 border-stone-200 shadow-[0_10px_30px_rgba(139,120,90,0.05)]"
    }`}>
      <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setActiveView("gallery");
            setMobileMenuOpen(false);
          }}
          className={`font-display text-2xl font-bold tracking-widest cursor-pointer select-none transition-colors ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}
        >
          ARTVERSE
        </div>

        {/* Desktop Navigation links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            id="nav-gallery"
            onClick={() => setActiveView("gallery")}
            className={`flex items-center gap-2 font-semibold tracking-wide text-sm transition-colors duration-300 ${
              activeView === "gallery" 
                ? (isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]") 
                : (isDark ? "text-[#ebe1d6] hover:text-[#f0bf5c]" : "text-stone-600 hover:text-[#c89b3c]")
            }`}
          >
            <Compass size={16} />
            <span>🎨 Galeri Seni</span>
          </button>

          <button
            id="nav-cart"
            onClick={() => setActiveView("cart")}
            className={`flex items-center gap-2 font-semibold tracking-wide text-sm transition-all duration-300 px-3.5 py-2 rounded-lg ${
              activeView === "cart"
                ? (isDark ? "bg-[#f0bf5c] text-[#412d00]" : "bg-[#c89b3c] text-white")
                : (isDark ? "text-[#ebe1d6] hover:text-[#f0bf5c] hover:bg-white/5" : "text-stone-600 hover:text-[#c89b3c] hover:bg-stone-100")
            }`}
          >
            <ShoppingCart size={16} />
            <span>🛒 Keranjang</span>
            {cartCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                  activeView === "cart" 
                    ? (isDark ? "bg-[#412d00] text-[#f0bf5c]" : "bg-white text-[#c89b3c]") 
                    : (isDark ? "bg-[#f0bf5c] text-[#412d00]" : "bg-[#c89b3c] text-white")
                }`}
              >
                {cartCount}
              </span>
            )}
          </button>

          <button
            id="nav-transactions"
            onClick={() => setActiveView("transactions")}
            className={`flex items-center gap-2 font-semibold tracking-wide text-sm transition-colors duration-300 ${
              activeView === "transactions" 
                ? (isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]") 
                : (isDark ? "text-[#ebe1d6] hover:text-[#f0bf5c]" : "text-stone-600 hover:text-[#c89b3c]")
            }`}
          >
            <FileText size={16} />
            <span>📦 Transaksi Saya</span>
          </button>
        </div>

        {/* Action Button & Live Notifications */}
        <div className="flex items-center gap-3">
          {/* Interactive Tutorial Trigger Button */}
          <button
            id="nav-guide"
            onClick={onOpenTutorial}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all cursor-pointer text-xs font-semibold ${
              isDark 
                ? "border-[#f0bf5c]/20 hover:bg-[#f0bf5c]/10 text-[#f0bf5c]" 
                : "border-stone-200 hover:bg-stone-50 text-stone-600"
            }`}
            title="Buka Panduan Tutorial Interaktif"
          >
            <HelpCircle size={15} />
            <span className="hidden sm:inline">Panduan</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            id="nav-theme"
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isDark 
                ? "border-[#f0bf5c]/20 hover:bg-[#f0bf5c]/10 text-[#f0bf5c]" 
                : "border-stone-200 hover:bg-stone-100 text-stone-600"
            }`}
            title={isDark ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Real-time Notification Bell */}
          <div className="relative">
            <button
              id="nav-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-full border transition-all cursor-pointer ${
                isDark 
                  ? "border-[#f0bf5c]/20 hover:bg-[#f0bf5c]/10 text-[#f0bf5c]" 
                  : "border-stone-200 hover:bg-stone-100 text-stone-600"
              }`}
              title="Notifikasi Real-time"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className={`absolute right-0 mt-3 w-80 rounded-xl shadow-2xl p-4 z-[110] animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark 
                  ? "bg-[#17130c] border border-[#f0bf5c]/25 text-white" 
                  : "bg-white border border-stone-200 text-stone-800"
              }`}>
                <div className="flex justify-between items-center mb-3 border-b pb-2 border-stone-200 dark:border-stone-800">
                  <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1 ${
                    isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                  }`}>
                    <Bell size={12} /> Live Updates
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        clearNotifications();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest font-semibold"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-3">
                  {notifications.length === 0 ? (
                    <div className={`py-8 text-center text-xs ${isDark ? "text-[#d2c5b1]/60" : "text-stone-400"}`}>
                      Belum ada notifikasi baru.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border-l-2 text-xs space-y-1 transition-colors ${
                          isDark 
                            ? "bg-[#1f1b14] border-[#f0bf5c] hover:bg-white/5 text-white" 
                            : "bg-stone-50 border-[#c89b3c] hover:bg-stone-100 text-stone-800"
                        }`}
                      >
                        <div className="flex justify-between text-[10px] opacity-75">
                          <span className={`capitalize font-bold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>{n.type}</span>
                          <span>{new Date(n.date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-bold">{n.title}</p>
                        <p className="leading-relaxed text-[11px] opacity-90">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            id="nav-seller"
            onClick={() => setActiveView("seller")}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs transition-all cursor-pointer border ${
              activeView === "seller"
                ? (isDark ? "bg-[#f0bf5c] text-[#412d00] border-transparent" : "bg-[#c89b3c] text-white border-transparent")
                : (isDark ? "border-[#f0bf5c]/40 text-[#f0bf5c] hover:bg-[#f0bf5c]/10" : "border-[#c89b3c]/40 text-[#c89b3c] hover:bg-[#c89b3c]/5")
            }`}
          >
            <Lock size={11} />
            <span>Portal Penjual</span>
          </button>

          {/* Hamburger Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1.5 border rounded-md transition-colors cursor-pointer ${
              isDark 
                ? "text-[#f0bf5c] border-[#f0bf5c]/20 hover:bg-[#f0bf5c]/10" 
                : "text-stone-600 border-stone-200 hover:bg-stone-100"
            }`}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-6 py-4 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-300 ${
          isDark 
            ? "bg-[#17130c] border-[#f0bf5c]/20" 
            : "bg-white border-stone-200 shadow-lg"
        }`}>
          <button
            id="nav-guide-mobile"
            onClick={() => {
              onOpenTutorial();
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 text-left py-2 text-sm font-semibold transition-colors ${
              isDark ? "text-[#f0bf5c] hover:text-[#ffcf6e]" : "text-[#c89b3c] hover:text-[#b0842e]"
            }`}
          >
            <HelpCircle size={16} />
            <span>✨ Panduan Interaktif</span>
          </button>
          <button
            id="nav-gallery-mobile"
            onClick={() => {
              setActiveView("gallery");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 text-left py-2 text-sm font-semibold transition-colors ${
              activeView === "gallery" 
                ? (isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]") 
                : (isDark ? "text-[#ebe1d6]" : "text-stone-600")
            }`}
          >
            <span>🎨 Galeri Seni</span>
          </button>
          <button
            id="nav-cart-mobile"
            onClick={() => {
              setActiveView("cart");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 text-left py-2 text-sm font-semibold transition-colors ${
              activeView === "cart" 
                ? (isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]") 
                : (isDark ? "text-[#ebe1d6]" : "text-stone-600")
            }`}
          >
            <span>🛒 Keranjang ({cartCount})</span>
          </button>
          <button
            id="nav-transactions-mobile"
            onClick={() => {
              setActiveView("transactions");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 text-left py-2 text-sm font-semibold transition-colors ${
              activeView === "transactions" 
                ? (isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]") 
                : (isDark ? "text-[#ebe1d6]" : "text-stone-600")
            }`}
          >
            <span>📦 Transaksi Saya</span>
          </button>
          <button
            id="nav-seller-mobile"
            onClick={() => {
              setActiveView("seller");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 text-left py-2 text-sm font-semibold transition-colors ${
              activeView === "seller" 
                ? (isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]") 
                : (isDark ? "text-[#ebe1d6]" : "text-stone-600")
            }`}
          >
            <span>🔒 Portal Penjual</span>
          </button>
        </div>
      )}
    </nav>
  );
}
