import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";

interface AiChatbotProps {
  theme?: "dark" | "light";
}

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function AiChatbot({ theme = "dark" }: AiChatbotProps) {
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", parts: [{ text: input.trim() }] };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) {
        let errorMsg = "Maaf, saya sedang mengalami kendala jaringan. Silakan coba lagi nanti.";
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = `Server Error: ${errData.error}`;
        } catch(e) {
          const text = await res.text();
          errorMsg = `HTTP ${res.status}: ${text.substring(0, 50)}`;
        }
        const aiMessage: ChatMessage = { role: "model", parts: [{ text: errorMsg }] };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      // Start streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      // Add empty AI message placeholder
      setMessages(prev => [...prev, { role: "model", parts: [{ text: "" }] }]);
      setIsLoading(false); // Disable loading spinner since we are starting to receive text

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          // Safely append to the last message
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].parts[0].text = fullText;
            return updated;
          });
        }
      }
    } catch (err) {
      const aiMessage: ChatMessage = { role: "model", parts: [{ text: "Terjadi kesalahan saat menghubungi server." }] };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className={`mb-4 w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ${
          isDark ? "bg-[#1f1b14] border border-[#4e4637]/50" : "bg-white border border-stone-200"
        }`}>
          {/* Header */}
          <div className={`p-4 flex justify-between items-center border-b ${
            isDark ? "bg-[#110e08] border-[#4e4637]/50" : "bg-stone-50 border-stone-200"
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? "bg-[#f0bf5c]/20 text-[#f0bf5c]" : "bg-[#c89b3c]/20 text-[#c89b3c]"
              }`}>
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className={`font-display font-bold text-sm ${isDark ? "text-white" : "text-stone-900"}`}>Finszart AI Assistant</h3>
                <p className={`text-[10px] ${isDark ? "text-stone-400" : "text-stone-500"}`}>Kurator Galeri Virtual Anda</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? "hover:bg-white/10 text-stone-400" : "hover:bg-black/5 text-stone-600"
              }`}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${
            isDark ? "bg-[#110e08]/50" : "bg-stone-50/50"
          }`}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center mt-6">
                <div className={`text-center text-xs mb-6 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
                  <p>Halo! Saya asisten AI Finszart.</p>
                  <p className="mt-1">Tanyakan saya tentang lukisan, filosofi seni, atau rekomendasi karya untuk ruangan Anda.</p>
                </div>
                
                {/* Panduan / Saran Pertanyaan */}
                <div className="flex flex-col gap-2 w-full">
                  <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isDark ? "text-stone-500" : "text-stone-400"}`}>Coba tanyakan:</p>
                  {[
                    "Apa lukisan yang paling murah di galeri?",
                    "Rekomendasi lukisan bertema alam?",
                    "Jelaskan aliran gaya Impresionisme."
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className={`text-left text-xs p-3 rounded-xl border transition-colors ${
                        isDark 
                          ? "bg-[#1f1b14] border-[#4e4637]/50 hover:border-[#f0bf5c] text-stone-300" 
                          : "bg-white border-stone-200 hover:border-[#c89b3c] text-stone-600"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    isUser 
                      ? isDark 
                        ? "bg-[#f0bf5c] text-[#412d00] rounded-br-sm" 
                        : "bg-[#c89b3c] text-white rounded-br-sm"
                      : isDark
                        ? "bg-[#2a241b] text-[#ebe1d6] rounded-bl-sm border border-[#4e4637]/30"
                        : "bg-white text-stone-800 rounded-bl-sm border border-stone-200"
                  }`}>
                    {msg.parts.map((p, i) => <span key={i} className="whitespace-pre-wrap leading-relaxed">{p.text}</span>)}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-4 py-2.5 rounded-bl-sm border flex items-center gap-2 ${
                  isDark ? "bg-[#2a241b] text-[#ebe1d6] border-[#4e4637]/30" : "bg-white text-stone-800 border-stone-200"
                }`}>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Berpikir...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${
            isDark ? "bg-[#110e08] border-[#4e4637]/50" : "bg-stone-50 border-stone-200"
          }`}>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 border transition-colors ${
                isDark 
                  ? "bg-[#1f1b14] border-[#4e4637]/50 focus-within:border-[#f0bf5c]" 
                  : "bg-white border-stone-300 focus-within:border-[#c89b3c]"
              }`}
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya sesuatu tentang seni..."
                disabled={isLoading}
                className={`flex-1 bg-transparent border-none outline-none text-sm ${
                  isDark ? "text-white placeholder:text-stone-500" : "text-stone-900 placeholder:text-stone-400"
                }`}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full transition-colors ${
                  input.trim() && !isLoading
                    ? isDark ? "bg-[#f0bf5c] text-[#412d00]" : "bg-[#c89b3c] text-white"
                    : isDark ? "bg-stone-800 text-stone-500" : "bg-stone-200 text-stone-400"
                }`}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        id="ai-chatbot-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
          isOpen
            ? isDark ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-800"
            : isDark ? "bg-[#f0bf5c] text-[#412d00]" : "bg-[#c89b3c] text-white"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
