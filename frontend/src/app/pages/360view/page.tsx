"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function OfficeModel({ gridWidth = 20, gridHeight = 20, floorCount = 1, visibleFloor, setDensityData }) {
  const calculateDensity = (floorIndex) => {
    let filledCount = 0;

    for (let row = 0; row < gridWidth; row++) {
      for (let col = 0; col < gridHeight; col++) {
        const x = row - gridWidth / 2 + 0.5;
        const z = col - gridHeight / 2 + 0.5;

        // Check if both table and chair are present in the current grid
        const hasTable = true; // Table is always created
        const hasChair = true; // Chair is always created

        if (hasTable && hasChair) {
          filledCount++;
        }
      }
    }

    const totalGrids = gridWidth * gridHeight;
    const filledPercentage = (filledCount / totalGrids) * 100;

    return { floorIndex, filledCount, totalGrids, filledPercentage };
  };

  const densityData = [];

  return (
    <group>
      {[...Array(floorCount)].map((_, floorIndex) => {
        // Show all floors if 'visibleFloor' is -1 (Show All selected)
        if (visibleFloor !== -1 && floorIndex !== visibleFloor) return null;

        const floorHeight = floorIndex * 6; // Adjust vertical spacing

        // Calculate the density for the current floor
        if (visibleFloor === -1) {
          const density = calculateDensity(floorIndex);
          densityData.push(density);
          setDensityData(densityData);
        }

        return (
          <group key={`floor-${floorIndex}`} position={[0, floorHeight, 0]}>
            {/* Floor */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[gridWidth, 1, gridHeight]} />
              <meshStandardMaterial color="gray" />
            </mesh>

            {/* Grid Lines */}
            {[...Array(gridWidth + 1)].map((_, i) => (
              <line key={`h-${floorIndex}-${i}`}>
                <bufferGeometry attach="geometry">
                  <bufferAttribute
                    attach="attributes-position"
                    array={new Float32Array([
                      -gridWidth / 2, 0.51, i - gridHeight / 2,
                      gridWidth / 2, 0.51, i - gridHeight / 2
                    ])}
                    itemSize={3}
                    count={2}
                  />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color="black" linewidth={1} />
              </line>
            ))}
            {[...Array(gridHeight + 1)].map((_, i) => (
              <line key={`v-${floorIndex}-${i}`}>
                <bufferGeometry attach="geometry">
                  <bufferAttribute
                    attach="attributes-position"
                    array={new Float32Array([
                      i - gridWidth / 2, 0.51, -gridHeight / 2,
                      i - gridWidth / 2, 0.51, gridHeight / 2
                    ])}
                    itemSize={3}
                    count={2}
                  />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color="black" linewidth={1} />
              </line>
            ))}

            {/* Walls */}
            <mesh position={[0, 1.75, (-gridHeight / 2) - 0.5]}>
              <boxGeometry args={[gridWidth, 5, 1]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0, 1.75, (gridHeight / 2) + 0.5]}>
              <boxGeometry args={[gridWidth, 5, 1]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[(-gridWidth / 2) - 0.5, 1.75, 0]}>
              <boxGeometry args={[1, 5, gridHeight]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[((gridWidth / 2) + 0.5), 1.75, 0]}>
              <boxGeometry args={[1, 5, gridHeight]} />
              <meshStandardMaterial color="white" />
            </mesh>

            {/* Tables and Chairs */}
            {visibleFloor !== -1 && (
              [...Array(gridWidth)].map((_, row) =>
                [...Array(gridHeight)].map((_, col) => {
                  const x = row - gridWidth / 2 + 0.5;
                  const z = col - gridHeight / 2 + 0.5;
                  return (
                    <group key={`table-chair-${floorIndex}-${row}-${col}`}>
                      {/* Table */}
                      <group position={[x, 0.9, z]}>
                        <mesh>
                          <boxGeometry args={[0.5, 0.1, 0.5]} />
                          <meshStandardMaterial color="brown" />
                        </mesh>
                        <mesh position={[-0.225, -0.25, -0.225]}>
                          <boxGeometry args={[0.05, 0.5, 0.05]} />
                          <meshStandardMaterial color="brown" />
                        </mesh>
                        <mesh position={[0.225, -0.25, -0.225]}>
                          <boxGeometry args={[0.05, 0.5, 0.05]} />
                          <meshStandardMaterial color="brown" />
                        </mesh>
                        <mesh position={[-0.225, -0.25, 0.225]}>
                          <boxGeometry args={[0.05, 0.5, 0.05]} />
                          <meshStandardMaterial color="brown" />
                        </mesh>
                        <mesh position={[0.225, -0.25, 0.225]}>
                          <boxGeometry args={[0.05, 0.5, 0.05]} />
                          <meshStandardMaterial color="brown" />
                        </mesh>
                      </group>

                      {/* Chair */}
                      <group position={[x, 0.7, z + 0.30]} rotation={[0, Math.PI, 0]}>
                        <mesh>
                          <boxGeometry args={[0.3, 0.15, 0.3]} />
                          <meshStandardMaterial color="blue" />
                        </mesh>
                        <mesh position={[0, 0.25, -0.15]}>
                          <boxGeometry args={[0.3, 0.5, 0.1]} />
                          <meshStandardMaterial color="blue" />
                        </mesh>
                        <mesh position={[-0.15, -0.075, -0.15]}>
                          <boxGeometry args={[0.03, 0.2, 0.03]} />
                          <meshStandardMaterial color="blue" />
                        </mesh>
                        <mesh position={[0.15, -0.075, -0.15]}>
                          <boxGeometry args={[0.03, 0.2, 0.03]} />
                          <meshStandardMaterial color="blue" />
                        </mesh>
                        <mesh position={[-0.15, -0.075, 0.15]}>
                          <boxGeometry args={[0.03, 0.2, 0.03]} />
                          <meshStandardMaterial color="blue" />
                        </mesh>
                        <mesh position={[0.15, -0.075, 0.15]}>
                          <boxGeometry args={[0.03, 0.2, 0.03]} />
                          <meshStandardMaterial color="blue" />
                        </mesh>
                      </group>
                    </group>
                  );
                })
              )
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function Home() {
  const gridWidth = 12;
  const gridHeight = 15;
  const floorCount = 5; // Change this to add more floors

  const [visibleFloor, setVisibleFloor] = useState(0);
  const [densityData, setDensityData] = useState([]);

  return (
    <div className="w-screen h-screen relative">
      {/* Panel to select floor */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1, background: 'rgba(255, 255, 255, 0.3)', padding: '10px', borderRadius: '5px' }}>
        <label style={{ color: 'white' }}>Select Floor: </label>
        <select
          value={visibleFloor}
          onChange={(e) => setVisibleFloor(Number(e.target.value))}
          style={{ color: 'black', backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: '5px' }}
        >
          <option value={-1}>Show All</option>
          {[...Array(floorCount)].map((_, index) => (
            <option key={index} value={index}>
              Floor {index + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Density analysis popups for each floor */}
      {[...Array(floorCount)].map((_, floorIndex) => {
        if (visibleFloor !== -1 && floorIndex !== visibleFloor) return null;
        const density = densityData.find((d) => d.floorIndex === floorIndex);
        if (!density) return null;

        return (
          <div
            key={floorIndex}
            style={{
              position: 'absolute',
              bottom: `${(floorIndex + 1) * 100}px`, // Adjust the bottom position based on the floor index
              left: '20px',
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              width: '250px',
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
            }}
          >
            <h3 style={{ fontSize: '14px', marginBottom: '5px' }}>Floor {floorIndex + 1}</h3>
            <div>
              <strong>Filled: </strong>
              {density.filledCount}/{density.totalGrids} ({density.filledPercentage.toFixed(2)}%)
            </div>
          </div>
        );
      })}

      <Canvas camera={{ position: [0, 50, 50], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        <OfficeModel
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          floorCount={floorCount}
          visibleFloor={visibleFloor}
          setDensityData={setDensityData}
        />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
