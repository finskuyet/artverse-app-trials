import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, ZoomIn, Eye, ShoppingCart, Info, MessageCircle, X, ChevronLeft, ChevronRight, Check, ChevronDown, Loader2 } from "lucide-react";
import { Artwork } from "../types";

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="inline-block">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.371a9.936 9.936 0 004.777 1.218h.005c5.505 0 9.987-4.478 9.988-9.984A9.998 9.998 0 0012.012 2zm5.787 14.153c-.247.695-1.442 1.341-1.996 1.4a5.617 5.617 0 01-2.585-.639c-2.316-1.026-3.805-3.372-3.92-3.526-.117-.154-.951-1.258-.951-2.4a2.535 2.535 0 01.765-1.848c.24-.247.523-.309.695-.309.172 0 .344.001.493.008.159.007.373-.06.584.444.215.512.735 1.785.798 1.916.064.13.107.284.021.454-.086.17-.129.274-.258.423-.129.149-.271.332-.387.447-.129.129-.264.27-.113.528.15.258.667 1.101 1.429 1.779.983.875 1.812 1.144 2.07 1.274.258.129.408.108.559-.064.151-.173.645-.752.817-1.008.172-.257.344-.215.58-.129.237.086 1.494.704 1.753.833.258.129.43.193.494.301.064.11.064.636-.183 1.331z" />
  </svg>
);

interface MainGalleryProps {
  addToCart: (artwork: Artwork) => void;
  cartItemIds: string[];
  theme?: "dark" | "light";
  isSeller?: boolean;
}

function formatWhatsAppNumber(num: string): string {
  if (!num) return "6281234567890";
  const cleaned = num.replace(/\D/g, "");
  if (!cleaned) return "6281234567890";
  if (cleaned.startsWith("0")) {
    return "62" + cleaned.substring(1);
  }
  if (cleaned.startsWith("62")) {
    return cleaned;
  }
  if (cleaned.startsWith("8")) {
    return "62" + cleaned;
  }
  return cleaned;
}

export default function MainGallery({ addToCart, cartItemIds, theme = "dark", isSeller = false }: MainGalleryProps) {
  const isDark = theme === "dark";
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("6281234567890");

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.whatsappNumber) {
          setWhatsappNumber(formatWhatsAppNumber(data.whatsappNumber));
        }
      })
      .catch((err) => console.error("Error loading payment settings for WhatsApp link:", err));
  }, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Kategori");
  const [priceFilter, setPriceFilter] = useState("Rentang Harga");
  const [yearFilter, setYearFilter] = useState("Tahun");
  const [statusFilter, setStatusFilter] = useState("Status");

  // Scroll tracking to hide filters on mobile and tablet when scrolling down
  const [showFilters, setShowFilters] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (window.innerWidth < 1024) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
          setShowFilters(false);
        } else {
          setShowFilters(true);
        }
      } else {
        setShowFilters(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Detail Modal State
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Inquire Message Form inside Modal
  const [showInquireForm, setShowInquireForm] = useState(false);
  const [inquireName, setInquireName] = useState("");
  const [inquireEmail, setInquireEmail] = useState("");
  const [inquirePhone, setInquirePhone] = useState("");
  const [inquireText, setInquireText] = useState("");
  const [inquireSuccess, setInquireSuccess] = useState(false);

  // Fetch Artworks from Server
  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/artworks");
      const data = await res.json();
      setArtworks(data);
      setFilteredArtworks(data);
    } catch (err) {
      console.error("Error fetching artworks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  // Filter apply logic
  const handleApplyFilters = () => {
    let temp = [...artworks];

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      temp = temp.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.artist.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.medium.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "Kategori") {
      temp = temp.filter((art) => art.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    // Year filter
    if (yearFilter !== "Tahun") {
      if (yearFilter === "Lama") {
        temp = temp.filter((art) => Number(art.year) < 2022);
      } else {
        temp = temp.filter((art) => art.year === yearFilter);
      }
    }

    // Status filter
    if (statusFilter !== "Status") {
      temp = temp.filter((art) => art.status === statusFilter);
    }

    // Price filter
    if (priceFilter !== "Rentang Harga") {
      if (priceFilter === "di bawah Rp 5jt") {
        temp = temp.filter((art) => art.price < 5000000);
      } else if (priceFilter === "Rp 5jt - 20jt") {
        temp = temp.filter((art) => art.price >= 5000000 && art.price <= 20000000);
      } else if (priceFilter === "Rp 20jt - 50jt") {
        temp = temp.filter((art) => art.price >= 20000000 && art.price <= 50000000);
      } else if (priceFilter === "di atas Rp 50jt") {
        temp = temp.filter((art) => art.price > 50000000);
      }
    }

    setFilteredArtworks(temp);
  };

  // Run automatically on query changes
  useEffect(() => {
    handleApplyFilters();
  }, [searchQuery, categoryFilter, priceFilter, yearFilter, statusFilter, artworks]);

  // Handle Zoom Hover on desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setZoomOrigin(`${xPercent}% ${yPercent}%`);
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomOrigin("center center");
  };

  // Handle Send Inquiry (Message)
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquireName.trim() || !inquireText.trim()) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquireName,
          email: inquireEmail,
          phone: inquirePhone,
          text: inquireText,
          artworkTitle: selectedArtwork?.title,
        }),
      });

      if (res.ok) {
        setInquireSuccess(true);
        setTimeout(() => {
          setInquireSuccess(false);
          setShowInquireForm(false);
          setInquireText("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error sending inquiry message", err);
    }
  };

  return (
    <div className={`pt-20 transition-colors duration-300 ${isDark ? "" : "bg-[#fbf9f6]"}`}>
      {/* Hero Section */}
      <header className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        {/* Subtle background overlay gradient */}
        <div className={`absolute inset-0 z-0 transition-colors duration-300 ${
          isDark 
            ? "bg-gradient-to-b from-black/40 via-[#17130c]/70 to-[#0d0d0d]" 
            : "bg-gradient-to-b from-stone-100/30 via-stone-200/40 to-[#fbf9f6]"
        }`} />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-sm"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80')`,
          }}
        />

        <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl">
          <p className={`text-xs font-bold tracking-[0.3em] uppercase mb-3 animate-pulse ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            ARTVERSE EXHIBITION
          </p>
          <h1 className={`font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            Galeri Utama
          </h1>
          <p className={`font-sans text-sm md:text-base max-w-2xl mx-auto leading-relaxed ${
            isDark ? "text-[#d2c5b1]/90" : "text-stone-600"
          }`}>
            Kurasi karya seni rupa eksklusif dari pelukis ternama di seluruh nusantara.
          </p>
        </div>
      </header>

      {/* Search and Filters panel */}
      <section className={`sticky top-20 z-40 px-6 md:px-12 mb-12 transition-all duration-300 ${
        showFilters 
          ? "translate-y-0 opacity-100 pointer-events-auto" 
          : "max-lg:-translate-y-28 max-lg:opacity-0 max-lg:pointer-events-none"
      }`}>
        <div className={`max-w-7xl mx-auto rounded-xl p-5 shadow-2xl transition-all ${
          isDark 
            ? "glass-panel ambient-glow" 
            : "bg-white border border-stone-200 shadow-[0_15px_35px_rgba(139,120,90,0.06)]"
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full lg:flex-1">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
              }`} size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lukisan, seniman, atau aliran..."
                className={`w-full rounded-lg py-3 pl-12 pr-4 outline-none transition-all text-sm ${
                  isDark 
                    ? "bg-[#1f1b14] border border-[#4e4637]/30 focus:border-[#f0bf5c] text-[#ebe1d6] placeholder:text-[#9b8f7d]" 
                    : "bg-stone-50 border border-stone-200 focus:border-[#c89b3c] text-stone-950 placeholder:text-stone-400"
                }`}
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Category */}
              <div className="relative flex-1 min-w-[120px] lg:flex-none">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`appearance-none w-full rounded-lg py-3 pl-4 pr-10 text-xs font-semibold cursor-pointer outline-none transition-all font-sans ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-[#ebe1d6] hover:border-[#f0bf5c]/50" 
                      : "bg-white border border-stone-200 text-stone-800 hover:border-[#c89b3c]/50"
                  }`}
                >
                  <option>Kategori</option>
                  <option>Realisme Klasik</option>
                  <option>Abstrak Modern</option>
                  <option>Impressionisme</option>
                  <option>Surealisme</option>
                  <option>Ink on Canvas</option>
                  <option>Ekspresionisme</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b8f7d] pointer-events-none" size={14} />
              </div>

              {/* Price Range */}
              <div className="relative flex-1 min-w-[130px] lg:flex-none">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className={`appearance-none w-full rounded-lg py-3 pl-4 pr-10 text-xs font-semibold cursor-pointer outline-none transition-all font-sans ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-[#ebe1d6] hover:border-[#f0bf5c]/50" 
                      : "bg-white border border-stone-200 text-stone-800 hover:border-[#c89b3c]/50"
                  }`}
                >
                  <option>Rentang Harga</option>
                  <option>di bawah Rp 5jt</option>
                  <option>Rp 5jt - 20jt</option>
                  <option>Rp 20jt - 50jt</option>
                  <option>di atas Rp 50jt</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b8f7d] pointer-events-none" size={14} />
              </div>

              {/* Year */}
              <div className="relative flex-1 min-w-[100px] lg:flex-none">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className={`appearance-none w-full rounded-lg py-3 pl-4 pr-10 text-xs font-semibold cursor-pointer outline-none transition-all font-sans ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-[#ebe1d6] hover:border-[#f0bf5c]/50" 
                      : "bg-white border border-stone-200 text-stone-800 hover:border-[#c89b3c]/50"
                  }`}
                >
                  <option>Tahun</option>
                  <option>2026</option>
                  <option>2025</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                  <option>Lama</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b8f7d] pointer-events-none" size={14} />
              </div>

              {/* Status */}
              <div className="relative flex-1 min-w-[110px] lg:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`appearance-none w-full rounded-lg py-3 pl-4 pr-10 text-xs font-semibold cursor-pointer outline-none transition-all font-sans ${
                    isDark 
                      ? "bg-[#1f1b14] border border-[#4e4637]/30 text-[#ebe1d6] hover:border-[#f0bf5c]/50" 
                      : "bg-white border border-stone-200 text-stone-800 hover:border-[#c89b3c]/50"
                  }`}
                >
                  <option>Status</option>
                  <option>Tersedia</option>
                  <option>Terjual</option>
                  <option>Hanya Pameran</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9b8f7d] pointer-events-none" size={14} />
              </div>

              <button
                onClick={handleApplyFilters}
                className={`px-5 py-3 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 flex-1 lg:flex-none justify-center ${
                  isDark ? "bg-[#f0bf5c] text-[#412d00] hover:brightness-110" : "bg-[#c89b3c] text-white hover:bg-[#b08530]"
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Artworks grid list */}
      <section className="px-6 md:px-20 max-w-7xl mx-auto pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-4xl text-[#f0bf5c]" size={36} />
            <p className="text-[#d2c5b1]/80 text-sm font-sans">Memuat koleksi galeri seni...</p>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="py-32 text-center glass-panel rounded-xl flex flex-col items-center justify-center gap-4">
            <Search className="text-stone-300 text-opacity-40" size={56} />
            <p className="text-[#d2c5b1] text-lg font-sans">
              Maaf, tidak ada karya yang sesuai dengan kriteria pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("Kategori");
                setPriceFilter("Rentang Harga");
                setYearFilter("Tahun");
                setStatusFilter("Status");
              }}
              className="text-[#f0bf5c] hover:underline font-bold text-sm"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.map((art, index) => {
              const inCart = cartItemIds.includes(art.id);
              return (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.16, 1, 0.3, 1],
                    delay: (index % 3) * 0.08
                  }}
                  className={`artwork-card group cursor-pointer relative rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                    isDark 
                      ? "glass-panel text-[#ebe1d6] hover:shadow-[0_20px_40px_rgba(240,191,92,0.15)]" 
                      : "bg-white border border-stone-200/80 text-stone-800 shadow-[0_6px_20px_rgba(139,120,90,0.03)] hover:shadow-[0_15px_35px_rgba(139,120,90,0.12)]"
                  }`}
                >
                  {/* Photo frame container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#110e08]">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />

                     {/* Premium / Status Tag Badge */}
                    {art.premium !== false && (
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#f0bf5c]">
                          stars
                        </span>
                        <span className="text-[#f0bf5c] font-sans text-[9px] font-extrabold uppercase tracking-widest">
                          Premium
                        </span>
                      </div>
                    )}

                     {art.status !== "Tersedia" && (
                      <div className="absolute top-4 left-4 bg-red-950/90 text-red-400 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1 z-20">
                        <span className="text-[9px] font-sans font-bold uppercase tracking-widest">
                          {art.status}
                        </span>
                      </div>
                    )}

                    {/* Glassy Hover Overlay with action buttons */}
                    <div className="absolute inset-0 bg-[#17130c]/75 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 gap-3">
                      <button
                        onClick={() => setSelectedArtwork(art)}
                        className={`w-full py-2.5 font-bold rounded-lg transition-all flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg ${
                          isDark ? "bg-[#f0bf5c] text-[#412d00] hover:bg-[#ffdea4]" : "bg-[#c89b3c] text-white hover:bg-[#b08530]"
                        }`}
                      >
                        <Eye size={16} />
                        <span>Detail Karya</span>
                      </button>

                      {art.status === "Tersedia" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(art);
                          }}
                          disabled={inCart}
                          className={`w-full py-2.5 border rounded-lg font-bold transition-all flex items-center justify-center gap-2 transform translate-y-8 group-hover:translate-y-0 duration-500 shadow-md ${
                            inCart
                              ? "bg-green-950/40 text-green-400 border-green-500/30"
                              : isDark
                                ? "border-[#f0bf5c] text-[#f0bf5c] hover:bg-[#f0bf5c]/10"
                                : "border-[#c89b3c] text-[#c89b3c] hover:bg-[#c89b3c]/5"
                          }`}
                        >
                          {inCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                          <span>{inCart ? "Di Keranjang" : "Tambah"}</span>
                        </button>
                      ) : (
                        <div className="text-xs text-stone-300/80 italic py-2">
                          Tidak dapat dibeli ({art.status})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata block */}
                  <div className={`p-5 flex flex-col flex-1 border-t transition-colors ${
                    isDark ? "border-[#f0bf5c]/5" : "border-stone-100"
                  }`}>
                    <span className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-1 block ${
                      isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                    }`}>
                      {art.category}
                    </span>
                    <h3 className={`font-display text-lg font-bold mb-1 transition-colors truncate ${
                      isDark ? "text-[#ebe1d6] group-hover:text-[#f0bf5c]" : "text-stone-900 group-hover:text-[#c89b3c]"
                    }`}>
                      {art.title}
                    </h3>
                    <p className={`text-xs italic mb-4 ${
                      isDark ? "text-[#d2c5b1]/70" : "text-stone-500"
                    }`}>
                      {art.artist}, {art.year}
                    </p>
                    
                    <div className={`mt-auto flex justify-between items-center pt-3 border-t ${
                      isDark ? "border-[#f0bf5c]/5" : "border-stone-100"
                    }`}>
                      <div className="flex flex-col">
                        <span className={`font-bold text-base ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                          Rp {art.price.toLocaleString("id-ID")}
                        </span>
                        <span className={`text-[9px] tracking-wider uppercase font-sans ${
                          isDark ? "text-[#9b8f7d]" : "text-stone-400"
                        }`}>
                          {art.size}
                        </span>
                      </div>

                      {/* Explicit Direct WhatsApp Button for cross-device support (important on mobile where hover is absent) */}
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                          `Halo ARTVERSE, saya tertarik dengan karya seni "${art.title}" oleh ${art.artist}. Apakah karya ini masih tersedia?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-[#25D366] text-white hover:bg-[#20ba5a] text-[11px] font-bold px-3 py-2 rounded-lg transition-all active:scale-95 shadow-sm"
                        title="Hubungi Penjual di WhatsApp"
                      >
                        <WhatsAppIcon size={12} />
                        <span>Tanya WA</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Dynamic Detail Modal with Zoom and Inquiry Chat Form */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dark Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-300"
            onClick={() => {
              setSelectedArtwork(null);
              setShowInquireForm(false);
            }}
          />

          {/* Modal box */}
          <div className={`relative w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto border max-h-[90vh] z-10 animate-in zoom-in-95 duration-200 transition-colors ${
            isDark ? "bg-[#17130c] border-[#f0bf5c]/20" : "bg-white border-stone-200"
          }`}>
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedArtwork(null);
                setShowInquireForm(false);
              }}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Left Column: Image box with mouse hover zoom & click to open full screen */}
            <div
              className="relative w-full md:w-1/2 h-80 xs:h-96 sm:h-[450px] md:h-auto md:min-h-[500px] bg-black overflow-hidden flex items-center justify-center cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsLightboxOpen(true)}
              style={{ cursor: isZoomed ? "move" : "zoom-in" }}
              title="Klik untuk melihat layar penuh"
            >
              {/* Blurred background representation of painting */}
              <img
                src={selectedArtwork.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-105 pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />

              {/* Main Artwork Image rendered complete without cropping */}
              <img
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                className="relative max-w-full max-h-full object-contain transition-transform duration-100 ease-linear z-10"
                style={{
                  transform: isZoomed ? "scale(2.2)" : "scale(1)",
                  transformOrigin: zoomOrigin,
                }}
                referrerPolicy="no-referrer"
              />

              {/* Bottom Instructions hint */}
              {!isZoomed && (
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white/90 text-[10px] tracking-wider uppercase font-semibold pointer-events-none">
                  <ZoomIn size={12} />
                  <span className="hidden md:inline">Arahkan kursor / Klik untuk Zoom</span>
                  <span className="md:hidden">Ketuk untuk Layar Penuh</span>
                </div>
              )}
            </div>

            {/* Right Column: Context details */}
            <div className={`w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar transition-colors ${
              isDark ? "bg-[#17130c]" : "bg-white"
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block ${
                isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
              }`}>
                {selectedArtwork.category}
              </span>
              <h2 className={`font-display text-2xl md:text-3xl font-bold mb-2 leading-tight ${
                isDark ? "text-[#ebe1d6]" : "text-stone-900"
              }`}>
                {selectedArtwork.title}
              </h2>
              <p className={`text-sm mb-6 ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
                Oleh seniman:{" "}
                <span className={`font-bold underline underline-offset-4 ${
                  isDark ? "text-[#f0bf5c] decoration-[#f0bf5c]/30" : "text-[#c89b3c] decoration-[#c89b3c]/30"
                }`}>
                  {selectedArtwork.artist}
                </span>
              </p>

              {/* Technical Spec Grid */}
              <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg mb-6 border text-xs ${
                isDark 
                  ? "bg-[#1f1b14] border-[#4e4637]/30 text-white" 
                  : "bg-stone-50 border-stone-200 text-stone-800"
              }`}>
                <div>
                  <span className={`block text-[10px] uppercase tracking-wider mb-1 ${
                    isDark ? "text-[#9b8f7d]" : "text-stone-400"
                  }`}>
                    Tahun Pembuatan
                  </span>
                  <span className="font-semibold">{selectedArtwork.year}</span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase tracking-wider mb-1 ${
                    isDark ? "text-[#9b8f7d]" : "text-stone-400"
                  }`}>
                    Media / Material
                  </span>
                  <span className="font-semibold">{selectedArtwork.medium}</span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase tracking-wider mb-1 ${
                    isDark ? "text-[#9b8f7d]" : "text-stone-400"
                  }`}>
                    Ukuran Fisik
                  </span>
                  <span className="font-semibold">{selectedArtwork.size}</span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase tracking-wider mb-1 ${
                    isDark ? "text-[#9b8f7d]" : "text-stone-400"
                  }`}>
                    Status Galeri
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedArtwork.status === "Tersedia" ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        selectedArtwork.status === "Tersedia" ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {selectedArtwork.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description text */}
              <div className="mb-6">
                <span className={`block text-[10px] uppercase tracking-wider mb-2 font-bold ${
                  isDark ? "text-[#9b8f7d]" : "text-stone-400"
                }`}>
                  Deskripsi Karya
                </span>
                <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-[#d2c5b1]/90" : "text-stone-600"}`}>
                  {selectedArtwork.description || "Tidak ada deskripsi makna filosofis tambahan."}
                </p>
              </div>

              {/* Quick Inquiry / Form Actions */}
              {showInquireForm ? (
                <form
                  onSubmit={handleSendInquiry}
                  className={`p-4 rounded-lg border space-y-3 mb-6 animate-in slide-in-from-bottom-2 duration-300 ${
                    isDark ? "bg-[#1f1b14] border-[#f0bf5c]/20" : "bg-stone-50 border-stone-200"
                  }`}
                >
                  <div className={`flex justify-between items-center border-b pb-1.5 mb-2 ${
                    isDark ? "border-[#f0bf5c]/10" : "border-stone-200"
                  }`}>
                    <h4 className={`text-xs font-bold tracking-wider uppercase ${
                      isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                    }`}>
                      Tanya Seniman / Galeri
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowInquireForm(false)}
                      className={`text-xs font-semibold ${isDark ? "text-[#d2c5b1] hover:text-[#f0bf5c]" : "text-stone-500 hover:text-[#c89b3c]"}`}
                    >
                      Batal
                    </button>
                  </div>

                  {inquireSuccess ? (
                    <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 text-center text-xs rounded-lg border border-green-500/20">
                      Pesan Anda berhasil dikirim ke Penjual! Kami akan memprosesnya segera.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          required
                          value={inquireName}
                          onChange={(e) => setInquireName(e.target.value)}
                          placeholder="Nama Anda *"
                          className={`p-2 border rounded outline-none text-xs ${
                            isDark 
                              ? "bg-[#17130c] border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                              : "bg-white border-stone-300 focus:border-[#c89b3c] text-stone-900"
                          }`}
                        />
                        <input
                          type="email"
                          value={inquireEmail}
                          onChange={(e) => setInquireEmail(e.target.value)}
                          placeholder="Email Anda"
                          className={`p-2 border rounded outline-none text-xs ${
                            isDark 
                              ? "bg-[#17130c] border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                              : "bg-white border-stone-300 focus:border-[#c89b3c] text-stone-900"
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        value={inquirePhone}
                        onChange={(e) => setInquirePhone(e.target.value)}
                        placeholder="No. WhatsApp / Telepon"
                        className={`w-full p-2 border rounded outline-none text-xs ${
                          isDark 
                            ? "bg-[#17130c] border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                            : "bg-white border-stone-300 focus:border-[#c89b3c] text-stone-900"
                        }`}
                      />
                      <textarea
                        required
                        rows={2}
                        value={inquireText}
                        onChange={(e) => setInquireText(e.target.value)}
                        placeholder="Tulis pertanyaan atau penawaran khusus Anda disini... *"
                        className={`w-full p-2 border rounded outline-none text-xs resize-none ${
                          isDark 
                            ? "bg-[#17130c] border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                            : "bg-white border-stone-300 focus:border-[#c89b3c] text-stone-900"
                        }`}
                      />
                      <button
                        type="submit"
                        className={`w-full py-2 text-xs font-bold rounded hover:brightness-110 transition-all cursor-pointer ${
                          isDark ? "bg-[#f0bf5c] text-[#412d00]" : "bg-[#c89b3c] text-white"
                        }`}
                      >
                        Kirim Pesan Masuk
                      </button>
                    </>
                  )}
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
                  {/* Option A: Inquiry Form Button */}
                  <button
                    onClick={() => setShowInquireForm(true)}
                    className={`flex-1 flex items-center justify-center gap-2 border py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isDark 
                        ? "border-[#f0bf5c]/35 text-[#f0bf5c] hover:bg-[#f0bf5c]/5" 
                        : "border-[#c89b3c]/35 text-[#c89b3c] hover:bg-[#c89b3c]/5"
                    }`}
                  >
                    <MessageCircle size={14} />
                    <span>Tanya via Form</span>
                  </button>

                  {/* Option B: Direct WhatsApp Button */}
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Halo ARTVERSE, saya tertarik dengan karya seni "${selectedArtwork.title}" oleh ${selectedArtwork.artist}. Apakah karya ini masih tersedia?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#20ba5a] transition-all cursor-pointer shadow-md hover:shadow-lg text-center"
                  >
                    <WhatsAppIcon size={14} />
                    <span>WhatsApp Penjual</span>
                  </a>
                </div>
              )}

              {/* Purchase Details Footer Actions */}
              <div className={`mt-auto pt-6 border-t flex items-center justify-between gap-4 ${
                isDark ? "border-[#4e4637]/30" : "border-stone-100"
              }`}>
                <div>
                  <span className={`block text-[9px] uppercase tracking-widest mb-1 font-bold ${
                    isDark ? "text-[#9b8f7d]" : "text-stone-400"
                  }`}>
                    Harga Jual
                  </span>
                  <span className={`font-bold text-xl md:text-2xl font-display ${
                    isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
                  }`}>
                    Rp {selectedArtwork.price.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex gap-2.5 items-center">
                  {selectedArtwork.status === "Tersedia" ? (
                    <button
                      onClick={() => {
                        addToCart(selectedArtwork);
                        setSelectedArtwork(null);
                      }}
                      disabled={cartItemIds.includes(selectedArtwork.id)}
                      className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 text-xs transition-all cursor-pointer shadow-lg active:scale-95 ${
                        cartItemIds.includes(selectedArtwork.id)
                          ? "bg-green-950/40 text-green-400 border border-green-500/20 cursor-not-allowed"
                          : isDark
                            ? "bg-[#f0bf5c] text-[#412d00] hover:brightness-110"
                            : "bg-[#c89b3c] text-white hover:bg-[#b08530]"
                      }`}
                    >
                      <ShoppingCart size={14} />
                      <span>
                        {cartItemIds.includes(selectedArtwork.id)
                          ? "Sudah di Keranjang"
                          : "Beli Karya Seni"}
                      </span>
                    </button>
                  ) : (
                    <div className="bg-red-500/10 text-red-500 px-4 py-2 border border-red-500/20 rounded text-xs italic">
                      Karya seni ({selectedArtwork.status})
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal for detailed high-res inspection (extremely useful on mobile & tablet) */}
      {isLightboxOpen && selectedArtwork && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 animate-in fade-in duration-200">
          {/* Close Backdrop Click */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsLightboxOpen(false)} />
          
          {/* Header info bar */}
          <div className="absolute top-0 inset-x-0 bg-black/60 backdrop-blur-md p-4 flex justify-between items-center z-10 border-b border-white/5">
            <div className="text-left">
              <h4 className="text-white font-display text-sm font-bold tracking-tight">{selectedArtwork.title}</h4>
              <p className="text-[#9b8f7d] text-xs">oleh {selectedArtwork.artist} • {selectedArtwork.year}</p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Fully Zoomed/Complete image without any clipping */}
          <div className="relative max-w-full max-h-full p-4 flex items-center justify-center z-0 select-none">
            <img
              src={selectedArtwork.image}
              alt={selectedArtwork.title}
              className="max-w-[95vw] max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] object-contain rounded shadow-2xl transition-transform"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Footer details indicator */}
          <div className="absolute bottom-6 inset-x-0 text-center text-white/50 text-[10px] tracking-widest uppercase pointer-events-none">
            Ketuk di mana saja untuk kembali
          </div>
        </div>
      )}
    </div>
  );
}
