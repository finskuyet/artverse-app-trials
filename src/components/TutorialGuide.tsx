import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ShoppingBag, 
  Bell, 
  HelpCircle,
  Compass,
  FileText,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface TutorialGuideProps {
  theme: "dark" | "light";
  onEmitMockNotification?: (title: string, msg: string, type: "order" | "payment" | "message") => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialGuide({ 
  theme, 
  onEmitMockNotification,
  isOpen,
  onClose
}: TutorialGuideProps) {
  const isDark = theme === "dark";
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Configuration of all steps for the Guided Tour
  const tourSteps = [
    {
      targetId: "nav-gallery",
      title: "Jelajahi Galeri Seni 🎨",
      description: "Ini adalah galeri utama tempat Anda mengagresiasi lukisan virtual kelas dunia. Anda dapat melihat mahakarya secara detail, memperbesar dengan animasi high-fidelity, dan mengobrol langsung dengan seniman kurator.",
      icon: <Compass className="w-5 h-5 text-[#f0bf5c]" />,
      tooltip: "Akses Pameran Seni Utama"
    },
    {
      targetId: "nav-cart",
      title: "Keranjang Belanja 🛒",
      description: "Simpan lukisan orisinal favorit Anda ke dalam keranjang. Lakukan checkout aman menggunakan sistem pembayaran terintegrasi kami.",
      icon: <ShoppingBag className="w-5 h-5 text-[#f0bf5c]" />,
      tooltip: "Kelola Lukisan Terpilih Anda"
    },
    {
      targetId: "nav-transactions",
      title: "Riwayat Transaksi 📄",
      description: "Pantau status pengiriman fisik lukisan, bukti transaksi pembayaran digital, serta riwayat pembelian karya seni Anda secara transparan.",
      icon: <FileText className="w-5 h-5 text-[#f0bf5c]" />,
      tooltip: "Lacak Transaksi & Pengiriman"
    },
    {
      targetId: "nav-seller",
      title: "Portal Seniman / Penjual 🧑‍🎨",
      description: "Ingin menjual karya seni Anda? Masuk ke portal ini untuk mengunggah gambar lukisan, mengatur harga, menulis kisah di balik lukisan, dan memantau pendapatan galeri pribadi Anda.",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      tooltip: "Mulai Jual Mahakarya Anda"
    },
    {
      targetId: "nav-bell",
      title: "Live Notifikasi & Aktivitas 🔔",
      description: "Dapatkan pembaruan langsung tentang status penawaran harga, pesanan baru dari kolektor, maupun pesan chat terbaru dalam sekejap.",
      icon: <Bell className="w-5 h-5 text-[#f0bf5c]" />,
      tooltip: "Info Live Notifikasi"
    },
    {
      targetId: "nav-theme",
      title: "Ubah Pencahayaan Galeri 🌓",
      description: "Sesuaikan pencahayaan galeri rupa dengan satu klik! Beralihlah antara Mode Gelap yang megah dan elegan atau Mode Terang yang bersih dan hangat.",
      icon: <Sun className="w-5 h-5 text-[#f0bf5c]" />,
      tooltip: "Ganti Mode Gelap / Terang"
    },
    {
      targetId: "nav-guide",
      title: "Pusat Panduan Tour 💡",
      description: "Kapan pun Anda membutuhkan penjelasan tentang fitur-fitur galeri virtual Artverse kembali, Anda selalu dapat menekan tombol Panduan ini untuk mengulangi tour interaktif.",
      icon: <HelpCircle className="w-5 h-5 text-emerald-400" />,
      tooltip: "Buka Kembali Tour Kapan Saja"
    }
  ];

  // Dynamic real-time tracking of the highlighted DOM element
  useEffect(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    const currentStepData = tourSteps[currentStep];
    if (!currentStepData) return;

    const updatePosition = () => {
      const el = document.getElementById(currentStepData.targetId);
      if (el) {
        // Automatically scroll to view if button is out of viewport (mostly for mobile responsive views)
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    // Short interval to wait for tab animations / layout renders
    const timer = setTimeout(updatePosition, 100);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("artverse_tutorial_completed", "true");
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("artverse_tutorial_completed", "true");
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto">
        {/* Semi-transparent dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkip}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
        />

        {/* Real-time Target Highlight Spotlight & Circling Rings */}
        {targetRect && (
          <div className="absolute inset-0 pointer-events-none z-[110]">
            {/* Spotlight Glow Border circling the button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="absolute border-2 border-[#f0bf5c] rounded-full shadow-[0_0_30px_rgba(240,191,92,0.8)]"
              style={{
                top: targetRect.top - 6,
                left: targetRect.left - 6,
                width: targetRect.width + 12,
                height: targetRect.height + 12,
              }}
            >
              {/* Infinite concentric ripple effect */}
              <div className="absolute -inset-3 border-2 border-[#f0bf5c]/40 rounded-full animate-ping opacity-60" />
            </motion.div>

            {/* Bouncing Pointer Arrow with tooltip explaining exactly what the highlighted button is */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 120, 
                damping: 10,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.2
              }}
              className="absolute flex flex-col items-center justify-center"
              style={{
                top: targetRect.top + targetRect.height + 12,
                left: targetRect.left + (targetRect.width / 2) - 100, // horizontal center
                width: "200px"
              }}
            >
              {/* Arrow caret pointing UP */}
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#f0bf5c] filter drop-shadow-[0_-2px_4px_rgba(240,191,92,0.5)]" />
              
              {/* Tooltip Content Card with glassmorphic look */}
              <div className="mt-1 bg-black/95 text-white border border-[#f0bf5c] text-[10px] font-bold tracking-wider py-1.5 px-3 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-center flex flex-col gap-0.5 max-w-[190px]">
                <span className="text-[#f0bf5c] font-extrabold uppercase text-[9px] tracking-widest">{currentStepData.title}</span>
                <span className="text-stone-300 font-normal leading-normal">{currentStepData.tooltip}</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Guided Tour Floating popover card */}
        <div className="fixed inset-0 pointer-events-none z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`pointer-events-auto max-w-sm w-full rounded-2xl p-6 border shadow-2xl relative flex flex-col justify-between ${
              isDark 
                ? "bg-stone-900/95 border-[#f0bf5c]/30 text-white backdrop-blur-md" 
                : "bg-white/95 border-stone-200 text-stone-800 backdrop-blur-md"
            }`}
          >
            {/* Top decorative gradient glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#c89b3c] via-[#f0bf5c] to-purple-500 rounded-t-2xl" />

            {/* Header section with step indicators */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                isDark ? "bg-[#f0bf5c]/15 text-[#f0bf5c]" : "bg-[#c89b3c]/15 text-[#c89b3c]"
              }`}>
                Langkah {currentStep + 1} dari {tourSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? "hover:bg-white/5 text-stone-400 hover:text-white" : "hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                }`}
                title="Selesaikan Tour"
              >
                <X size={16} />
              </button>
            </div>

            {/* Core Tour Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isDark ? "bg-[#f0bf5c]/10" : "bg-[#c89b3c]/10"}`}>
                  {currentStepData.icon}
                </div>
                <h4 className="font-display font-bold text-[15px] tracking-tight">{currentStepData.title}</h4>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? "text-stone-300" : "text-stone-600"}`}>
                {currentStepData.description}
              </p>
            </div>

            {/* Live Indicator/Interactive Helper (Simulate Event inside helper) */}
            {currentStep === 4 && onEmitMockNotification && (
              <div className="mb-4 bg-[#f0bf5c]/5 border border-[#f0bf5c]/10 rounded-xl p-3 text-center space-y-2">
                <p className="text-[10px] text-[#f0bf5c] font-bold uppercase tracking-wider">Mari Simulasi Notifikasi!</p>
                <button
                  onClick={() => {
                    onEmitMockNotification(
                      "Pesanan Baru!",
                      "Kolektor dari Surabaya membeli 'Sunset Whisper' seharga Rp 3.200.000",
                      "order"
                    );
                  }}
                  className="px-3 py-1.5 bg-[#f0bf5c] hover:bg-[#ffcf6e] text-[#412d00] font-bold text-[11px] rounded-lg transition-all"
                >
                  Kirim Notifikasi Demo 🔔
                </button>
              </div>
            )}

            {/* Footer Navigation controls */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between">
              {/* Skip tour text */}
              <button
                onClick={handleSkip}
                className={`text-[11px] font-semibold transition-colors ${
                  isDark ? "text-stone-400 hover:text-white" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                Lewati Tour
              </button>

              {/* Next/Prev buttons */}
              <div className="flex items-center gap-1.5">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className={`flex items-center justify-center p-1.5 rounded-lg border transition-all ${
                      isDark 
                        ? "border-stone-700 text-stone-300 hover:bg-white/5" 
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 text-xs px-3.5 py-1.5 rounded-lg bg-[#f0bf5c] text-[#412d00] hover:bg-[#ffcf6e] font-bold transition-all shadow-lg shadow-[#f0bf5c]/5"
                >
                  <span>{currentStep === tourSteps.length - 1 ? "Selesai" : "Lanjut"}</span>
                  {currentStep < tourSteps.length - 1 && <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
