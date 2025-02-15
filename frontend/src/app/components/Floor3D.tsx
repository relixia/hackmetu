"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";

interface Floor3DProps {
  width: number;
  height: number;
  onFloorClick: (x: number, z: number) => void;
}

export default function Floor3D({ width, height, onFloorClick }: Floor3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Capture click on the plane
  const handlePointerDown = (event: ThreeEvent<MouseEvent>) => {
    // Stop the event from propagating so we don't rotate the camera
    event.stopPropagation();
    // Get the point where the ray intersects the floor
    const point = event.point;
    // point.x, point.z is the floor coordinate
    onFloorClick(point.x, point.z);
  };

  return (
    <mesh
      ref={meshRef}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]} // rotate plane to be horizontal
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#FBF8EF" />
    </mesh>
  );
}
