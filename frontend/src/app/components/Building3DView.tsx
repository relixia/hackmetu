"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import throttle from "lodash/throttle";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Type for each floor
interface FloorItem {
  id: number;            // Floors.id
  number: number;        // floor number
  width: number;         // floor width
  length: number;        // floor length
  capacity?: number;     // optional
  occupantCount?: number;// optional
  tableCoordinates?: { x: number; z: number }[];
}

interface Building3DViewProps {
  floors: FloorItem[];           // all floors in this building
  userFloorId?: number;          // highlight the user's floor
  onFloorClick: (floorId: number) => void;
}

export default function Building3DView({
  floors,
  userFloorId,
  onFloorClick,
}: Building3DViewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ---------------------------
    // 1. Basic constants
    // ---------------------------
    const SCALE = 1;
    const FLOOR_HEIGHT = 3 * SCALE;
    const WALL_THICKNESS = 0.7 * SCALE;
    const FLOOR_DETAILS = {
      width: 12 * SCALE,  // default if floor.width not given
      depth: 8 * SCALE,   // default if floor.length not given
      windowSpacing: 1.5 * SCALE,
      windowSize: 0.9 * SCALE,
    };
    const TABLE_SIZE = 1 * SCALE;
    const TABLE_HEIGHT = 0.2 * SCALE;
    const BUILDING_OFFSET = 1; // shift building upward

    // 2. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#303030");
    sceneRef.current = scene;

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      1,
      1000
    );
    // position the camera so we see the entire stack
    camera.position.set(floors.length * 8, floors.length * 6, floors.length * 8);
    cameraRef.current = camera;

    // 4. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 5. Lights
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // 6. OrbitControls (dynamic import)
    import("three/examples/jsm/controls/OrbitControls").then((module) => {
      const { OrbitControls } = module;
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = true;
      controls.maxPolarAngle = Math.PI / 2;
      controlsRef.current = controls;
    });

    // 7. Helper function: get color based on occupant ratio
    function getFloorColor(f: FloorItem, userFloorId: number) {
      console.log(userFloorId, f, "lol")
      if (f.id === userFloorId) {
        // The user's floor => green
        return new THREE.Color(0x00ff00);
      } else {
        // Any other floor => gray
        return new THREE.Color(0x999999);
      }
    }
    

    // 8. Create floor structure
    const createFloorStructure = (floorIndex: number, floorItem: FloorItem) => {
      const floorGroup = new THREE.Group();

      // Determine actual floor dimensions from DB
      const actualWidth =  FLOOR_DETAILS.width;
      const actualDepth =  FLOOR_DETAILS.depth;

      // If this is the user's floor, highlight or we can just use occupant ratio color
      let baseColor = getFloorColor(floorItem);
      if (floorItem.id === userFloorId) {
        baseColor = new THREE.Color(0x00ff00); 
        // but let's keep the ratio color for consistency
      }

      // Material
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.2,
        roughness: 0.7,
        emissive: baseColor.clone().multiplyScalar(0.1),
      });

      // (a) Main floor plate
      const floorGeometry = new THREE.BoxGeometry(
        actualWidth,
        WALL_THICKNESS,
        actualDepth
      );
      const floorPlate = new THREE.Mesh(floorGeometry, floorMaterial);
      floorPlate.receiveShadow = true;
      floorPlate.castShadow = true;
      floorPlate.position.y = floorIndex * FLOOR_HEIGHT + BUILDING_OFFSET;
      floorGroup.add(floorPlate);

      // (b) Walls
      const wallMaterial = floorMaterial.clone();

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
          wallShape.holes.push(
            windowHole
              .moveTo(x - FLOOR_DETAILS.windowSize / 2, -FLOOR_DETAILS.windowSize)
              .lineTo(x + FLOOR_DETAILS.windowSize / 2, -FLOOR_DETAILS.windowSize)
              .lineTo(x + FLOOR_DETAILS.windowSize / 2, FLOOR_DETAILS.windowSize)
              .lineTo(x - FLOOR_DETAILS.windowSize / 2, FLOOR_DETAILS.windowSize)
          );
        }

        return new THREE.ExtrudeGeometry(wallShape, {
          depth: depth,
          bevelEnabled: false,
        });
      };

      // front
      const frontWall = new THREE.Mesh(
        createWallWithWindows(actualWidth, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      frontWall.position.set(
        0,
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
        actualDepth / 2 - WALL_THICKNESS / 2
      );
      floorGroup.add(frontWall);

      // back
      const backWall = new THREE.Mesh(
        createWallWithWindows(actualWidth, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      backWall.rotation.y = Math.PI;
      backWall.position.set(
        0,
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
        -actualDepth / 2 + WALL_THICKNESS / 2
      );
      floorGroup.add(backWall);

      // left
      const leftWall = new THREE.Mesh(
        createWallWithWindows(actualDepth, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      leftWall.rotation.y = -Math.PI / 2;
      leftWall.position.set(
        -actualWidth / 2 + WALL_THICKNESS / 2,
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
        0
      );
      floorGroup.add(leftWall);

      // right
      const rightWall = new THREE.Mesh(
        createWallWithWindows(actualDepth, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      rightWall.rotation.y = Math.PI / 2;
      rightWall.position.set(
        actualWidth / 2 - WALL_THICKNESS / 2,
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
        0
      );
      floorGroup.add(rightWall);

      // (c) Random tables
      if (floorItem.tableCoordinates) {
        // We'll just randomly place them ignoring the actual (x,z).
        floorItem.tableCoordinates.forEach(() => {
          const tableGeom = new THREE.BoxGeometry(
            TABLE_SIZE,
            TABLE_HEIGHT,
            TABLE_SIZE
          );
          const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
          const tableMesh = new THREE.Mesh(tableGeom, tableMat);

          const randomX =
            Math.random() * (actualWidth - 2 * TABLE_SIZE) -
            (actualWidth / 2 - TABLE_SIZE);
          const randomZ =
            Math.random() * (actualDepth - 2 * TABLE_SIZE) -
            (actualDepth / 2 - TABLE_SIZE);

          tableMesh.position.set(
            randomX,
            floorIndex * FLOOR_HEIGHT + WALL_THICKNESS / 2 + TABLE_HEIGHT / 2 + BUILDING_OFFSET,
            randomZ
          );
          tableMesh.castShadow = true;
          tableMesh.receiveShadow = true;
          floorGroup.add(tableMesh);
        });
      }

      return floorGroup;
    };

    // 9. Build the floors
    const floorMeshes: THREE.Object3D[] = [];
    floors.forEach((floor, index) => {
      const floorStructure = createFloorStructure(index, floor);
      floorStructure.userData.floorId = floor.id;
      floorMeshes.push(floorStructure);
      scene.add(floorStructure);
    });

    // 10. Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = throttle((event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(floorMeshes, true);

      // Reset emissive highlight
      floorMeshes.forEach((obj) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.emissive?.setHex(0x000000);
          }
        });
      });

      if (intersects.length > 0) {
        // highlight the intersected floor
        intersects[0].object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.emissive?.setHex(0x555555);
          }
        });
      }
    }, 100);

    const handleClick = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(floorMeshes, true);
      if (intersects.length > 0) {
        let floorId: number | null = null;
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj) {
          if (obj.userData && obj.userData.floorId !== undefined) {
            floorId = obj.userData.floorId;
            break;
          }
          obj = obj.parent;
        }
        if (floorId !== null) {
          onFloorClick(floorId);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("click", handleClick);

    // 11. Resize handling
    const onWindowResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
      cameraRef.current.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", onWindowResize);

    // 12. Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controlsRef.current?.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", onWindowResize);
      controlsRef.current?.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [floors, userFloorId, onFloorClick]);

  return <div ref={mountRef} style={{ width: "100%", height: "600px", cursor: "pointer" }} />;
}
