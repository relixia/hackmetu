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
import FloorPlan from './FloorPlan';
import ItemMenu from './ItemMenu';
import PersonnelMenu from './PersonelMenu';
import Floor3DAndUsers from './FloorPage';

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
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId= searchParams.get('userId');

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/fetch-floors');
        const floors = response.data;

        if (floors && floors.length > 0) {
          setActiveComponent('Floorplan'); // Default to Floorplan if floors exist
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
    }, [userId]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#303030]">
      {/* 🔹 Fixed Top Bar with Navbar & Profile Button Slightly Lowered */}
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
                <FloorPlan floorId={selectedFloorId} />
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
                <FloorPlan floorId={selectedFloorId} />
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
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default Layout;
