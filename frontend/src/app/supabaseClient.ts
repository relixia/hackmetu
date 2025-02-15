// src/app/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rocfeidnitxzwvoaavsd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvY2ZlaWRuaXR4end2b2FhdnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTYwODAzOSwiZXhwIjoyMDU1MTg0MDM5fQ.M-yYK7nxtE5y-vQ5WHEQLPT-OjTbMENpsLDC6c7YaNs";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
