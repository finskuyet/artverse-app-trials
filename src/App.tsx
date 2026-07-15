import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MainGallery from "./components/MainGallery";
import CartCheckout from "./components/CartCheckout";
import MyTransactions from "./components/MyTransactions";
import SellerPortal from "./components/SellerPortal";
import TutorialGuide from "./components/TutorialGuide";
import { Artwork, Notification } from "./types";
import { Bell, CheckCircle, Info, MessageSquare, Sparkles, X } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<string>("gallery");
  const [cart, setCart] = useState<Artwork[]>([]);
  const [searchContact, setSearchContact] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Theme mode: dark (default elegant gallery) or light (clean museum gallery)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Seller authentication state
  const [isSeller, setIsSeller] = useState<boolean>(false);

  // Real-time active visual toast notification state
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  // Onboarding Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Load initial cart, theme, and seller state from localStorage
  useEffect(() => {
    const cached = localStorage.getItem("artverse_cart");
    if (cached) {
      try {
        setCart(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to parse cart localstorage", err);
      }
    }
    
    const cachedTheme = localStorage.getItem("artverse_theme") as "dark" | "light";
    if (cachedTheme) {
      setTheme(cachedTheme);
    }

    const cachedSeller = localStorage.getItem("artverse_seller_auth");
    if (cachedSeller === "true") {
      setIsSeller(true);
    }

    // Launch tutorial automatically if never completed before
    const isCompleted = localStorage.getItem("artverse_tutorial_completed");
    if (isCompleted !== "true") {
      setIsTutorialOpen(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("artverse_theme", nextTheme);
  };

  // Sync cart to localStorage
  const syncCartToStorage = (newCart: Artwork[]) => {
    setCart(newCart);
    localStorage.setItem("artverse_cart", JSON.stringify(newCart));
  };

  const addToCart = (artwork: Artwork) => {
    // Avoid double addition
    if (cart.some((item) => item.id === artwork.id)) return;
    const updated = [...cart, artwork];
    syncCartToStorage(updated);

    // Prompt visual feedback toast
    setActiveToast({
      id: "toast-" + Date.now(),
      date: new Date().toISOString(),
      title: "Keranjang Belanja",
      message: `"${artwork.title}" berhasil ditambahkan ke keranjang.`,
      type: "order",
    });
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    syncCartToStorage(updated);
  };

  const clearCart = () => {
    syncCartToStorage([]);
  };

  // Poll for live real-time notifications from backend
  const fetchLiveNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: Notification[] = await res.json();
        
        // If we received a new notification, show an active toast notification!
        if (data.length > notifications.length && data.length > 0) {
          const latest = data[0];
          setActiveToast(latest);
        }
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch live notifications", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveNotifications();

    // Poll every 4 seconds for immediate real-time sync simulation
    const intervalId = setInterval(fetchLiveNotifications, 4000);
    return () => clearInterval(intervalId);
  }, [notifications.length]);

  const clearNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/clear", { method: "POST" });
      if (res.ok) {
        setNotifications([]);
        setActiveToast(null);
      }
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const emitMockNotification = async (title: string, message: string, type: "order" | "payment" | "message") => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type }),
      });
      if (res.ok) {
        await fetchLiveNotifications();
      }
    } catch (err) {
      console.error("Failed to emit mock notification:", err);
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between selection:bg-[#f0bf5c] selection:text-[#412d00] transition-colors duration-300 ${
      theme === "dark" ? "bg-[#0d0d0d] text-[#ebe1d6]" : "bg-[#fcfaf7] text-stone-900"
    }`}>
      {/* Onboarding Interactive Tutorial & Canvas Animation */}
      <TutorialGuide
        theme={theme}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onEmitMockNotification={emitMockNotification}
      />

      {/* Global Header and Nav Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cart.length}
        notifications={notifications}
        clearNotifications={clearNotifications}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Main Content Sections switcher */}
      <div className="flex-grow pb-12">
        {activeView === "gallery" && (
          <MainGallery 
            addToCart={addToCart} 
            cartItemIds={cart.map((item) => item.id)} 
            theme={theme}
            isSeller={isSeller}
          />
        )}

        {activeView === "cart" && (
          <CartCheckout
            cart={cart}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            setActiveView={setActiveView}
            setSearchContact={setSearchContact}
            theme={theme}
          />
        )}

        {activeView === "transactions" && (
          <MyTransactions 
            searchContact={searchContact} 
            setSearchContact={setSearchContact} 
            theme={theme}
          />
        )}

        {activeView === "seller" && (
          <SellerPortal 
            theme={theme}
            isSeller={isSeller}
            onSellerAuthChange={(val) => {
              setIsSeller(val);
              localStorage.setItem("artverse_seller_auth", val ? "true" : "false");
            }}
          />
        )}
      </div>

      {/* Static Footer */}
      <Footer theme={theme} />

      {/* Floating Real-time Toast Alerts Overlay */}
      {activeToast && (
        <div className={`fixed bottom-6 right-6 z-[120] max-w-sm w-full border-l-4 rounded-lg p-4 shadow-2xl flex gap-3 animate-in slide-in-from-right-4 duration-300 ${
          theme === "dark" 
            ? "bg-[#17130c] border-[#f0bf5c] text-white" 
            : "bg-white border-[#c89b3c] text-stone-800"
        }`}>
          <div className={`${theme === "dark" ? "text-[#f0bf5c]" : "text-[#c89b3c]"} flex-shrink-0 mt-0.5`}>
            {activeToast.type === "message" ? (
              <MessageSquare size={18} />
            ) : activeToast.type === "payment" ? (
              <CheckCircle size={18} />
            ) : (
              <Sparkles size={18} />
            )}
          </div>
          <div className="flex-grow text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className={`font-bold uppercase tracking-wider text-[10px] ${
                theme === "dark" ? "text-[#f0bf5c]" : "text-[#c89b3c]"
              }`}>
                {activeToast.title}
              </span>
              <button
                onClick={() => setActiveToast(null)}
                className={`p-0.5 transition-colors ${
                  theme === "dark" ? "text-[#9b8f7d] hover:text-[#ebe1d6]" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <X size={14} />
              </button>
            </div>
            <p className={`font-semibold leading-snug ${theme === "dark" ? "text-white" : "text-stone-900"}`}>{activeToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
