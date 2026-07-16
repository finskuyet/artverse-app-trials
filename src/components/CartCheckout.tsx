import React, { useState, useEffect, useRef } from "react";
import { Trash2, MapPin, PersonStanding, Phone, Mail, FileText, CheckCircle, ChevronRight, Upload, Sparkles, AlertCircle, ShoppingCart, Wallet, User, CreditCard, ChevronDown, Download, ShieldCheck, ExternalLink } from "lucide-react";
import { Artwork, PaymentSettings } from "../types";

interface CartCheckoutProps {
  cart: Artwork[];
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setActiveView: (view: string) => void;
  setSearchContact: (contact: string) => void;
  theme?: "dark" | "light";
}

export default function CartCheckout({
  cart,
  removeFromCart,
  clearCart,
  setActiveView,
  setSearchContact,
  theme = "dark",
}: CartCheckoutProps) {
  // Checkout Form State
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank BCA (No. 123-456-7890)");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    bank1Name: "BCA",
    bank1Number: "123-456-7890",
    bank1Owner: "Galeri Pratama",
    bank2Name: "Mandiri",
    bank2Number: "987-654-3210",
    bank2Owner: "Galeri Pratama",
    qrisImage: "https://lh3.googleusercontent.com/aida/AP1WRLvtjN7SIYTNoGyPxtES-aFpY9Ogo35dMBFSz8oAngHSTYPhWB0LsgeQOdporsqBp_Y003JG8r5xqeqYZV2s-ysxV5OLZBretXLrSYwMZEst7UqtpnGHG-1oaW-MoP9l7XA45T1g4I0DRZQevTLCWnhEgla_n7_UYZl1WZZvZPMnmgYbt9H5afXjQeHFDlU_O0liKaVZ4Ge_tZOMU2Yzcu7O-__Xl-7trrjyccQU8OW3XrZaYCwQshs_FZDk"
  });

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPaymentSettings(data);
          const defaultBank = data.bank1Name || "BCA";
          const defaultNumber = data.bank1Number || "123-456-7890";
          setPaymentMethod(`Transfer Bank ${defaultBank} (No. ${defaultNumber})`);
        }
      })
      .catch((err) => console.error("Error fetching payment settings:", err));
  }, []);

  // Validate cart against current catalog automatically when opening cart
  useEffect(() => {
    if (cart.length > 0) {
      fetch("/api/artworks")
        .then(res => res.json())
        .then((data: Artwork[]) => {
          const availableIds = new Set(data.map(a => a.id));
          cart.forEach(item => {
            if (!availableIds.has(item.id)) {
              removeFromCart(item.id);
            }
          });
        })
        .catch(err => console.error("Error validating cart:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [receiptImage, setReceiptImage] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Drag over states
  const [isDragOver, setIsDragOver] = useState(false);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Math totals
  const subtotal = cart.reduce((acc, cur) => acc + cur.price, 0);
  const total = subtotal; // gratis ongkir

  // Convert uploaded image file to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal adalah 5MB");
      return;
    }

    setReceiptFileName(file.name);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg("Gagal membaca file gambar");
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Form submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Keranjang belanja Anda kosong.");
      return;
    }

    if (!buyerName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      setErrorMsg("Mohon lengkapi seluruh formulir bertanda bintang (*)");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          email,
          phone,
          address,
          city,
          postalCode,
          itemIds: cart.map((item) => item.id),
          paymentMethod,
          receiptImage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedOrderId(data.id);
        setShowSuccessModal(true);
        // Clear global cart state
        clearCart();
      } else {
        setErrorMsg(data.error || "Gagal memproses checkout.");
      }
    } catch (err) {
      console.error("Checkout error", err);
      setErrorMsg("Kesalahan jaringan, gagal menghubungi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <main className={`pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen transition-colors duration-300 ${
      isDark ? "" : "text-stone-900"
    }`}>
      {/* Header */}
      <div className="text-center mb-16">
        <p className={`text-xs font-bold tracking-[0.3em] uppercase mb-4 ${
          isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
        }`}>
          PROSES TRANSAKSI
        </p>
        <h1 className={`font-display text-4xl md:text-5xl font-bold mb-4 ${
          isDark ? "text-white" : "text-stone-900"
        }`}>
          Keranjang &amp; Formulir Checkout
        </h1>
        <p className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed ${
          isDark ? "text-[#d2c5b1]/80" : "text-stone-600"
        }`}>
          Tinjau kembali karya seni pilihan Anda, lengkapi alamat pengiriman, dan selesaikan
          transfer bank dengan aman.
        </p>
      </div>

      {cart.length === 0 && !showSuccessModal ? (
        <div className={`p-16 text-center max-w-2xl mx-auto rounded-xl space-y-6 ${
          isDark 
            ? "glass-panel" 
            : "bg-white border border-stone-200 shadow-[0_15px_35px_rgba(139,120,90,0.06)]"
        }`}>
          <ShoppingCart size={64} className={`mx-auto ${
            isDark ? "text-[#f0bf5c]/20" : "text-[#c89b3c]/20"
          }`} />
          <h2 className={`font-display text-2xl font-semibold ${isDark ? "text-white" : "text-stone-900"}`}>Keranjang Kosong</h2>
          <p className={`text-sm leading-relaxed max-w-md mx-auto ${isDark ? "text-[#d2c5b1]/80" : "text-stone-500"}`}>
            Anda belum menambahkan karya seni apa pun ke dalam keranjang. Kunjungi galeri seni kami
            untuk menelusuri mahakarya pelukis nusantara.
          </p>
          <button
            onClick={() => setActiveView("gallery")}
            className={`font-bold px-8 py-3 rounded-lg hover:brightness-110 transition-all cursor-pointer ${
              isDark ? "bg-[#f0bf5c] text-[#412d00]" : "bg-[#c89b3c] text-white"
            }`}
          >
            Jelajahi Galeri Seni
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Summary list & Instructions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Selected artworks card */}
            <section className={`rounded-xl p-6 shadow-xl relative overflow-hidden transition-all ${
              isDark 
                ? "glass-panel" 
                : "bg-white border border-stone-200 shadow-[0_15px_35px_rgba(139,120,90,0.05)]"
            }`}>
              <div className={`flex justify-between items-center mb-6 border-b pb-4 ${
                isDark ? "border-[#f0bf5c]/10" : "border-stone-100"
              }`}>
                <h2 className={`font-display text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Karya Seni Dipilih</h2>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-[#d2c5b1]/70" : "text-stone-400"}`}>
                  {cart.length} Karya
                </span>
              </div>

              {/* Items loop list */}
              <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-1 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 items-center p-3 rounded-lg border relative transition-all ${
                      isDark 
                        ? "bg-[#1f1b14]/40 border-[#f0bf5c]/5 hover:border-[#f0bf5c]/25" 
                        : "bg-stone-50 border-stone-200/60 hover:border-stone-300 text-stone-950"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded overflow-hidden flex-shrink-0 border ${
                      isDark ? "bg-[#231f18] border-[#f0bf5c]/10" : "bg-white border-stone-200"
                    }`}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${
                        isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                      }`}>
                        {item.category}
                      </p>
                      <h3 className={`font-display text-sm font-bold truncate ${
                        isDark ? "text-[#ebe1d6]" : "text-stone-900"
                      }`}>
                        {item.title}
                      </h3>
                      <p className={`text-[10px] truncate mb-1 ${
                        isDark ? "text-[#d2c5b1]/60" : "text-stone-500"
                      }`}>
                        Oleh {item.artist}
                      </p>
                      <p className={`font-bold text-xs ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className={`transition-colors cursor-pointer self-start p-1 ${
                        isDark ? "text-[#9b8f7d] hover:text-red-400" : "text-stone-400 hover:text-red-500"
                      }`}
                      title="Hapus dari keranjang"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className={`space-y-3 mb-6 pt-4 border-t text-sm ${
                isDark ? "border-[#f0bf5c]/10" : "border-stone-100"
              }`}>
                <div className="flex justify-between text-xs">
                  <span className={isDark ? "text-[#d2c5b1]/70" : "text-stone-500"}>Total Karya Seni</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-stone-900"}`}>
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isDark ? "text-[#d2c5b1]/70" : "text-stone-500"}>Biaya Pengiriman</span>
                  <span className="text-[#10b981] font-bold">Gratis (Asuransi Penuh)</span>
                </div>
              </div>

              <div className={`flex justify-between items-center pt-4 border-t ${
                isDark ? "border-[#f0bf5c]/20" : "border-stone-200"
              }`}>
                <span className={`font-bold text-xs uppercase tracking-wider ${isDark ? "text-[#d2c5b1]" : "text-stone-500"}`}>
                  TOTAL PEMBAYARAN
                </span>
                <span className={`text-xl font-display font-bold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </section>

            {/* Rekening Pembayaran Info Card */}
            <section className={`rounded-xl p-6 border-l-4 shadow-lg ${
              isDark 
                ? "glass-panel border-[#f0bf5c]" 
                : "bg-white border-[#c89b3c] border-y border-r border-stone-200 shadow-[0_10px_30px_rgba(139,120,90,0.04)]"
            }`}>
              <div className={`flex items-center gap-2.5 mb-4 ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                <Wallet size={18} />
                <h2 className="font-bold text-sm uppercase tracking-wider">
                  Instruksi Rekening Pembayaran
                </h2>
              </div>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>
                Silakan lakukan pembayaran transfer sejumlah nilai total ke salah satu rekening resmi
                Galeri Pratama di bawah ini:
              </p>

              <div className="space-y-3">
                <div className={`p-4 rounded-lg flex justify-between items-center border ${
                  isDark 
                    ? "bg-[#1f1b14] border-[#4e4637]/20" 
                    : "bg-stone-50 border-stone-200"
                }`}>
                  <div>
                    <p className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                      Bank {paymentSettings.bank1Name || "BCA"}
                    </p>
                    <p className={`font-bold text-sm ${isDark ? "text-white" : "text-stone-900"}`}>{paymentSettings.bank1Number}</p>
                  </div>
                  <p className={`text-[10px] italic ${isDark ? "text-[#d2c5b1]/70" : "text-stone-500"}`}>a.n {paymentSettings.bank1Owner}</p>
                </div>

                <div className={`p-4 rounded-lg flex justify-between items-center border ${
                  isDark 
                    ? "bg-[#1f1b14] border-[#4e4637]/20" 
                    : "bg-stone-50 border-stone-200"
                }`}>
                  <div>
                    <p className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                      Bank {paymentSettings.bank2Name || "Mandiri"}
                    </p>
                    <p className={`font-bold text-sm ${isDark ? "text-white" : "text-stone-900"}`}>{paymentSettings.bank2Number}</p>
                  </div>
                  <p className={`text-[10px] italic ${isDark ? "text-[#d2c5b1]/70" : "text-stone-500"}`}>a.n {paymentSettings.bank2Owner}</p>
                </div>
              </div>

              <p className={`mt-6 text-[10px] leading-relaxed italic font-sans ${
                isDark ? "text-[#f0bf5c]/70" : "text-[#c89b3c]/80"
              }`}>
                * Harap upload foto bukti transfer bank (struk / m-banking screenshot) Anda pada
                form di samping sebagai konfirmasi pembayaran instan.
              </p>
            </section>
          </div>

          {/* RIGHT COLUMN: Shipping Details & Payment Upload Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleCheckoutSubmit} className={`rounded-xl p-8 space-y-10 shadow-2xl ${
              isDark 
                ? "glass-panel" 
                : "bg-white border border-stone-200 shadow-[0_15px_40px_rgba(139,120,90,0.06)]"
            }`}>
              {/* Error messages if any */}
              {errorMsg && (
                <div className={`p-4 rounded-lg flex items-center gap-3 border text-xs ${
                  isDark 
                    ? "bg-red-950/40 text-red-400 border-red-500/30" 
                    : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Shipping Details */}
              <section className="space-y-6">
                <div className={`flex items-center gap-3 border-b pb-4 ${
                  isDark ? "border-[#f0bf5c]/10" : "border-stone-100"
                }`}>
                  <MapPin className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} size={20} />
                  <h2 className={`font-display text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
                    Formulir Pengiriman (Shipping Details)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Buyer Name */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>
                      <User size={14} className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} />
                      <span>Nama Lengkap Pembeli *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c] placeholder:text-[#9b8f7d]/60" 
                          : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                      }`}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>
                      <Phone size={14} className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} />
                      <span>Nomor Telepon / WhatsApp *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c] placeholder:text-[#9b8f7d]/60" 
                          : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2 space-y-2">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>
                      <Mail size={14} className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} />
                      <span>Email Aktif (Untuk Lacak Pesanan) *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Contoh: budi.santoso@example.com"
                      className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c] placeholder:text-[#9b8f7d]/60" 
                          : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                      }`}
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 space-y-2">
                    <label className={`text-xs font-bold ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>
                      Alamat Lengkap Pengiriman *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kabupaten..."
                      className={`w-full rounded-lg p-3 text-sm outline-none transition-all resize-none ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c] placeholder:text-[#9b8f7d]/60" 
                          : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                      }`}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>Kota *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Contoh: Jakarta Pusat"
                      className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c] placeholder:text-[#9b8f7d]/60" 
                          : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                      }`}
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>Kode Pos *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Contoh: 10110"
                      className={`w-full rounded-lg p-3 text-sm outline-none transition-all ${
                        isDark 
                          ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c] placeholder:text-[#9b8f7d]/60" 
                          : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                      }`}
                    />
                  </div>
                </div>
              </section>

               {/* Section 2: Payment Method */}
              <section className="space-y-6">
                <div className={`flex items-center gap-3 border-b pb-4 ${
                  isDark ? "border-[#f0bf5c]/10" : "border-stone-100"
                }`}>
                  <CreditCard className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} size={20} />
                  <h2 className={`font-display text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
                    Metode Pembayaran &amp; Unggah Bukti *
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  {/* Select account */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>
                      Rekening Tujuan Transfer *
                    </label>
                    <div className="relative">
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`appearance-none w-full rounded-lg p-3 pr-10 text-xs font-semibold cursor-pointer outline-none transition-all ${
                          isDark 
                            ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c]" 
                            : "bg-stone-50 border border-stone-300 text-stone-800 focus:border-[#c89b3c]"
                        }`}
                      >
                        <option value={`Transfer Bank ${paymentSettings.bank1Name || "BCA"} (No. ${paymentSettings.bank1Number})`}>
                          Transfer Bank {paymentSettings.bank1Name || "BCA"} (No. {paymentSettings.bank1Number})
                        </option>
                        <option value={`Transfer Bank ${paymentSettings.bank2Name || "Mandiri"} (No. ${paymentSettings.bank2Number})`}>
                          Transfer Bank {paymentSettings.bank2Name || "Mandiri"} (No. {paymentSettings.bank2Number})
                        </option>
                        <option value="qris">QRIS (Pembayaran Instan)</option>
                      </select>
                      <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                      }`} size={14} />
                    </div>
                  </div>

                  {/* File receipt upload */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold block ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>
                      Pilih File Bukti Pembayaran *
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-4 py-2.5 rounded text-xs font-bold transition-colors cursor-pointer select-none border ${
                          isDark 
                            ? "bg-[#2e2922] border-[#4e4637]/50 hover:bg-[#39342c] text-[#ebe1d6]" 
                            : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        Choose File
                      </button>
                      <span className={`text-xs italic truncate max-w-[150px] ${isDark ? "text-[#d2c5b1]/80" : "text-stone-500"}`}>
                        {receiptFileName || "No file chosen"}
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* QRIS section (Visual only but matching Screen 1 perfectly) */}
                <div className={`rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 group transition-all duration-300 border ${
                  isDark 
                    ? "bg-[#1f1b14] border-[#f0bf5c]/20 hover:border-[#f0bf5c]/40" 
                    : "bg-stone-50 border-stone-200 hover:border-stone-300 shadow-sm"
                }`}>
                  <div className="relative flex-shrink-0">
                    <div className={`w-40 h-40 rounded-lg p-2 border shadow-lg hover:scale-105 transition-transform duration-300 ${
                      isDark ? "bg-[#39342c] border-[#f0bf5c]/30 shadow-[#f0bf5c]/5" : "bg-white border-stone-200"
                    }`}>
                      <img
                        src={paymentSettings.qrisImage}
                        alt="QRIS Code"
                        className="w-full h-full object-contain rounded bg-white p-1"
                      />
                    </div>
                  </div>
                  <div className="flex-grow space-y-3 text-center md:text-left">
                    <h3 className={`font-display text-base font-bold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                      QRIS Pembayaran Instan
                    </h3>
                    <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>
                      Scan kode QR di samping menggunakan aplikasi perbankan atau e-wallet Anda
                      (Gopay, OVO, Dana, ShopeePay, dll) untuk pembayaran instan dan otomatis.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <a
                        href={paymentSettings.qrisImage}
                        download="ArtVerse-QRIS-Payment.png"
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                          isDark 
                            ? "bg-[#2e2922] border-[#4e4637]/50 text-white hover:bg-[#f0bf5c] hover:text-[#412d00]" 
                            : "bg-white border-stone-300 text-stone-700 hover:bg-[#c89b3c] hover:text-white"
                        }`}
                      >
                        <Download size={12} />
                        <span>Unduh QRIS</span>
                      </a>
                      <div className={`flex items-center gap-1 border px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                        isDark 
                          ? "bg-[#f0bf5c]/5 border-[#f0bf5c]/20 text-[#f0bf5c]" 
                          : "bg-[#c89b3c]/5 border-[#c89b3c]/20 text-[#c89b3c]"
                      }`}>
                        <ShieldCheck size={11} />
                        <span>Terverifikasi Aman</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drag and Dropzone box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`custom-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? isDark
                        ? "bg-[#f0bf5c]/10 border-[#f0bf5c]"
                        : "bg-[#c89b3c]/10 border-[#c89b3c]"
                      : isDark
                        ? "hover:bg-white/[0.01] border-[#f0bf5c]/20"
                        : "hover:bg-stone-50/50 border-stone-300"
                  }`}
                >
                  <Upload className="text-stone-400 mb-3" size={32} />
                  {receiptImage ? (
                    <div className="space-y-2">
                      <p className="text-xs text-green-500 font-bold flex items-center gap-1.5 justify-center">
                        <CheckCircle size={14} /> Bukti transfer berhasil dimuat!
                      </p>
                      <p className={`text-[10px] truncate max-w-xs mx-auto ${isDark ? "text-[#d2c5b1]/60" : "text-stone-500"}`}>
                        {receiptFileName}
                      </p>
                      <img
                        src={receiptImage}
                        alt="Pratinjau Kuitansi"
                        className={`h-16 w-auto object-contain mx-auto rounded border mt-1 ${
                          isDark ? "border-[#f0bf5c]/20" : "border-stone-300"
                        }`}
                      />
                    </div>
                  ) : (
                    <>
                      <p className={`text-xs font-bold mb-1 ${isDark ? "text-white" : "text-stone-800"}`}>
                        Tarik &amp; lepas file foto kuitansi pembayaran Anda di sini
                      </p>
                      <p className={`text-[9px] uppercase tracking-widest font-sans ${isDark ? "text-[#d2c5b1]/60" : "text-stone-400"}`}>
                        Mendukung JPEG, PNG hingga ukuran file maksimal 5MB
                      </p>
                    </>
                  )}
                </div>

                {/* Submit footer details */}
                <div className={`flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t ${
                  isDark ? "border-[#f0bf5c]/10" : "border-stone-200"
                }`}>
                  <p className={`text-[10px] max-w-sm leading-relaxed text-center md:text-left font-sans ${
                    isDark ? "text-[#d2c5b1]/60" : "text-stone-500"
                  }`}>
                    Dengan mengklik tombol checkout, Anda menyatakan data alamat di atas adalah
                    benar dan transfer senilai nominal di atas telah diselesaikan sepenuhnya.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`font-bold px-8 py-4 rounded-lg flex items-center gap-2 active:scale-95 transition-all w-full md:w-auto justify-center shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark 
                        ? "bg-[#f0bf5c] text-[#412d00] hover:brightness-110 shadow-[#f0bf5c]/20" 
                        : "bg-[#c89b3c] text-white hover:bg-[#b08530] shadow-[0_4px_12px_rgba(200,155,60,0.2)]"
                    }`}
                  >
                    <span>
                      {isSubmitting ? "Memproses Checkout..." : "Selesaikan Checkout"}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal exactly matching SCREEN_5 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className={`relative z-10 max-w-md w-full p-8 md:p-10 rounded-xl text-center shadow-2xl animate-in zoom-in-95 duration-200 ${
            isDark 
              ? "glass-panel border-[#f0bf5c]/20 ambient-glow" 
              : "bg-white border border-stone-200 text-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border ${
              isDark ? "bg-[#f0bf5c]/10 border-[#f0bf5c]/30" : "bg-[#c89b3c]/10 border-[#c89b3c]/30"
            }`}>
              <CheckCircle size={40} className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} />
            </div>

            <h2 className={`font-display text-2xl md:text-3xl font-bold mb-2 leading-snug ${isDark ? "text-white" : "text-stone-900"}`}>
              Pembayaran Berhasil Diproses
            </h2>
            <p className={`font-semibold text-xs uppercase tracking-wider mb-4 font-sans ${
              isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
            }`}>
              Terima Kasih, Pembayaran Anda Sedang Diproses
            </p>
            <p className={`text-xs leading-relaxed mb-8 ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>
              Kami akan memverifikasi bukti transfer Anda segera. Status pesanan dapat dipantau di
              halaman Transaksi Saya menggunakan email aktif Anda:
              <span className={`block font-bold mt-1 select-all ${isDark ? "text-white" : "text-stone-950"}`}>{email}</span>
            </p>

            <button
              onClick={() => {
                setSearchContact(email);
                setActiveView("transactions");
                setShowSuccessModal(false);
              }}
              className={`block w-full font-bold py-4 rounded-lg hover:brightness-110 transition-all shadow-lg text-xs tracking-wider uppercase cursor-pointer ${
                isDark 
                  ? "bg-[#f0bf5c] text-[#412d00] shadow-[#f0bf5c]/20" 
                  : "bg-[#c89b3c] text-white shadow-[0_4px_12px_rgba(200,155,60,0.2)]"
              }`}
            >
              Lihat Status Pesanan Saya
            </button>

            <button
              onClick={() => setShowSuccessModal(false)}
              className={`mt-4 block w-full text-xs transition-colors font-semibold py-1 uppercase tracking-widest ${
                isDark ? "text-[#d2c5b1]/60 hover:text-[#f0bf5c]" : "text-stone-400 hover:text-[#c89b3c]"
              }`}
            >
              Kembali ke Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
