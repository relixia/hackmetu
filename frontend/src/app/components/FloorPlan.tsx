import React, { useEffect, useState } from "react";

interface FloorPlanProps {
  width: number;
  length: number; // Changed height to length
}

const FloorPlan: React.FC<FloorPlanProps> = ({ width, length }) => {
  const [cellSize, setCellSize] = useState(20);
  const [containerSize, setContainerSize] = useState({ width: 0, length: 0 }); // Changed height to length

  useEffect(() => {
    const updateSize = () => {
      const newContainerWidth = window.innerWidth * 0.6;
      const newContainerLength = window.innerHeight * 0.8; // Changed height to length
      setContainerSize({ width: newContainerWidth, length: newContainerLength }); // Changed height to length
      const maxCellSize = Math.min(newContainerWidth / width, newContainerLength / length); // Changed height to length
      setCellSize(Math.floor(maxCellSize));
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [width, length]); // Changed height to length

  return (
    <div className="flex justify-center items-center border border-gray-300 p-2 bg-white"
         style={{ width: "60vw", height: "80vh", display: "flex", overflow: "hidden" }}>
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${length}, ${cellSize}px)`, // Changed height to length
          width: `${cellSize * width}px`,
          height: `${cellSize * length}px`, // Changed height to length
          marginTop: "10px",  // Small space from the top
          marginBottom: "10px",  // Small space from the bottom
        }}
      >
        {Array.from({ length: length * width }).map((_, index) => ( // Changed height to length
          <div
            key={index}
            className="border bg-gray-200 cursor-pointer"
            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            onClick={() => console.log(`Clicked on (${Math.floor(index / width)}, ${index % width})`)}
          />
        ))}
      </div>
    </div>
  );
};

export default FloorPlan;
