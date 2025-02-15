// src/app/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rocfeidnitxzwvoaavsd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvY2ZlaWRuaXR4end2b2FhdnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MDgwMzksImV4cCI6MjA1NTE4NDAzOX0.z8ZZXih19cugJMr52idx23O3mPqrhf3z0ohPSIFK1Eg";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
