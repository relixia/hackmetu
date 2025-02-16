"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Building3DProps {
  allFloors: any[];
  userFloorId: number;
  onFloorClick: (floorId: number) => void;
}

/**
 * Building3D:
 *  - Renders multiple floors stacked in 3D.
 *  - Highlights the user's floor in green.
 *  - Only that floor is clickable; others do nothing if clicked.
 */
function Building3D({
  allFloors,
  userFloorId,
  onFloorClick,
}: Building3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fafafa");
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 30);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Build floors
    const floorHeight = 3; // arbitrary
    const geometry = new THREE.BoxGeometry(1, 0.1, 1); // default; we’ll scale it
    const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
    const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

    allFloors.forEach((f, index) => {
      const floorMesh = new THREE.Mesh(geometry, defaultMaterial);
      floorMesh.scale.set(f.width, 0.1, f.length);
      floorMesh.position.set(0, index * floorHeight, 0);

      // Mark user floor green
      if (f.id === userFloorId) {
        floorMesh.material = greenMaterial;
      }

      // Store the floor ID in userData for picking
      floorMesh.userData.floorId = f.id;

      scene.add(floorMesh);
    });

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(e: MouseEvent) {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const clickedFloorId = obj.userData.floorId;
        if (clickedFloorId) {
          onFloorClick(clickedFloorId);
        }
      }
    }

    renderer.domElement.addEventListener("click", onClick);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [allFloors, userFloorId, onFloorClick]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
    />
  );
}
