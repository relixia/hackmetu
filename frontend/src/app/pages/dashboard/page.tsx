"use client"; 
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";

interface Feedback {
  id: number;
  title: string;
  content: string;
  personnel_id: number;
}

interface Personnel {
  name: string;
  surname: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // State for feedbacks
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [personnelData, setPersonnelData] = useState<Map<number, Personnel>>(new Map());
  const [feedbackLoading, setFeedbackLoading] = useState(true);

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
      setLoading(false);
    };

    checkUser();
  }, [router]);

  // Fetch feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch("http://localhost:8000/fetch-feedbacks");
        const data = await response.json();
        setFeedbacks(data);

        // Fetch personnel data for each feedback
        const personnelPromises = data.map(async (feedback: Feedback) => {
          const personnelResponse = await fetch(`http://localhost:8000/fetch-personnel/${feedback.personnel_id}`);
          const personnelData = await personnelResponse.json();
          return { personnelId: feedback.personnel_id, personnel: personnelData };
        });

        const personnelDataList = await Promise.all(personnelPromises);

        const personnelMap = new Map<number, Personnel>();
        personnelDataList.forEach((item) => {
          personnelMap.set(item.personnelId, item.personnel);
        });

        setPersonnelData(personnelMap);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

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

  const handleDeleteFeedback = async (feedbackId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/delete-feedback/${feedbackId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      // Remove the deleted feedback from the state
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.filter((feedback) => feedback.id !== feedbackId)
      );
      alert("Feedback is confirmed");
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Error deleting feedback");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-5">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <p className="mt-2 text-gray-600">Logged in as: <span className="font-medium">{userEmail}</span></p>

      {/* Feedbacks Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700">Feedbacks</h2>

        {feedbackLoading ? (
          <p className="text-gray-500 mt-3">Loading feedbacks...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-gray-500 mt-3">No feedback available.</p>
        ) : (
          <div className="mt-3 space-y-4 max-h-96 overflow-y-auto">
            {feedbacks.map((feedback) => {
              const personnel = personnelData.get(feedback.personnel_id);

              return (
                <div key={feedback.id} className="p-4 bg-gray-100 rounded-lg shadow-sm flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{feedback.title}</h3>
                    <p className="text-gray-600">{feedback.content}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Personnel: {personnel ? `${personnel.name} ${personnel.surname}` : "Loading..."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    className="ml-4 text-green-600 hover:text-green-800"
                  >
                    ✔️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Invite Link Section */}
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
    </div>
  );
}
