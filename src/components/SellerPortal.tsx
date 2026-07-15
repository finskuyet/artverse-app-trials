import React, { useState, useEffect, useRef } from "react";
import { Lock, Sparkles, TrendingUp, DollarSign, Image as ImageIcon, Plus, CheckCircle, Trash2, Edit2, MessageSquare, AlertCircle, RefreshCw, Layers, Check, ShoppingBag, Eye, X, Loader2, Truck } from "lucide-react";
import { Artwork, Order, Message } from "../types";

const INDONESIAN_BANKS = [
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "BSI",
  "CIMB Niaga",
  "Permata Bank",
  "Bank Danamon",
  "Bank Jago",
  "BTN",
  "Seabank"
];

interface SellerPortalProps {
  theme?: "dark" | "light";
  isSeller: boolean;
  onSellerAuthChange: (auth: boolean) => void;
}

export default function SellerPortal({ 
  theme = "dark",
  isSeller,
  onSellerAuthChange
}: SellerPortalProps) {
  const isDark = theme === "dark";
  const isAuthenticated = isSeller;
  const setIsAuthenticated = onSellerAuthChange;
  const [accessToken, setAccessToken] = useState("");
  const [loginError, setLoginError] = useState("");

  // Dashboard state
  const [activeTab, setActiveTab] = useState<"summary" | "catalog" | "upload" | "orders" | "messages" | "settings">("summary");
  const [stats, setStats] = useState({
    activeArtworksCount: 0,
    availableCount: 0,
    soldCount: 0,
    totalOmset: 0,
    activeOrdersCount: 0,
  });

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload Form state
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Andini Kusuma");
  const [category, setCategory] = useState("Realisme Klasik");
  const [year, setYear] = useState("2026");
  const [size, setSize] = useState("");
  const [medium, setMedium] = useState("Cat Minyak pada Kanvas");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Tersedia");
  const [description, setDescription] = useState("");
  const [uploadImage, setUploadImage] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Edit/Zoom Modal States
  const [zoomReceiptUrl, setZoomReceiptUrl] = useState<string | null>(null);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deletingArt, setDeletingArt] = useState<Artwork | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);

  // Message reply states
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // Shipping receipt states
  const [editingShippingOrderId, setEditingShippingOrderId] = useState<string | null>(null);
  const [shippingCourier, setShippingCourier] = useState("");
  const [shippingReceipt, setShippingReceipt] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);

  // Payment Settings States
  const [bank1Name, setBank1Name] = useState("BCA");
  const [bank1Number, setBank1Number] = useState("");
  const [bank1Owner, setBank1Owner] = useState("");
  const [bank2Name, setBank2Name] = useState("Mandiri");
  const [bank2Number, setBank2Number] = useState("");
  const [bank2Owner, setBank2Owner] = useState("");
  const [qrisImage, setQrisImage] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrisInputRef = useRef<HTMLInputElement>(null);

  // Load payment settings
  const loadPaymentSettings = async () => {
    try {
      const res = await fetch("/api/payment-settings");
      const data = await res.json();
      if (data) {
        setBank1Name(data.bank1Name || "BCA");
        setBank1Number(data.bank1Number || "");
        setBank1Owner(data.bank1Owner || "");
        setBank2Name(data.bank2Name || "Mandiri");
        setBank2Number(data.bank2Number || "");
        setBank2Owner(data.bank2Owner || "");
        setQrisImage(data.qrisImage || "");
        setWhatsappNumber(data.whatsappNumber || "");
      }
    } catch (err) {
      console.error("Error loading payment settings:", err);
    }
  };

  // Load all dashboard statistics & listings
  // `silent` = true is used for background polling so we don't flash the loading spinner
  const loadDashboardData = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const [statsRes, artRes, ordersRes, msgRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/artworks"),
        fetch("/api/orders"),
        fetch("/api/messages"),
      ]);

      const statsData = await statsRes.json();
      const artData = await artRes.json();
      const ordersData = await ordersRes.json();
      const msgData = await msgRes.json();

      setStats(statsData);
      setArtworks(artData);
      setOrders(ordersData);
      setMessages(msgData);
    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      loadPaymentSettings();
    }
  }, [isAuthenticated, activeTab]);

  // Auto-refresh (polling) so new incoming orders & chat messages from buyers
  // show up in the "Pesanan Masuk" / "Pesan Masuk" tabs automatically,
  // without the seller needing to manually refresh the page.
  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = setInterval(() => {
      loadDashboardData(true);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Handle Login Access verification
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) {
      setLoginError("Token akses tidak boleh kosong.");
      return;
    }

    try {
      setLoginError("");
      const res = await fetch("/api/seller/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          setLoginError("");
        } else {
          setLoginError(data.error || "Token akses tidak valid.");
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setLoginError(errData.error || "Token akses tidak valid. Hubungi administrator galeri.");
      }
    } catch (err) {
      console.error("Login verification error", err);
      setLoginError("Gagal terhubung ke server untuk verifikasi token.");
    }
  };

  // Convert uploaded painting file to Base64
  const handlePaintingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Ukuran gambar maksimal adalah 5MB");
        return;
      }
      setUploadFileName(file.name);
      setUploadError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit new Artwork form
  const handleCreateArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess(false);

    if (!title.trim() || !artist.trim() || !price || !uploadImage) {
      setUploadError("Lengkapi semua formulir wajib dan unggah gambar lukisan.");
      return;
    }

    try {
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist,
          category,
          year,
          size: size || "100 x 100 cm",
          medium,
          price: Number(price),
          status,
          description,
          image: uploadImage,
        }),
      });

      if (res.ok) {
        setUploadSuccess(true);
        setTitle("");
        setSize("");
        setDescription("");
        setUploadImage("");
        setUploadFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        setTimeout(() => setUploadSuccess(false), 4000);
        loadDashboardData();
      } else {
        const errorData = await res.json();
        setUploadError(errorData.error || "Gagal mengunggah lukisan.");
      }
    } catch (err) {
      console.error("Upload error", err);
      setUploadError("Gagal menghubungi server untuk mengunggah.");
    }
  };

  // Toggle/Update status of order (Dibayar, Gagal, dll.)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error("Update order status failed", err);
    }
  };

  // Delete message
  const executeDeleteMessage = async (msgId: string) => {
    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingMessage(null);
        loadDashboardData();
      }
    } catch (err) {
      console.error("Delete message failed", err);
    }
  };

  // Send reply to message
  const handleSendReply = async (msgId: string) => {
    if (!replyText.trim()) return;
    try {
      setReplyLoading(true);
      const res = await fetch(`/api/messages/${msgId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      });
      if (res.ok) {
        setReplyingMessageId(null);
        setReplyText("");
        loadDashboardData();
      }
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setReplyLoading(false);
    }
  };

  // Save/Update shipping information (Resi & Kurir)
  const handleSaveShipping = async (orderId: string) => {
    try {
      setShippingLoading(true);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingReceipt,
          courier: shippingCourier,
        }),
      });
      if (res.ok) {
        setEditingShippingOrderId(null);
        setShippingCourier("");
        setShippingReceipt("");
        loadDashboardData();
      }
    } catch (err) {
      console.error("Failed to save shipping info", err);
    } finally {
      setShippingLoading(false);
    }
  };

  // Delete/Remove Artwork from Catalog
  const executeDeleteArtwork = async (artId: string) => {
    try {
      const res = await fetch(`/api/artworks/${artId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingArt(null);
        loadDashboardData();
      }
    } catch (err) {
      console.error("Delete artwork failed", err);
    }
  };

  // Quick edit artwork status directly from catalog table
  const handleUpdateArtworkStatus = async (artId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/artworks/${artId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error("Update artwork status failed", err);
    }
  };

  // Convert uploaded QRIS image file to Base64
  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSettingsError("Ukuran gambar QRIS maksimal adalah 5MB");
        return;
      }
      setSettingsError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrisImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save/Update payment configuration
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(false);
    setSettingsError("");
    setSavingSettings(true);

    try {
      const res = await fetch("/api/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank1Name,
          bank1Number,
          bank1Owner,
          bank2Name,
          bank2Number,
          bank2Owner,
          qrisImage,
          whatsappNumber,
        }),
      });

      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 4000);
        loadPaymentSettings();
      } else {
        const errData = await res.json();
        setSettingsError(errData.error || "Gagal menyimpan pengaturan pembayaran.");
      }
    } catch (err) {
      console.error("Save settings error", err);
      setSettingsError("Kesalahan jaringan, gagal menghubungi server.");
    } finally {
      setSavingSettings(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-center min-h-[85vh]">
        <div className={`max-w-md w-full p-8 md:p-10 rounded-xl border relative overflow-hidden flex flex-col items-center ${
          isDark 
            ? "glass-panel border-[#f0bf5c]/20 shadow-2xl" 
            : "bg-white border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
        }`}>
          {/* Ambient Glow background blur */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#f0bf5c]/5 rounded-full blur-2xl pointer-events-none" />

          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${
            isDark 
              ? "bg-[#f0bf5c]/10 border-[#f0bf5c]/30 text-[#f0bf5c]" 
              : "bg-stone-50 border-stone-200 text-[#c89b3c]"
          }`}>
            <Lock size={24} />
          </div>

          <h1 className={`font-display text-2xl md:text-3xl font-bold mb-2 text-center ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            Portal Login Penjual
          </h1>
          <p className={`font-semibold text-[10px] uppercase tracking-widest mb-6 font-sans ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            Verifikasi Otoritas Pengelola Galeri
          </p>

          {loginError && (
            <div className={`w-full p-3.5 rounded-lg flex items-center gap-2 mb-4 border text-xs ${
              isDark 
                ? "bg-red-950/40 text-red-400 border-red-500/30" 
                : "bg-red-50 text-red-600 border-red-200"
            }`}>
              <AlertCircle size={14} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDark ? "text-[#d2c5b1]" : "text-stone-600"
              }`}>
                Token Akses Penjual *
              </label>
              <input
                type="password"
                required
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Masukkan kata kunci akses..."
                className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                  isDark 
                    ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white placeholder:text-[#9b8f7d]/50" 
                    : "bg-stone-50 border border-stone-300 focus:border-[#c89b3c] text-stone-950 placeholder:text-stone-400"
                }`}
              />
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-3.5 rounded-lg hover:brightness-110 active:scale-95 transition-all text-xs tracking-wider uppercase shadow-lg cursor-pointer ${
                isDark 
                  ? "bg-[#f0bf5c] text-[#412d00] shadow-[#f0bf5c]/15" 
                  : "bg-[#c89b3c] text-white hover:bg-[#b08530] shadow-md"
              }`}
            >
              Verifikasi Akses
            </button>
          </form>

          {/* Prompt Instructions Box */}
          <div className={`mt-8 rounded-lg p-4 w-full text-left space-y-1.5 text-xs ${
            isDark 
              ? "bg-[#1f1b14] border border-[#4e4637]/30" 
              : "bg-stone-50 border border-stone-200"
          }`}>
            <p className={`font-bold uppercase tracking-wider text-[10px] ${
              isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
            }`}>
              Petunjuk Akses:
            </p>
            <p className={`leading-relaxed text-[11px] ${isDark ? "text-[#d2c5b1]/80" : "text-stone-500"}`}>
              Masukkan Token Akses khusus mitra penjual untuk masuk dan mengelola karya seni, pesanan, dan transaksi Anda. Jika Anda tidak memiliki token, silakan hubungi Administrator Galeri.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen transition-colors duration-300 ${
      isDark ? "" : "text-stone-900"
    }`}>
      {/* Upper Dashboard header with sync/refresh button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className={`text-xs font-bold tracking-[0.2em] uppercase ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            DASBOR PENGELOLA GALERI
          </span>
          <h1 className={`font-display text-3xl md:text-4xl font-bold mt-1 ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            ArtVerse Management Portal
          </h1>
        </div>

        <div className="flex gap-3 self-start">
          <button
            onClick={() => loadDashboardData()}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              isDark 
                ? "bg-[#1f1b14] border-[#4e4637]/30 text-[#f0bf5c] hover:bg-[#f0bf5c]/10 hover:border-[#f0bf5c]" 
                : "bg-white border-stone-300 text-[#c89b3c] hover:bg-[#c89b3c]/5 hover:border-[#c89b3c]"
            }`}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sinkronkan Data</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              isDark 
                ? "bg-red-950/40 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500" 
                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
            }`}
          >
            <Lock size={14} />
            <span>Keluar Portal</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className={`flex overflow-x-auto gap-2 pb-2 mb-8 border-b custom-scrollbar whitespace-nowrap ${
        isDark ? "border-[#f0bf5c]/10" : "border-stone-200"
      }`}>
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${
            activeTab === "summary"
              ? isDark 
                ? "bg-[#f0bf5c]/10 text-[#f0bf5c] border-[#f0bf5c]/30"
                : "bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30"
              : isDark 
                ? "text-[#d2c5b1] hover:text-[#f0bf5c] hover:bg-[#ebe1d6]/5 border-transparent"
                : "text-stone-600 hover:text-stone-950 hover:bg-stone-100 border-transparent"
          }`}
        >
          📊 Ringkasan Galeri
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${
            activeTab === "catalog"
              ? isDark 
                ? "bg-[#f0bf5c]/10 text-[#f0bf5c] border-[#f0bf5c]/30"
                : "bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30"
              : isDark 
                ? "text-[#d2c5b1] hover:text-[#f0bf5c] hover:bg-[#ebe1d6]/5 border-transparent"
                : "text-stone-600 hover:text-stone-950 hover:bg-stone-100 border-transparent"
          }`}
        >
          🎨 Kelola Katalog ({artworks.length})
        </button>

        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${
            activeTab === "upload"
              ? isDark 
                ? "bg-[#f0bf5c]/10 text-[#f0bf5c] border-[#f0bf5c]/30"
                : "bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30"
              : isDark 
                ? "text-[#d2c5b1] hover:text-[#f0bf5c] hover:bg-[#ebe1d6]/5 border-transparent"
                : "text-stone-600 hover:text-stone-950 hover:bg-stone-100 border-transparent"
          }`}
        >
          📤 Unggah Lukisan
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative border ${
            activeTab === "orders"
              ? isDark 
                ? "bg-[#f0bf5c]/10 text-[#f0bf5c] border-[#f0bf5c]/30"
                : "bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30"
              : isDark 
                ? "text-[#d2c5b1] hover:text-[#f0bf5c] hover:bg-[#ebe1d6]/5 border-transparent"
                : "text-stone-600 hover:text-stone-950 hover:bg-stone-100 border-transparent"
          }`}
        >
          📦 Pesanan Masuk ({orders.length})
          {stats.activeOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {stats.activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${
            activeTab === "messages"
              ? isDark 
                ? "bg-[#f0bf5c]/10 text-[#f0bf5c] border-[#f0bf5c]/30"
                : "bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30"
              : isDark 
                ? "text-[#d2c5b1] hover:text-[#f0bf5c] hover:bg-[#ebe1d6]/5 border-transparent"
                : "text-stone-600 hover:text-stone-950 hover:bg-stone-100 border-transparent"
          }`}
        >
          ✉️ Pesan Masuk ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${
            activeTab === "settings"
              ? isDark 
                ? "bg-[#f0bf5c]/10 text-[#f0bf5c] border-[#f0bf5c]/30"
                : "bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30"
              : isDark 
                ? "text-[#d2c5b1] hover:text-[#f0bf5c] hover:bg-[#ebe1d6]/5 border-transparent"
                : "text-stone-600 hover:text-stone-950 hover:bg-stone-100 border-transparent"
          }`}
        >
          ⚙️ Pengaturan Pembayaran
        </button>
      </div>

      {/* PANELS */}

      {/* Tab 1: Summary */}
      {activeTab === "summary" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div className={`p-6 rounded-xl flex items-center gap-5 border-l-4 border-amber-500 shadow-md ${
              isDark ? "glass-panel" : "bg-white border border-stone-200"
            }`}>
              <div className="w-12 h-12 rounded bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <Layers size={20} />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                  Total Katalog
                </p>
                <h3 className={`text-2xl font-bold font-display mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>
                  {stats.activeArtworksCount} Karya
                </h3>
              </div>
            </div>

            {/* Stat 2 */}
            <div className={`p-6 rounded-xl flex items-center gap-5 border-l-4 border-emerald-500 shadow-md ${
              isDark ? "glass-panel" : "bg-white border border-stone-200"
            }`}>
              <div className="w-12 h-12 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <Check size={20} />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                  Karya Tersedia
                </p>
                <h3 className={`text-2xl font-bold font-display mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>
                  {stats.availableCount} Unit
                </h3>
              </div>
            </div>

            {/* Stat 3 */}
            <div className={`p-6 rounded-xl flex items-center gap-5 border-l-4 border-blue-500 shadow-md ${
              isDark ? "glass-panel" : "bg-white border border-stone-200"
            }`}>
              <div className="w-12 h-12 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                  Karya Terjual
                </p>
                <h3 className={`text-2xl font-bold font-display mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>
                  {stats.soldCount} Karya
                </h3>
              </div>
            </div>

            {/* Stat 4 */}
            <div className={`p-6 rounded-xl flex items-center gap-5 border-l-4 border-yellow-500 shadow-md ${
              isDark ? "glass-panel" : "bg-white border border-stone-200"
            }`}>
              <div className="w-12 h-12 rounded bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                <DollarSign size={20} />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                  Total Omset Penjualan
                </p>
                <h3 className={`text-xl font-bold font-display mt-0.5 ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                  Rp {stats.totalOmset.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Info & Sold Painting Grid of main sales (Hasil lukisan yang dijual penjual) */}
          <div className={`rounded-xl p-6 md:p-8 ${isDark ? "glass-panel" : "bg-white border border-stone-200 shadow-sm"}`}>
            <div className={`flex justify-between items-center mb-6 pb-4 border-b ${
              isDark ? "border-[#f0bf5c]/10" : "border-stone-200"
            }`}>
              <h2 className={`font-display text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-stone-900"}`}>
                <Sparkles className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} size={16} />
                <span>Galeri Utama Karya yang Terjual (Sales Gallery)</span>
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded ${
                isDark 
                  ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/20" 
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}>
                Verified Sales
              </span>
            </div>

            {orders.filter((o) => o.status === "Dibayar").length === 0 ? (
              <div className={`py-16 text-center text-xs ${isDark ? "text-[#d2c5b1]/60" : "text-stone-400"}`}>
                Belum ada transaksi pembayaran lunas.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {orders
                  .filter((o) => o.status === "Dibayar")
                  .flatMap((o) => o.items)
                  .map((item, index) => (
                    <div
                      key={index}
                      className={`rounded-lg overflow-hidden flex flex-col transition-colors border ${
                        isDark 
                          ? "bg-[#110e08]/60 border-[#f0bf5c]/15 hover:border-[#f0bf5c]/35" 
                          : "bg-stone-50 border-stone-200 hover:border-stone-300 shadow-sm"
                      }`}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-black relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className={`border rounded px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest font-sans ${
                            isDark 
                              ? "bg-red-950/90 text-red-400 border-red-500/20" 
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            Terjual
                          </span>
                        </div>
                      </div>
                      <div className="p-3 text-xs space-y-1">
                        <h4 className={`font-display font-bold truncate ${isDark ? "text-[#ebe1d6]" : "text-stone-900"}`}>{item.title}</h4>
                        <p className={`text-[10px] italic truncate ${isDark ? "text-[#d2c5b1]/60" : "text-stone-500"}`}>Oleh {item.artist}</p>
                        <p className={`font-bold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>Rp {item.price.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Catalog Management */}
      {activeTab === "catalog" && (
        <div className={`rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300 border ${
          isDark ? "glass-panel border-[#f0bf5c]/10" : "bg-white border-stone-200"
        }`}>
          <div className={`p-6 border-b flex justify-between items-center ${
            isDark ? "border-[#f0bf5c]/10 bg-[#1f1b14]/50" : "border-stone-200 bg-stone-50"
          }`}>
            <h2 className={`font-display text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Daftar Katalog Karya Seni</h2>
            <button
              onClick={() => setActiveTab("upload")}
              className={`font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer px-4 py-2 rounded ${
                isDark 
                  ? "bg-[#f0bf5c] text-[#412d00] hover:brightness-110" 
                  : "bg-[#c89b3c] text-white hover:bg-[#b08530]"
              }`}
            >
              <Plus size={14} />
              <span>Tambah Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-bold uppercase tracking-wider ${
                  isDark 
                    ? "border-[#f0bf5c]/10 bg-[#1f1b14]/30 text-[#f0bf5c]" 
                    : "border-stone-200 bg-stone-100 text-stone-700"
                }`}>
                  <th className="p-4">Karya Lukisan</th>
                  <th className="p-4">Seniman</th>
                  <th className="p-4">Kategori / Tahun</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? "divide-[#f0bf5c]/5 text-[#ebe1d6]" : "divide-stone-100 text-stone-800"
              }`}>
                {artworks.map((art) => (
                  <tr key={art.id} className={isDark ? "hover:bg-[#ebe1d6]/5 transition-colors" : "hover:bg-stone-50 transition-colors"}>
                    <td className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-12 rounded overflow-hidden flex-shrink-0 border ${
                        isDark ? "bg-black border-[#f0bf5c]/10" : "bg-white border-stone-200"
                      }`}>
                        <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                      </div>
                      <span className={`font-bold text-sm block truncate max-w-[150px] ${isDark ? "text-white" : "text-stone-900"}`}>
                        {art.title}
                      </span>
                    </td>
                    <td className={`p-4 italic ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>{art.artist}</td>
                    <td className="p-4 text-xs">
                      <span className={`font-bold block ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>{art.category}</span>
                      <span className={`text-[10px] ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>{art.year}</span>
                    </td>
                    <td className={`p-4 font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Rp {art.price.toLocaleString("id-ID")}</td>
                    <td className="p-4">
                      {/* Interactive inline toggle select */}
                      <select
                        value={art.status}
                        onChange={(e) => handleUpdateArtworkStatus(art.id, e.target.value)}
                        className={`text-xs font-bold rounded px-2.5 py-1.5 outline-none cursor-pointer border ${
                          isDark 
                            ? "bg-[#1f1b14] border-[#4e4637]/30 text-white" 
                            : "bg-white border-stone-300 text-stone-800"
                        } ${
                          art.status === "Tersedia" ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        <option value="Tersedia">Tersedia</option>
                        <option value="Terjual">Terjual</option>
                        <option value="Hanya Pameran">Hanya Pameran</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setDeletingArt(art)}
                          className={`p-1.5 rounded hover:bg-red-500/10 transition-colors ${
                            isDark ? "text-[#9b8f7d] hover:text-red-400" : "text-stone-400 hover:text-red-600"
                          }`}
                          title="Hapus Karya"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Upload Painting Form */}
      {activeTab === "upload" && (
        <div className={`max-w-3xl mx-auto rounded-xl p-8 shadow-xl animate-in fade-in duration-300 border ${
          isDark ? "glass-panel border-[#f0bf5c]/10" : "bg-white border-stone-200"
        }`}>
          <div className={`flex items-center gap-3 border-b pb-4 mb-6 ${
            isDark ? "border-[#f0bf5c]/10" : "border-stone-200"
          }`}>
            <Plus className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} size={20} />
            <h2 className={`font-display text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Unggah Karya Seni Baru</h2>
          </div>

          {uploadSuccess && (
            <div className={`p-4 rounded-lg flex items-center gap-3 border text-xs mb-6 ${
              isDark 
                ? "bg-green-950/30 text-green-400 border-green-500/20" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              <CheckCircle size={16} />
              <span>Lukisan baru berhasil disimpan ke database katalog!</span>
            </div>
          )}

          {uploadError && (
            <div className={`p-4 rounded-lg flex items-center gap-3 border text-xs mb-6 ${
              isDark 
                ? "bg-red-950/40 text-red-400 border-red-500/30" 
                : "bg-red-50 text-red-600 border-red-200"
            }`}>
              <AlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleCreateArtwork} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Judul Lukisan *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Langgam Kencana"
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                  }`}
                />
              </div>

              {/* Artist */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Nama Seniman (Artist) *</label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Contoh: Andini Kusuma"
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c]"
                  }`}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Kategori / Aliran Seni *</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Realisme Klasik, Abstrak, dll."
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                  }`}
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Tahun Pembuatan *</label>
                <input
                  type="text"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Contoh: 2024"
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c]"
                  }`}
                />
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Ukuran Fisik (Lebar x Tinggi) *</label>
                <input
                  type="text"
                  required
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Contoh: 100 x 140 cm"
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                  }`}
                />
              </div>

              {/* Medium */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Media lukisan *</label>
                <input
                  type="text"
                  required
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="Contoh: Cat Minyak pada Kanvas"
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c]"
                  }`}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Harga Jual (Rp) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 45000000"
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c]"
                  }`}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Status Ketersediaan *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full rounded-lg p-3 text-sm outline-none transition-all cursor-pointer border ${
                    isDark 
                      ? "bg-[#1f1b14] border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                      : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c]"
                  }`}
                >
                  <option>Tersedia</option>
                  <option>Terjual</option>
                  <option>Hanya Pameran</option>
                </select>
              </div>
            </div>

            {/* Description / Makna Filosofis */}
            <div className="space-y-2">
              <label className={`font-bold ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Deskripsi &amp; Filosofi Lukisan</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tulis makna filosofis, detail warna, atau inspirasi di balik lukisan..."
                className={`w-full rounded-lg p-3 text-sm outline-none transition-all resize-none border ${
                  isDark 
                    ? "bg-[#1f1b14] border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                    : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                }`}
              />
            </div>

            {/* Image Upload Block */}
            <div className="space-y-2 pt-2">
              <label className={`font-bold block ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>Foto / Gambar Lukisan *</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`border px-4 py-2.5 rounded text-xs font-bold transition-colors cursor-pointer select-none ${
                    isDark 
                      ? "bg-[#2e2922] border-[#4e4637]/50 hover:bg-[#39342c] text-[#ebe1d6]" 
                      : "bg-stone-100 border-stone-300 hover:bg-stone-200 text-stone-800"
                  }`}
                >
                  Pilih File Lukisan
                </button>
                <span className={`italic ${isDark ? "text-[#d2c5b1]/80" : "text-stone-500"}`}>
                  {uploadFileName || "Belum ada file yang dipilih"}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePaintingUpload}
                  className="hidden"
                />
              </div>

              {uploadImage && (
                <div className={`mt-3 p-3 rounded-lg max-w-xs border ${
                  isDark ? "bg-[#1f1b14] border-[#f0bf5c]/10" : "bg-stone-50 border-stone-200"
                }`}>
                  <p className={`text-[10px] uppercase tracking-wider mb-2 font-bold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                    Pratinjau Gambar:
                  </p>
                  <img
                    src={uploadImage}
                    alt="Pratinjau"
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              )}
            </div>

            {/* Form footer submit */}
            <div className={`pt-6 border-t ${isDark ? "border-[#f0bf5c]/10" : "border-stone-200"} text-right`}>
              <button
                type="submit"
                className={`font-bold px-8 py-3.5 rounded-lg hover:brightness-110 active:scale-95 transition-all text-xs tracking-wider uppercase shadow-lg cursor-pointer ${
                  isDark 
                    ? "bg-[#f0bf5c] text-[#412d00] shadow-[#f0bf5c]/15" 
                    : "bg-[#c89b3c] text-white hover:bg-[#b08530] shadow-md"
                }`}
              >
                Simpan Lukisan ke Katalog
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Incoming Orders */}
      {activeTab === "orders" && (
        <div className={`rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300 border ${
          isDark ? "glass-panel border-[#f0bf5c]/10" : "bg-white border-stone-200"
        }`}>
          <div className={`p-6 border-b flex justify-between items-center ${
            isDark ? "border-[#f0bf5c]/10 bg-[#1f1b14]/50" : "border-stone-200 bg-stone-50"
          }`}>
            <h2 className={`font-display text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-stone-900"}`}>
              <span>Daftar Pesanan Masuk</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded ${
                isDark 
                  ? "text-yellow-400 bg-yellow-950/40 border-yellow-500/20" 
                  : "text-[#c89b3c] bg-stone-50 border-stone-300"
              }`}>
                Real-time Sync
              </span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className={`py-20 text-center text-xs ${isDark ? "text-[#d2c5b1]/60" : "text-stone-400"}`}>
              Belum ada pesanan masuk dari pembeli.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider ${
                    isDark 
                      ? "border-[#f0bf5c]/10 bg-[#1f1b14]/30 text-[#f0bf5c]" 
                      : "border-stone-200 bg-stone-100 text-stone-700"
                  }`}>
                    <th className="p-4">ID / Tanggal</th>
                    <th className="p-4">Nama Pembeli</th>
                    <th className="p-4">Email / Telepon</th>
                    <th className="p-4">Karya Seni</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Kuitansi Bukti</th>
                    <th className="p-4">Status &amp; Verifikasi</th>
                    <th className="p-4">Pengiriman (No. Resi)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? "divide-[#f0bf5c]/5 text-[#ebe1d6]" : "divide-stone-100 text-stone-800"
                }`}>
                  {orders.map((o) => (
                    <tr key={o.id} className={isDark ? "hover:bg-[#ebe1d6]/5 transition-colors" : "hover:bg-stone-50 transition-colors"}>
                      <td className="p-4 space-y-0.5">
                        <span className={`font-bold block ${isDark ? "text-white" : "text-stone-900"}`}>{o.id}</span>
                        <span className={`text-[10px] ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                          {new Date(o.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className={`p-4 font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{o.buyerName}</td>
                      <td className="p-4 space-y-0.5 text-xs">
                        <span className={`block ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>{o.email}</span>
                        <span className={`block ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>{o.phone}</span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 max-w-[150px]">
                          {o.items.map((item, i) => (
                            <span key={i} className={`block truncate text-[11px] font-bold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                              {item.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={`p-4 font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
                        Rp {o.totalPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        {o.receipt ? (
                          <button
                            onClick={() => setZoomReceiptUrl(o.receipt)}
                            className={`font-bold px-3 py-1.5 rounded text-[10px] flex items-center gap-1 transition-all border ${
                              isDark 
                                ? "bg-[#2e2922] border-[#f0bf5c]/20 hover:bg-[#f0bf5c]/10 text-[#f0bf5c]" 
                                : "bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-700"
                            }`}
                          >
                            <Eye size={12} />
                            <span>Lihat Foto</span>
                          </button>
                        ) : (
                          <span className="text-red-500 italic text-[11px]">Belum diupload</span>
                        )}
                      </td>
                      <td className="p-4">
                        {/* Status Verification dropdown trigger */}
                        <div className="flex flex-col gap-1">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className={`text-[11px] font-bold rounded p-1.5 outline-none cursor-pointer border ${
                              isDark 
                                ? "bg-[#1f1b14] border-[#4e4637]/30 text-white" 
                                : "bg-white border-stone-300 text-stone-800"
                            } ${
                              o.status === "Dibayar"
                                ? "text-emerald-500"
                                : o.status === "Gagal"
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          >
                            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                            <option value="Dibayar">Dibayar (Lunas)</option>
                            <option value="Gagal">Gagal / Ditolak</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4">
                        {o.status === "Dibayar" ? (
                          editingShippingOrderId === o.id ? (
                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                              <input
                                type="text"
                                placeholder="Kurir (contoh: JNE, J&T)"
                                value={shippingCourier}
                                onChange={(e) => setShippingCourier(e.target.value)}
                                className={`rounded p-1 text-[10px] outline-none border ${
                                  isDark 
                                    ? "bg-[#110e08] border-[#4e4637]/50 text-white focus:border-[#f0bf5c]" 
                                    : "bg-white border-stone-300 text-stone-900 focus:border-[#c89b3c]"
                                }`}
                              />
                              <input
                                type="text"
                                placeholder="No. Resi Pengiriman"
                                value={shippingReceipt}
                                onChange={(e) => setShippingReceipt(e.target.value)}
                                className={`rounded p-1 text-[10px] outline-none border ${
                                  isDark 
                                    ? "bg-[#110e08] border-[#4e4637]/50 text-white focus:border-[#f0bf5c]" 
                                    : "bg-white border-stone-300 text-stone-900 focus:border-[#c89b3c]"
                                }`}
                              />
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => {
                                    setEditingShippingOrderId(null);
                                    setShippingCourier("");
                                    setShippingReceipt("");
                                  }}
                                  className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                                    isDark ? "border-stone-700 text-stone-300 hover:bg-stone-800" : "border-stone-300 text-stone-600 hover:bg-stone-50"
                                  }`}
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => handleSaveShipping(o.id)}
                                  disabled={shippingLoading}
                                  className="px-1.5 py-0.5 rounded bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold uppercase flex items-center gap-0.5 cursor-pointer"
                                >
                                  {shippingLoading ? (
                                    <Loader2 size={10} className="animate-spin" />
                                  ) : (
                                    <Check size={10} />
                                  )}
                                  <span>Simpan</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {o.shippingReceipt ? (
                                <>
                                  <span className={`font-semibold block text-[10px] ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                    {o.courier || "Kurir"}: <code className="font-mono">{o.shippingReceipt}</code>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingShippingOrderId(o.id);
                                      setShippingCourier(o.courier || "");
                                      setShippingReceipt(o.shippingReceipt || "");
                                    }}
                                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 border self-start cursor-pointer ${
                                      isDark 
                                        ? "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700" 
                                        : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
                                    }`}
                                  >
                                    <Edit2 size={10} />
                                    <span>Ubah Resi</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingShippingOrderId(o.id);
                                    setShippingCourier("");
                                    setShippingReceipt("");
                                  }}
                                  className={`px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer border self-start ${
                                    isDark 
                                      ? "bg-[#f0bf5c]/10 border-[#f0bf5c]/30 text-[#f0bf5c] hover:bg-[#f0bf5c]/20" 
                                      : "bg-[#c89b3c]/5 border-[#c89b3c]/20 text-[#c89b3c] hover:bg-[#c89b3c]/10"
                                  }`}
                                >
                                  <Truck size={10} />
                                  <span>Input Resi</span>
                                </button>
                              )}
                            </div>
                          )
                        ) : (
                          <span className={`italic text-[10px] ${isDark ? "text-stone-500" : "text-stone-400"}`}>
                            Menunggu pelunasan
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Messages Inbox */}
      {activeTab === "messages" && (
        <div className={`rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300 border ${
          isDark ? "glass-panel border-[#f0bf5c]/10" : "bg-white border-stone-200"
        }`}>
          <div className={`p-6 border-b ${
            isDark ? "border-[#f0bf5c]/10 bg-[#1f1b14]/50" : "border-stone-200 bg-stone-50"
          }`}>
            <h2 className={`font-display text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Inbox Pesan Masuk (Inquiries)</h2>
          </div>

          {messages.length === 0 ? (
            <div className={`py-20 text-center text-xs ${isDark ? "text-[#d2c5b1]/60" : "text-stone-400"}`}>
              Belum ada pesan masuk mengenai lukisan atau pameran.
            </div>
          ) : (
            <div className={`divide-y ${isDark ? "divide-[#f0bf5c]/10" : "divide-stone-150"}`}>
              {messages.map((m) => (
                <div key={m.id} className={`p-6 transition-colors text-xs space-y-3 ${
                  isDark ? "hover:bg-[#ebe1d6]/5" : "hover:bg-stone-50"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-stone-900"}`}>
                        <span>{m.name}</span>
                        {m.artworkTitle && (
                          <span className={`text-[10px] border px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                            isDark 
                              ? "text-[#f0bf5c] bg-[#f0bf5c]/5 border-[#f0bf5c]/20" 
                              : "text-[#c89b3c] bg-[#c89b3c]/5 border-[#c89b3c]/20"
                          }`}>
                            Inquiry: {m.artworkTitle}
                          </span>
                        )}
                      </h4>
                      <p className={`mt-1 ${isDark ? "text-[#9b8f7d]" : "text-stone-500"}`}>
                        Email: <span className={isDark ? "text-white font-semibold" : "text-stone-800 font-semibold"}>{m.email}</span> | Telp: <span className={isDark ? "text-white font-semibold" : "text-stone-800 font-semibold"}>{m.phone}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={isDark ? "text-[#9b8f7d]" : "text-stone-400"}>
                        {new Date(m.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Reply button */}
                      {replyingMessageId !== m.id && (
                        <button
                          onClick={() => {
                            setReplyingMessageId(m.id);
                            setReplyText(m.replyText || "");
                          }}
                          className={`px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer border ${
                            m.replyText
                              ? isDark 
                                ? "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700" 
                                : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
                              : isDark 
                                ? "bg-[#f0bf5c]/10 border-[#f0bf5c]/30 text-[#f0bf5c] hover:bg-[#f0bf5c]/20" 
                                : "bg-[#c89b3c]/5 border-[#c89b3c]/20 text-[#c89b3c] hover:bg-[#c89b3c]/10"
                          }`}
                        >
                          {m.replyText ? <Edit2 size={10} /> : <MessageSquare size={10} />}
                          <span>{m.replyText ? "Edit Balasan" : "Balas"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingMessage(m)}
                        className={`p-1.5 rounded transition-colors cursor-pointer border ${
                          isDark 
                            ? "border-red-500/10 text-red-400 hover:bg-red-500/10" 
                            : "border-red-200 text-red-500 hover:bg-red-50"
                        }`}
                        title="Hapus Pesan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={`p-4 border rounded-lg leading-relaxed font-sans ${
                    isDark 
                      ? "bg-[#110e08]/60 border-[#4e4637]/30 text-white" 
                      : "bg-stone-50 border-stone-200 text-stone-800"
                  }`}>
                    {m.text}
                  </div>

                  {/* Render Existing Reply if present */}
                  {m.replyText && replyingMessageId !== m.id && (
                    <div className={`p-4 border rounded-lg leading-relaxed font-sans ml-4 border-l-4 ${
                      isDark 
                        ? "bg-green-950/10 border-green-500/30 text-green-200/90 border-l-green-500" 
                        : "bg-green-50/50 border-green-200 text-green-800 border-l-[#c89b3c]"
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-green-600">
                        <CheckCircle size={12} className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} />
                        <span className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}>Tanggapan Penjual</span>
                        {m.repliedAt && (
                          <span className={`font-normal normal-case ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                            ({new Date(m.repliedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })})
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{m.replyText}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingMessageId === m.id && (
                    <div className={`p-4 border rounded-lg ml-4 space-y-3 ${
                      isDark 
                        ? "bg-[#1f1b14] border-[#4e4637]/30" 
                        : "bg-stone-50 border-stone-200"
                    }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                        Tulis Tanggapan Balasan:
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Ketik balasan Anda di sini... (Pelanggan akan melihat tanggapan Anda ketika melacak via email)"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className={`w-full rounded-lg p-3 text-xs outline-none transition-all resize-none border ${
                          isDark 
                            ? "bg-[#110e08] border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                            : "bg-white border border-stone-300 text-stone-950 focus:border-[#c89b3c]"
                        }`}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setReplyingMessageId(null);
                            setReplyText("");
                          }}
                          className={`px-3 py-1.5 rounded font-bold text-[10px] uppercase tracking-wider border transition-all cursor-pointer ${
                            isDark 
                              ? "border-stone-700 text-stone-300 hover:bg-stone-800" 
                              : "border-stone-300 text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleSendReply(m.id)}
                          disabled={replyLoading || !replyText.trim()}
                          className={`px-3 py-1.5 rounded font-bold text-[10px] uppercase tracking-wider text-white transition-all cursor-pointer flex items-center gap-1.5 ${
                            replyLoading || !replyText.trim()
                              ? "bg-stone-600/50 cursor-not-allowed text-stone-400"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {replyLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          <span>{replyLoading ? "Mengirim..." : "Simpan Balasan"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Settings */}
      {activeTab === "settings" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className={`p-6 rounded-xl border shadow-md ${
            isDark ? "glass-panel" : "bg-white border border-stone-200"
          }`}>
            <h2 className={`font-display text-lg font-bold mb-1 flex items-center gap-2 ${
              isDark ? "text-white" : "text-stone-900"
            }`}>
              ⚙️ Pengaturan Rekening & QRIS Pembayaran
            </h2>
            <p className={`text-xs mb-6 ${isDark ? "text-[#d2c5b1]/70" : "text-stone-500"}`}>
              Ubah no rekening bank dan upload QRIS pembayaran resmi yang akan ditampilkan pada halaman transaksi pembelian karya seni pelanggan.
            </p>

            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              {settingsSuccess && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>Pengaturan pembayaran berhasil disimpan dan diperbarui!</span>
                </div>
              )}

              {settingsError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{settingsError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank 1 Settings */}
                <div className={`p-4 rounded-lg border space-y-4 ${
                  isDark ? "bg-[#110e08] border-[#4e4637]/30" : "bg-stone-50 border-stone-200"
                }`}>
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                    Rekening Bank Utama (Pilihan 1)
                  </h3>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                      Pilih Bank Utama *
                    </label>
                    <select
                      value={INDONESIAN_BANKS.includes(bank1Name) ? bank1Name : "Lainnya"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "Lainnya") {
                          setBank1Name(val);
                        } else {
                          setBank1Name("");
                        }
                      }}
                      className={`w-full rounded-lg p-3 text-xs outline-none transition-all cursor-pointer ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                          : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                      }`}
                    >
                      {INDONESIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="Lainnya">Lainnya (Ketik Manual...)</option>
                    </select>
                  </div>

                  {(!INDONESIAN_BANKS.includes(bank1Name)) && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                        Tulis Nama Bank Utama Baru *
                      </label>
                      <input
                        type="text"
                        required
                        value={bank1Name}
                        onChange={(e) => setBank1Name(e.target.value)}
                        placeholder="Contoh: Bank Ganesha"
                        className={`w-full rounded-lg p-3 text-xs outline-none transition-all ${
                          isDark 
                            ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                            : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                        }`}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                      Nomor Rekening Bank Utama *
                    </label>
                    <input
                      type="text"
                      required
                      value={bank1Number}
                      onChange={(e) => setBank1Number(e.target.value)}
                      placeholder="Contoh: 123-456-7890"
                      className={`w-full rounded-lg p-3 text-xs outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                          : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                      Nama Pemilik Rekening Bank Utama *
                    </label>
                    <input
                      type="text"
                      required
                      value={bank1Owner}
                      onChange={(e) => setBank1Owner(e.target.value)}
                      placeholder="Contoh: Galeri Pratama"
                      className={`w-full rounded-lg p-3 text-xs outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                          : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                      }`}
                    />
                  </div>
                </div>

                {/* Bank 2 Settings */}
                <div className={`p-4 rounded-lg border space-y-4 ${
                  isDark ? "bg-[#110e08] border-[#4e4637]/30" : "bg-stone-50 border-stone-200"
                }`}>
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                    Rekening Bank Kedua (Pilihan 2)
                  </h3>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                      Pilih Bank Kedua *
                    </label>
                    <select
                      value={INDONESIAN_BANKS.includes(bank2Name) ? bank2Name : "Lainnya"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "Lainnya") {
                          setBank2Name(val);
                        } else {
                          setBank2Name("");
                        }
                      }}
                      className={`w-full rounded-lg p-3 text-xs outline-none transition-all cursor-pointer ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                          : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                      }`}
                    >
                      {INDONESIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="Lainnya">Lainnya (Ketik Manual...)</option>
                    </select>
                  </div>

                  {(!INDONESIAN_BANKS.includes(bank2Name)) && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                        Tulis Nama Bank Kedua Baru *
                      </label>
                      <input
                        type="text"
                        required
                        value={bank2Name}
                        onChange={(e) => setBank2Name(e.target.value)}
                        placeholder="Contoh: Bank BPD Bali"
                        className={`w-full rounded-lg p-3 text-xs outline-none transition-all ${
                          isDark 
                            ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                            : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                        }`}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                      Nomor Rekening Bank Kedua *
                    </label>
                    <input
                      type="text"
                      required
                      value={bank2Number}
                      onChange={(e) => setBank2Number(e.target.value)}
                      placeholder="Contoh: 987-654-3210"
                      className={`w-full rounded-lg p-3 text-xs outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                          : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                      Nama Pemilik Rekening Bank Kedua *
                    </label>
                    <input
                      type="text"
                      required
                      value={bank2Owner}
                      onChange={(e) => setBank2Owner(e.target.value)}
                      placeholder="Contoh: Galeri Pratama"
                      className={`w-full rounded-lg p-3 text-xs outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                          : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* QRIS Image Config */}
              <div className={`p-4 rounded-lg border space-y-4 ${
                isDark ? "bg-[#110e08] border-[#4e4637]/30" : "bg-stone-50 border-stone-200"
              }`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                  QRIS Pembayaran Resmi
                </h3>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {qrisImage ? (
                    <div className={`w-36 h-36 rounded-lg p-2 border flex-shrink-0 bg-white border-stone-300`}>
                      <img src={qrisImage} alt="QRIS Preview" className="w-full h-full object-contain rounded bg-white p-1" />
                    </div>
                  ) : (
                    <div className={`w-36 h-36 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-stone-400 text-center p-4 text-[10px]`}>
                      Belum ada QRIS
                    </div>
                  )}

                  <div className="flex-grow space-y-2 w-full">
                    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                      Unggah File QRIS Baru (Format Gambar)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => qrisInputRef.current?.click()}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isDark 
                            ? "bg-[#252017] border-[#4e4637]/50 text-white hover:bg-[#f0bf5c] hover:text-[#412d00]" 
                            : "bg-white border-stone-300 text-stone-800 hover:bg-stone-100"
                        }`}
                      >
                        Pilih Gambar QRIS
                      </button>
                      <input
                        type="file"
                        ref={qrisInputRef}
                        accept="image/*"
                        onChange={handleQrisUpload}
                        className="hidden"
                      />
                    </div>
                    <p className={`text-[10px] leading-relaxed italic ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                      * Disarankan gambar berformat persegi (ratio 1:1) dan berukuran kurang dari 5MB agar QRIS mudah dipindai oleh pembeli.
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Link/Number Config */}
              <div className={`p-4 rounded-lg border space-y-4 ${
                isDark ? "bg-[#110e08] border-[#4e4637]/30" : "bg-stone-50 border-stone-200"
              }`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                  <span>💬 Nomor / Link WhatsApp Penjual</span>
                </h3>

                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className={`w-full rounded-lg p-3 text-xs outline-none transition-all ${
                      isDark 
                        ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                        : "bg-white border border-stone-300 focus:border-[#c89b3c] text-stone-950"
                    }`}
                  />
                  <p className={`text-[10px] leading-relaxed italic ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                    * Masukkan nomor WhatsApp aktif Anda (contoh: 081234567890). Pembeli di Galeri Utama akan diarahkan ke chat WhatsApp ini untuk bertanya seputar karya seni atau melakukan konfirmasi pembayaran.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className={`px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                    savingSettings
                      ? "bg-stone-700 text-stone-400 cursor-not-allowed"
                      : isDark
                        ? "bg-[#f0bf5c] text-[#412d00] shadow-[#f0bf5c]/10 hover:brightness-110"
                        : "bg-[#c89b3c] text-white hover:bg-[#b08530]"
                  }`}
                >
                  {savingSettings ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  <span>{savingSettings ? "Menyimpan..." : "Simpan Semua Pengaturan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Zoom Modal Box */}
      {zoomReceiptUrl && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setZoomReceiptUrl(null)} />
          <div className={`relative z-10 max-w-2xl w-full rounded-xl p-4 border shadow-2xl animate-in zoom-in-95 duration-200 ${
            isDark ? "bg-[#17130c] border-[#f0bf5c]/30 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <button
              onClick={() => setZoomReceiptUrl(null)}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${
                isDark 
                  ? "bg-black/60 text-white border-white/10 hover:bg-black/80" 
                  : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
              }`}
            >
              <X size={14} />
            </button>
            <p className={`text-[10px] uppercase tracking-wider font-bold mb-3 ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>Foto Bukti Transfer Pembeli</p>
            <img src={zoomReceiptUrl} alt="Bukti Transfer Zoom" className="w-full h-[60vh] object-contain rounded bg-black" />
          </div>
        </div>
      )}

      {/* Custom Delete Artwork Confirmation Modal */}
      {deletingArt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setDeletingArt(null)} />
          
          <div className={`relative z-10 max-w-sm w-full rounded-xl p-6 border shadow-2xl animate-in zoom-in-95 duration-200 ${
            isDark ? "bg-[#17130c] border-red-500/30 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <h3 className="font-display text-lg font-bold text-red-500 flex items-center gap-2 mb-2">
              <Trash2 size={18} className="text-red-500" />
              <span>Hapus Karya Seni?</span>
            </h3>
            <p className={`text-xs leading-relaxed mb-6 ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>
              Apakah Anda yakin ingin menghapus karya seni <strong className={isDark ? "text-white" : "text-stone-900"}>"{deletingArt.title}"</strong> oleh {deletingArt.artist} secara permanen dari katalog galeri? Tindakan ini tidak dapat dibatalkan dan karya seni ini otomatis akan ikut terhapus dari galeri utama.
            </p>

            <div className="flex gap-3 justify-end text-xs">
              <button
                onClick={() => setDeletingArt(null)}
                className={`px-4 py-2 rounded-lg font-bold transition-all border cursor-pointer ${
                  isDark 
                    ? "border-stone-700 text-stone-300 hover:bg-stone-800" 
                    : "border-stone-300 text-stone-700 hover:bg-stone-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => executeDeleteArtwork(deletingArt.id)}
                className="px-4 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Message Confirmation Modal */}
      {deletingMessage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setDeletingMessage(null)} />
          
          <div className={`relative z-10 max-w-sm w-full rounded-xl p-6 border shadow-2xl animate-in zoom-in-95 duration-200 ${
            isDark ? "bg-[#17130c] border-red-500/30 text-white" : "bg-white border-stone-200 text-stone-900"
          }`}>
            <h3 className="font-display text-lg font-bold text-red-500 flex items-center gap-2 mb-2">
              <Trash2 size={18} className="text-red-500" />
              <span>Hapus Pesan Masuk?</span>
            </h3>
            <p className={`text-xs leading-relaxed mb-6 ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>
              Apakah Anda yakin ingin menghapus pesan masuk dari <strong className={isDark ? "text-white" : "text-stone-900"}>"{deletingMessage.name}"</strong> secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 justify-end text-xs">
              <button
                onClick={() => setDeletingMessage(null)}
                className={`px-4 py-2 rounded-lg font-bold transition-all border cursor-pointer ${
                  isDark 
                    ? "border-stone-700 text-stone-300 hover:bg-stone-800" 
                    : "border-stone-300 text-stone-700 hover:bg-stone-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => executeDeleteMessage(deletingMessage.id)}
                className="px-4 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
