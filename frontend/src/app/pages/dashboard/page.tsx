"use client"; 
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<"admin" | "personnel" | "unknown" | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }
      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email);

      const { data: adminData, error: adminError } = await supabase
        .from("Admins")
        .select("*")
        .eq("email", user.email)
        .single();

      if (adminError && adminError.code !== "PGRST116") {
        setError(adminError.message);
        setLoading(false);
        return;
      }

      if (adminData) {
        setUserType("admin");
        setLoading(false);
        return;
      }

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
        setUserType("unknown");
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  // Handle Invite Request (Calls API)
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus("");
    setInviteLink("");
    setError("");

    if (!inviteEmail) {
      setInviteStatus("Enter an email to invite.");
      return;
    }

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInviteStatus(`Error: ${data.error}`);
        return;
      }

      setInviteLink(data.inviteLink);
      setInviteStatus("Invite link generated successfully!");
    } catch (err) {
      console.error("Unexpected error inviting user:", err);
      setInviteStatus("Some unexpected error occurred. Check console.");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-5">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <p className="mt-2 text-gray-600">Logged in as: <span className="font-medium">{userEmail}</span></p>
      <p className="text-gray-600">Type: <span className="font-medium">{userType}</span></p>

      {userType === "admin" && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">Generate Invite Link</h2>
          <form onSubmit={handleInvite} className="mt-3 flex">
            <input
              type="email"
              placeholder="someone@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1 p-2 border rounded-l-md outline-none focus:ring focus:ring-blue-300"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700">
              Generate Link
            </button>
          </form>
          {inviteStatus && <p className="mt-3 text-sm text-gray-600">{inviteStatus}</p>}
          {inviteLink && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-gray-700 text-sm">Invite Link:</p>
              <p className="text-blue-500 break-words">{inviteLink}</p>
              <button
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={() => navigator.clipboard.writeText(inviteLink)}
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      )}

      {userType === "personnel" && (
        <p className="mt-6 text-lg font-semibold text-gray-700">
          Welcome, Personnel!
        </p>
      )}

      {userType === "unknown" && (
        <p className="mt-6 text-lg font-semibold text-red-600">
          You have no role assigned.
        </p>
      )}
    </div>
  );
}
