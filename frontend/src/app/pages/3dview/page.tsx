"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

// Helper function to generate grid cells
const createGrid = (width, height) => {
  const grid = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      grid.push([x, y]);
    }
  }
  return grid;
};

// Table and Chair Component
function TableAndChair({ position }) {
  return (
    <group position={position}>
      {/* Table */}
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
  );
}

// FloorAllocation Component (Updated)
function FloorAllocation({ gridWidth = 10, gridHeight = 10, objects }) {
  return (
    <group>
      {/* Floor Base */}
      <mesh position={[gridWidth / 2 - 0.5, 0, gridHeight / 2 - 0.5]}>
        <boxGeometry args={[gridWidth, 1, gridHeight]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>

      {/* Place objects on the floor */}
      {objects.map((obj, index) => (
        <group key={index}>
          {Array.from({ length: obj.width }).map((_, x) =>
            Array.from({ length: obj.length }).map((_, y) => {
              // If the object is workspace, add a table and chair
              if (obj.name === "workspace") {
                return (
                  <TableAndChair
                    key={`${x}-${y}`}
                    position={[obj.x + x, 1, obj.y + y]}
                  />
                );
              } else {
                return (
                  <mesh key={`${x}-${y}`} position={[obj.x + x, 1, obj.y + y]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={obj.color} />
                  </mesh>
                );
              }
            })
          )}
          <Text position={[obj.x + (obj.width - 1) / 2, 2.5, obj.y + (obj.length - 1) / 2]} fontSize={0.5} color="white">
            {obj.name}
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function AllocationPage() {
  const [activePopup, setActivePopup] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [objects, setObjects] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 1, length: 1 });
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [activeOption, setActiveOption] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);

  // Separate state for object dimensions (Width and Length for selected component)
  const [objectDimensions, setObjectDimensions] = useState({
    width: 1,
    length: 1,
  });

  // Fetch buildings on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const buildingsResponse = await fetch("http://localhost:8000/fetch-buildings");
        const buildingsData = await buildingsResponse.json();
        setBuildings(buildingsData);
  
        if (selectedFloor) {
          const objectsResponse = await fetch(`http://localhost:8000/fetch-objects/${selectedFloor}`);
          const objectsData = await objectsResponse.json();
  
          const mappedObjects = objectsData.map((obj) => ({
            ...obj,
            name: getNameForType(obj.o_type),
            width: obj.width || 1,  // Ensure width is defined
            length: obj.length || 1, // Ensure length is defined
            color: getColorForType2(obj.o_type),
            x: obj.x_coor,  // Ensure x and y coordinates are set properly
            y: obj.y_coor
          }));
  
          // Directly update the state with the mapped objects
          setObjects(mappedObjects);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setObjects([]); // Fallback to empty array in case of an error
      }
    };
  
    fetchData();
  }, [selectedFloor]);  // Runs when selectedFloor changes
    
  const handleSaveObject = (obj) => {
    const newObject = {
      name: obj.name,
      state: 1,
      floor_id: selectedFloor,
      o_type: obj.o_type,
      x_coor: obj.x_coor, // Use x_coor from the fetched object
      y_coor: obj.y_coor, // Use y_coor from the fetched object
      width: obj.width,
      length: obj.length,
      x: obj.x_coor, // Ensure consistency in naming
      y: obj.y_coor,
      color: obj.color,
    };
  
    setObjects((prevObjects) => [...prevObjects, newObject]);
    console.log("Object saved:", newObject);
  
    // Reset the form and selection after saving
    setActiveOption("");
    setObjectDimensions({ width: 1, length: 1 });
    setCoordinates({ x: 0, y: 0 });

  };
    
  const getColorForType2 = (type) => {
    // If type is a number (o_type from DB), convert it to name
    const typeMapping = {
      1: "pathway",
      2: "kitchen",
      3: "WC",
      4: "conference",
      5: "workspace",
    };
  
    // Convert number to name if needed
    const typeName = typeof type === "number" ? typeMapping[type] : type;
  
    switch (typeName) {
      case "kitchen":
        return "green";
      case "conference":
        return "blue";
      case "WC":
        return "gray";
      case "workspace":
        return "orange";
      case "pathway":
        return "darkgray";
      default:
        return "orange"; // Default color
    }
  };
  
      
  const getNameForType = (o_type) => {
    switch (o_type) {
      case 1:
        return "Pathway";
      case 2:
        return "Kitchen";
      case 3:
        return "WC";
      case 4:
        return "Conference";
      case 5:
        return "Workspace";
      default:
        return "Unknown";
    }
  };
  

  // Fetch floors for a selected building
  const fetchFloorsForBuilding = async (buildingId) => {
    try {
      const response = await fetch(`http://localhost:8000/fetch-floors/${buildingId}`);
      const data = await response.json();
      setFloors(data);
    } catch (error) {
      console.error("Error fetching floors:", error);
    }
  };

  // Fetch floor data (width, length) for the selected floor
  const fetchFloorData = async (buildingId, floorNumber) => {
    try {
      const response = await fetch(`http://localhost:8000/fetch-floor-by-building/${buildingId}/${floorNumber}`);
      const floor = await response.json();
      setDimensions({ width: floor.width, length: floor.length });
      setSelectedFloor(floor.id);
    } catch (error) {
      console.error("Error fetching floor data:", error);
    }
  };

  const handleSelectBuilding = (buildingId) => {
    setSelectedBuilding(buildingId);
    fetchFloorsForBuilding(buildingId); // Fetch floors for the selected building
  };

  const handleSelectFloor = (floorNumber) => {
    if (selectedBuilding) {
      fetchFloorData(selectedBuilding, floorNumber); // Fetch floor data based on selected building and floor
    }
  };

  // Handle object selection
  const handleSelect = (type) => {
    setActiveOption(type);

    // Reset object dimensions when a new component is selected
    setObjectDimensions({
      width: 1,
      length: 1,
    });
  };

  const handleClose = () => {
    setActivePopup(null);
  };

  const handleSave = async () => {
    const newObject = {
      name: activeOption,
      state: 1,
      floor_id: selectedFloor,
      o_type: getObjectType(activeOption),
      x_coor: coordinates.x,
      y_coor: coordinates.y,
      width: objectDimensions.width,
      length: objectDimensions.length,
      x: coordinates.x,
      y: coordinates.y,
      color: getColorForType(activeOption),
    };
  
    try {
      const response = await fetch("http://localhost:8000/create-object", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newObject),
      });
  
      if (!response.ok) throw new Error("Failed to save object");
  
      const result = await response.json();
      console.log("Object saved:", result);
  
      // Update local state with the newly saved object
      setObjects((prevObjects) => [...prevObjects, newObject]);
  
      // Reset the form and selection after saving
      setActiveOption("");
      setObjectDimensions({ width: 1, length: 1 });
      setCoordinates({ x: 0, y: 0 });
    } catch (error) {
      console.error("Error saving object:", error);
    }
  };
    
  const getObjectType = (name) => {
    switch (name) {
      case "pathway":
        return 1; // Pathway
      case "kitchen":
        return 2; // Kitchen
      case "WC":
        return 3; // WC
      case "conference":
        return 4; // Conference
      case "workspace":
        return 5; // Workspace
      default:
        return 0; // Default case if not found
    }
  };  

  const getColorForType = (type) => {
    switch (type) {
      case "kitchen":
        return "green";
      case "conference":
        return "blue";
      case "WC":
        return "gray";
      case "workspace":
        return "orange";
      case "pathway":
        return "darkgray";
      default:
        return "orange";
    }
  };

  const handleCoordinateChange = (axis, value) => {
    const newValue = Math.max(0, Math.min(9, value));
    setCoordinates((prevCoordinates) => ({
      ...prevCoordinates,
      [axis]: newValue,
    }));
  };

  const handleWidthChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setObjectDimensions({ ...objectDimensions, width: value });
    }
  };

  const handleLengthChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setObjectDimensions({ ...objectDimensions, length: value });
    }
  };

  return (
    <div className="w-screen h-screen relative flex">
      {/* Left Panel */}
      <div className="w-1/4 bg-black text-white p-6 border-r-4 border-teal-500 shadow-lg rounded-l-lg flex flex-col justify-between">
        <h2 className="text-3xl font-bold mb-6 text-teal-400">CC Floor Plan</h2>

        {/* Building Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold">Select Building</label>
          <select
            onChange={(e) => handleSelectBuilding(e.target.value)}
            className="w-full p-3 mt-2 bg-gray-800 text-white border-2 border-teal-500 rounded-md"
          >
            <option value="">Select Building</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                Building {building.id}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Selection */}
        {floors.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold">Select Floor</label>
            <select
              onChange={(e) => handleSelectFloor(e.target.value)}
              className="w-full p-3 mt-2 bg-gray-800 text-white border-2 border-teal-500 rounded-md"
            >
              <option value="">Select Floor</option>
              {floors.map((floor) => (
                <option key={floor.number} value={floor.number}>
                  Floor {floor.number}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Object Selection */}
        <div className="flex flex-col gap-4">
          {["pathway", "kitchen", "WC", "conference", "workspace"].map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="px-5 py-2 bg-teal-600 rounded-md shadow-md text-xl hover:bg-teal-500 transition duration-200 ease-in-out transform hover:scale-105"
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {activeOption && (
          <div className="mt-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold">Width</label>
              <input
                type="number"
                value={objectDimensions.width}
                onChange={handleWidthChange}
                className="w-full p-3 mt-2 bg-gray-800 text-white border-2 border-teal-500 rounded-md focus:outline-none focus:border-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold">Length</label>
              <input
                type="number"
                value={objectDimensions.length}
                onChange={handleLengthChange}
                className="w-full p-3 mt-2 bg-gray-800 text-white border-2 border-teal-500 rounded-md focus:outline-none focus:border-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold">X Coordinate</label>
              <input
                type="number"
                value={coordinates.x}
                onChange={(e) => handleCoordinateChange('x', parseInt(e.target.value))}
                className="w-full p-3 mt-2 bg-gray-800 text-white border-2 border-teal-500 rounded-md focus:outline-none focus:border-teal-300"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold">Y Coordinate</label>
              <input
                type="number"
                value={coordinates.y}
                onChange={(e) => handleCoordinateChange('y', parseInt(e.target.value))}
                className="w-full p-3 mt-2 bg-gray-800 text-white border-2 border-teal-500 rounded-md focus:outline-none focus:border-teal-300"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full px-5 py-2 bg-teal-600 rounded-md text-xl hover:bg-teal-500 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Save Placement
            </button>
          </div>
        )}
      </div>

      {/* Right Side with Canvas */}
      <div className="w-3/4">
        <Canvas camera={{ position: [0, 20, 20], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1} />
          <FloorAllocation gridWidth={dimensions.width} gridHeight={dimensions.length} objects={objects} />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
