import React, { useEffect, useState } from "react";
import axios from "axios";

interface FloorPlanProps {
  floorId: number; // Floor ID to fetch dimensions
}

interface FloorData {
  width: number;
  length: number;
}

interface DroppedItem {
  name: string;
  width: number;
  height: number;
}

const itemColors: Record<string, string> = {
  "Table": "green",
  "Cabinet": "yellow",
  "Door": "gray",
};

// Function to determine background color
const getItemColor = (itemName: string) => {
  for (const key in itemColors) {
    if (itemName.includes(key)) {
      return itemColors[key];
    }
  }
  return "";
};

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
        setItemsInCells(Array(width * length).fill(null)); // Reset items when switching floors
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

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    const itemName = e.dataTransfer.getData("item");

    let itemWidth = 1;
    let itemHeight = 1;

    if (itemName === "Table Medium") itemWidth = 2;
    if (itemName === "Table Large") itemWidth = 3;
    if (itemName === "Table Medium (Vertical)") {
      itemWidth = 1;
      itemHeight = 2;
    }
    if (itemName === "Table Large (Vertical)") {
      itemWidth = 1;
      itemHeight = 3;
    }

    if (!floorData || row + itemHeight > floorData.length || col + itemWidth > floorData.width) {
      console.warn("Item is too large for the selected space!");
      return;
    }

    const newItems = [...itemsInCells];

    for (let r = 0; r < itemHeight; r++) {
      for (let c = 0; c < itemWidth; c++) {
        const index = (row + r) * floorData.width + (col + c);
        if (newItems[index] !== null) {
          console.warn("Space is already occupied!");
          return;
        }
      }
    }

    for (let r = 0; r < itemHeight; r++) {
      for (let c = 0; c < itemWidth; c++) {
        const index = (row + r) * floorData.width + (col + c);
        newItems[index] = { name: itemName, width: itemWidth, height: itemHeight };
      }
    }

    setItemsInCells(newItems);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!floorData) return;
    const index = row * floorData.width + col;
    if (itemsInCells[index] !== null) {
      const newItems = [...itemsInCells];
      const item = newItems[index];
      if (item) {
        for (let r = 0; r < item.height; r++) {
          for (let c = 0; c < item.width; c++) {
            const itemIndex = (row + r) * floorData.width + (col + c);
            newItems[itemIndex] = null;
          }
        }
      }
      setItemsInCells(newItems);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!floorData) {
    return <div className="text-center text-lg font-semibold">Loading Floor Data...</div>;
  }

  return (
    <div className="flex justify-center items-center bg-[#FBF8EF]">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${floorData.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${floorData.length}, ${cellSize}px)`,
          width: `${cellSize * floorData.width}px`,
          height: `${cellSize * floorData.length}px`,
        }}
      >
        {Array.from({ length: floorData.length * floorData.width }).map((_, index) => {
          const row = Math.floor(index / floorData.width);
          const col = index % floorData.width;
          const item = itemsInCells[index];

          return (
            <div
              key={index}
              className="border flex justify-center items-center cursor-crosshair"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: item ? getItemColor(item.name) : "",
              }}
              onDrop={(e) => handleDrop(e, row, col)}
              onDragOver={handleDragOver}
              onClick={() => handleCellClick(row, col)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlan;
