import React, { useEffect, useState } from "react";

interface FloorPlanProps {
  width: number;
  length: number;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ width, length }) => {
  const [cellSize, setCellSize] = useState(20);
  const [containerSize, setContainerSize] = useState({ width: 0, length: 0 });
  const [itemsInCells, setItemsInCells] = useState<string[]>(Array(width * length).fill(""));

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
    const item = e.dataTransfer.getData("item");
    const index = row * width + col;
    const newItems = [...itemsInCells];
    newItems[index] = item; // Update the cell with the dropped item
    setItemsInCells(newItems);
    console.log(`Dropped ${item} at cell (${row}, ${col})`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow the drop by preventing the default behavior
  };

  return (
    <div
      className="flex justify-center items-center border border-gray-300 p-2 bg-white"
      style={{ display: "flex", overflow: "hidden" }}
    >
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${length}, ${cellSize}px)`,
          width: `${cellSize * width}px`,
          height: `${cellSize * length}px`,
          marginTop: "10px",
          marginBottom: "10px",
          marginLeft: "10px",
          marginRight: "10px",
        }}
      >
        {Array.from({ length: length * width }).map((_, index) => {
          const row = Math.floor(index / width);
          const col = index % width;
          return (
            <div
              key={index}
              className="border bg-gray-200 cursor-pointer"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: itemsInCells[index] ? "#d3d3d3" : "",
              }}
              onDrop={(e) => handleDrop(e, row, col)}
              onDragOver={handleDragOver}
            >
              {itemsInCells[index] && (
                <div className="text-center">{itemsInCells[index]}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlan;
