// pages/office-model.tsx
"use client";

import React, { useState, ChangeEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";

// Extend the layout data structure to include additional zones.
interface OfficeLayout {
  office: {
    walls: { start: { x: number; y: number }; end: { x: number; y: number } }[];
    desks: { id: number; position: { x: number; y: number } }[];
    kitchen?: { start: { x: number; y: number }; end: { x: number; y: number } };
    wc?: { start: { x: number; y: number }; end: { x: number; y: number } };
    hallway?: { start: { x: number; y: number }; end: { x: number; y: number } };
    dimensions?: { width: number; length: number };
  };
}

// Component that builds the 3D scene based on the layout data
function Office3D({ layout }: { layout: OfficeLayout }) {
  return (
    <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, 4]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Walls */}
      {layout.office?.walls.map((wall, index) => {
        // Calculate the wall's length and angle
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const centerX = (wall.start.x + wall.end.x) / 2;
        const centerZ = (wall.start.y + wall.end.y) / 2;
        const angle = Math.atan2(dy, dx);

        return (
          <mesh
            key={index}
            position={[centerX, 1.5, centerZ]}
            rotation={[0, -angle, 0]}
          >
            {/* Wall dimensions: length, height, thickness */}
            <boxGeometry args={[length, 3, 0.2]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        );
      })}

      {/* Desks */}
      {layout.office?.desks.map((desk) => (
        <mesh
          key={desk.id}
          position={[desk.position.x, 0.5, desk.position.y]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#00e6ff"
            emissive="#00e6ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Kitchen Zone */}
      {layout.office?.kitchen && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            (layout.office.kitchen.start.x + layout.office.kitchen.end.x) / 2,
            0.01,
            (layout.office.kitchen.start.y + layout.office.kitchen.end.y) / 2,
          ]}
        >
          <planeGeometry
            args={[
              layout.office.kitchen.end.x - layout.office.kitchen.start.x,
              layout.office.kitchen.end.y - layout.office.kitchen.start.y,
            ]}
          />
          <meshStandardMaterial color="#ff7f50" transparent opacity={0.7} />
        </mesh>
      )}

      {/* WC Zone */}
      {layout.office?.wc && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            (layout.office.wc.start.x + layout.office.wc.end.x) / 2,
            0.01,
            (layout.office.wc.start.y + layout.office.wc.end.y) / 2,
          ]}
        >
          <planeGeometry
            args={[
              layout.office.wc.end.x - layout.office.wc.start.x,
              layout.office.wc.end.y - layout.office.wc.start.y,
            ]}
          />
          <meshStandardMaterial color="#8a2be2" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Hallway Zone */}
      {layout.office?.hallway && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            (layout.office.hallway.start.x + layout.office.hallway.end.x) / 2,
            0.01,
            (layout.office.hallway.start.y + layout.office.hallway.end.y) / 2,
          ]}
        >
          <planeGeometry
            args={[
              layout.office.hallway.end.x - layout.office.hallway.start.x,
              layout.office.hallway.end.y - layout.office.hallway.start.y,
            ]}
          />
          <meshStandardMaterial color="#39ff14" transparent opacity={0.7} />
        </mesh>
      )}
    </Canvas>
  );
}

const OfficeModelPage = () => {
  const [layoutData, setLayoutData] = useState<OfficeLayout | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setLayoutData(json);
          setError("");
        } catch (err) {
          setError("Invalid file format. Please upload a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center justify-center p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl font-bold mb-8"
      >
        Office 3D Model Generator
      </motion.h1>

      <div className="mb-4">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="bg-gray-800 p-2 rounded border border-gray-700"
        />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {layoutData ? (
        <div className="w-full h-[600px] mt-8 border border-gray-700 rounded">
          <Office3D layout={layoutData} />
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          Upload a JSON file to generate the 3D model of your office.
        </motion.p>
      )}
    </div>
  );
};

export default OfficeModelPage;