"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface SingleFloor3DViewProps {
  floorData: {
    width: number;        // total floor width
    length: number;       // total floor length
    tableCoordinates?: any[]; // optional array to indicate # of tables or coords
  };
  personnel: {
    x_coor: number;
    y_coor: number;
};
}

/**
 * SingleFloor3DView:
 *  - Floor is made of 1×1 block tiles.
 *  - Walls with windows (extruded geometry).
 *  - Randomly placed tables if floorData.tableCoordinates is present.
 *  - The user's coordinate is shown as a table (not a sphere).
 */
export default function SingleFloor3DView({ floorData, personnel }: SingleFloor3DViewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ---------------------------
    // 1. Scene, Camera, Renderer
    // ---------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#202020");

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ---------------------------
    // 2. Floor & Dimensions
    // ---------------------------
    const actualWidth = floorData.width || 10;
    const actualLength = floorData.length || 10;

    // We'll keep the floor "tiles" approach (1×1 blocks).
    const floorGroup = new THREE.Group();
    scene.add(floorGroup);

    // Each tile: 1×1 in XZ-plane, height=0.05
    const cellGeometry = new THREE.BoxGeometry(1, 0.05, 1);
    const cellMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

    // Build the grid
    for (let x = 0; x < actualWidth; x++) {
      for (let z = 0; z < actualLength; z++) {
        const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
        cellMesh.receiveShadow = true;

        // offset to center the floor at (0,0)
        const offsetX = x + 0.5 - actualWidth / 2;
        const offsetZ = z + 0.5 - actualLength / 2;
        cellMesh.position.set(offsetX, 0.025, offsetZ);
        floorGroup.add(cellMesh);
      }
    }

    // ---------------------------
    // 3. Walls with Windows
    // ---------------------------
    // We'll extrude a shape and cut out "window" holes
    const WALL_HEIGHT = 3;           // how tall the walls are
    const WALL_THICKNESS = 0.5;      // thickness of the extruded geometry
    const windowSpacing = 1.5;       // space between windows
    const windowSize = 0.9;          // width/height of each window

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });

    // Helper to create an extruded geometry with window holes
    const createWallWithWindows = (width: number, height: number, depth: number) => {
      const wallShape = new THREE.Shape();

      // Outline of the wall
      wallShape.moveTo(-width / 2, -height / 2);
      wallShape.lineTo(width / 2, -height / 2);
      wallShape.lineTo(width / 2, height / 2);
      wallShape.lineTo(-width / 2, height / 2);
      wallShape.lineTo(-width / 2, -height / 2);

      // Calculate how many windows can fit horizontally
      const windowCount = Math.floor(width / windowSpacing);
      const windowStart = -width / 2 + windowSpacing;

      // Carve out window holes
      for (let i = 0; i < windowCount - 1; i++) {
        const x = windowStart + i * windowSpacing;
        const windowHole = new THREE.Path();
        windowHole.moveTo(x - windowSize / 2, -windowSize);
        windowHole.lineTo(x + windowSize / 2, -windowSize);
        windowHole.lineTo(x + windowSize / 2, windowSize);
        windowHole.lineTo(x - windowSize / 2, windowSize);
        wallShape.holes.push(windowHole);
      }

      return new THREE.ExtrudeGeometry(wallShape, {
        depth: depth,
        bevelEnabled: false,
      });
    };

    // FRONT WALL
    const frontWall = new THREE.Mesh(
      createWallWithWindows(actualWidth, WALL_HEIGHT, WALL_THICKNESS),
      wallMaterial
    );
    // position it so bottom edge is at y=0, front edge at z= +actualLength/2
    frontWall.position.set(0, WALL_HEIGHT / 2, actualLength / 2 - WALL_THICKNESS / 2);
    floorGroup.add(frontWall);

    // BACK WALL
    const backWall = new THREE.Mesh(
      createWallWithWindows(actualWidth, WALL_HEIGHT, WALL_THICKNESS),
      wallMaterial
    );
    backWall.rotation.y = Math.PI; // flip 180
    backWall.position.set(0, WALL_HEIGHT / 2, -actualLength / 2 + WALL_THICKNESS / 2);
    floorGroup.add(backWall);

    // LEFT WALL
    const leftWall = new THREE.Mesh(
      createWallWithWindows(actualLength, WALL_HEIGHT, WALL_THICKNESS),
      wallMaterial
    );
    leftWall.rotation.y = -Math.PI / 2;
    leftWall.position.set(-actualWidth / 2 + WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0);
    floorGroup.add(leftWall);

    // RIGHT WALL
    const rightWall = new THREE.Mesh(
      createWallWithWindows(actualLength, WALL_HEIGHT, WALL_THICKNESS),
      wallMaterial
    );
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.set(actualWidth / 2 - WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0);
    floorGroup.add(rightWall);

    // ---------------------------
    // 4. Random Tables if tableCoordinates exist
    // ---------------------------
    const TABLE_SIZE = 1;
    const TABLE_HEIGHT = 0.2;

    if (floorData.tableCoordinates && Array.isArray(floorData.tableCoordinates)) {
      floorData.tableCoordinates.forEach(() => {
        const tableGeom = new THREE.BoxGeometry(TABLE_SIZE, TABLE_HEIGHT, TABLE_SIZE);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const tableMesh = new THREE.Mesh(tableGeom, tableMat);

        // random X / Z within walls
        const randomX =
          Math.random() * (actualWidth - 2 * TABLE_SIZE) -
          (actualWidth / 2 - TABLE_SIZE);
        const randomZ =
          Math.random() * (actualLength - 2 * TABLE_SIZE) -
          (actualLength / 2 - TABLE_SIZE);

        tableMesh.position.set(randomX, TABLE_HEIGHT / 2, randomZ);
        tableMesh.castShadow = true;
        tableMesh.receiveShadow = true;
        floorGroup.add(tableMesh);
      });
    }

    // ---------------------------
    // 5. Place the User's "Table"
    // ---------------------------
    // The user's coordinate is NOT random: we place it exactly at (x_coor, y_coor).
    const userX = (personnel?.x_coor ?? 0) + 0.5 - actualWidth / 2;
    const userZ = (personnel?.y_coor ?? 0) + 0.5 - actualLength / 2;

    const userTableGeom = new THREE.BoxGeometry(TABLE_SIZE, TABLE_HEIGHT, TABLE_SIZE);
    const userTableMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const userTableMesh = new THREE.Mesh(userTableGeom, userTableMat);
    userTableMesh.castShadow = true;

    userTableMesh.position.set(userX, TABLE_HEIGHT / 2, userZ);
    floorGroup.add(userTableMesh);

    // ---------------------------
    // 6. Animate
    // ---------------------------
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ---------------------------
    // 7. Cleanup
    // ---------------------------
    return () => {
      controls.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [floorData, personnel]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
    />
  );
}
