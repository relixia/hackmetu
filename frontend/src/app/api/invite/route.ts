import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";

// Secure Admin Supabase Client (Only runs on the server)
const supabaseAdmin = createClient(
  "https://rocfeidnitxzwvoaavsd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvY2ZlaWRuaXR4end2b2FhdnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTYwODAzOSwiZXhwIjoyMDU1MTg0MDM5fQ.M-yYK7nxtE5y-vQ5WHEQLPT-OjTbMENpsLDC6c7YaNs" // Secure: Do not expose this in frontend!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("📩 Generating invite for:", email);

    // Generate a signup invite link
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)
    if (error) {
      console.error("🚨 Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("✅ Invite Link Generated:", data.action_link);
    return NextResponse.json({ inviteLink: data.action_link });
  } catch (err) {
    console.error("🔥 Unexpected API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
