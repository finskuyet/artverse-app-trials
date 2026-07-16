import React, { useState, useEffect } from "react";
import { Search, Mail, FileText, CheckCircle2, Clock, AlertTriangle, AlertCircle, ShoppingBag, MapPin, Calendar, CreditCard, Loader2, SearchX, ExternalLink, ShieldAlert, Truck, Copy, Check, MessageSquare } from "lucide-react";
import { Order, Message } from "../types";

interface MyTransactionsProps {
  searchContact: string;
  setSearchContact: (contact: string) => void;
  theme?: "dark" | "light";
}

export default function MyTransactions({ searchContact, setSearchContact, theme = "dark" }: MyTransactionsProps) {
  const [emailInput, setEmailInput] = useState(searchContact || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!searchContact);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const handleCopyTracking = (orderId: string, receipt: string) => {
    navigator.clipboard.writeText(receipt);
    setCopiedOrderId(orderId);
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2000);
  };

  const fetchOrders = async (contactVal: string) => {
    if (!contactVal.trim()) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const [resOrders, resMessages] = await Promise.all([
        fetch(`/api/orders?contact=${encodeURIComponent(contactVal.trim())}`),
        fetch(`/api/messages?email=${encodeURIComponent(contactVal.trim())}`)
      ]);
      const dataOrders = await resOrders.json();
      const dataMessages = await resMessages.json();
      
      if (resOrders.ok && resMessages.ok) {
        setOrders(dataOrders);
        setMessages(dataMessages);
        setSearched(true);
      } else {
        setErrorMsg(dataOrders.error || dataMessages.error || "Gagal memuat data transaksi & pesan.");
      }
    } catch (err) {
      console.error("Error loading data", err);
      setErrorMsg("Gagal memuat data transaksi karena gangguan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchContact) {
      setEmailInput(searchContact);
      fetchOrders(searchContact);
    }
  }, [searchContact]);

  // Poll for status updates in real-time every 5 seconds if we have searched results
  useEffect(() => {
    let intervalId: any;
    if (searched && emailInput.trim()) {
      intervalId = setInterval(() => {
        // Silent update to avoid loading spinner flickering
        Promise.all([
          fetch(`/api/orders?contact=${encodeURIComponent(emailInput.trim())}`).then(res => res.json()),
          fetch(`/api/messages?email=${encodeURIComponent(emailInput.trim())}`).then(res => res.json())
        ])
          .then(([dataOrders, dataMessages]) => {
            setOrders(dataOrders);
            setMessages(dataMessages);
          })
          .catch((err) => console.error("Polling error", err));
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [searched, emailInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Mohon masukkan email aktif Anda untuk melacak.");
      return;
    }
    setSearchContact(emailInput);
    fetchOrders(emailInput);
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
          STATUS PEMBELIAN
        </p>
        <h1 className={`font-display text-4xl md:text-5xl font-bold mb-4 ${
          isDark ? "text-white" : "text-stone-900"
        }`}>
          Riwayat Transaksi &amp; Lacak Pesanan
        </h1>
        <p className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed ${
          isDark ? "text-[#d2c5b1]/80" : "text-stone-600"
        }`}>
          Masukkan alamat email aktif yang digunakan saat checkout untuk melihat status verifikasi pembayaran
          real-time serta detail pesanan karya seni rupa Anda.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="max-w-xl mx-auto mb-16">
        <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow-xl space-y-4 ${
          isDark 
            ? "glass-panel" 
            : "bg-white border border-stone-200 shadow-[0_15px_35px_rgba(139,120,90,0.05)]"
        }`}>
          <div className="space-y-2">
            <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-[#ebe1d6]" : "text-stone-700"}`}>
              <Mail size={14} className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} />
              <span>Email Pemesan Aktif</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Contoh: siti.a@gallery.com"
                className={`flex-1 rounded-lg p-3 text-sm outline-none transition-all ${
                  isDark 
                    ? "bg-[#1f1b14] border border-[#4e4637]/30 text-white focus:border-[#f0bf5c] placeholder:text-[#9b8f7d]/60" 
                    : "bg-stone-50 border border-stone-300 text-stone-950 focus:border-[#c89b3c] placeholder:text-stone-400"
                }`}
              />
              <button
                type="submit"
                disabled={loading}
                className={`font-bold px-6 rounded-lg text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all select-none cursor-pointer disabled:opacity-50 ${
                  isDark 
                    ? "bg-[#c89b3c] hover:bg-[#f0bf5c] text-[#412d00]" 
                    : "bg-[#c89b3c] text-white hover:bg-[#b08530]"
                }`}
              >
                <Search size={14} />
                <span>{loading ? "Mencari..." : "Lacak"}</span>
              </button>
            </div>
          </div>
          <div className={`text-[11px] leading-relaxed ${isDark ? "text-[#9b8f7d]" : "text-stone-500"}`}>
            <span className={`font-bold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>Kredensial Contoh: </span>
            <span>Gunakan email <code className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c] font-bold"}>siti.a@gallery.com</code> atau <code className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c] font-bold"}>budi.santoso@example.com</code> untuk melihat pesanan prapengisi.</span>
          </div>
        </form>
      </div>

      {/* Search results */}
      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 font-sans">
          <Loader2 className={`animate-spin text-4xl ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`} size={36} />
          <p className={`text-sm ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>Mencari riwayat pesanan Anda...</p>
        </div>
      ) : searched ? (
        <div className="max-w-4xl mx-auto space-y-8">
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

          {orders.length === 0 && messages.length === 0 ? (
            <div className={`py-20 text-center rounded-xl flex flex-col items-center justify-center gap-4 ${
              isDark 
                ? "glass-panel" 
                : "bg-white border border-stone-200 shadow-lg"
            }`}>
              <SearchX className={isDark ? "text-[#f0bf5c]/20" : "text-[#c89b3c]/20"} size={48} />
              <p className={`text-base font-sans ${isDark ? "text-[#d2c5b1]" : "text-stone-700"}`}>
                Tidak ada pesanan atau pesan ditemukan yang berasosiasi dengan email:
                <strong className={`block mt-1 select-all ${isDark ? "text-white" : "text-stone-950"}`}>{emailInput}</strong>
              </p>
              <p className={`text-xs ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                Pastikan pengetikan email Anda sama persis saat melakukan transaksi atau mengirim pesan.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.length > 0 && (
                <>
                  <div className={`flex items-center justify-between text-xs font-semibold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                    <span>DITEMUKAN {orders.length} TRANSAKSI</span>
                    <span className={`${isDark ? "text-[#9b8f7d]" : "text-stone-500"} animate-pulse`}>● Terkoneksi Real-time</span>
                  </div>

              {orders.map((order) => {
                const orderDate = new Date(order.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl overflow-hidden shadow-2xl border transition-all duration-300 ${
                      isDark 
                        ? "glass-panel border-[#f0bf5c]/10 hover:border-[#f0bf5c]/20" 
                        : "bg-white border-stone-200 shadow-[0_10px_35px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-stone-300"
                    }`}
                  >
                    {/* Card Header metadata */}
                    <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDark ? "bg-[#1f1b14] border-[#f0bf5c]/10" : "bg-stone-50 border-stone-200"
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold tracking-widest font-mono ${
                            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                          }`}>
                            {order.id}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-[#f0bf5c]/30" : "bg-stone-300"}`} />
                          <span className={`text-[11px] flex items-center gap-1 ${isDark ? "text-[#d2c5b1]/80" : "text-stone-500"}`}>
                            <Calendar size={12} />
                            <span>{orderDate}</span>
                          </span>
                        </div>
                        <p className={`text-xs font-sans ${isDark ? "text-[#d2c5b1]/60" : "text-stone-500"}`}>
                          Pemesan: <span className={`font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{order.buyerName}</span>
                        </p>
                      </div>

                      {/* Status pill tag */}
                      <div>
                        {order.status === "Dibayar" ? (
                          <div className={`px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                            isDark 
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}>
                            <CheckCircle2 size={14} />
                            <span>Pembayaran Lunas</span>
                          </div>
                        ) : order.status === "Gagal" ? (
                          <div className={`px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                            isDark 
                              ? "bg-red-950/80 text-red-400 border border-red-500/30" 
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            <AlertCircle size={14} />
                            <span>Gagal / Ditolak</span>
                          </div>
                        ) : (
                          <div className={`px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                            isDark 
                              ? "bg-[#5c4920]/80 text-[#f0bf5c] border border-[#f0bf5c]/30" 
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            <Clock size={14} className="animate-spin" />
                            <span>Menunggu Verifikasi</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content details */}
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Left: Items list */}
                      <div className="md:col-span-7 space-y-4">
                        <span className={`block text-[10px] uppercase tracking-wider font-bold ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                          Katalog Lukisan Terkait
                        </span>

                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex gap-4 p-3 rounded-lg border ${
                                isDark 
                                  ? "bg-[#110e08]/60 border-[#4e4637]/20" 
                                  : "bg-stone-50 border-stone-200"
                              }`}
                            >
                              <div className={`w-12 h-16 rounded overflow-hidden flex-shrink-0 border ${
                                isDark ? "bg-[#17130c] border-[#f0bf5c]/10" : "bg-white border-stone-200"
                              }`}>
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className={`font-display text-sm font-bold truncate ${isDark ? "text-[#ebe1d6]" : "text-stone-900"}`}>
                                  {item.title}
                                </h4>
                                <p className={`text-[10px] truncate mb-1 ${isDark ? "text-[#d2c5b1]/60" : "text-stone-500"}`}>
                                  Oleh {item.artist}
                                </p>
                                <p className={`font-bold text-xs ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                                  Rp {item.price.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Shipping Address & Summary info */}
                      <div className={`md:col-span-5 space-y-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 text-xs ${
                        isDark ? "border-[#f0bf5c]/10" : "border-stone-200"
                      }`}>
                        <div>
                          <span className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1 ${
                            isDark ? "text-[#9b8f7d]" : "text-stone-400"
                          }`}>
                            <MapPin size={11} />
                            <span>Alamat Pengiriman</span>
                          </span>
                          <p className={`leading-relaxed font-semibold ${isDark ? "text-[#ebe1d6]" : "text-stone-950"}`}>
                            {order.address}
                          </p>
                          <p className={isDark ? "text-[#d2c5b1]/70" : "text-stone-500"}>
                            {order.city} - {order.postalCode}
                          </p>
                        </div>

                        <div>
                          <span className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1 ${
                            isDark ? "text-[#9b8f7d]" : "text-stone-400"
                          }`}>
                            <CreditCard size={11} />
                            <span>Metode Pembayaran</span>
                          </span>
                          <p className={`truncate font-semibold ${isDark ? "text-[#ebe1d6]" : "text-stone-950"}`}>
                            {order.paymentMethod}
                          </p>
                        </div>

                        {order.receipt && (
                          <div>
                            <span className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${
                              isDark ? "text-[#9b8f7d]" : "text-stone-400"
                            }`}>
                              Bukti Transfer Anda
                            </span>
                            <a
                              href={order.receipt}
                              target="_blank"
                              rel="noreferrer"
                              className={`font-bold text-[11px] flex items-center gap-1 mt-0.5 ${
                                isDark ? "text-[#f0bf5c] hover:underline" : "text-[#c89b3c] hover:underline"
                              }`}
                            >
                              <span>Lihat Bukti Foto</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}

                        {order.shippingReceipt && (
                          <div className={`p-3 rounded-lg border mt-2 ${
                            isDark 
                              ? "bg-emerald-950/20 border-emerald-500/20 text-[#ebe1d6]" 
                              : "bg-emerald-50/50 border-emerald-200 text-stone-900"
                          }`}>
                            <span className={`text-[10px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1 ${
                              isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                            }`}>
                              <Truck size={12} className="animate-pulse" />
                              <span>Informasi Pengiriman</span>
                            </span>
                            <div className="space-y-1 text-xs">
                              <p className="font-semibold">
                                Kurir: <span className={isDark ? "text-white" : "text-stone-950"}>{order.courier || "Tidak ditentukan"}</span>
                              </p>
                              <div className="font-semibold flex items-center flex-wrap gap-1.5">
                                <span>No. Resi:</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded select-all text-[11px] ${
                                    isDark ? "bg-[#110e08] text-emerald-400 border border-emerald-950" : "bg-white border border-stone-200 text-emerald-600"
                                  }`}>
                                    {order.shippingReceipt}
                                  </span>
                                  <button
                                    onClick={() => handleCopyTracking(order.id, order.shippingReceipt || "")}
                                    className={`p-1 rounded cursor-pointer transition-colors border flex items-center justify-center ${
                                      copiedOrderId === order.id
                                        ? "bg-emerald-500/25 text-emerald-400 border-emerald-500/30"
                                        : isDark
                                          ? "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white"
                                          : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                                    }`}
                                    title="Salin No. Resi"
                                  >
                                    {copiedOrderId === order.id ? <Check size={11} /> : <Copy size={11} />}
                                  </button>
                                  {copiedOrderId === order.id && (
                                    <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 animate-pulse">
                                      Tersalin!
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className={`text-[10px] leading-tight ${isDark ? "text-[#9b8f7d]" : "text-stone-500"} pt-1`}>
                                Pesanan Anda telah diserahkan ke kurir. Silakan pantau status pengiriman menggunakan No. Resi di atas.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className={`pt-4 border-t flex justify-between items-center text-sm ${
                          isDark ? "border-[#f0bf5c]/10" : "border-stone-200"
                        }`}>
                          <span className={`font-bold text-[10px] uppercase tracking-wider ${isDark ? "text-[#9b8f7d]" : "text-stone-400"}`}>
                            Total Nilai
                          </span>
                          <span className={`font-display text-base font-bold ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                            Rp {order.totalPrice.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                </>
              )}

              {/* Messages & Replies Section */}
              {messages.length > 0 && (
                <>
                  <div className={`flex items-center justify-between text-xs font-semibold mt-12 pt-8 border-t ${isDark ? "text-[#f0bf5c] border-[#f0bf5c]/20" : "text-[#c89b3c] border-stone-200"}`}>
                    <span className="flex items-center gap-2">
                      <MessageSquare size={14} /> RIWAYAT PESAN & BALASAN ({messages.length})
                    </span>
                  </div>
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const msgDate = new Date(msg.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                      const repliedDate = msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString("id-ID", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : null;

                      return (
                        <div key={msg.id} className={`rounded-xl overflow-hidden shadow border transition-all ${
                          isDark 
                            ? "glass-panel border-[#f0bf5c]/10" 
                            : "bg-white border-stone-200 shadow-sm"
                        }`}>
                          <div className={`p-4 md:p-6 space-y-4 ${
                            msg.replyText 
                              ? isDark ? "border-l-4 border-l-[#f0bf5c]" : "border-l-4 border-l-[#c89b3c]"
                              : "border-l-4 border-l-transparent"
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className={`font-bold text-sm ${isDark ? "text-white" : "text-stone-900"}`}>
                                  Terkait: {msg.artworkTitle || "Pertanyaan Umum"}
                                </h5>
                                <span className={`text-[10px] ${isDark ? "text-[#9b8f7d]" : "text-stone-500"}`}>{msgDate}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                msg.replyText 
                                  ? isDark ? "bg-[#f0bf5c]/20 text-[#f0bf5c]" : "bg-[#c89b3c]/20 text-[#c89b3c]"
                                  : isDark ? "bg-stone-800 text-stone-400" : "bg-stone-100 text-stone-500"
                              }`}>
                                {msg.replyText ? "Dibalas" : "Menunggu Balasan"}
                              </span>
                            </div>
                            
                            <div className={`p-3 rounded-lg text-xs leading-relaxed ${isDark ? "bg-[#110e08] text-[#d2c5b1]" : "bg-stone-50 text-stone-700"}`}>
                              <span className="block font-bold text-[10px] mb-1 opacity-60">PESAN ANDA:</span>
                              {msg.text}
                            </div>
                            
                            {msg.replyText && (
                              <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                                isDark ? "bg-[#f0bf5c]/5 border-[#f0bf5c]/20 text-white" : "bg-amber-50/50 border-amber-200/60 text-stone-900"
                              }`}>
                                <span className="block font-bold text-[10px] mb-1 flex items-center gap-1">
                                  <Check size={10} className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"} />
                                  <span className={isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}>BALASAN PENJUAL (ARTVERSE) - {repliedDate}</span>
                                </span>
                                {msg.replyText}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={`p-16 text-center max-w-xl mx-auto rounded-xl space-y-4 ${
          isDark 
            ? "glass-panel" 
            : "bg-white border border-stone-200 shadow-xl"
        }`}>
          <ShieldAlert className={isDark ? "text-[#f0bf5c]/20 mx-auto" : "text-[#c89b3c]/20 mx-auto"} size={56} />
          <h2 className={`font-display text-xl font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Masukkan Alamat Email Lacak</h2>
          <p className={`text-xs leading-relaxed max-w-sm mx-auto font-sans ${isDark ? "text-[#d2c5b1]/80" : "text-stone-500"}`}>
            Untuk alasan keamanan, kami membatasi akses melihat riwayat transaksi. Harap isi email Anda di atas lalu klik Lacak.
          </p>
        </div>
      )}
    </main>
  );
}
