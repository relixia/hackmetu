'use client';

import { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import ProfileButton from './ProfileButton';
import ThreeColumnLayout from './ThreeColumnLayout';
import FloorSidebarComponent from './FloorSidebarComponent';
import FloorForm from './FloorForm';
import FloorPlan from './FloorPlan';
import ItemMenu from './ItemMenu';
import PersonnelMenu from './PersonelMenu';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-bold text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#303030]">
      {/* 🔹 Fixed Top Bar with Navbar & Profile Button Slightly Lowered */}
      <div className="fixed top-[20px] left-0 w-full z-50 bg-[#1A1A1A] shadow-md px-16 py-6 flex justify-between items-center border-b border-gray-700 h-[90px]">
        <div className="flex items-center mt-24"> {/* ⬇ Profile Button Moved Down Slightly */}
          <ProfileButton setActiveComponent={setActiveComponent} />
        </div>
        <div className="flex items-center mt-4"> {/* ⬇ Navbar Moved Down Slightly */}
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
        ) : activeComponent === 'FloorForm' ? (
          <FloorForm onSubmit={(floors, totalSquareMeters) => console.log(floors, totalSquareMeters)} />
        ) : activeComponent === 'profile' ? (
          <div className="text-gray-300">Profile Page</div>
        ) : (
          children
        )}
        {activeComponent === 'Staff' ? (
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
  ) : activeComponent === 'FloorForm' ? (
    <FloorForm onSubmit={(floors, totalSquareMeters) => console.log(floors, totalSquareMeters)} />
  ) : activeComponent === 'profile' ? (
    <div>Profile Page</div>
  ) : (
    children
  )}
      </main>
    </div>
  );
};

export default Layout;
