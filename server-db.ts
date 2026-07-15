import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Database Interfaces
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  category: string;
  year: string;
  size: string;
  medium: string;
  price: number;
  status: string; // "Tersedia" | "Terjual" | "Hanya Pameran"
  description: string;
  image: string;
  premium: boolean;
}

export interface OrderItem {
  id: string;
  title: string;
  artist: string;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  buyerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  status: string; // "Menunggu Verifikasi" | "Dibayar" | "Gagal"
  receipt: string;
  shippingReceipt?: string;
  courier?: string;
  notes?: string;
}

export interface Message {
  id: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  text: string;
  artworkTitle?: string;
  replyText?: string;
  repliedAt?: string;
}

export interface Notification {
  id: string;
  date: string;
  title: string;
  message: string;
  type: "order" | "payment" | "message";
}

export interface PaymentSettings {
  bank1Name: string;
  bank1Number: string;
  bank1Owner: string;
  bank2Name: string;
  bank2Number: string;
  bank2Owner: string;
  qrisImage: string;
  whatsappNumber?: string;
}

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const isSupabaseEnabled = 
  process.env.DATABASE_MODE === "supabase" && 
  supabaseUrl && 
  supabaseAnonKey;

export const supabase = isSupabaseEnabled 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to upload base64 images to Supabase Storage bucket ('artverse')
async function uploadImageToSupabaseStorage(base64Data: string, folder: string, filename: string): Promise<string> {
  if (!supabase) return base64Data;
  if (!base64Data || !base64Data.startsWith("data:")) return base64Data;

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Data;

    const contentType = matches[1];
    const base64Buffer = Buffer.from(matches[2], "base64");
    const extension = contentType.split("/")[1] || "png";
    const filePath = `${folder}/${filename}.${extension}`;

    // Upload to 'artverse' bucket. 
    // Note: The bucket 'artverse' must be created in the Supabase Dashboard and set to "Public".
    const { data, error } = await supabase.storage
      .from("artverse")
      .upload(filePath, base64Buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`Supabase Storage upload warning (make sure 'artverse' bucket exists & is public): ${error.message}`);
      return base64Data; // Fallback to Base64 in DB
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("artverse")
      .getPublicUrl(filePath);

    if (publicUrlData && publicUrlData.publicUrl) {
      console.log(`Successfully uploaded image to Supabase Storage: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.warn("Error uploading image to Supabase Storage, using base64 fallback:", err);
  }
  return base64Data;
}

// Local JSON File Database Setup
const DB_FILE = path.join(process.cwd(), "db.json");

const defaultArtworks: Artwork[] = [
  {
    id: "art-1",
    title: "Langgam Kencana",
    artist: "Andini Kusuma",
    category: "Realisme Klasik",
    year: "2024",
    size: "100 x 140 cm",
    medium: "Cat Minyak pada Kanvas",
    price: 45000000,
    status: "Tersedia",
    description: "Sebuah lukisan cat minyak sinematik dari penari tradisional Jawa dalam pose dinamis, menangkap kaburnya kain sutra emas. Pencahayaan dramatis dan murung, mengingatkan pada mahakarya Caravaggio.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdY6Vots5I5BDgOwjPGeF7CiV-nYhX0zMvmNkkCbbaPxJSDIDeZZ0a9NTPh5Rl_3C8zyCpX9wjs3KmAuG3-5aNrm7myjdY7ZcAVpGdprn95LevoJek9wtmDDFLf_sX5UtCk98aKCj_q9VYtmOoI0HR87vIJuInu0ZvAc2xK5Yf9mN5dLUhgAV2UFaBhjCjXHhMTXH8-YNzHeJTTfynGF4RUoUimen8CQsZrsadOSIBLuNz7EHrnTkJng",
    premium: true
  },
  {
    id: "art-2",
    title: "Keheningan Emas",
    artist: "Bastian Salim",
    category: "Abstrak Modern",
    year: "2023",
    size: "150 x 150 cm",
    medium: "Mixed Media & Gold Leaf",
    price: 120000000,
    status: "Tersedia",
    description: "Lukisan abstrak minimalis yang menampilkan sapuan arang hitam dan emas cair di atas latar belakang krem bertekstur. Komposisinya asimetris dan seimbang, mencerminkan estetika seni rupa kontemporer.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGOITpWrWW5E_nRhxaK3sN8JBOCrRLpZw6Nu-cZuQBiC0Z5mDk1k8CQc-MNRbO8ffE2jF9bxnrEomoFEeyRVw_PdGlioFfWtFd4QSEF4XCvhbRmKpc2bHufK_UJYVfgjjZenbRdyn8OB6-i3pic9ebV1wAEeyighAXl_k-_8ou9rUgHhUIzsjIYg39RAHlCyYpN7S1GuKTM27rE2wMX9n9gA_RFg2QQWJTwey4ocbT10Zd4sEtB-ToKg",
    premium: true
  },
  {
    id: "art-3",
    title: "Fajar di Tengger",
    artist: "Surya Wijaya",
    category: "Impressionisme",
    year: "2024",
    size: "100 x 80 cm",
    medium: "Cat Minyak pada Kanvas",
    price: 32500000,
    status: "Tersedia",
    description: "Lanskap impresionis Gunung Bromo saat matahari terbit, dengan kabut lavender dan biru yang bersanding dengan jingga api matahari yang bangun. Sapuan pisau palet yang bertekstur menciptakan kedalaman.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTTA_dlUR_8rmne9LX-o-Jc60A8sHigUxuTwLDo3v08C78rdTM1afNQIZtm3qG4tMEo4aCM1fbt9PtzAobC_CcKRyW4ZUDolLCXHS0MbPaPGgoah4gKRzwnUVmEkH918Setv_9AfF6x8Omy8636mfmmZQ_b921fX1GDPfoqKVfC9wvCLfZ4sWJrSP1JAJqdJmIDwizReTnnPi62h07JLj7g8SaIJ3AkV8LPDziuXqWoYgx5Mbc94EO_Q",
    premium: true
  }
];

const defaultOrders: Order[] = [
  {
    id: "AV-2024-0901",
    date: "2026-07-12T14:20:00.000Z",
    buyerName: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "081234567890",
    address: "Jl. Kencana Raya No. 12, Kebayoran Baru",
    city: "Jakarta Selatan",
    postalCode: "12130",
    items: [
      {
        id: "art-1",
        title: "Langgam Kencana",
        artist: "Andini Kusuma",
        price: 45000000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdY6Vots5I5BDgOwjPGeF7CiV-nYhX0zMvmNkkCbbaPxJSDIDeZZ0a9NTPh5Rl_3C8zyCpX9wjs3KmAuG3-5aNrm7myjdY7ZcAVpGdprn95LevoJek9wtmDDFLf_sX5UtCk98aKCj_q9VYtmOoI0HR87vIJuInu0ZvAc2xK5Yf9mN5dLUhgAV2UFaBhjCjXHhMTXH8-YNzHeJTTfynGF4RUoUimen8CQsZrsadOSIBLuNz7EHrnTkJng"
      }
    ],
    totalPrice: 45000000,
    paymentMethod: "Transfer Bank BCA (No. 123-456-7890)",
    status: "Dibayar",
    receipt: "https://lh3.googleusercontent.com/aida-public/AB6AXuDE0Sj_dWK8HIPE_Sj76JYEr3_G0XcWWm_M2fEYIT-cWqBplqBmE-qo_aIDD2fpfr_cY5s-DKylxSL8v2tP9b8DKeemL-dl3EqaMd_sKxNgofXY9PbKSGNQuycS_M9gYDAZqdLQXrlR4Sq_UAXksVitPZoiYhXrCu7yyhM8ej9bBPhclKIKHJCCTFNfmpwub11nLG6whwRyuoYHRu8OqUY-0Im3x9ckQBYJr9PgWEXzVc1xdhzdgCuFRA"
  }
];

const defaultPaymentSettings: PaymentSettings = {
  bank1Name: "BCA",
  bank1Number: "123-456-7890",
  bank1Owner: "Galeri Pratama",
  bank2Name: "Mandiri",
  bank2Number: "987-654-3210",
  bank2Owner: "Galeri Pratama",
  qrisImage: "https://lh3.googleusercontent.com/aida/AP1WRLvtjN7SIYTNoGyPxtES-aFpY9Ogo35dMBFSz8oAngHSTYPhWB0LsgeQOdporsqBp_Y003JG8r5xqeqYZV2s-ysxV5OLZBretXLrSYwMZEst7UqtpnGHG-1oaW-MoP9l7XA45T1g4I0DRZQevTLCWnhEgla_n7_UYZl1WZZvZPMnmgYbt9H5afXjQeHFDlU_O0liKaVZ4Ge_tZOMU2Yzcu7O-__Xl-7trrjyccQU8OW3XrZaYCwQshs_FZDk",
  whatsappNumber: "6281234567890"
};

// Local JSON Database Operations
function loadLocalDb() {
  if (!fs.existsSync(DB_FILE)) {
    const db = {
      artworks: defaultArtworks,
      orders: defaultOrders,
      messages: [],
      notifications: [],
      paymentSettings: defaultPaymentSettings
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    if (!data.paymentSettings) data.paymentSettings = defaultPaymentSettings;
    return data;
  } catch (err) {
    console.error("Error reading JSON db, using empty fields:", err);
    return {
      artworks: [],
      orders: [],
      messages: [],
      notifications: [],
      paymentSettings: defaultPaymentSettings
    };
  }
}

function saveLocalDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving to JSON db:", err);
  }
}

// Unified Database Repository API
export const dbRepository = {
  isSupabase: () => !!supabase,

  // Artworks
  getArtworks: async (): Promise<Artwork[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Supabase getArtworks error, falling back:", error);
      } else if (data) {
        return data as Artwork[];
      }
    }
    return loadLocalDb().artworks;
  },

  addArtwork: async (artwork: Artwork): Promise<Artwork> => {
    if (supabase) {
      if (artwork.image) {
        artwork.image = await uploadImageToSupabaseStorage(artwork.image, "artworks", artwork.id);
      }
      const { data, error } = await supabase
        .from("artworks")
        .insert([artwork])
        .select()
        .single();
      if (error) {
        console.error("Supabase addArtwork error, falling back to local:", error);
      } else if (data) {
        return data as Artwork;
      }
    }
    const db = loadLocalDb();
    db.artworks.unshift(artwork);
    saveLocalDb(db);
    return artwork;
  },

  updateArtwork: async (id: string, updates: Partial<Artwork>): Promise<Artwork> => {
    if (supabase) {
      if (updates.image) {
        updates.image = await uploadImageToSupabaseStorage(updates.image, "artworks", id);
      }
      const { data, error } = await supabase
        .from("artworks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error("Supabase updateArtwork error:", error);
      } else if (data) {
        return data as Artwork;
      }
    }
    const db = loadLocalDb();
    const idx = db.artworks.findIndex((a: any) => a.id === id);
    if (idx !== -1) {
      db.artworks[idx] = { ...db.artworks[idx], ...updates };
      saveLocalDb(db);
      return db.artworks[idx];
    }
    throw new Error("Artwork not found");
  },

  deleteArtwork: async (id: string): Promise<boolean> => {
    if (supabase) {
      const { data, error } = await supabase.from("artworks").delete().eq("id", id).select();
      if (error) {
        console.error("Supabase deleteArtwork error:", error);
        return false;
      }
      if (!data || data.length === 0) {
        console.error(`Supabase deleteArtwork: no row matched id "${id}" — nothing was deleted (check RLS policy or that the id exists)`);
        return false;
      }
      return true;
    }
    const db = loadLocalDb();
    const len = db.artworks.length;
    db.artworks = db.artworks.filter((a: any) => a.id !== id);
    saveLocalDb(db);
    return db.artworks.length < len;
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("date", { ascending: false });
      if (error) {
        console.error("Supabase getOrders error:", error);
      } else if (data) {
        return data as Order[];
      }
    }
    return loadLocalDb().orders;
  },

  addOrder: async (order: Order): Promise<Order> => {
    if (supabase) {
      if (order.receipt) {
        order.receipt = await uploadImageToSupabaseStorage(order.receipt, "receipts", order.id);
      }
      const { data, error } = await supabase
        .from("orders")
        .insert([order])
        .select()
        .single();
      if (error) {
        console.error("Supabase addOrder error:", error);
      } else if (data) {
        return data as Order;
      }
    }
    const db = loadLocalDb();
    db.orders.unshift(order);
    saveLocalDb(db);
    return order;
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<Order> => {
    if (supabase) {
      if (updates.receipt) {
        updates.receipt = await uploadImageToSupabaseStorage(updates.receipt, "receipts", id);
      }
      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error("Supabase updateOrder error:", error);
      } else if (data) {
        return data as Order;
      }
    }
    const db = loadLocalDb();
    const idx = db.orders.findIndex((o: any) => o.id === id);
    if (idx !== -1) {
      db.orders[idx] = { ...db.orders[idx], ...updates };
      saveLocalDb(db);
      return db.orders[idx];
    }
    throw new Error("Order not found");
  },

  // Messages
  getMessages: async (): Promise<Message[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("date", { ascending: false });
      if (error) {
        console.error("Supabase getMessages error:", error);
      } else if (data) {
        return data as Message[];
      }
    }
    return loadLocalDb().messages || [];
  },

  addMessage: async (msg: Message): Promise<Message> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("messages")
        .insert([msg])
        .select()
        .single();
      if (error) {
        console.error("Supabase addMessage error:", error);
      } else if (data) {
        return data as Message;
      }
    }
    const db = loadLocalDb();
    if (!db.messages) db.messages = [];
    db.messages.unshift(msg);
    saveLocalDb(db);
    return msg;
  },

  updateMessage: async (id: string, updates: Partial<Message>): Promise<Message> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("messages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error("Supabase updateMessage error:", error);
      } else if (data) {
        return data as Message;
      }
    }
    const db = loadLocalDb();
    const idx = db.messages.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      db.messages[idx] = { ...db.messages[idx], ...updates };
      saveLocalDb(db);
      return db.messages[idx];
    }
    throw new Error("Message not found");
  },

  deleteMessage: async (id: string): Promise<boolean> => {
    if (supabase) {
      const { data, error } = await supabase.from("messages").delete().eq("id", id).select();
      if (error) {
        console.error("Supabase deleteMessage error:", error);
        return false;
      }
      return !!data && data.length > 0;
    }
    const db = loadLocalDb();
    const len = db.messages.length;
    db.messages = db.messages.filter((m: any) => m.id !== id);
    saveLocalDb(db);
    return db.messages.length < len;
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("date", { ascending: false });
      if (error) {
        console.error("Supabase getNotifications error:", error);
      } else if (data) {
        return data as Notification[];
      }
    }
    return loadLocalDb().notifications || [];
  },

  addNotification: async (notif: Notification): Promise<Notification> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .insert([notif])
        .select()
        .single();
      if (error) {
        console.error("Supabase addNotification error:", error);
      } else if (data) {
        return data as Notification;
      }
    }
    const db = loadLocalDb();
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift(notif);
    saveLocalDb(db);
    return notif;
  },

  clearNotifications: async (): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from("notifications").delete().neq("id", "");
      if (error) {
        console.error("Supabase clearNotifications error:", error);
        return false;
      }
      return true;
    }
    const db = loadLocalDb();
    db.notifications = [];
    saveLocalDb(db);
    return true;
  },

  // Payment Settings
  getPaymentSettings: async (): Promise<PaymentSettings> => {
    if (supabase) {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("value")
        .eq("key", "global")
        .single();
      if (error) {
        console.error("Supabase getPaymentSettings error, returning defaults:", error);
      } else if (data) {
        return data.value as PaymentSettings;
      }
    }
    return loadLocalDb().paymentSettings;
  },

  updatePaymentSettings: async (settings: PaymentSettings): Promise<PaymentSettings> => {
    if (supabase) {
      if (settings.qrisImage) {
        settings.qrisImage = await uploadImageToSupabaseStorage(settings.qrisImage, "settings", "qris");
      }
      const { data, error } = await supabase
        .from("payment_settings")
        .upsert({ key: "global", value: settings })
        .select()
        .single();
      if (error) {
        console.error("Supabase updatePaymentSettings error:", error);
      } else if (data) {
        return data.value as PaymentSettings;
      }
    }
    const db = loadLocalDb();
    db.paymentSettings = settings;
    saveLocalDb(db);
    return settings;
  }
};
