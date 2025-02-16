"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import throttle from "lodash/throttle";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// ------------------------------------------
// 1. Data Types
// ------------------------------------------
export interface FloorData {
  id: number;
  name: string;
  area: number;
  occupantCount: number;
  capacity: number;
  tableCoordinates?: { x: number; z: number }[];
  users?: string[]; // optional: list of user names
}

// ------------------------------------------
// 2. Combined Component
// ------------------------------------------
interface Floor3DAndUsersProps {
  floors: FloorData[];
  // Optional initial selected floor
  defaultFloorId?: number;
}

/**
 * A reusable component that displays a 3D building (floors + tables)
 * and a user list for the selected floor.
 */
export default function Floor3DAndUsers({
  floors,
  defaultFloorId,
}: Floor3DAndUsersProps) {
  // If no floors, render nothing
  if (!floors || floors.length === 0) {
    return <p>No floor data available</p>;
  }

  // State for which floor is selected
  const [selectedFloorId, setSelectedFloorId] = useState<number>(
    defaultFloorId ?? floors[0].id
  );

  // Find the selected floor object
  const selectedFloor = floors.find((f) => f.id === selectedFloorId);

  // 3D renderer container ref
  const mountRef = useRef<HTMLDivElement | null>(null);

  // ------------------------------------------------
  // 2A. Three.js Setup in useEffect
  // ------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;

    // Basic measurements (adjust as needed)
    const SCALE = 1;
    const FLOOR_HEIGHT = 3 * SCALE;
    const WALL_THICKNESS = 0.5 * SCALE;
    const FLOOR_DETAILS = {
      width: 12 * SCALE, // e.g., 12m
      depth: 8 * SCALE,  // e.g., 8m
      windowSpacing: 1.5 * SCALE,
      windowSize: 0.8 * SCALE,
    };
    const TABLE_SIZE = 1 * SCALE;
    const TABLE_HEIGHT = 0.2 * SCALE;

    // Scene + Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(floors.length * 4, floors.length * 6, floors.length * 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    // We’ll resize this later to match the parent container
    renderer.setSize(800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Floor color logic
    const getFloorColor = (floor: FloorData) => {
      const ratio = floor.occupantCount / floor.capacity;
      const color = new THREE.Color();
      // Example: shift hue based on ratio
      color.setHSL(0.3 - ratio * 0.3, 0.8, 0.5 + (0.3 - ratio * 0.3));
      return color;
    };

    // Create floors
    const floorMeshes: THREE.Object3D[] = [];

    floors.forEach((floorData, index) => {
      // Group for each floor
      const floorGroup = new THREE.Group();
      floorGroup.userData.floorId = floorData.id;

      // Floor color
      const baseColor = getFloorColor(floorData);

      // Floor platform
      const floorGeometry = new THREE.BoxGeometry(
        FLOOR_DETAILS.width,
        WALL_THICKNESS,
        FLOOR_DETAILS.depth
      );
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.2,
        roughness: 0.7,
        emissive: new THREE.Color().copy(baseColor).multiplyScalar(0.1),
      });
      const floorPlate = new THREE.Mesh(floorGeometry, floorMaterial);
      floorPlate.receiveShadow = true;
      floorPlate.castShadow = true;
      floorPlate.position.y = index * FLOOR_HEIGHT;
      floorGroup.add(floorPlate);

      // Walls
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.2,
        roughness: 0.7,
        emissive: new THREE.Color().copy(baseColor).multiplyScalar(0.1),
      });

      const createWallWithWindows = (
        width: number,
        height: number,
        depth: number
      ) => {
        const wallShape = new THREE.Shape();
        wallShape.moveTo(-width / 2, -height / 2);
        wallShape.lineTo(width / 2, -height / 2);
        wallShape.lineTo(width / 2, height / 2);
        wallShape.lineTo(-width / 2, height / 2);
        wallShape.lineTo(-width / 2, -height / 2);

        const windowCount = Math.floor(width / FLOOR_DETAILS.windowSpacing);
        const windowStart = -width / 2 + FLOOR_DETAILS.windowSpacing;
        for (let i = 0; i < windowCount - 1; i++) {
          const x = windowStart + i * FLOOR_DETAILS.windowSpacing;
          const windowHole = new THREE.Path();
          windowHole.moveTo(x - FLOOR_DETAILS.windowSize / 2, -FLOOR_DETAILS.windowSize);
          windowHole.lineTo(x + FLOOR_DETAILS.windowSize / 2, -FLOOR_DETAILS.windowSize);
          windowHole.lineTo(x + FLOOR_DETAILS.windowSize / 2, FLOOR_DETAILS.windowSize);
          windowHole.lineTo(x - FLOOR_DETAILS.windowSize / 2, FLOOR_DETAILS.windowSize);
          wallShape.holes.push(windowHole);
        }

        return new THREE.ExtrudeGeometry(wallShape, {
          depth: depth,
          bevelEnabled: false,
        });
      };

      // Front wall
      const frontWall = new THREE.Mesh(
        createWallWithWindows(FLOOR_DETAILS.width, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      frontWall.position.set(
        0,
        index * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
        FLOOR_DETAILS.depth / 2 - WALL_THICKNESS / 2
      );
      floorGroup.add(frontWall);

      // Back wall
      const backWall = new THREE.Mesh(
        createWallWithWindows(FLOOR_DETAILS.width, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      backWall.rotation.y = Math.PI;
      backWall.position.set(
        0,
        index * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
        -FLOOR_DETAILS.depth / 2 + WALL_THICKNESS / 2
      );
      floorGroup.add(backWall);

      // Left wall
      const leftWall = new THREE.Mesh(
        createWallWithWindows(FLOOR_DETAILS.depth, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      leftWall.rotation.y = -Math.PI / 2;
      leftWall.position.set(
        -FLOOR_DETAILS.width / 2 + WALL_THICKNESS / 2,
        index * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
        0
      );
      floorGroup.add(leftWall);

      // Right wall
      const rightWall = new THREE.Mesh(
        createWallWithWindows(FLOOR_DETAILS.depth, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      rightWall.rotation.y = Math.PI / 2;
      rightWall.position.set(
        FLOOR_DETAILS.width / 2 - WALL_THICKNESS / 2,
        index * FLOOR_HEIGHT + FLOOR_HEIGHT / 2,
        0
      );
      floorGroup.add(rightWall);

      // Tables
      if (floorData.tableCoordinates) {
        floorData.tableCoordinates.forEach((coord) => {
          const tableGeometry = new THREE.BoxGeometry(TABLE_SIZE, TABLE_HEIGHT, TABLE_SIZE);
          const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
          const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);

          // SHIFT from top-left to center
          tableMesh.position.x = coord.x - FLOOR_DETAILS.width / 2;
          tableMesh.position.z = coord.z - FLOOR_DETAILS.depth / 2;
          tableMesh.position.y = index * FLOOR_HEIGHT + WALL_THICKNESS / 2 + TABLE_HEIGHT / 2;

          tableMesh.castShadow = true;
          tableMesh.receiveShadow = true;
          floorGroup.add(tableMesh);
        });
      }

      floorMeshes.push(floorGroup);
      scene.add(floorGroup);
    });

    // OrbitControls (dynamic import)
    let controls: OrbitControls | undefined;
    import("three/examples/jsm/controls/OrbitControls").then(({ OrbitControls }) => {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = true;
      controls.maxPolarAngle = Math.PI / 2;
    });

    // Raycaster for hover + click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = throttle((event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshes, true);

      // reset highlight
      floorMeshes.forEach((obj) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.emissive?.setHex(0x000000);
          }
        });
      });

      if (intersects.length > 0) {
        intersects[0].object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.emissive?.setHex(0x555555);
          }
        });
      }
    }, 100);

    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshes, true);

      if (intersects.length > 0) {
        let clickedFloorId: number | null = null;
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj) {
          if (obj.userData && obj.userData.floorId !== undefined) {
            clickedFloorId = obj.userData.floorId;
            break;
          }
          obj = obj.parent;
        }
        if (clickedFloorId !== null) {
          setSelectedFloorId(clickedFloorId);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("click", handleClick);

    // Resize handling
    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Kick off first resize so we fill container
    handleResize();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      controls?.dispose();
    };
  }, [floors]);

  // ------------------------------------------------
  // 2B. Render
  // ------------------------------------------------
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      {/* 3D Container */}
      <div
        ref={mountRef}
        style={{
          width: "800px",
          height: "600px",
          border: "1px solid #ccc",
          position: "relative",
        }}
      />

      {/* User List for the selected floor */}
      {selectedFloor && (
        <div style={{ width: "300px", backgroundColor: "#fff", color: "#000" }}>
          <h2>{selectedFloor.name} - Users</h2>
          <ul>
            {selectedFloor.users?.map((user, i) => (
              <li key={i}>{user}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}