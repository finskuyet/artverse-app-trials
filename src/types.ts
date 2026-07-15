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
  premium?: boolean;
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
  receipt: string; // Base64 data or URL
  notes?: string;
  shippingReceipt?: string;
  courier?: string;
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
