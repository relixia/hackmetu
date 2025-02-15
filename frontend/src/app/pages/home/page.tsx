// pages/home.tsx
"use client"; // If Next.js 13 App Router; remove if older pages router
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";  // Adjust path if needed
import { useRouter } from "next/navigation";   // For Next.js 13; "next/router" if older

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        // Not logged in, go back to /login
        router.push("/login");
        return;
      }

      // If we have a user, save their email
      setUserEmail(data.user.email);
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
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Home
        </h1>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4">
            {error}
          </div>
        )}
        <p className="text-center text-gray-800 text-lg">
          Welcome, <span className="font-semibold">{userEmail}</span>!
        </p>
      </div>
    </div>
  );
}