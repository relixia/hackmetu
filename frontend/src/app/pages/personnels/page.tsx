"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import ThreeColumnLayout from "@/app/components/ThreeColumnLayoutPerson";
import LeftPanel from "@/app/components/LeftPanel";
import RightPanel from "@/app/components/RightPanel";
import Building3DView from "@/app/components/Building3DView";
import SingleFloor3DView from "@/app/components/SingleFloor3DView";

// Adjust these with your actual project details
const supabaseUrl = "https://rocfeidnitxzwvoaavsd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvY2ZlaWRuaXR4end2b2FhdnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTYwODAzOSwiZXhwIjoyMDU1MTg0MDM5fQ.M-yYK7nxtE5y-vQ5WHEQLPT-OjTbMENpsLDC6c7YaNs";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MyPage() {
  const router = useRouter();

  // --------------------------------------------------
  // 1. State
  // --------------------------------------------------
  const [authUser, setAuthUser] = useState<any>(null);       // from supabase.auth
  const [personnel, setPersonnel] = useState<any>(null);      // row from Personnels
  const [floorData, setFloorData] = useState<any>(null);      // row from Floors
  const [buildingData, setBuildingData] = useState<any>(null);
  const [allFloors, setAllFloors] = useState<any[]>([]);      // for the 3D building
  const [showSingleFloor, setShowSingleFloor] = useState(false);

  // --------------------------------------------------
  // 2. On mount, check user from Supabase
  // --------------------------------------------------
  useEffect(() => {
    checkUser();
    console.log("sndkj")
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Supabase Auth Error:", error);
      return;
    }
    if (!user) {
      // If not logged in, redirect or handle as needed
      router.push("/login");
      return;
    }

    setAuthUser(user);
    // Next, fetch the Personnel row
    fetchPersonnelByEmail(user.email);
  };

  // --------------------------------------------------
  // 3. fetchPersonnelByEmail
  // --------------------------------------------------
  const fetchPersonnelByEmail = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("Personnels")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        console.error("Error fetching personnel:", error);
        return;
      }

      setPersonnel(data);

      // Then fetch floor -> building -> all floors
      if (data.floor_id) {
        fetchFloor(data.floor_id);
      }
    } catch (err) {
      console.error("fetchPersonnelByEmail error:", err);
    }
  };

  // --------------------------------------------------
  // 4. fetchFloor
  // --------------------------------------------------
  const fetchFloor = async (floor_id: number) => {
    try {
      const { data, error } = await supabase
        .from("Floors")
        .select("*")
        .eq("id", floor_id)
        .single();

      if (error || !data) {
        console.error("Error fetching floor:", error);
        return;
      }
      setFloorData(data);

      // Next: fetch building
      if (data.building_id) {
        fetchBuilding(data.building_id);
        fetchAllFloors(data.building_id);
      }
    } catch (err) {
      console.error("fetchFloor error:", err);
    }
  };

  // --------------------------------------------------
  // 5. fetchBuilding
  // --------------------------------------------------
  const fetchBuilding = async (building_id: number) => {
    try {
      const { data, error } = await supabase
        .from("Buildings")
        .select("*")
        .eq("id", building_id)
        .single();

      if (error || !data) {
        console.error("Error fetching building:", error);
        return;
      }
      setBuildingData(data);
    } catch (err) {
      console.error("fetchBuilding error:", err);
    }
  };

  // --------------------------------------------------
  // 6. fetchAllFloors
  // --------------------------------------------------
  const fetchAllFloors = async (building_id: number) => {
    try {
      const { data, error } = await supabase
        .from("Floors")
        .select("*")
        .eq("building_id", building_id);

      if (error || !data) {
        console.error("Error fetching floors:", error);
        return;
      }
      setAllFloors(data);
    } catch (err) {
      console.error("fetchAllFloors error:", err);
    }
  };

  // --------------------------------------------------
  // 7. onFloorClick
  //    Only allow user to click on their own floor
  // --------------------------------------------------
  const handleFloorClick = (clickedFloorId: number) => {
    if (!personnel || !floorData) return;
    if (clickedFloorId !== floorData.id) {
      // do nothing if user tries to click other floors
      return;
    }
    // if user clicked their own floor, show single-floor view
    setShowSingleFloor(true);
  };

  // --------------------------------------------------
  // 8. Render the 3-column layout
  // --------------------------------------------------
  // Left
  const leftContent = (
    <LeftPanel
      personnel={personnel}
      floorData={floorData}
      buildingData={buildingData}
    />
  );

  // Center
  let centerContent;
  if (!showSingleFloor) {
    // Show entire building
    centerContent = (
      <Building3DView
        floors={allFloors}
        userFloorId={floorData?.id}
        onFloorClick={handleFloorClick}
      />
    );
  } else {
    // Show single-floor
    centerContent = (
      <SingleFloor3DView
        floorData={floorData}
        personnel={personnel}
      />
    );
  }

  // Right
  const rightContent = (
    <RightPanel personnelId={personnel?.id} />
  );

  return (
    <ThreeColumnLayout
      left={leftContent}
      center={centerContent}
      right={rightContent}
    />
  );
}
