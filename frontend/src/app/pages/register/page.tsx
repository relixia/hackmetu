// pages/register.tsx
"use client"; // If Next.js 13 App Router; remove if older pages router
import React, { useState } from "react";
import { supabase } from "../../supabaseClient"; 
import { useRouter } from "next/navigation"; // For Next 13; use "next/router" if older

const RegisterPage = () => {
  const router = useRouter();

  // Form fields for Personnels table
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name || !surname  || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      console.log("Attempting signUp with Supabase Auth...");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Sign-up error:", signUpError);
        setError(signUpError.message);
        return;
      }
      console.log("Sign-up successful:", signUpData);

      // Now insert a row into the "Personnels" table with the extra fields
      console.log("Inserting row into Personnels table...");
      const { error: insertError } = await supabase
        .from("Personnels") // Must match your actual table name/casing
        .insert({
          name,
          surname,
          email,
          password, // not recommended to store in plain text
        });

      if (insertError) {
        console.error("Error inserting into Personnels:", insertError);
        setError(insertError.message);
        return;
      }

      console.log("Personnels row created successfully!");

      // Redirect to /pages/login (or /login)
      console.log("Redirecting to /pages/login...");
      router.push("/pages/login");
    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Register
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
              required
            />
          </div>

          {/* Surname */}
          <div className="mb-4">
            <label htmlFor="surname" className="block text-gray-700 font-medium mb-2">
              Surname
            </label>
            <input
              type="text"
              id="surname"
              placeholder="Enter your surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
              required
            />
          </div>


          {/* Email */}
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

          {/* Password */}
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold
                       rounded-lg hover:bg-blue-600 focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
          >
            Sign up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/pages/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;