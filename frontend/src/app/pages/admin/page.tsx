"use client"; // If using Next.js 13 App Router
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // Adjust path as needed
import { useRouter } from "next/navigation";   // or "next/router" if using older pages router



const DashboardPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<"admin" | "personnel" | "unknown" | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      // 1) Check if user is logged in
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        // Some error fetching user session
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        // Not logged in: redirect to /login
        router.push("/login");
        return;
      }

      // We do have a logged-in user, so store their email
      setUserEmail(user.email);

      // 2) See if this email is in Admins
      const { data: adminData, error: adminError } = await supabase
        .from("Admins")
        .select("*")
        .eq("email", user.email)
        .single();

      // If something besides "row not found" (PGRST116) went wrong
      if (adminError && adminError.code !== "PGRST116") {
        setError(adminError.message);
        setLoading(false);
        return;
      }

      if (adminData) {
        // We found a match in Admins
        setUserType("admin");
        setLoading(false);
        return;
      }

      // 3) Otherwise, check if they’re in Personnels
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

      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  // At this point, we have a userEmail and userType
  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {userEmail}</p>
      <p>Type: {userType}</p>
      {userType === "admin" && <p>Welcome, admin!</p>}
      {userType === "personnel" && <p>Welcome, personnel!</p>}
      {userType === "unknown" && <p>You have no role assigned.</p>}
    </div>
  );
};

export default DashboardPage;
