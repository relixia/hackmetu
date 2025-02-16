'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from './Navbar';
import ProfileButton from './ProfileButton';
import ThreeColumnLayout from './ThreeColumnLayout';
import FloorSidebarComponent from './FloorSidebarComponent';
import FloorForm from './FloorForm';
import FloorPlan from './FloorPlan';
import ItemMenu from './ItemMenu';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [floorDimensions, setFloorDimensions] = useState<{ width: number; length: number } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId= searchParams.get('userId');

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/fetch-floors');
        const floors = response.data;

        if (floors && floors.length > 0) {
          setActiveComponent('Floorplan');
          setSelectedFloorId(floors[0].id);
          setFloorDimensions({ width: floors[0].width, length: floors[0].length });
        } else {
          setActiveComponent('FloorForm');
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

  const handleFloorSelect = (id: number, width: number, length: number) => {
    console.log(`Selected floor ID: ${id}, Width: ${width}, Length: ${length}`);
    setSelectedFloorId(id);
    setFloorDimensions({ width, length });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-bold text-gray-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF] px-32 py-6">
      <div className="relative flex justify-between items-center px-2 py-2 bg-[#FBF8EF] rounded-b-lg mx-12">
      <ProfileButton setActiveComponent={setActiveComponent} userId={userId} />
        <Navbar setActiveComponent={setActiveComponent} />
      </div>

      <main className="flex-1 p-16 bg-[#FBF8EF] rounded-t-lg mx-12">
        {activeComponent === 'Floorplan' ? (
          <ThreeColumnLayout 
            leftComponent={<FloorSidebarComponent onSelect={handleFloorSelect} />} 
            centerComponent={
              selectedFloorId && floorDimensions ? (
                <FloorPlan width={floorDimensions.width} length={floorDimensions.length} />
              ) : (
                <div>Select a floor to view the floor plan.</div>
              )
            } 
            rightComponent={<ItemMenu cellSize={40} />} 
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
