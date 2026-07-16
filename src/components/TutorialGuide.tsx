import { useState, useEffect, useCallback } from "react";
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
  const [isMobileView, setIsMobileView] = useState(false);

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

  // Find target element: try desktop ID first, then mobile fallback
  const findTargetElement = useCallback((targetId: string): HTMLElement | null => {
    // Try the desktop element first
    const desktopEl = document.getElementById(targetId);
    if (desktopEl) {
      const rect = desktopEl.getBoundingClientRect();
      // Check if the element is actually visible (not hidden by CSS)
      if (rect.width > 0 && rect.height > 0) {
        return desktopEl;
      }
    }
    // Fallback: try mobile version
    const mobileEl = document.getElementById(`${targetId}-mobile`);
    if (mobileEl) {
      const rect = mobileEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return mobileEl;
      }
    }
    return null;
  }, []);

  // Detect mobile/tablet view (under 1024px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dynamic real-time tracking of the highlighted DOM element
  useEffect(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    const currentStepData = tourSteps[currentStep];
    if (!currentStepData) return;

    const updatePosition = () => {
      const el = findTargetElement(currentStepData.targetId);
      if (el) {
        // Scroll into view to center of screen so bottom card doesn't overlap it
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        // Use viewport-relative coordinates (fixed positioning)
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        setTargetRect(null);
      }
    };

    // Initial position + delayed update for layout settling
    updatePosition();
    const timer = setTimeout(updatePosition, 150);
    const timer2 = setTimeout(updatePosition, 400);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true); // capture phase for inner scrolls

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [currentStep, isOpen, findTargetElement]);

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

  // Calculate clamped tooltip position to stay within viewport
  const getTooltipStyle = () => {
    if (!targetRect) return {};
    
    const tooltipWidth = isMobileView ? 160 : 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Determine if tooltip should go above or below the target
    const spaceBelow = viewportHeight - (targetRect.top + targetRect.height);
    const spaceAbove = targetRect.top;
    const showBelow = spaceBelow > 100 || spaceBelow >= spaceAbove;
    
    // Calculate horizontal center, then clamp to viewport
    let tooltipLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
    const margin = 8;
    tooltipLeft = Math.max(margin, Math.min(tooltipLeft, viewportWidth - tooltipWidth - margin));
    
    const tooltipTop = showBelow 
      ? targetRect.top + targetRect.height + 12
      : targetRect.top - 12; // Will use bottom positioning via transform

    return {
      top: tooltipTop,
      left: tooltipLeft,
      width: `${tooltipWidth}px`,
      showBelow,
    };
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden">
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
          <div className="fixed inset-0 pointer-events-none z-[110]">
            {/* Spotlight Glow Border circling the button */}
            <motion.div
              key={`spotlight-${currentStep}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="fixed border-2 border-[#f0bf5c] rounded-full shadow-[0_0_30px_rgba(240,191,92,0.8)]"
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

            {/* Bouncing Pointer Arrow with tooltip */}
            <motion.div
              key={`tooltip-${currentStep}`}
              initial={{ opacity: 0, y: tooltipStyle.showBelow ? 8 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 120, 
                damping: 10,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.2
              }}
              className="fixed flex flex-col items-center justify-center"
              style={{
                top: tooltipStyle.showBelow ? tooltipStyle.top : undefined,
                bottom: tooltipStyle.showBelow ? undefined : `${window.innerHeight - (targetRect.top - 12)}px`,
                left: tooltipStyle.left,
                width: tooltipStyle.width,
              }}
            >
              {/* Arrow & Tooltip - order flips based on position */}
              {tooltipStyle.showBelow ? (
                <>
                  {/* Arrow caret pointing UP */}
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#f0bf5c] filter drop-shadow-[0_-2px_4px_rgba(240,191,92,0.5)]" />
                  {/* Tooltip Content Card */}
                  <div className="mt-1 bg-black/95 text-white border border-[#f0bf5c] text-[10px] font-bold tracking-wider py-1.5 px-3 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-center flex flex-col gap-0.5 max-w-full">
                    <span className="text-[#f0bf5c] font-extrabold uppercase text-[9px] tracking-widest leading-tight">{currentStepData.title}</span>
                    <span className="text-stone-300 font-normal leading-normal">{currentStepData.tooltip}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Tooltip Content Card */}
                  <div className="mb-1 bg-black/95 text-white border border-[#f0bf5c] text-[10px] font-bold tracking-wider py-1.5 px-3 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-center flex flex-col gap-0.5 max-w-full">
                    <span className="text-[#f0bf5c] font-extrabold uppercase text-[9px] tracking-widest leading-tight">{currentStepData.title}</span>
                    <span className="text-stone-300 font-normal leading-normal">{currentStepData.tooltip}</span>
                  </div>
                  {/* Arrow caret pointing DOWN */}
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#f0bf5c] filter drop-shadow-[0_2px_4px_rgba(240,191,92,0.5)]" />
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Guided Tour Floating popover card */}
        <div className="fixed inset-0 pointer-events-none z-[120] flex items-end sm:items-center justify-center p-3 sm:p-4">
          <motion.div
            key={`card-${currentStep}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`pointer-events-auto w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm rounded-2xl p-4 sm:p-6 border shadow-2xl relative flex flex-col justify-between mb-4 sm:mb-0 ${
              isDark 
                ? "bg-stone-900/95 border-[#f0bf5c]/30 text-white backdrop-blur-md" 
                : "bg-white/95 border-stone-200 text-stone-800 backdrop-blur-md"
            }`}
          >
            {/* Top decorative gradient glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#c89b3c] via-[#f0bf5c] to-purple-500 rounded-t-2xl" />

            {/* Header section with step indicators */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 mt-2">
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

            {/* Step progress dots for mobile */}
            <div className="flex items-center justify-center gap-1.5 mb-3 sm:hidden">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep 
                      ? "w-6 bg-[#f0bf5c]" 
                      : idx < currentStep 
                        ? "w-1.5 bg-[#f0bf5c]/50" 
                        : "w-1.5 bg-stone-600"
                  }`}
                />
              ))}
            </div>

            {/* Core Tour Details */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg shrink-0 ${isDark ? "bg-[#f0bf5c]/10" : "bg-[#c89b3c]/10"}`}>
                  {currentStepData.icon}
                </div>
                <h4 className="font-display font-bold text-sm sm:text-[15px] tracking-tight">{currentStepData.title}</h4>
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
