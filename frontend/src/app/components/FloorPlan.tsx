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
  type: "person" | "item";
  id: number;
  name: string;
  width: number;
  height: number;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ floorId }) => {
  const [cellSize, setCellSize] = useState(20);
  const [floorData, setFloorData] = useState<FloorData | null>(null);
  const [itemsInCells, setItemsInCells] = useState<(DroppedItem | null)[]>([]);

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

    if (floorId) {
      fetchFloorData();
    }
  }, [floorId]);

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
      width: 1, // Assuming each person takes 1x1 space
      height: 1,
    };

    setItemsInCells(newItems);

    // Update coordinates of the personnel in the backend
    try {
      await axios.post("http://localhost:8000/update-personnel-coordinates/", {
        personnel_id: parseInt(personId),
        x_coor: col,
        y_coor: row,
      });
      console.log("Coordinates updated successfully!");
    } catch (error) {
      console.error("Failed to update coordinates:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex justify-center items-center bg-[#FBF8EF]">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${floorData?.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${floorData?.length}, ${cellSize}px)`,
          width: `${cellSize * (floorData?.width || 0)}px`,
          height: `${cellSize * (floorData?.length || 0)}px`,
        }}
      >
        {Array.from({ length: floorData?.length * floorData?.width }).map((_, index) => {
          const row = Math.floor(index / (floorData?.width || 1));
          const col = index % (floorData?.width || 1);
          const item = itemsInCells[index];

          return (
            <div
              key={index}
              className="border flex justify-center items-center cursor-crosshair"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: item?.type === "person" ? "lightgray" : "transparent", // Optional: indicate dropped cells
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
                  {item.name} {/* Display personnel ID in grid */}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlan;
