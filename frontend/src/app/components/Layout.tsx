'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from "../supabaseClient"; 
import axios from 'axios';
import Navbar from './Navbar';
import ProfileButton from './ProfileButton';
import ThreeColumnLayout from './ThreeColumnLayout';
import FloorSidebarComponent from './FloorSidebarComponent';
import FloorForm from './FloorForm';
import FloorPlan1 from './FloorPlan1';
import FloorPlan2 from './FloorPlan2';
import ItemMenu from './ItemMenu';
import PersonnelMenu from './PersonelMenu';
import Floor3DAndUsers from './FloorPage';
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export interface FloorData {
  id: number;
  name: string;
  area: number;
  occupantCount: number;
  capacity: number;
  tableCoordinates?: { x: number; z: number }[];
  users?: string[];
}

const Layout = ({ children }: LayoutProps) => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [floorsData, setFloorsData] = useState<FloorData[]>([]);
  const [personnel, setPersonnel] = useState<any>(null); // Adjust type if needed.
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/fetch-floors');
        const floors = response.data;

        if (floors && floors.length > 0) {
          setActiveComponent('Data'); // Default to Floorplan if floors exist
          setSelectedFloorId(floors[0].id);
        } else {
          setActiveComponent('FloorForm'); // Otherwise, show FloorForm
        }
      } catch (error) {
        console.error('Error fetching floors:', error);
        setActiveComponent('FloorForm');
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, []);

  const handleFloorSelect = (id: number) => {
    console.log(`Selected floor ID: ${id}`);
    setSelectedFloorId(id);
  };

  useEffect(() => {
    fetch("http://localhost:8000/fetch-floors-with-personnels/14")
      .then((res) => res.json())
      .then((data: FloorData[]) => {
        setFloorsData(data);
      })
      .catch((err) => console.error("Error fetching floors:", err));
  }, []);

  

  useEffect(() => {
    if (activeComponent === 'Editor3D') {
      router.push('/pages/3dview');
    }
  }, [activeComponent, router]);

  useEffect(() => {
    if (activeComponent === '360 View') {
      router.push('/pages/360view');
    }
  }, [activeComponent, router]);

    useEffect(() => {
      if (activeComponent === 'Dashboard') {
        router.push('/pages/dashboard');
      }
    }, [activeComponent, router]);

    useEffect(() => {
      if (activeComponent === 'office-model') {
        router.push('/pages/office-model');
      }
    }, [activeComponent, router]);

    useEffect(() => {
      if (activeComponent === 'office-json') {
        router.push('/pages/office-json');
      }
    }, [activeComponent, router]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-bold text-gray-300">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 animated-bg" />

      <motion.div 
        className="min-h-screen flex flex-col relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        {/* 🔹 Fixed Top Bar with Navbar & Profile Button */}
        <div className="fixed top-[20px] left-0 w-full z-50 bg-[#1A1A1A] shadow-md px-16 py-6 flex justify-between items-center border-b border-gray-700 h-[90px]">
          <div className="flex items-center mt-24">
            <ProfileButton setActiveComponent={setActiveComponent} />
          </div>
          <div className="flex items-center mt-4">
            <Navbar setActiveComponent={setActiveComponent} />
          </div>
        </div>

      {/* 🔹 Adjust Main Content with Proper Top Margin */}
      <main className="flex-1 mx-auto mt-[120px] px-8 pb-8 overflow-auto">
        {activeComponent === 'Floorplan' ? (
          <ThreeColumnLayout 
            leftComponent={<FloorSidebarComponent onSelect={handleFloorSelect} />} 
            centerComponent={
              selectedFloorId ? (
                <FloorPlan1 floorId={selectedFloorId} />
              ) : (
                <div className="text-gray-400 text-center">Select a floor to view the floor plan.</div>
              )
            } 
            rightComponent={<ItemMenu cellSize={40} />} 
          />
        ) : activeComponent === 'Staff' ? (
          <ThreeColumnLayout 
            leftComponent={<FloorSidebarComponent onSelect={handleFloorSelect} />} 
            centerComponent={
              selectedFloorId ? (
                <FloorPlan2 floorId={selectedFloorId} />
              ) : (
                <div>Select a floor to view the floor plan.</div>
              )
            } 
            rightComponent={<PersonnelMenu cellSize={40} />} 
          />
        ) : activeComponent === 'Data' ? (
          <Floor3DAndUsers floors={floorsData} /> // ✅ Data Section Added Here
        ) : activeComponent === 'FloorForm' ? (
          <FloorForm onSubmit={(floors, totalSquareMeters) => console.log(floors, totalSquareMeters)} />
        ) : activeComponent === 'profile' ? (
          <div className="text-center text-gray-400">Profile Page</div>
        ) : (
          children
        )}
      </main>
    </motion.div>

      {/* CSS for the Animated Background */}
      <style jsx>{`
        .animated-bg {
          background: linear-gradient(-45deg, #0a0a0a, #1a1a1a, #303030, #1a1a1a);
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
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

export default Layout;