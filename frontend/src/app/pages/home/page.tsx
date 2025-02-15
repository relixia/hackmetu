"use client"; // Remove if using older Pages Router
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // Adjust path if needed
import { useRouter } from "next/navigation";     // For Next.js 13; use "next/router" if older

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<"admin" | "personnel" | "unknown">("unknown");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // 1) Check if user is logged in
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // Not logged in: redirect to /login
        router.push("/login");
        return;
      }

      // We do have a logged-in user, so store their email:
      setUserEmail(user.email);

      // 2) See if this email is in Admins
      const { data: adminData, error: adminError } = await supabase
        .from("Admins")
        .select("*")
        .eq("email", user.email)
        .single();

      // If something besides "row not found" went wrong
      if (adminError && adminError.code !== "PGRST116") {
        setError(adminError.message);
        setLoading(false);
        return;
      }

      if (adminData) {
        // We found a match in Admins
        setUserType("admin");
      } else {
        // 3) Otherwise, see if they’re in Personnels
        const { data: personnelData, error: personnelError } = await supabase
          .from("Personnels")
          .select("*")
          .eq("email", user.email)
          .single();

        if (personnelError && personnelError.code !== "PGRST116") {
          setError(personnelError.message);
          setLoading(false);
          return;
        }

        if (personnelData) {
          setUserType("personnel");
        } else {
          // Not found in either table
          setUserType("unknown");
        }
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Home</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4">
            {error}
          </div>
        )}

        <p className="text-center text-gray-800 text-lg mb-3">
          Welcome, <span className="font-semibold">{userEmail}</span>!
        </p>
        
        <p className="text-center text-gray-600">
          Your user type: <strong>{userType}</strong>
        </p>
      </div>
    </div>
  );
}
