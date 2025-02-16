// pages/auto-office-model.tsx
"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";

// Define the structure of the office layout data
export interface OfficeLayout {
  office: {
    walls: { start: { x: number; y: number }; end: { x: number; y: number } }[];
    desks: { id: number; position: { x: number; y: number } }[];
    kitchen: { start: { x: number; y: number }; end: { x: number; y: number } };
    wc: { start: { x: number; y: number }; end: { x: number; y: number } };
    hallway: { start: { x: number; y: number }; end: { x: number; y: number } };
    dimensions: { width: number; length: number };
  };
}

/**
 * Generates an office layout automatically based on floor dimensions.
 * The design includes:
 * - Outer walls around the floor.
 * - A kitchen area (20% of width/length) in the bottom-left.
 * - A WC area (20% of width/length) in the bottom-right.
 * - A central vertical hallway (15% of the floor width).
 * - Desks arranged in a grid over the remaining area.
 */
function generateOfficeLayout(floorWidth: number, floorLength: number): OfficeLayout {
  const margin = 1;
  // Kitchen and WC take 20% of width/length from bottom corners.
  const kitchenWidth = floorWidth * 0.2;
  const kitchenLength = floorLength * 0.2;
  const wcWidth = floorWidth * 0.2;
  const wcLength = floorLength * 0.2;

  const kitchen = {
    start: { x: margin, y: margin },
    end: { x: margin + kitchenWidth, y: margin + kitchenLength },
  };

  const wc = {
    start: { x: floorWidth - margin - wcWidth, y: margin },
    end: { x: floorWidth - margin, y: margin + wcLength },
  };

  // Define a vertical hallway running through the center.
  const hallwayWidth = floorWidth * 0.15;
  const hallway = {
    start: { x: (floorWidth - hallwayWidth) / 2, y: margin },
    end: { x: (floorWidth - hallwayWidth) / 2 + hallwayWidth, y: floorLength - margin },
  };

  const desks = [];
  const deskSpacing = 2; // space between desk centers

  // Generate desks in a grid, skipping cells in kitchen, wc, or hallway areas.
  for (let x = margin + deskSpacing / 2; x < floorWidth - margin; x += deskSpacing) {
    for (let y = margin + deskSpacing / 2; y < floorLength - margin; y += deskSpacing) {
      // Skip if point is in kitchen
      if (
        x >= kitchen.start.x &&
        x <= kitchen.end.x &&
        y >= kitchen.start.y &&
        y <= kitchen.end.y
      ) {
        continue;
      }
      // Skip if point is in WC
      if (
        x >= wc.start.x &&
        x <= wc.end.x &&
        y >= wc.start.y &&
        y <= wc.end.y
      ) {
        continue;
      }
      // Skip if point is in the hallway (vertical strip)
      if (x >= hallway.start.x && x <= hallway.end.x) {
        continue;
      }
      desks.push({ id: desks.length + 1, position: { x, y } });
    }
  }

  // Define outer walls for the floor plan.
  const walls = [
    { start: { x: 0, y: 0 }, end: { x: floorWidth, y: 0 } },
    { start: { x: floorWidth, y: 0 }, end: { x: floorWidth, y: floorLength } },
    { start: { x: floorWidth, y: floorLength }, end: { x: 0, y: floorLength } },
    { start: { x: 0, y: floorLength }, end: { x: 0, y: 0 } },
  ];

  return {
    office: {
      walls,
      desks,
      kitchen,
      wc,
      hallway,
      dimensions: { width: floorWidth, length: floorLength },
    },
  };
}

/**
 * Renders the 3D scene based on the office layout data.
 * Walls, desks, kitchen, WC, and hallway zones are visualized.
 */
function Office3D({ layout }: { layout: OfficeLayout }) {
  const { walls, desks, kitchen, wc, hallway, dimensions } = layout.office;
  return (
    <Canvas
      camera={{
        position: [dimensions.width / 2, 15, dimensions.length + 10],
        fov: 50,
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />

      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[dimensions.width / 2, 0, dimensions.length / 2]}
      >
        <planeGeometry args={[dimensions.width + 2, dimensions.length + 2]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Outer Walls */}
      {walls.map((wall, index) => {
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const centerX = (wall.start.x + wall.end.x) / 2;
        const centerY = (wall.start.y + wall.end.y) / 2;
        const angle = Math.atan2(dy, dx);
        return (
          <mesh
            key={index}
            position={[centerX, 1.5, centerY]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[length, 3, 0.2]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        );
      })}

      {/* Desks */}
      {desks.map((desk) => (
        <mesh key={desk.id} position={[desk.position.x, 0.5, desk.position.y]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#00e6ff"
            emissive="#00e6ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Kitchen Zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          (kitchen.start.x + kitchen.end.x) / 2,
          0.01,
          (kitchen.start.y + kitchen.end.y) / 2,
        ]}
      >
        <planeGeometry
          args={[
            kitchen.end.x - kitchen.start.x,
            kitchen.end.y - kitchen.start.y,
          ]}
        />
        <meshStandardMaterial color="#ff7f50" transparent opacity={0.7} />
      </mesh>

      {/* WC Zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          (wc.start.x + wc.end.x) / 2,
          0.01,
          (wc.start.y + wc.end.y) / 2,
        ]}
      >
        <planeGeometry
          args={[wc.end.x - wc.start.x, wc.end.y - wc.start.y]}
        />
        <meshStandardMaterial color="#8a2be2" transparent opacity={0.7} />
      </mesh>

      {/* Hallway Zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          (hallway.start.x + hallway.end.x) / 2,
          0.01,
          (hallway.start.y + hallway.end.y) / 2,
        ]}
      >
        <planeGeometry
          args={[hallway.end.x - hallway.start.x, hallway.end.y - hallway.start.y]}
        />
        <meshStandardMaterial color="#39ff14" transparent opacity={0.7} />
      </mesh>
    </Canvas>
  );
}

/**
 * This page allows users to enter floor dimensions (width & length)
 * to auto-generate an office layout. The generated layout now includes a central hallway.
 */
const AutoOfficeModelPage = () => {
  const [layoutData, setLayoutData] = useState<OfficeLayout | null>(null);
  const [error, setError] = useState<string>("");
  const [widthInput, setWidthInput] = useState<string>("");
  const [lengthInput, setLengthInput] = useState<string>("");

  // Generates a layout based on user-specified floor dimensions.
  const handleGenerate = () => {
    const floorWidth = parseFloat(widthInput);
    const floorLength = parseFloat(lengthInput);
    if (isNaN(floorWidth) || isNaN(floorLength) || floorWidth <= 0 || floorLength <= 0) {
      setError("Please enter valid positive numbers for width and length.");
      return;
    }
    const generatedLayout = generateOfficeLayout(floorWidth, floorLength);
    setLayoutData(generatedLayout);
    setError("");
  };

  // Downloads the generated layout as a JSON file.
  const handleDownload = () => {
    if (!layoutData) return;
    const fileData = JSON.stringify(layoutData, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "office-layout.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        Auto Office Model Generator
      </motion.h1>
      <div className="max-w-xl mx-auto">
        {/* Auto-Generate Layout */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Auto Generate Layout</h2>
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Floor Width"
              value={widthInput}
              onChange={(e) => setWidthInput(e.target.value)}
              className="bg-gray-800 p-2 rounded border border-gray-700 w-full"
            />
            <input
              type="number"
              placeholder="Floor Length"
              value={lengthInput}
              onChange={(e) => setLengthInput(e.target.value)}
              className="bg-gray-800 p-2 rounded border border-gray-700 w-full"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="mt-4 w-full py-2 bg-blue-500 rounded font-semibold hover:bg-blue-600 transition"
          >
            Generate Layout
          </button>
          {/* Show Download button if a layout has been generated */}
          {layoutData && (
            <button
              onClick={handleDownload}
              className="mt-4 w-full py-2 bg-green-500 rounded font-semibold hover:bg-green-600 transition"
            >
              Download Layout JSON
            </button>
          )}
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
      </div>
      {layoutData ? (
        <div className="w-full h-[600px] mt-8 border border-gray-700 rounded">
          <Office3D layout={layoutData} />
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          Enter floor dimensions to generate a 3D model of your office.
        </motion.p>
      )}
    </div>
  );
};

export default AutoOfficeModelPage;