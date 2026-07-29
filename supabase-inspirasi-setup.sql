-- ============================================================
-- Tambah nilai 'inspirasi' ke kolom jenis pada tabel laporan
-- ============================================================
-- 
-- LANGKAH 1: Cek apakah ada CHECK constraint pada kolom jenis:
-- 
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.laporan'::regclass
--   AND contype = 'c';
--
-- Jika ADA constraint, jalankan Langkah 2 & 3.
-- Jika TIDAK ADA constraint (kolom jenis bertipe text biasa),
-- maka TIDAK PERLU menjalankan apapun — kode sudah siap.
-- ============================================================

-- LANGKAH 2: Drop constraint yang ada (sesuaikan nama constraint!)
ALTER TABLE public.laporan 
DROP CONSTRAINT IF EXISTS laporan_jenis_check;

-- LANGKAH 3: Re-create constraint dengan nilai baru
ALTER TABLE public.laporan 
ADD CONSTRAINT laporan_jenis_check 
CHECK (jenis IN ('pengaduan', 'aspirasi', 'informasi', 'inspirasi'));
