import { Camera, Mail } from "lucide-react";

interface FooterProps {
  theme?: "dark" | "light";
}

export default function Footer({ theme = "dark" }: FooterProps) {
  const isDark = theme === "dark";

  return (
    <footer id="main-footer" className={`w-full pt-16 pb-10 border-t transition-colors duration-300 ${
      isDark 
        ? "bg-[#110e08] border-[#f0bf5c]/10" 
        : "bg-stone-100/60 border-stone-200 text-stone-800"
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-5">
          <div className={`font-display text-2xl font-bold tracking-widest ${
            isDark ? "text-[#f0bf5c]" : "text-[#c89b3c]"
          }`}>
            ARTVERSE
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? "text-[#d2c5b1]/80" : "text-stone-600"}`}>
            Menghubungkan kolektor elit dengan mahakarya seniman terbaik melalui platform digital yang terkurasi dengan sempurna.
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
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Tentang Kami
              </a>
            </li>
            <li>
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Galeri Lukisan
              </a>
            </li>
            <li>
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Seniman
              </a>
            </li>
            <li>
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Pameran Virtual
              </a>
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
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Kebijakan Pengiriman
              </a>
            </li>
            <li>
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Syarat &amp; Ketentuan
              </a>
            </li>
            <li>
              <a href="#" className={`transition-colors ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
                Kontak
              </a>
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
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email Anda"
              className={`border rounded-lg px-4 py-2 flex-1 outline-none text-sm transition-all ${
                isDark 
                  ? "bg-[#1f1b14] border-[#4e4637]/30 focus:border-[#f0bf5c] text-white" 
                  : "bg-white border-stone-300 focus:border-[#c89b3c] text-stone-900"
              }`}
            />
            <button className={`px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? "bg-[#f0bf5c] text-[#412d00]" : "bg-[#c89b3c] text-white"
            }`}>
              Daftar
            </button>
          </div>
        </div>
      </div>
      <div className={`max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs ${
        isDark ? "border-[#f0bf5c]/5 text-[#d2c5b1]/80" : "border-stone-200 text-stone-500"
      }`}>
        <p>© 2026 ArtVerse Fine Art Gallery. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className={`transition-colors flex items-center gap-1 ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
            <Camera size={16} />
            <span>@artverse.gallery</span>
          </a>
          <a href="#" className={`transition-colors flex items-center gap-1 ${isDark ? "hover:text-[#f0bf5c]" : "hover:text-[#c89b3c]"}`}>
            <Mail size={16} />
            <span>inquire@artverse.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
