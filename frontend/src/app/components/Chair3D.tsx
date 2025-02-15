"use client";

import React from "react";

interface Chair3DProps {
  position: [number, number, number];
  color?: string;
  scale?: [number, number, number];
}

export default function Chair3D({
  position,
  color = "#F96E2A",
  scale = [1, 1, 1],
}: Chair3DProps) {
  return (
    <mesh position={position} scale={scale} castShadow>
      {/* A box geometry as a placeholder for a chair */}
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
