// pages/login.tsx
"use client";
import React, { useState } from "react";
import { supabase } from "../../supabaseClient"; // Adjust path if needed
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

      // 1) Check if user is an Admin
      console.log('Querying "Admins" table...');
      const { data: adminData, error: adminSelectError } =
        await supabase
          .from("Admins")
          .select("*")
          .eq("email", email)
          .single()
          ;
  
      if (adminSelectError && adminSelectError.code !== "PGRST116") {
        console.error("Admin selection error:", adminSelectError);
        setError(adminSelectError.message);
        return;
      }

      let userType: "admin" | "personnel" | null = null;

      if (adminData) {
        userType = "admin";
        console.log("User is an Admin:", adminData);
        const userId = adminData?.id;
        router.push(`/pages/home?userId=${userId}`);
      } else {
        // 2) If not found in Admins, check in Personnels
        console.log('Not found in "Admins"; querying "Personnels" table...');
        const { data: personnelData, error: personnelSelectError } =
          await supabase
            .from("Personnels")
            .select("*")
            .eq("email", email)
            .single()
            ;
  
        if (personnelSelectError && personnelSelectError.code !== "PGRST116") {
          console.error("Personnel selection error:", personnelSelectError);
          setError(personnelSelectError.message);
          return;
        }

        if (!personnelData) {
          console.warn("No matching row found in either table.");
        } else {
          userType = "personnel";
          console.log("User is a Personnel:", personnelData);
        }
        console.log("User type determined as:", userType);
  
      // 3) Redirect (or do anything else) after figuring out user type
      console.log("Login process done. Redirecting to /home...");
      const userId = personnelData?.id;
      router.push(`/pages/personnels?userId=${userId}`);
      }
    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 animated-bg" />

      {/* Main Container with Fade-In */}
      <motion.div
        className="flex items-center justify-center min-h-screen relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="relative z-10 w-full max-w-sm p-8 bg-[rgba(0,0,0,0.8)] border border-[#00e6ff] rounded-lg shadow-lg">
          <motion.h1
            className="text-2xl font-semibold text-center text-[#00e6ff] mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Login
          </motion.h1>

          {error && (
            <motion.div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span>{error}</span>
            </motion.div>
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
                         focus:border-transparent text-black"
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
                         focus:border-transparent text-black"
              required
            />
          </div>

            <motion.button
              type="submit"
              className="w-full py-2 px-4 bg-[rgba(0,0,0,0.8)] text-[#00e6ff] font-semibold rounded-lg border-2 border-[#00e6ff] uppercase tracking-wide focus:outline-none"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,230,255,0.8)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Login
            </motion.button>
          </form>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <a href="/pages/register" className="text-[#00e6ff] hover:underline">
                Sign up
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* CSS for the Animated Background */}
      <style jsx>{`
        .animated-bg {
          background: linear-gradient(-45deg, #000, #1a1a1a, #0d0d0d, #121212);
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
          z-index: -1;
        }
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default LoginPage;