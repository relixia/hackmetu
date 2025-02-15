"use client";

import Layout from "@/app/components/Layout";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
  name: string;
  surname: string;
  email: string;
  password: string;
  table_id: number;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const storedUserData = sessionStorage.getItem('userData');

    setTimeout(() => {
      if (!token || !storedUserData) {
        // If no token or user data, redirect to login page
        router.push('/pages/login');
      } else {
        // Parse the stored user data and update state
        try {
          const parsedUserData: UserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setLoading(false);
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push('/pages/login');
        }
      }
    }, 1000); // Adding delay for user experience

  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Error loading user data</div>;
  }

  return (
    <Layout>
    </Layout>
  );
}
