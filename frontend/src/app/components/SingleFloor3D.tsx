"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface SingleFloor3DProps {
  floorData: any;     // includes { width, length }
  personnel: any;     // includes { x_coor, y_coor }
}

export default function SingleFloor3D({ floorData, personnel }: SingleFloor3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f0f0f0");

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Floor geometry
    const floorGeometry = new THREE.PlaneGeometry(floorData.width, floorData.length);
    // rotate plane so it's horizontal
    floorGeometry.rotateX(-Math.PI / 2);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      side: THREE.DoubleSide,
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Add user marker (a small sphere or box)
    const userGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const userMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const userMarker = new THREE.Mesh(userGeometry, userMaterial);
    userMarker.castShadow = true;

    // The plane is centered at (0,0). 
    // If x_coor,y_coor are in [0..width], [0..length], 
    // we shift them so center of plane is (0,0).
    const halfW = floorData.width / 2;
    const halfL = floorData.length / 2;

    const userX = (personnel?.x_coor ?? 0) - halfW;
    const userZ = (personnel?.y_coor ?? 0) - halfL;

    userMarker.position.set(userX, 0.5, userZ); // y=0.5 so it sits on plane
    scene.add(userMarker);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
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
