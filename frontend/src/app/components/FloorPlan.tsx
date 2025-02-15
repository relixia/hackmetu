import React, { useEffect, useState } from "react";

interface FloorPlanProps {
  width: number;
  length: number;
  cellSize: number;
  onDrop: (item: string, row: number, col: number) => void; // Add this line
}

interface DroppedItem {
  name: string;
  width: number;
  height: number;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ width, length }) => {
  const [cellSize, setCellSize] = useState(20);
  const [containerSize, setContainerSize] = useState({ width: 0, length: 0 });
  const [itemsInCells, setItemsInCells] = useState<(DroppedItem | null)[]>(Array(width * length).fill(null));

  useEffect(() => {
    const updateSize = () => {
      const newContainerWidth = window.innerWidth * 0.6;
      const newContainerLength = window.innerHeight * 0.8;
      setContainerSize({ width: newContainerWidth, length: newContainerLength });

      const maxCellSize = Math.min(newContainerWidth / width, newContainerLength / length);
      setCellSize(Math.floor(maxCellSize));
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [width, length]);

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
  
    const itemName = e.dataTransfer.getData("item");
  
    let itemWidth = 1; // Default: 1x1 cell
    let itemHeight = 1; // Default: 1x1 cell
  
    // Define special rules for specific items (horizontal)
    if (itemName === "Table Medium") {
      itemWidth = 2; // Occupies 2 horizontal cells
    } else if (itemName === "Table Large") {
      itemWidth = 3; // Occupies 3 horizontal cells
    }
  
    // Define special rules for vertical items
    if (itemName === "Table Medium (Vertical)") {
      itemWidth = 1; // Occupies 1 cell wide
      itemHeight = 2; // Occupies 2 cells vertically
    } else if (itemName === "Table Large (Vertical)") {
      itemWidth = 1; // Occupies 1 cell wide
      itemHeight = 3; // Occupies 3 cells vertically
    } else if (itemName === "Table Large (Vertical)") {
      itemWidth = 1; // Occupies 1 cell wide
      itemHeight = 4; // Occupies 4 cells vertically
    }
  
    // Check if the item fits within the grid boundaries
    if (row + itemHeight > length || col + itemWidth > width) {
      console.warn("Item is too large for the selected space!");
      return;
    }
  
    const newItems = [...itemsInCells];
  
    // Check if the space is already occupied
    for (let r = 0; r < itemHeight; r++) {
      for (let c = 0; c < itemWidth; c++) {
        const index = (row + r) * width + (col + c);
        if (newItems[index] !== null) {
          console.warn("Space is already occupied!");
          return;
        }
      }
    }
  
    // Place the item in the selected cell and its occupied area
    for (let r = 0; r < itemHeight; r++) {
      for (let c = 0; c < itemWidth; c++) {
        const index = (row + r) * width + (col + c);
        newItems[index] = { name: itemName, width: itemWidth, height: itemHeight };
      }
    }
  
    setItemsInCells(newItems);
  };
  
  

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex justify-center items-center bg-[#FBF8EF]"
         style={{ display: "flex", overflow: "hidden" }}>
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${length}, ${cellSize}px)`,
          width: `${cellSize * width}px`,
          height: `${cellSize * length}px`, // Changed height to length
          marginTop: "10px",  // Small space from the top
          marginBottom: "10px",  // Small space from the bottom
          marginLeft: "10px",
          marginRight: "10px"
        }}
      >
        {Array.from({ length: length * width }).map((_, index) => {
          const row = Math.floor(index / width);
          const col = index % width;
          const item = itemsInCells[index];

          return (
            <div
              key={index}
              className="border bg-gray-200 flex justify-center items-center"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: item ? "#d3d3d3" : "",
              }}
              onDrop={(e) => handleDrop(e, row, col)}
              onDragOver={handleDragOver}
            >
              {item && <span className="text-xs">{item.name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlan;
