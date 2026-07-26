-- Script SQL untuk Otomatisasi dukungan_count di Supabase via Trigger & Function

-- 1. Buat Function dengan SECURITY DEFINER agar bypass RLS pada tabel laporan
CREATE OR REPLACE FUNCTION update_dukungan_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.laporan
    SET dukungan_count = COALESCE(dukungan_count, 0) + 1
    WHERE id = NEW.laporan_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.laporan
    SET dukungan_count = GREATEST(COALESCE(dukungan_count, 0) - 1, 0)
    WHERE id = OLD.laporan_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Pasang Trigger pada tabel public.dukungan
DROP TRIGGER IF EXISTS trigger_update_dukungan_count ON public.dukungan;

CREATE TRIGGER trigger_update_dukungan_count
AFTER INSERT OR DELETE ON public.dukungan
FOR EACH ROW
EXECUTE FUNCTION update_dukungan_count();
