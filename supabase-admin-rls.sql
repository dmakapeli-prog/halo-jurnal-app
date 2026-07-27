-- ==============================================================================
-- SQL MIGRATION: RLS POLICIES UNTUK ADMIN & PETUGAS HASIL REVIEW
-- Platform Halo Jurnal (Akses Data Sensitif KTP & Identitas Pelapor)
-- ==============================================================================

-- 1. Helper Function: is_admin()
-- Memeriksa apakah user yang sedang login memiliki role 'admin' atau 'superadmin' pada tabel profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. RLS Policies pada tabel public.profiles
-- Mengizinkan admin melihat seluruh profil (termasuk KTP), sementara warga biasa hanya bisa melihat profilnya sendiri
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR public.is_admin()
)
WITH CHECK (
  auth.uid() = id OR public.is_admin()
);


-- 3. RLS Policies pada tabel public.laporan
-- Admin dapat melihat dan memperbarui seluruh laporan (publik maupun privat)
ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View reports policy" ON public.laporan;
CREATE POLICY "View reports policy"
ON public.laporan FOR SELECT
TO authenticated
USING (
  is_public = true OR user_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "Update reports policy" ON public.laporan;
CREATE POLICY "Update reports policy"
ON public.laporan FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR public.is_admin()
)
WITH CHECK (
  user_id = auth.uid() OR public.is_admin()
);


-- 4. RLS Policies pada tabel public.chat_messages
-- Admin dapat membaca dan mengirim pesan chat ke pelapor manapun
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View chat messages policy" ON public.chat_messages;
CREATE POLICY "View chat messages policy"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() OR public.is_admin() OR EXISTS (
    SELECT 1 FROM public.laporan WHERE id = laporan_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Insert chat messages policy" ON public.chat_messages;
CREATE POLICY "Insert chat messages policy"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.laporan WHERE id = laporan_id AND user_id = auth.uid()
    )
  )
);


-- 5. RLS Policies pada tabel public.status_log
-- Admin dapat mencatat riwayat perubahan status laporan
ALTER TABLE public.status_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins insert status log" ON public.status_log;
CREATE POLICY "Admins insert status log"
ON public.status_log FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
);

DROP POLICY IF EXISTS "View status log policy" ON public.status_log;
CREATE POLICY "View status log policy"
ON public.status_log FOR SELECT
TO authenticated
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.laporan WHERE id = laporan_id AND (is_public = true OR user_id = auth.uid())
  )
);
