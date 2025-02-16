"use client";
import React, { useState } from "react";
import ThreeColumnLayout from "./ThreeColumnLayout";
import FloorColorBar from "./FloorColorBar";
import FloorCapacityView from "./FloorCapacityView";
import Floor3DRenderer from "./Floor3DRenderer";
import FloorUsersList from "./FloorUsersList";

// Same FloorData type as in your Layout
export interface FloorData {
  id: number;
  name: string;
  area: number;
  occupantCount: number;
  capacity: number;
  tableCoordinates?: { x: number; z: number }[];
  users?: string[];
}

interface FloorDataPageProps {
  floors: FloorData[];
}

/**
 * Displays a three-column layout for "Data" mode:
 * Left  => Color bar, capacity, etc.
 * Center => 3D building
 * Right => User list for the selected floor
 */
export default function FloorDataPage({ floors }: FloorDataPageProps) {
  const [selectedFloorId, setSelectedFloorId] = useState<number>(
    floors.length > 0 ? floors[0].id : 0
  );

  // Find the currently selected floor object
  const selectedFloor = floors.find((f) => f.id === selectedFloorId);

  // Column: Left
  const leftColumn = (
    <div className="text-gray-200">
      <h2 className="text-xl font-semibold mb-4">Data Section</h2>
      <FloorColorBar />
      <div className="mt-4">
        <FloorCapacityView floors={floors} />
      </div>
    </div>
  );

  // Column: Center (3D)
  const centerColumn = (
    <Floor3DRenderer
      floors={floors}
      onFloorClick={(floorId) => setSelectedFloorId(floorId)}
    />
  );

  // Column: Right (User List)
  const rightColumn = selectedFloor ? (
    <FloorUsersList
      floorName={selectedFloor.name}
      users={selectedFloor.users ?? []}
    />
  ) : (
    <div className="text-gray-300">Select a floor to see users.</div>
  );

  return (
    <ThreeColumnLayout
      leftComponent={leftColumn}
      centerComponent={centerColumn}
      rightComponent={rightColumn}
    />
  );
}
