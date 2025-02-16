"use client";

import Layout from "@/app/components/Layout";
import { useRouter, useSearchParams } from 'next/navigation';


export default function HomePage() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const userId= searchParams.get('userId');

  return (
    <Layout >
      
    </Layout>
  );
}
