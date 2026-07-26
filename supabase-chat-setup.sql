-- ============================================
-- Halo Jurnal - Supabase Setup (Tahap 3: Chat Messages)
-- ============================================

-- 1. Buat Tabel "chat_messages"
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Policy: User dapat melihat pesan chat untuk laporan miliknya atau jika ia pengirimnya
CREATE POLICY "Users can view chat messages for their reports" ON chat_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM laporan WHERE laporan.id = chat_messages.laporan_id AND laporan.user_id = auth.uid()
    )
  );

-- 4. Policy: User terautentikasi dapat mengirim pesan chat untuk laporan miliknya
CREATE POLICY "Users can insert chat messages for their reports" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );
