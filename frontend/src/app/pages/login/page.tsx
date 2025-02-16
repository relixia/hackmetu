// pages/login.tsx
"use client"; // If using Next.js 13 App Router; remove if older (pages) router
import React, { useState } from "react";
import { supabase } from "../../supabaseClient"; // Adjust path if needed
import { useRouter } from "next/navigation";     // For Next.js 13; use "next/router" if older

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      console.log("Attempting signInWithPassword...");
      const { data: signInData, error: signInError } = 
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        console.error("Sign-in error:", signInError);
        setError(signInError.message);
        return;
      }

      console.log("Sign-in successful:", signInData);

      console.log('Querying "Personnels" table...');
      const { data: personnelData, error: personnelSelectError } =
        await supabase
          .from("Personnels")
          .select("*")
          .eq("email", email)
          .single();

      if (personnelSelectError && personnelSelectError.code !== "PGRST116") {
        console.error("Selection error:", personnelSelectError);
        setError(personnelSelectError.message);
        return;
      }

      if (!personnelData) {
        console.warn("No matching row found, optionally create one if needed.");
      } else {
        console.log("Row found:", personnelData);
      }

      const userId = personnelData?.id;
      // <--- Only addition: navigate to /home on success
      console.log("Login process done. Redirecting to /home...");
      router.push(`/pages/home?userId=${userId}`);  // Navigate to /home/<userId>

    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold
                       rounded-lg hover:bg-blue-600 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/pages/register" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;