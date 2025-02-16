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
  type: "person";
  id: number;
  name: string;
  width: number;
  height: number;
}

const FloorPlan2: React.FC<FloorPlanProps> = ({ floorId }) => {
  const [cellSize, setCellSize] = useState(20);
  const [floorData, setFloorData] = useState<FloorData | null>(null);
  const [itemsInCells, setItemsInCells] = useState<(DroppedItem | null)[]>([]);

  // Fetch floor data
  useEffect(() => {
    const fetchFloorData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/fetch-floor/${floorId}`);
        const { width, length } = response.data;
        setFloorData({ width, length });
      } catch (error) {
        console.error("Error fetching floor data:", error);
      }
    };

    if (floorId) {
      fetchFloorData();
    }
  }, [floorId]);

  // Fetch staff members and place them on the grid
  useEffect(() => {
    if (!floorData) return; // Wait for floor data before proceeding

    const fetchStaffPersonnel = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/fetch-staff-personnel/${floorId}`);
        const staffMembers: DroppedItem[] = response.data;

        console.log("Fetched staff members:", staffMembers);

        // Populate grid with staff members only
        const newGrid = Array(floorData.width * floorData.length).fill(null);
        staffMembers.forEach((person) => {
          // Using person.x_coor and person.y_coor directly for proper index calculation
          const index = person.y_coor * floorData.width + person.x_coor;
          console.log(`Placing ${person.name} at index ${index} (x: ${person.x_coor}, y: ${person.y_coor})`);
          newGrid[index] = person;
        });

        setItemsInCells([...newGrid]); // Force state update
      } catch (error) {
        console.error("Error fetching staff personnel:", error);
      }
    };

    fetchStaffPersonnel();
  }, [floorId, floorData]); // Runs after floorData is available

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

  // Handle dropping a staff member
  const handleDrop = async (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    const personId = e.dataTransfer.getData("personId");
    const personName = e.dataTransfer.getData("personName");

    const newItems = [...itemsInCells];
    const index = row * floorData.width + col;

    // Check if cell is occupied before dropping the item
    if (newItems[index] !== null) {
      console.warn("Cell already occupied!");
      return;
    }

    // Add the person to the grid
    newItems[index] = {
      type: "person",
      id: parseInt(personId),
      name: personName,
      width: 1,
      height: 1,
    };

    setItemsInCells(newItems);

    // Update coordinates of the staff in the backend
    try {
      await axios.post("http://localhost:8000/update-personnel-coordinates/", {
        personnel_id: parseInt(personId),
        x_coor: col,
        y_coor: row,
      });
      console.log("Staff coordinates updated successfully!");
    } catch (error) {
      console.error("Failed to update coordinates:", error);
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
        {itemsInCells.map((item, index) => {
          const row = Math.floor(index / floorData.width);
          const col = index % floorData.width;

          return (
            <div
              key={index}
              className="border border-gray-600 flex justify-center items-center cursor-crosshair transition-all hover:bg-[#444]"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: item?.type === "person" ? "lightgray" : "transparent",
                boxShadow: item ? "0px 0px 8px rgba(255, 255, 255, 0.2)" : "none",
              }}
              onDrop={(e) => handleDrop(e, row, col)}
              onDragOver={handleDragOver}
            >
              {item?.type === "person" && (
                <span
                  style={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {item.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlan2;
