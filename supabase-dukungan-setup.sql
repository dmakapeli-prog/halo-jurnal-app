-- Enable RLS for dukungan table
ALTER TABLE public.dukungan ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated and anonymous users
CREATE POLICY "Allow read dukungan for all" 
ON public.dukungan FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own dukungan
CREATE POLICY "Allow insert dukungan for authenticated users" 
ON public.dukungan FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Optional: Allow update dukungan_count on laporan table for authenticated users
CREATE POLICY "Allow update dukungan_count on laporan" 
ON public.laporan FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);
