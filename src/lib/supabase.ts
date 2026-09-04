import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ucrhphtrvlsqureiynpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcmhwaHRydmxzcXVyZWl5bnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDM4MjUsImV4cCI6MjEwNDExOTgyNX0.Q5_dowAyMQzhv9-tWLVDyxa2vqrUXAoX_2cEXuFfZdo'
)
