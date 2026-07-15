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
