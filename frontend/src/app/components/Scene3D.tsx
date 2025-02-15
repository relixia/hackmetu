"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Floor3D from "./Floor3D";
import Chair3D from "./Chair3D";

interface FloorData {
  id: number;
  name: string;
  width: number;  // in meters
  height: number; // in meters
}

interface PlacedObject {
  id: number;
  type: string;
  position: [number, number, number];
}

interface Scene3DProps {
  floor: FloorData;
  objects: PlacedObject[];
  onPlaceObject: (position: [number, number, number]) => void;
}

export default function Scene3D({ floor, objects, onPlaceObject }: Scene3DProps) {
  // When user clicks on the floor, place the object
  // We'll pass this down to the Floor3D component
  const handleFloorClick = (x: number, z: number) => {
    // y = 0 for floor level
    onPlaceObject([x, 0, z]);
  };

  return (
    <Canvas
      style={{
        width: "100%",
        height: "100%",
        background: "#C9E6F0", // light background for the canvas
      }}
      camera={{ position: [0, 10, 15], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
      {/* Floor */}
      <Floor3D
        width={floor.width}
        height={floor.height}
        onFloorClick={handleFloorClick}
      />
      {/* Placed objects */}
      {objects.map((obj) => {
        if (obj.type === "chair") {
          return <Chair3D key={obj.id} position={obj.position} />;
        }
        if (obj.type === "table") {
          // You could create a Table3D component or reuse Chair3D with different geometry
          return (
            <Chair3D
              key={obj.id}
              position={obj.position}
              color="#78B3CE" // example color difference
              scale={[1.5, 1.5, 1.5]}
            />
          );
        }
        return null;
      })}
    </Canvas>
  );
}
