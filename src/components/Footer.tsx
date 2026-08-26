import { Camera, Mail, X } from "lucide-react";
import { useState, useEffect } from "react";

interface FooterProps {
  theme?: "dark" | "light";
  onSecretAccess?: () => void;
}

export default function Footer({ theme = "dark", onSecretAccess }: FooterProps) {
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [contactEmail, setContactEmail] = useState("inquire@finszart.com");
  const [contactPhone, setContactPhone] = useState("+62 811-0000-0000");
  const [contactAddress, setContactAddress] = useState("Studio: SCBD, Jakarta, Indonesia.");
  const [aboutUsText, setAboutUsText] = useState("Finszart adalah galeri seni premium digital yang didirikan pada tahun 2026. Kami berdedikasi untuk menghubungkan mahakarya seniman terbaik dengan para kolektor seni dari seluruh dunia dengan kurasi yang ketat dan jaminan keaslian.");
  const [faqText, setFaqText] = useState("T: Apakah lukisan dilengkapi sertifikat?\nJ: Ya, setiap pembelian dilengkapi dengan Sertifikat Keaslian fisik bersertifikasi.\n\nT: Bisakah dibatalkan?\nJ: Pembatalan hanya dapat dilakukan dalam kurun waktu 24 jam setelah pembayaran.");
  const [shippingText, setShippingText] = useState("Kami menggunakan jasa kurir asuransi khusus seni rupa (fine-art logistics) untuk menjamin lukisan tiba dengan aman tanpa cacat. Pengiriman memakan waktu 2-5 hari untuk domestik, dan 7-14 hari untuk internasional.");
  const [termsText, setTermsText] = useState("Dengan mengakses, menggunakan, atau melakukan transaksi di Finszart, Anda dianggap telah membaca, memahami, dan menyetujui semua aturan hak cipta, perlindungan privasi, dan protokol jual beli benda seni otentik yang berlaku.");
  const [footerDescription, setFooterDescription] = useState("Menghubungkan kolektor elit dengan mahakarya seniman terbaik melalui platform digital yang terkurasi dengan sempurna.");
  const [galleryText, setGalleryText] = useState("Koleksi kami mencakup ratusan lukisan otentik dari berbagai aliran mulai dari Realisme klasik hingga Abstrak kontemporer. Anda dapat menjelajahi keseluruhan katalog kami langsung dari Halaman Utama.");
  const [artistText, setArtistText] = useState("Saat ini Finszart telah bekerja sama secara eksklusif dengan lebih dari 50 pelukis maestro dan seniman muda berbakat dari kancah lokal maupun internasional.");
  const [exhibitionText, setExhibitionText] = useState("Fitur Pameran 3D Virtual interaktif saat ini sedang dalam tahap pengembangan akhir oleh tim insinyur kami. Segera hadir untuk memberikan Anda pengalaman menjelajah galeri secara imersif dari rumah!");

  useEffect(() => {
    // Fetch global payment settings to get the dynamic contact email
    fetch("/api/payment-settings")
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.contactEmail) setContactEmail(data.contactEmail);
          if (data.contactPhone) setContactPhone(data.contactPhone);
          if (data.contactAddress) setContactAddress(data.contactAddress);
          if (data.aboutUsText) setAboutUsText(data.aboutUsText);
          if (data.faqText) setFaqText(data.faqText);
          if (data.shippingText) setShippingText(data.shippingText);
          if (data.termsText) setTermsText(data.termsText);
          if (data.footerDescription) setFooterDescription(data.footerDescription);
          if (data.galleryText) setGalleryText(data.galleryText);
          if (data.artistText) setArtistText(data.artistText);
          if (data.exhibitionText) setExhibitionText(data.exhibitionText);
        }
      })
      .catch(err => console.error("Error loading footer settings:", err));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const [activeModal, setActiveModal] = useState<{title: string, content: string} | null>(null);

  const footerData = {
    tentang: { title: "Tentang Kami", content: aboutUsText },
    galeri: { title: "Galeri Lukisan", content: galleryText },
    seniman: { title: "Seniman", content: artistText },
    pameran: { title: "Pameran Virtual", content: exhibitionText },
    faq: { title: "FAQ (Tanya Jawab)", content: faqText },
    pengiriman: { title: "Kebijakan Pengiriman", content: shippingText },
    syarat: { title: "Syarat & Ketentuan", content: termsText },
    kontak: { title: "Hubungi Kami", content: `Kami siap melayani kebutuhan koleksi seni Anda 24/7.\nEmail: ${contactEmail}\nTelepon: ${contactPhone}\n${contactAddress}` }
  };

  return (
    <footer id="main-footer" className={`w-full pt-16 pb-10 border-t transition-colors duration-300 ${
      isDark 
        ? "bg-[#110e08] border-[#f0bf5c]/10" 
        : "bg-stone-100/60 border-stone-200 text-stone-800"
    }`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-5">
          <div className={`font-display text-2xl font-bold tracking-widest ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            FINSZART
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>
            {footerDescription}
          </p>
        </div>
        <div>
          <h4 className={`text-xs font-bold mb-4 uppercase tracking-widest ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            Navigasi
          </h4>
          <ul className={`flex flex-col gap-3 text-sm ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
            <li>
              <button onClick={() => setActiveModal(footerData.tentang)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Tentang Kami
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal(footerData.galeri)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Galeri Lukisan
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal(footerData.seniman)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Seniman
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal(footerData.pameran)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Pameran Virtual
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className={`text-xs font-bold mb-4 uppercase tracking-widest ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            Bantuan
          </h4>
          <ul className={`flex flex-col gap-3 text-sm ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
            <li>
              <button onClick={() => setActiveModal(footerData.faq)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                FAQ
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal(footerData.pengiriman)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Kebijakan Pengiriman
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal(footerData.syarat)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Syarat &amp; Ketentuan
              </button>
            </li>
            <li>
              <button onClick={() => setActiveModal(footerData.kontak)} className={`transition-colors cursor-pointer ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Kontak
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className={`text-xs font-bold mb-4 uppercase tracking-widest ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            Buletin Seni
          </h4>
          <p className={`text-sm mb-4 ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
            Dapatkan info pameran eksklusif langsung di email Anda.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading" || status === "success"}
              className={`border rounded-lg px-4 py-2 flex-1 outline-none text-sm transition-all ${
                isDark 
                  ? "bg-[#1f1b14] border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                  : "bg-white border-stone-300 focus:border-[#c89b3c] text-stone-900"
              } ${(status === "loading" || status === "success") ? "opacity-70" : ""}`}
            />
            <button 
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                status === "success" 
                  ? "bg-emerald-500 text-white" 
                  : status === "error"
                    ? "bg-red-500 text-white"
                    : isDark 
                      ? "bg-[#f0bf5c] text-[#412d00] hover:scale-105 active:scale-95" 
                      : "bg-[#c89b3c] text-white hover:scale-105 active:scale-95"
              }`}
            >
              {status === "loading" ? "..." : status === "success" ? "Berhasil!" : status === "error" ? "Gagal" : "Daftar"}
            </button>
          </form>
        </div>
      </div>
      <div className={`max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs ${
        isDark ? "border-[#f0bf5c]/5 text-[#d2c5b1]/80" : "border-stone-200 text-stone-500"
      }`}>
        <p>
          © 2026 Finszart Fine Art Gallery. All rights reserved. 
          <button onClick={onSecretAccess} className="ml-2 text-[8px] opacity-0 hover:opacity-50 cursor-pointer">
            Portal Penjual
          </button>
        </p>
        <div className="flex gap-6">
          <a href="#" className={`transition-colors flex items-center gap-1 ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
            <Camera size={16} />
            <span>@finszart.gallery</span>
          </a>
          <a href={`mailto:${contactEmail}`} className={`transition-colors flex items-center gap-1 ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
            <Mail size={16} />
            <span>{contactEmail}</span>
          </a>
        </div>
      </div>

      {/* Footer Info Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
            isDark ? "bg-[#110e08] border border-[#f0bf5c]/20 text-[#ebe1d6]" : "bg-white border border-stone-200 text-stone-900"
          }`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className={`font-display font-bold text-xl ${isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"}`}>
                {activeModal.title}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className={`p-1 rounded-full hover:bg-black/10 cursor-pointer ${isDark ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-black"}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "text-[#d2c5b1]" : "text-stone-600"}`}>
              {activeModal.content}
            </div>
            <button 
              onClick={() => setActiveModal(null)}
              className={`mt-6 w-full py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider cursor-pointer ${
                isDark ? "bg-[#1f1b14] text-[#d2c5b1] hover:bg-[#2a251c]" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
