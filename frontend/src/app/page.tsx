"use client";

import React, { useState } from "react";
import floorsData from "./data/floors.json";
import Sidebar from "./components/Sidebar";
import Scene3D from "./components/Scene3D";

export default function HomePage() {
  const floor = floorsData.floors[0]; // { id: 1, name: "Main Floor", width: 10, height: 8 }

  // The currently selected item from the sidebar. Could be "chair", "table", etc.
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  // The list of placed objects in the 3D scene
  // Each object might have { id, type, position: [x,y,z] } 
  const [objects, setObjects] = useState<
    { id: number; type: string; position: [number, number, number] }[]
  >([]);

  // Callback when user clicks the floor to place an object
  const handlePlaceObject = (position: [number, number, number]) => {
    if (selectedObject) {
      setObjects((prev) => [
        ...prev,
        {
          id: Date.now(), // quick unique ID
          type: selectedObject,
          position,
        },
      ]);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        backgroundColor: "#FBF8EF", // from your palette
      }}
    >
      <Sidebar
        style={{
          width: "20%",
          backgroundColor: "#78B3CE", // primary color
          padding: "1rem",
        }}
        onSelectObject={(objName) => setSelectedObject(objName)}
      />

      {/* The 3D scene */}
      <div style={{ flex: 1, position: "relative" }}>
        <Scene3D
          floor={floor}
          objects={objects}
          onPlaceObject={handlePlaceObject}
        />
      </div>
    </main>
  );
}
