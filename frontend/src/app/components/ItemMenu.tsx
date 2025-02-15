import React from "react";

interface ItemMenuProps {
  cellSize: number;
}

const ItemMenu: React.FC<ItemMenuProps> = ({ cellSize }) => {
  // Define items with different sizes (including vertical ones)
  const items = [
    { name: "Cabinet", width: cellSize, height: cellSize },
    { name: "Door", width: cellSize, height: cellSize * 2 },
    { name: "Table Small", width: cellSize * 2, height: cellSize },
    { name: "Table Medium", width: cellSize * 2, height: cellSize * 2 },
    { name: "Table Large", width: cellSize * 3, height: cellSize * 2 },

    // Add vertical tables
    { name: "Table Small (Vertical)", width: cellSize, height: cellSize * 2 },
    { name: "Table Medium (Vertical)", width: cellSize, height: cellSize * 3 },
    { name: "Table Large (Vertical)", width: cellSize, height: cellSize * 4 },
  ];

  const handleDragStart = (e: React.DragEvent, item: string, width: number, height: number) => {
    e.dataTransfer.setData("item", item);
    e.dataTransfer.setData("width", width.toString());
    e.dataTransfer.setData("height", height.toString());
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 border bg-gray-100">
      <h3 className="text-lg font-semibold">Item Menu</h3>
      <div className="grid gap-2">
        {items.map(({ name, width, height }) => (
          <div
          key={name}
          className="border flex items-center justify-center cursor-pointer text-white font-bold"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: name.includes("Table") ? "green"
              : name.includes("Cabinet") ? "yellow"
              : name.includes("Door") ? "gray"
              : "#ccc",
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, name, width, height)}
        >

        </div>
        
        ))}
      </div>
    </div>
  );
};

export default ItemMenu;

