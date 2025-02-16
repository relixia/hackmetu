"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import throttle from 'lodash/throttle';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ThreeColumnLayout from './ThreeColumnLayoutData';

// ------------------------------------------------
// 1. Data Types
// ------------------------------------------------
interface FloorData {
  id: number;                      // from Floors.number
  name: string;                    // "Floor <number>"
  area: number;                    // width * length
  occupantCount: number;           // # of Personnels
  capacity: number;                // same as area
  tableCoordinates?: { x: number; z: number }[];
  users?: string[];                // array of user full names
}

// ------------------------------------------------
// 2. Components
// ------------------------------------------------

// FloorColorBar
function FloorColorBar() {
  return (
    <div style={styles.colorBarContainer}>
      <h3 style={styles.legendTitle}>Color Legend</h3>
      <div style={styles.legendItem}>
        <span style={{ ...styles.legendColorBox, backgroundColor: 'rgba(0, 255, 0, 0.6)' }} />
        <span style={styles.legendLabel}>Below 50% Capacity</span>
      </div>
      <div style={styles.legendItem}>
        <span style={{ ...styles.legendColorBox, backgroundColor: 'rgba(255, 255, 0, 0.6)' }} />
        <span style={styles.legendLabel}>50% - 80% Capacity</span>
      </div>
      <div style={styles.legendItem}>
        <span style={{ ...styles.legendColorBox, backgroundColor: 'rgba(255, 0, 0, 0.6)' }} />
        <span style={styles.legendLabel}>80%+ Capacity</span>
      </div>
    </div>
  );
}

// FloorList
function FloorList({ floors }: { floors: FloorData[] }) {
  return (
    <div style={styles.floorListContainer}>
      <h2 style={styles.sectionTitle}>Floor List</h2>
      <ul style={styles.floorList}>
        {floors.map((floor) => (
          <li key={floor.id} style={styles.floorListItem}>
            <strong>{floor.name}</strong> - Area: {floor.area}m² | 
            Occupants: {floor.occupantCount}/{floor.capacity}
          </li>
        ))}
      </ul>
    </div>
  );
}

// FloorCapacityView (2D)
function FloorCapacityView({ floors, onCapacityClick }: { floors: FloorData[]; onCapacityClick: (floorId: number) => void; }) {
  const getFloorColor = (floor: FloorData) => {
    const ratio = floor.occupantCount / floor.capacity;
    if (ratio < 0.5) return 'rgba(0, 255, 0, 0.8)';
    if (ratio < 0.8) return 'rgba(255, 255, 0, 0.8)';
    return 'rgba(255, 0, 0, 0.8)';
  };

  return (
    <div style={styles.capacityViewContainer}>
      <h2 style={styles.sectionTitle}>2D Capacity View</h2>
      <div style={styles.capacityBoxes}>
        {floors.map((floor) => {
          const color = getFloorColor(floor);
          return (
            <div
              key={floor.id}
              style={{
                ...styles.capacityBox,
                backgroundColor: color,
              }}
              onClick={() => onCapacityClick(floor.id)}
            >
              {floor.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Floor3DRenderer
function Floor3DRenderer({ floors, onFloorClick }: { floors: FloorData[]; onFloorClick: (floorId: number) => void; }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ---------------------------
    // Define scale & dimensions
    // ---------------------------
    const SCALE = 1; 
    const FLOOR_HEIGHT = 3 * SCALE;
    const WALL_THICKNESS = 0.7 * SCALE;
    const FLOOR_DETAILS = {
      width: 12 * SCALE,
      depth: 8 * SCALE,
      windowSpacing: 1.5 * SCALE,
      windowSize: 0.9 * SCALE,
    };
    const TABLE_SIZE = 1 * SCALE;    
    const TABLE_HEIGHT = 0.2 * SCALE; 

    // -----------------------------------------
    // Offset to shift the building higher (lowered from 5 to 1)
    // -----------------------------------------
    const BUILDING_OFFSET = 1;

    // Scene setup
    const scene = new THREE.Scene();
    // Changed background to #303030
    scene.background = new THREE.Color("#303030");
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(floors.length * 8, floors.length * 6, floors.length * 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth * 0.4, window.innerHeight * 0.6);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
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

    // Color function for floors
    const getFloorColor = (floor: FloorData) => {
      const ratio = floor.occupantCount / floor.capacity;
      const color = new THREE.Color();
      // example hue shift
      color.setHSL(0.3 - ratio * 0.3, 0.8, 0.5 + (0.3 - ratio * 0.3));
      return color;
    };

    // Create floor structure
    const createFloorStructure = (floorIndex: number, floorData: FloorData) => {
      const floorGroup = new THREE.Group();
      const baseColor = getFloorColor(floorData);

      // Main floor platform
      const floorGeometry = new THREE.BoxGeometry(
        FLOOR_DETAILS.width,
        WALL_THICKNESS,
        FLOOR_DETAILS.depth
      );
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.2,
        roughness: 0.7,
        emissive: new THREE.Color().copy(baseColor).multiplyScalar(0.1)
      });
      const floorPlate = new THREE.Mesh(floorGeometry, floorMaterial);
      floorPlate.receiveShadow = true;
      floorPlate.castShadow = true;

      // Shift the building upward by BUILDING_OFFSET
      floorPlate.position.y = floorIndex * FLOOR_HEIGHT + BUILDING_OFFSET;
      floorGroup.add(floorPlate);

      // Walls
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.2,
        roughness: 0.7,
        emissive: new THREE.Color().copy(baseColor).multiplyScalar(0.1)
      });

      const createWallWithWindows = (width: number, height: number, depth: number) => {
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
          bevelEnabled: false
        });
      };

      // Front wall
      const frontWall = new THREE.Mesh(
        createWallWithWindows(FLOOR_DETAILS.width, FLOOR_HEIGHT, WALL_THICKNESS),
        wallMaterial
      );
      frontWall.position.set(
        0,
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
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
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
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
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
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
        floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BUILDING_OFFSET,
        0
      );
      floorGroup.add(rightWall);

      // ----------------------------
      // Table placement (RANDOMIZED)
      // ----------------------------
      // We still use the count from the API (floorData.tableCoordinates.length),
      // but randomize the actual x/z to place them randomly within floor boundaries.
      if (floorData.tableCoordinates) {
        floorData.tableCoordinates.forEach(() => {
          const tableGeometry = new THREE.BoxGeometry(TABLE_SIZE, TABLE_HEIGHT, TABLE_SIZE);
          const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
          const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);

          // Random X / Z (leaving some margin so tables don't clip outside walls)
          const randomX = Math.random() * (FLOOR_DETAILS.width - 2 * TABLE_SIZE) - (FLOOR_DETAILS.width / 2 - TABLE_SIZE);
          const randomZ = Math.random() * (FLOOR_DETAILS.depth - 2 * TABLE_SIZE) - (FLOOR_DETAILS.depth / 2 - TABLE_SIZE);

          tableMesh.position.x = randomX;
          tableMesh.position.z = randomZ;
          tableMesh.position.y = floorIndex * FLOOR_HEIGHT + WALL_THICKNESS / 2 + TABLE_HEIGHT / 2 + BUILDING_OFFSET;
          tableMesh.castShadow = true;
          tableMesh.receiveShadow = true;
          floorGroup.add(tableMesh);
        });
      }

      return floorGroup;
    };

    // Create all floors
    const floorMeshes: THREE.Object3D[] = [];
    floors.forEach((floor, index) => {
      const floorStructure = createFloorStructure(index, floor);
      // Store the floor "id" for reference in raycasting
      floorStructure.userData.floorId = floor.id;
      floorMeshes.push(floorStructure);
      scene.add(floorStructure);
    });

    // Orbit controls (dynamically imported)
    import('three/examples/jsm/controls/OrbitControls').then((module) => {
      const { OrbitControls } = module;
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = true;
      controls.maxPolarAngle = Math.PI / 2;
      controlsRef.current = controls;
    });

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleMouseMove = throttle((event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshes, true);

      // Reset highlights
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

    // On floor click => find floorId => onFloorClick callback
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
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

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Handle window resize
    const onWindowResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
      }
    };
    window.addEventListener('resize', onWindowResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controlsRef.current?.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', onWindowResize);
      controlsRef.current?.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [floors, onFloorClick]);

  return <div ref={mountRef} style={{ cursor: 'pointer' }} />;
}

// FloorUsersList
function FloorUsersList({ floorName, users }: { floorName: string; users: string[] }) {
  return (
    <div style={styles.usersListContainer}>
      <h2 style={styles.usersListTitle}>{floorName} - Users</h2>
      <ul style={styles.usersList}>
        {users.map((user, index) => (
          <li key={index} style={styles.userListItem}>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------
// 3. Main Page Component
// ------------------------------------------------
export default function FloorPage() {
  const [floorsData, setFloorsData] = useState<FloorData[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<number>(0);
  const [showFloorList, setShowFloorList] = useState(false);

  // This will map floorId -> { floorName: string; users: string[] }
  const [floorUsersMapping, setFloorUsersMapping] = useState<{
    [key: number]: { floorName: string; users: string[] }
  }>({});

  // Fetch data from our new endpoint
  useEffect(() => {
    async function fetchData() {
      try {
        // building_id = 14 (adjust if needed)
        const res = await fetch("http://localhost:8000/fetch-latest-building-floors-with-personnels");
        const data: FloorData[] = await res.json();
        if (Array.isArray(data)) {
          setFloorsData(data);
          if (data.length > 0) {
            setSelectedFloorId(data[0].id); // default to first floor
          }
          // Build the user mapping
          const mapping: { [key: number]: { floorName: string; users: string[] } } = {};
          data.forEach((floor) => {
            mapping[floor.id] = {
              floorName: floor.name,
              users: floor.users ?? []
            };
          });
          setFloorUsersMapping(mapping);
        }
      } catch (err) {
        console.error("Error fetching floors:", err);
      }
    }
    fetchData();
  }, []);

  // Handler for 2D Capacity View box clicks
  const handleCapacityClick = (floorId: number) => {
    setSelectedFloorId(floorId);
    setShowFloorList(true);
  };

  return (
    <ThreeColumnLayout
      // Left Column: Color Legend + 2D Capacity View + Floor List (shown on click)
      leftComponent={
        <>
          <FloorColorBar />
          <FloorList floors={floorsData} />
          <FloorCapacityView floors={floorsData} onCapacityClick={handleCapacityClick} />
          
        </>
      }
      // Center Column: 3D Renderer
      centerComponent={
        <Floor3DRenderer floors={floorsData} onFloorClick={setSelectedFloorId} />
      }
      // Right Column: User List for selected floor
      rightComponent={
        (selectedFloorId in floorUsersMapping) && (
          <FloorUsersList
            floorName={floorUsersMapping[selectedFloorId].floorName}
            users={floorUsersMapping[selectedFloorId].users}
          />
        )
      }
    />
  );
}

// ------------------------------------------------
// 4. Inline Styles (unchanged subcomponent styling)
// ------------------------------------------------
const styles: { [key: string]: React.CSSProperties } = {
  colorBarContainer: {
    width: '100%',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(5px)',
    background: 'rgba(255, 255, 255, 0.05)',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
    marginBottom: '1.5rem',
  },
  legendTitle: {
    marginBottom: '1rem',
    fontSize: '1.2rem',
    textShadow: '0 0 8px rgba(0,255,255,0.6)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  legendColorBox: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    marginRight: '0.5rem',
    border: '1px solid #fff',
  },
  legendLabel: {
    fontSize: '0.9rem',
  },
  floorListContainer: {
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.6rem',
    marginBottom: '1rem',
    textShadow: '0 0 6px rgba(0,255,255,0.6)',
  },
  floorList: {
    listStyleType: 'none',
    padding: 0,
  },
  floorListItem: {
    marginBottom: '0.8rem',
    fontSize: '1rem',
    transition: 'color 0.3s',
    cursor: 'default',
  },
  capacityViewContainer: {
    background: 'rgba(255,255,255,0.07)',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    marginBottom: '1.5rem',
  },
  capacityBoxes: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  capacityBox: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: '8px',
    transition: 'transform 0.3s, box-shadow 0.3s',
    boxShadow: '0 0 8px rgba(255,255,255,0.3)',
    cursor: 'pointer',
  },
  usersListContainer: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  },
  usersListTitle: {
    fontSize: '1.6rem',
    marginBottom: '1rem',
    textShadow: '0 0 6px rgba(0,255,255,0.6)',
  },
  usersList: {
    listStyleType: 'none',
    padding: 0,
  },
  userListItem: {
    marginBottom: '0.8rem',
    fontSize: '1rem',
    transition: 'color 0.3s',
    cursor: 'default',
  },
};
