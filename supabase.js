import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Replace these with your Supabase project info
const SUPABASE_URL = "https://znngixswuvsumxycohcj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubmdpeHN3dXZzdW14eWNvaGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzI2MjUsImV4cCI6MjA4MjUwODYyNX0.QR4ZI_grVqueuo_KucdvypzbpTDYx4stAHnep6Hx2i0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);