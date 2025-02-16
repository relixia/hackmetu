import React, { useEffect, useState } from "react";
import axios from "axios";

interface FloorPlanProps {
  floorId: number;
}

interface FloorData {
  width: number;
  length: number;
}

interface DroppedItem {
  type: "item";
  id: number;
  name: string;
  width: number;
  height: number;
  x_coor: number;
  y_coor: number;
}

// Mapping object names to their type IDs
const objectTypeMapping: Record<string, number> = {
  "Table Small": 5,
  "Table Medium": 5,
  "Table Large": 5,
  "Cabinet": 4,
  "Door": 1,
};

// List of items
const itemMenu = [
  { name: "Cabinet", width: 1, height: 1 },
  { name: "Door", width: 1, height: 2 },
  { name: "Table Small", width: 2, height: 1 },
  { name: "Table Medium", width: 2, height: 2 },
  { name: "Table Large", width: 3, height: 2 },
];

const itemColors: Record<string, string> = {
  "Cabinet": "#FFC107",
  "Door": "#9E9E9E",
  "Table": "#4CAF50",
};

// Determine item color
const getItemColor = (itemName?: string) => {
  if (!itemName) return "transparent"; // Return default color for undefined items

  for (const key in itemColors) {
    if (itemName.includes(key)) {
      return itemColors[key];
    }
  }
  return "#1E1E1E"; // Default Dark Background
};


const FloorPlan1: React.FC<FloorPlanProps> = ({ floorId }) => {
  const [cellSize, setCellSize] = useState(20);
  const [floorData, setFloorData] = useState<FloorData | null>(null);
  const [itemsInCells, setItemsInCells] = useState<(DroppedItem | null)[]>([]);

  // Fetch floor data and objects
  useEffect(() => {
    const fetchFloorData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/fetch-floor/${floorId}`);
        const { width, length } = response.data;
        setFloorData({ width, length });
        setItemsInCells(Array(width * length).fill(null));
      } catch (error) {
        console.error("Error fetching floor data:", error);
      }
    };

    const fetchPlacedObjects = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/fetch-placed-objects/${floorId}`);
        const placedObjects: DroppedItem[] = response.data;

        // Populate grid with existing objects
        setItemsInCells((prevGrid) => {
          const newGrid = [...prevGrid];
          placedObjects.forEach((item) => {
            const index = item.y_coor * (floorData?.width || 1) + item.x_coor;
            newGrid[index] = item;
          });
          return newGrid;
        });
      } catch (error) {
        console.error("Error fetching placed objects:", error);
      }
    };

    if (floorId) {
      fetchFloorData().then(fetchPlacedObjects);
    }
  }, [floorId, floorData?.width, floorData?.length]);

  // Adjust cell size based on screen width
  useEffect(() => {
    if (floorData) {
      const updateSize = () => {
        const newContainerWidth = window.innerWidth * 0.6;
        const newContainerHeight = window.innerHeight * 0.8;
        const maxCellSize = Math.min(newContainerWidth / floorData.width, newContainerHeight / floorData.length);
        setCellSize(Math.floor(maxCellSize));
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, [floorData]);

  // Handle dropping an item onto the grid
  const handleDrop = async (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();

    const itemName = e.dataTransfer.getData("item");
    const itemWidth = parseInt(e.dataTransfer.getData("width"));
    const itemHeight = parseInt(e.dataTransfer.getData("height"));

    const itemData = itemMenu.find((item) => item.name === itemName);
    if (!itemData) {
      console.warn("Dropped item is not in the allowed menu.");
      return;
    }

    // Ensure the object fits inside the grid
    if (row + itemData.height > floorData.length || col + itemData.width > floorData.width) {
      console.warn("Object is out of grid bounds!");
      return;
    }

    // Check if the space is available (no overlapping)
    for (let r = row; r < row + itemData.height; r++) {
      for (let c = col; c < col + itemData.width; c++) {
        const index = r * floorData.width + c;
        if (itemsInCells[index]) {
          console.warn("Space is already occupied!");
          return;
        }
      }
    }

    // Create the object to add to the grid
    const newItem: DroppedItem = {
      type: "item",
      id: Date.now(),
      name: itemData.name,
      width: itemData.width,
      height: itemData.height,
      x_coor: col,
      y_coor: row,
    };

    // Add object to grid
    setItemsInCells((prevGrid) => {
      const newGrid = [...prevGrid];
      for (let r = row; r < row + itemData.height; r++) {
        for (let c = col; c < col + itemData.width; c++) {
          const index = r * floorData.width + c;
          newGrid[index] = newItem;
        }
      }
      return newGrid;
    });

    // Ensure valid object type
    const objectType = objectTypeMapping[newItem.name];
    if (!objectType) {
      console.error(`Error: No type found for object ${newItem.name}`);
      return;
    }

    // Determine state: Tables = true, Others = false
    const isTable = newItem.name.includes("Table");

    // Save object placement in the backend using create-or-update-object
    try {
      await axios.post(
        "http://localhost:8000/create-or-update-object/",
        {
          state: isTable, // True for tables, False otherwise
          floor_id: floorId,
          o_type: objectType, // Map from predefined types
          x_coor: col,
          y_coor: row,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Object placement saved!");
    } catch (error) {
      console.error("Failed to save object placement:", error);
    }
  };

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!floorData) {
    return <div className="text-center text-lg font-semibold text-gray-400">Loading Floor Data...</div>;
  }

  return (
    <div className="flex justify-center items-center bg-transparent p-0">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${floorData?.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${floorData?.length}, ${cellSize}px)`,
          width: `${cellSize * (floorData?.width || 0)}px`,
          height: `${cellSize * (floorData?.length || 0)}px`,
        }}
      >
        {itemsInCells.map((item, index) => (
          <div
            key={index}
            className="border border-gray-600 flex justify-center items-center cursor-crosshair transition-all hover:bg-[#444]"
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor: item ? getItemColor(item.name) : "transparent",
            }}
            onDrop={(e) => handleDrop(e, Math.floor(index / floorData.width), index % floorData.width)}
            onDragOver={handleDragOver}
          >
            {item && <span style={{ color: "black", fontWeight: "bold", fontSize: "12px" }}>{item.name}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorPlan1;
