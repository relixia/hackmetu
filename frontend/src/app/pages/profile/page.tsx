'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from "../../supabaseClient"; // Import your supabase client

interface Personnel {
  id: number;
  name: string;
  surname: string;
  table_id: number;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get userId as a string
  const userIdStr = searchParams.get('userId');
  
  // Convert userId to number or handle the case where it is null
  const userId = userIdStr ? parseInt(userIdStr) : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId) {
          setError("Invalid user ID");
          return;
        }

        // Fetch current signed-in user from Supabase
        const { data: user, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("You need to be logged in to view your profile");
          return;
        }

        // Fetch personnel data using the userId
        const { data: personnelData, error: personnelError } = await supabase
          .from("Personnels")
          .select("*")
          .eq("id", userId) // Use the numeric userId
          .single();

        if (personnelError) {
          setError(personnelError.message);
        } else {
          setPersonnel(personnelData);
        }
      } catch (err) {
        setError("Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]); // Add userId as a dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-00">
      <div className="w-full max-w-3xl p-8 bg-white shadow-md rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            {personnel?.name} {personnel?.surname}'s Profile
          </h1>
          <p className="text-gray-500 text-sm">Personal details and information</p>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col items-start space-y-4">
            <div className="flex items-center space-x-2">
              <strong className="text-gray-700">Name:</strong>
              <span className="text-black">{personnel?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <strong className="text-gray-700">Surname:</strong>
              <span className="text-black">{personnel?.surname}</span>
            </div>
            <div className="flex items-center space-x-2">
              <strong className="text-gray-700">Email:</strong>
              <span className="text-black">{personnel?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <strong className="text-gray-700">Table ID:</strong>
              <span className="text-black">{personnel?.table_id}</span>
            </div>
          </div>

          {/* Edit Profile Section */}
          <div className="flex flex-col items-start space-y-4">
            <button
              onClick={() => router.push(`/pages/feedback?personnel_id=${personnel?.id}`)}
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
