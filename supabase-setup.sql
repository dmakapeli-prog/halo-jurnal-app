-- ============================================
-- Halo Jurnal - Supabase Setup (Tahap 1)
-- ============================================
-- Tabel "profiles" SUDAH ADA di Supabase.
-- File ini hanya membuat storage bucket dan policy-nya.
-- ============================================

-- 1. Buat Storage Bucket "ktp-photos" (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ktp-photos', 'ktp-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies: user hanya bisa upload/akses file KTP miliknya sendiri
-- Folder path: {user_id}/filename

-- Policy: User bisa upload KTP ke folder miliknya
CREATE POLICY "Users can upload own KTP"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ktp-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: User bisa melihat KTP miliknya
CREATE POLICY "Users can view own KTP"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ktp-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: User bisa update KTP miliknya
CREATE POLICY "Users can update own KTP"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ktp-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: User bisa delete KTP miliknya
CREATE POLICY "Users can delete own KTP"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ktp-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
