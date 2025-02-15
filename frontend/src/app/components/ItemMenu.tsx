import React, { useState } from "react";

interface ItemMenuProps {
  // We will define grid dimensions and dynamic cell sizes
  width: number;
  length: number;
  cellSize: number;
}

const ItemMenu: React.FC<ItemMenuProps> = ({ width, length, cellSize }) => {
  // Example items array for demonstration
  const [items] = useState<string[]>(["Desk", "Chair", "Cabinet", "Lamp"]);

  return (
    <div
      className="flex justify-center items-center"
      style={{ width: `${cellSize * width}px`, overflow: "hidden" }}
    >
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${length}, ${cellSize}px)`,
        }}
      >
        {/* Create the table with varying sizes */}
        {Array.from({ length: width * length }).map((_, index) => {
          // You can add logic here to vary the content and size of each cell
          const row = Math.floor(index / width);
          const col = index % width;
          const item = items[(row + col) % items.length]; // Example logic to vary items
          const dynamicSize = cellSize + (row + col) * 2; // Example logic for different sizes

          return (
            <div
              key={index}
              className="border bg-gray-200"
              style={{
                width: `${dynamicSize}px`,
                height: `${dynamicSize}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                backgroundColor: "#f0f0f0",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemMenu;
