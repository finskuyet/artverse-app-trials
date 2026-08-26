import express from "express";
import { 
  dbRepository, 
  Artwork, 
  Order, 
  OrderItem, 
  Message, 
  Notification, 
  PaymentSettings 
} from "./server-db.js";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// --- API ENDPOINTS ---

// Verify seller portal token securely using environment variables
app.post("/api/seller/verify-token", (req, res) => {
  const { token } = req.body;
  const expectedToken = process.env.SELLER_TOKEN || "admin";
  if (token && token.trim() === expectedToken.trim()) {
    return res.json({ success: true });
  }
  return res.status(401).json({ 
    success: false, 
    error: "Token akses tidak valid. Silakan periksa kembali token Anda atau hubungi administrator." 
  });
});

// 1. Get database status & statistics
app.get("/api/stats", async (req, res) => {
  try {
    const artworks = await dbRepository.getArtworks();
    const orders = await dbRepository.getOrders();

    const activeArtworksCount = artworks.length;
    const availableCount = artworks.filter((a: Artwork) => a.status === "Tersedia").length;
    const soldOrders = orders.filter((o: Order) => o.status === "Dibayar");
    
    const soldCount = soldOrders.reduce((acc: number, cur: Order) => acc + (cur.items?.length || 0), 0);
    const totalOmset = soldOrders.reduce((acc: number, cur: Order) => acc + cur.totalPrice, 0);
    const activeOrdersCount = orders.filter((o: Order) => o.status === "Menunggu Verifikasi").length;

    res.json({
      activeArtworksCount,
      availableCount,
      soldCount,
      totalOmset,
      activeOrdersCount
    });
  } catch (err) {
    console.error("Error on /api/stats:", err);
    res.status(500).json({ error: "Gagal memuat statistik galeri" });
  }
});

// 2. Get all artworks
app.get("/api/artworks", async (req, res) => {
  try {
    const artworks = await dbRepository.getArtworks();
    res.json(artworks);
  } catch (err) {
    console.error("Error on GET /api/artworks:", err);
    res.status(500).json({ error: "Gagal memuat katalog karya seni" });
  }
});

// 3. Upload new artwork
app.post("/api/artworks", async (req, res) => {
  const { title, artist, category, year, size, medium, price, status, description, image, premium } = req.body;

  if (!title || !artist || !price) {
    return res.status(400).json({ error: "Judul, nama seniman, dan harga wajib diisi" });
  }

  try {
    const newArtwork: Artwork = {
      id: "art-" + Date.now(),
      title,
      artist,
      category: category || "Lukisan",
      year: year || new Date().getFullYear().toString(),
      size: size || "Tidak ditentukan",
      medium: medium || "Tidak ditentukan",
      price: Number(price),
      status: status || "Tersedia",
      description: description || "",
      image: image || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
      premium: !!premium
    };

    const added = await dbRepository.addArtwork(newArtwork);
    
    // Add notification
    await dbRepository.addNotification({
      id: "notif-" + Date.now(),
      date: new Date().toISOString(),
      title: "Katalog Diperbarui",
      message: `Lukisan baru "${title}" berhasil diunggah ke katalog.`,
      type: "order"
    });

    res.status(201).json(added);
  } catch (err) {
    console.error("Error on POST /api/artworks:", err);
    res.status(500).json({ error: "Gagal menambahkan karya seni" });
  }
});

// 4. Update artwork
app.put("/api/artworks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await dbRepository.updateArtwork(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(`Error updating artwork ${id}:`, err);
    res.status(500).json({ error: "Gagal memperbarui karya seni" });
  }
});

// 5. Delete all sold artworks
app.delete("/api/artworks/sold", async (req, res) => {
  try {
    const deletedCount = await dbRepository.deleteSoldArtworks();
    res.json({ success: true, deletedCount });
  } catch (err) {
    console.error(`Error deleting sold artworks:`, err);
    res.status(500).json({ error: "Gagal menghapus karya seni yang terjual" });
  }
});

// 5b. Delete artwork by ID
app.delete("/api/artworks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const success = await dbRepository.deleteArtwork(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Karya seni tidak ditemukan" });
    }
  } catch (err) {
    console.error(`Error deleting artwork ${id}:`, err);
    res.status(500).json({ error: "Gagal menghapus karya seni" });
  }
});

// 6. Submit a checkout/order
app.post("/api/orders", async (req, res) => {
  const { buyerName, email, phone, address, city, postalCode, itemIds, paymentMethod, receiptImage } = req.body;

  if (!buyerName || !email || !phone || !address || !itemIds || itemIds.length === 0) {
    return res.status(400).json({ error: "Lengkapi semua formulir checkout yang wajib diisi" });
  }

  try {
    const artworks = await dbRepository.getArtworks();
    const orderItems: OrderItem[] = [];
    let totalPrice = 0;

    for (const id of itemIds) {
      const art = artworks.find((a: Artwork) => a.id === id);
      if (art) {
        orderItems.push({
          id: art.id,
          title: art.title,
          artist: art.artist,
          price: art.price,
          image: art.image
        });
        totalPrice += art.price;

        // Mark artwork status as Terjual/Sold
        await dbRepository.updateArtwork(art.id, { status: "Terjual" });
      }
    }

    if (orderItems.length === 0) {
      return res.status(404).json({ error: "Karya seni tidak valid atau tidak ditemukan" });
    }

    // Generate unique ID in format AV-YEAR-RANDOM
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderId = `AV-${new Date().getFullYear()}-${randomHex}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString(),
      buyerName,
      email: email.toLowerCase(),
      phone,
      address,
      city: city || "",
      postalCode: postalCode || "",
      items: orderItems,
      totalPrice,
      paymentMethod,
      status: "Menunggu Verifikasi",
      receipt: receiptImage || ""
    };

    const addedOrder = await dbRepository.addOrder(newOrder);

    // Create notification
    await dbRepository.addNotification({
      id: "notif-" + Date.now(),
      date: new Date().toISOString(),
      title: "Pesanan Masuk Baru",
      message: `Pesanan baru ${orderId} dari ${buyerName} sebesar Rp ${totalPrice.toLocaleString("id-ID")}`,
      type: "order"
    });

    res.status(201).json(addedOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Gagal memproses pesanan Anda" });
  }
});

// 7. Get orders (or search by email/phone for buyers)
app.get("/api/orders", async (req, res) => {
  const { contact } = req.query;
  try {
    const orders = await dbRepository.getOrders();
    if (contact) {
      const searchContact = String(contact).toLowerCase().trim();
      const filtered = orders.filter((o: Order) => 
        o.email.toLowerCase() === searchContact || 
        o.phone.includes(searchContact)
      );
      return res.json(filtered);
    }
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Gagal mengambil daftar pesanan" });
  }
});

// 8. Update order payment status
app.put("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { status, shippingReceipt, courier } = req.body;

  try {
    const orders = await dbRepository.getOrders();
    const existingOrder = orders.find((o: Order) => o.id === id);
    if (!existingOrder) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }

    const updates: Partial<Order> = {};

    if (status !== undefined) {
      updates.status = status;

      // Restore artworks availability if order fails
      if (status === "Failed" || status === "Gagal") {
        for (const item of existingOrder.items || []) {
          await dbRepository.updateArtwork(item.id, { status: "Tersedia" });
        }
      }

      // Create status update notification
      await dbRepository.addNotification({
        id: "notif-" + Date.now(),
        date: new Date().toISOString(),
        title: "Pembaruan Pembayaran",
        message: `Status pesanan ${id} diubah menjadi "${status}".`,
        type: "payment"
      });
    }

    if (shippingReceipt !== undefined) {
      updates.shippingReceipt = shippingReceipt;
    }
    if (courier !== undefined) {
      updates.courier = courier;
    }

    const updatedOrder = await dbRepository.updateOrder(id, updates);

    if (shippingReceipt) {
      await dbRepository.addNotification({
        id: "notif-" + Date.now(),
        date: new Date().toISOString(),
        title: "Pesanan Dikirim",
        message: `Pesanan ${id} telah dikirim via ${courier || "Kurir"} dengan No. Resi: ${shippingReceipt}.`,
        type: "order"
      });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error(`Error updating order ${id}:`, err);
    res.status(500).json({ error: "Gagal memperbarui pesanan" });
  }
});

// 8b. Delete all paid orders (Reset Omset)
app.delete("/api/orders/paid", async (req, res) => {
  try {
    const deletedCount = await dbRepository.deletePaidOrders();
    res.json({ success: true, deletedCount });
  } catch (err) {
    console.error(`Error deleting paid orders:`, err);
    res.status(500).json({ error: "Gagal menghapus pesanan yang sudah dibayar" });
  }
});

// 8c. Delete an order
app.delete("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const success = await dbRepository.deleteOrder(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }
  } catch (err) {
    console.error(`Error deleting order ${id}:`, err);
    res.status(500).json({ error: "Gagal menghapus pesanan" });
  }
});

// 9. Send client message / inquiry
app.post("/api/messages", async (req, res) => {
  const { name, email, phone, text, artworkTitle } = req.body;

  if (!name || !text) {
    return res.status(400).json({ error: "Nama dan pesan wajib diisi" });
  }

  try {
    const newMessage: Message = {
      id: "msg-" + Date.now(),
      date: new Date().toISOString(),
      name,
      email: email || "",
      phone: phone || "",
      text,
      artworkTitle
    };

    const added = await dbRepository.addMessage(newMessage);

    // Add notification
    await dbRepository.addNotification({
      id: "notif-" + Date.now(),
      date: new Date().toISOString(),
      title: "Pesan Masuk Baru",
      message: `${name} mengirimkan pesan inquiry baru.`,
      type: "message"
    });

    res.status(201).json(added);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ error: "Gagal mengirimkan pesan Anda" });
  }
});

// 10. Get messages
app.get("/api/messages", async (req, res) => {
  const { email } = req.query;
  try {
    const messages = await dbRepository.getMessages();
    if (email) {
      const searchEmail = String(email).toLowerCase().trim();
      const filtered = messages.filter((m: Message) => 
        m.email && m.email.toLowerCase() === searchEmail
      );
      return res.json(filtered);
    }
    res.json(messages);
  } catch (err) {
    console.error("Error getting messages:", err);
    res.status(500).json({ error: "Gagal mengambil daftar pesan" });
  }
});

// 11. Delete a message
app.delete("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const success = await dbRepository.deleteMessage(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Pesan tidak ditemukan" });
    }
  } catch (err) {
    console.error(`Error deleting message ${id}:`, err);
    res.status(500).json({ error: "Gagal menghapus pesan" });
  }
});

// 11.5. Reply to a message
app.put("/api/messages/:id/reply", async (req, res) => {
  const { id } = req.params;
  const { replyText } = req.body;

  try {
    const updated = await dbRepository.updateMessage(id, {
      replyText,
      repliedAt: new Date().toISOString()
    });
    res.json(updated);
  } catch (err) {
    console.error(`Error replying to message ${id}:`, err);
    res.status(500).json({ error: "Gagal mengirim balasan pesan" });
  }
});

// 12. Get notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await dbRepository.getNotifications();
    res.json(notifications);
  } catch (err) {
    console.error("Error getting notifications:", err);
    res.status(500).json({ error: "Gagal memuat notifikasi" });
  }
});

// 12.5. Post a new notification
app.post("/api/notifications", async (req, res) => {
  const { title, message, type } = req.body;
  try {
    const added = await dbRepository.addNotification({
      id: "notif-" + Date.now(),
      date: new Date().toISOString(),
      title: title || "Notifikasi Baru",
      message: message || "",
      type: type || "order"
    });
    res.status(201).json(added);
  } catch (err) {
    console.error("Error creating custom notification:", err);
    res.status(500).json({ error: "Gagal membuat notifikasi" });
  }
});

// 13. Clear notifications
app.post("/api/notifications/clear", async (req, res) => {
  try {
    await dbRepository.clearNotifications();
    res.json({ success: true });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    res.status(500).json({ error: "Gagal menghapus notifikasi" });
  }
});

// 14. Get payment settings
app.get("/api/payment-settings", async (req, res) => {
  try {
    const settings = await dbRepository.getPaymentSettings();
    res.json(settings);
  } catch (err) {
    console.error("Error getting payment settings:", err);
    res.status(500).json({ error: "Gagal mengambil konfigurasi pembayaran" });
  }
});

// 15. Update payment settings
app.put("/api/payment-settings", async (req, res) => {
  const { 
    bank1Name, 
    bank1Number, 
    bank1Owner, 
    bank2Name, 
    bank2Number, 
    bank2Owner, 
    qrisImage,
    whatsappNumber,
    contactEmail,
    contactPhone,
    contactAddress,
    aboutUsText,
    faqText,
    shippingText,
    termsText
  } = req.body;
  
  try {
    const current = await dbRepository.getPaymentSettings();
    const updatedSettings: PaymentSettings = {
      bank1Name: bank1Name || current.bank1Name || "",
      bank1Number: bank1Number || current.bank1Number || "",
      bank1Owner: bank1Owner || current.bank1Owner || "",
      bank2Name: bank2Name || current.bank2Name || "",
      bank2Number: bank2Number || current.bank2Number || "",
      bank2Owner: bank2Owner || current.bank2Owner || "",
      qrisImage: qrisImage || current.qrisImage || "",
      whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : current.whatsappNumber || "",
      contactEmail: contactEmail !== undefined ? contactEmail : current.contactEmail || "inquire@artverse.com",
      contactPhone: contactPhone !== undefined ? contactPhone : current.contactPhone || "+62 811-0000-0000",
      contactAddress: contactAddress !== undefined ? contactAddress : current.contactAddress || "Studio: SCBD, Jakarta, Indonesia.",
      aboutUsText: aboutUsText !== undefined ? aboutUsText : current.aboutUsText || "",
      faqText: faqText !== undefined ? faqText : current.faqText || "",
      shippingText: shippingText !== undefined ? shippingText : current.shippingText || "",
      termsText: termsText !== undefined ? termsText : current.termsText || ""
    };

    const saved = await dbRepository.updatePaymentSettings(updatedSettings);
    res.json(saved);
  } catch (err) {
    console.error("Error updating payment settings:", err);
    res.status(500).json({ error: "Gagal menyimpan konfigurasi pembayaran" });
  }
});

// 16. Get newsletter subscribers
app.get("/api/newsletter", async (req, res) => {
  try {
    const subscribers = await dbRepository.getNewsletterSubscribers();
    res.json(subscribers);
  } catch (err) {
    console.error("Error getting newsletter subscribers:", err);
    res.status(500).json({ error: "Gagal memuat daftar pelanggan buletin" });
  }
});

// 17. Subscribe to newsletter
app.post("/api/newsletter", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email tidak valid" });
  }
  
  try {
    const added = await dbRepository.addNewsletterSubscriber({
      email: email.toLowerCase().trim(),
      date: new Date().toISOString()
    });
    res.status(201).json(added);
  } catch (err) {
    console.error("Error subscribing to newsletter:", err);
    res.status(500).json({ error: "Gagal mendaftar buletin" });
  }
});

// 18. Unsubscribe/Delete from newsletter
app.delete("/api/newsletter/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const success = await dbRepository.deleteNewsletterSubscriber(decodeURIComponent(email));
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Email tidak ditemukan" });
    }
  } catch (err) {
    console.error(`Error deleting newsletter subscriber ${email}:`, err);
    res.status(500).json({ error: "Gagal menghapus pelanggan" });
  }
});

// --- AI ENDPOINTS ---

// 19. Chatbot Assistant
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {
    const artworks = await dbRepository.getArtworks();
    const availableArtworks = artworks.filter(a => a.status === "Tersedia");
    
    const systemInstruction = `Kamu adalah asisten virtual untuk galeri seni bernama Artverse. 
Tugasmu HANYA membantu pengunjung menemukan lukisan yang mereka inginkan, memberikan informasi tentang lukisan di Artverse, dan memberikan penjelasan tentang seni.
PENTING: Jika pengguna bertanya tentang topik di luar seni, lukisan, atau galeri Artverse (misalnya coding, matematika, politik, dll), tolak dengan sopan dan beri tahu mereka bahwa Anda hanya asisten galeri seni.
Jawab dengan ramah, profesional, dan gunakan bahasa Indonesia yang baik dan puitis bila perlu. 
Jika pengguna bertanya tentang lukisan yang ada di galeri, rekomendasikan dari daftar lukisan yang tersedia berikut:
${JSON.stringify(availableArtworks.map(a => ({ title: a.title, artist: a.artist, price: a.price, category: a.category })), null, 2)}`;

    // Set headers for Server-Sent Events (SSE) / Streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Baik, saya siap membantu." }] },
        ...messages
      ]
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (err: any) {
    console.error("Error in AI Chat:", err);
    res.status(500).json({ error: err.message || "Gagal memproses percakapan dengan AI" });
  }
});

// 20. Generate Description for Seller
app.post("/api/ai/generate-description", async (req, res) => {
  const { title, artist, category, medium } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Judul lukisan wajib diisi" });
  }

  try {
    const prompt = `Buatkan deskripsi lukisan yang puitis, profesional, dan menawan untuk dijual di galeri seni premium.
Deskripsi ini harus menjelaskan makna filosofis yang mungkin terkandung di dalamnya.

Detail Lukisan:
Judul: ${title}
Seniman: ${artist || "Anonim"}
Kategori/Aliran: ${category || "Tidak diketahui"}
Medium: ${medium || "Tidak diketahui"}

Berikan hanya paragraf deskripsi tanpa kata pengantar atau penutup. Maksimal 3-4 kalimat panjang.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    const description = response.text?.trim() || "";
    res.json({ description });
  } catch (err) {
    console.error("Error in AI Generate Description:", err);
    res.status(500).json({ error: "Gagal membuat deskripsi dengan AI" });
  }
});

export { app };
export default app;
