-- ==========================================
-- SUPABASE POSTGRESQL SCHEMA FOR ART GALLERY / SELLER PORTAL
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create table: artworks
CREATE TABLE IF NOT EXISTS artworks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    category TEXT DEFAULT 'Lukisan',
    year TEXT,
    size TEXT,
    medium TEXT,
    price NUMERIC NOT NULL,
    status TEXT DEFAULT 'Tersedia',
    description TEXT,
    image TEXT,
    premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table: orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    buyerName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    postalCode TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    totalPrice NUMERIC NOT NULL,
    paymentMethod TEXT,
    status TEXT DEFAULT 'Menunggu Verifikasi',
    receipt TEXT,
    shippingReceipt TEXT,
    courier TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table: messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    text TEXT NOT NULL,
    artworkTitle TEXT,
    replyText TEXT,
    repliedAt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create table: payment_settings
CREATE TABLE IF NOT EXISTS payment_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies allowing full read/write for development & API proxy server
DROP POLICY IF EXISTS "Allow public select on artworks" ON artworks;
CREATE POLICY "Allow public select on artworks" ON artworks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on artworks" ON artworks;
CREATE POLICY "Allow public insert on artworks" ON artworks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on artworks" ON artworks;
CREATE POLICY "Allow public update on artworks" ON artworks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on artworks" ON artworks;
CREATE POLICY "Allow public delete on artworks" ON artworks FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on orders" ON orders;
CREATE POLICY "Allow public select on orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on orders" ON orders;
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on orders" ON orders;
CREATE POLICY "Allow public update on orders" ON orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public select on messages" ON messages;
CREATE POLICY "Allow public select on messages" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on messages" ON messages;
CREATE POLICY "Allow public insert on messages" ON messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on messages" ON messages;
CREATE POLICY "Allow public update on messages" ON messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on messages" ON messages;
CREATE POLICY "Allow public delete on messages" ON messages FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on notifications" ON notifications;
CREATE POLICY "Allow public select on notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on notifications" ON notifications;
CREATE POLICY "Allow public insert on notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on notifications" ON notifications;
CREATE POLICY "Allow public delete on notifications" ON notifications FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on payment_settings" ON payment_settings;
CREATE POLICY "Allow public select on payment_settings" ON payment_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on payment_settings" ON payment_settings;
CREATE POLICY "Allow public insert/update on payment_settings" ON payment_settings FOR ALL USING (true);

-- ==========================================
-- STORAGE POLICIES FOR THE 'artverse' BUCKET
-- A bucket set to "Public" only bypasses access control for reading/
-- downloading files. Uploading, updating, and deleting objects still
-- require explicit RLS policies on storage.objects, or every upload
-- from the app (artwork images, payment receipts, QRIS) will fail and
-- silently fall back to storing images as Base64 text in the database
-- instead of Supabase Storage. Run this AFTER creating the 'artverse'
-- bucket in the Storage dashboard.
-- ==========================================
DROP POLICY IF EXISTS "Allow public insert on artverse bucket" ON storage.objects;
CREATE POLICY "Allow public insert on artverse bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'artverse');

DROP POLICY IF EXISTS "Allow public select on artverse bucket" ON storage.objects;
CREATE POLICY "Allow public select on artverse bucket" ON storage.objects FOR SELECT USING (bucket_id = 'artverse');

DROP POLICY IF EXISTS "Allow public update on artverse bucket" ON storage.objects;
CREATE POLICY "Allow public update on artverse bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'artverse');

DROP POLICY IF EXISTS "Allow public delete on artverse bucket" ON storage.objects;
CREATE POLICY "Allow public delete on artverse bucket" ON storage.objects FOR DELETE USING (bucket_id = 'artverse');

-- ==========================================
-- SEED INITIAL DATA
-- ==========================================

INSERT INTO artworks (id, title, artist, category, year, size, medium, price, status, description, image, premium)
VALUES 
('art-1', 'Langgam Kencana', 'Andini Kusuma', 'Realisme Klasik', '2024', '100 x 140 cm', 'Cat Minyak pada Kanvas', 45000000, 'Tersedia', 'Sebuah lukisan cat minyak sinematik dari penari tradisional Jawa dalam pose dinamis, menangkap kaburnya kain sutra emas. Pencahayaan dramatis dan murung, mengingatkan pada mahakarya Caravaggio.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdY6Vots5I5BDgOwjPGeF7CiV-nYhX0zMvmNkkCbbaPxJSDIDeZZ0a9NTPh5Rl_3C8zyCpX9wjs3KmAuG3-5aNrm7myjdY7ZcAVpGdprn95LevoJek9wtmDDFLf_sX5UtCk98aKCj_q9VYtmOoI0HR87vIJuInu0ZvAc2xK5Yf9mN5dLUhgAV2UFaBhjCjXHhMTXH8-YNzHeJTTfynGF4RUoUimen8CQsZrsadOSIBLuNz7EHrnTkJng', true),
('art-2', 'Keheningan Emas', 'Bastian Salim', 'Abstrak Modern', '2023', '150 x 150 cm', 'Mixed Media & Gold Leaf', 120000000, 'Tersedia', 'Lukisan abstrak minimalis yang menampilkan sapuan arang hitam dan emas cair di atas latar belakang krem bertekstur. Komposisinya asimetris dan seimbang, mencerminkan estetika seni rupa kontemporer.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGOITpWrWW5E_nRhxaK3sN8JBOCrRLpZw6Nu-cZuQBiC0Z5mDk1k8CQc-MNRbO8ffE2jF9bxnrEomoFEeyRVw_PdGlioFfWtFd4QSEF4XCvhbRmKpc2bHufK_UJYVfgjjZenbRdyn8OB6-i3pic9ebV1wAEeyighAXl_k-_8ou9rUgHhUIzsjIYg39RAHlCyYpN7S1GuKTM27rE2wMX9n9gA_RFg2QQWJTwey4ocbT10Zd4sEtB-ToKg', true),
('art-3', 'Fajar di Tengger', 'Surya Wijaya', 'Impressionisme', '2024', '100 x 80 cm', 'Cat Minyak pada Kanvas', 32500000, 'Tersedia', 'Lanskap impresionis Gunung Bromo saat matahari terbit, dengan kabut lavender dan biru yang bersanding dengan jingga api matahari yang bangun. Sapuan pisau palet yang bertekstur menciptakan kedalaman.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTTA_dlUR_8rmne9LX-o-Jc60A8sHigUxuTwLDo3v08C78rdTM1afNQIZtm3qG4tMEo4aCM1fbt9PtzAobC_CcKRyW4ZUDolLCXHS0MbPaPGgoah4gKRzwnUVmEkH918Setv_9AfF6x8Omy8636mfmmZQ_b921fX1GDPfoqKVfC9wvCLfZ4sWJrSP1JAJqdJmIDwizReTnnPi62h07JLj7g8SaIJ3AkV8LPDziuXqWoYgx5Mbc94EO_Q', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_settings (key, value)
VALUES (
    'global', 
    '{
        "bank1Name": "BCA",
        "bank1Number": "123-456-7890",
        "bank1Owner": "Galeri Pratama",
        "bank2Name": "Mandiri",
        "bank2Number": "987-654-3210",
        "bank2Owner": "Galeri Pratama",
        "qrisImage": "https://lh3.googleusercontent.com/aida/AP1WRLvtjN7SIYTNoGyPxtES-aFpY9Ogo35dMBFSz8oAngHSTYPhWB0LsgeQOdporsqBp_Y003JG8r5xqeqYZV2s-ysxV5OLZBretXLrSYwMZEst7UqtpnGHG-1oaW-MoP9l7XA45T1g4I0DRZQevTLCWnhEgla_n7_UYZl1WZZvZPMnmgYbt9H5afXjQeHFDlU_O0liKaVZ4Ge_tZOMU2Yzcu7O-__Xl-7trrjyccQU8OW3XrZaYCwQshs_FZDk",
        "whatsappNumber": "6281234567890"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;


-- ==========================================
-- MIGRATION: Fix camelCase column names for existing Artverse projects
-- ==========================================
-- Why: The original supabase_schema.sql created columns like `buyerName`
-- WITHOUT double quotes. PostgreSQL automatically lowercases unquoted
-- identifiers, so the real column ended up as `buyername` (all lowercase)
-- instead of `buyerName`. The app sends camelCase keys (e.g. "buyerName"),
-- so Supabase/PostgREST can't find a matching column and throws:
--   "Could not find the 'buyerName' column of 'orders' in the schema cache"
--
-- This script renames the existing lowercase columns to their correct
-- camelCase form WITHOUT deleting any data. Safe to run even if some
-- columns were already renamed (each block checks before renaming).
--
-- Run this ONCE in your Supabase SQL Editor, then restart your app.
-- ==========================================

DO $$
BEGIN
  -- orders table
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='buyername') THEN
    ALTER TABLE orders RENAME COLUMN buyername TO "buyerName";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='postalcode') THEN
    ALTER TABLE orders RENAME COLUMN postalcode TO "postalCode";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='totalprice') THEN
    ALTER TABLE orders RENAME COLUMN totalprice TO "totalPrice";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='paymentmethod') THEN
    ALTER TABLE orders RENAME COLUMN paymentmethod TO "paymentMethod";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shippingreceipt') THEN
    ALTER TABLE orders RENAME COLUMN shippingreceipt TO "shippingReceipt";
  END IF;

  -- messages table
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='artworktitle') THEN
    ALTER TABLE messages RENAME COLUMN artworktitle TO "artworkTitle";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='replytext') THEN
    ALTER TABLE messages RENAME COLUMN replytext TO "replyText";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='repliedat') THEN
    ALTER TABLE messages RENAME COLUMN repliedat TO "repliedAt";
  END IF;
END $$;

-- Verify the fix: this should list buyerName, postalCode, totalPrice,
-- paymentMethod, shippingReceipt in mixed case
SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';
