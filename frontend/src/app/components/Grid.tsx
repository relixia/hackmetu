"use client";

import React from "react";
import GridCell from "./GridCell";

interface FloorData {
  id: number;
  name: string;
  width: number;  // number of cells horizontally
  height: number; // number of cells vertically
}

interface TableData {
  x: number;
  y: number;
}

interface GridProps {
  floor: FloorData;
  tables: TableData[];
  onDropTable: (x: number, y: number) => void;
}

export default function Grid({ floor, tables, onDropTable }: GridProps) {
  // We’ll make the entire grid 60% of the viewport width
  // and let the height auto-scale based on the grid’s aspect ratio
  const gridStyle: React.CSSProperties = {
    width: "60vw",
    display: "grid",
    gridTemplateColumns: `repeat(${floor.width}, 1fr)`,
    gridTemplateRows: `repeat(${floor.height}, 1fr)`,
    border: "2px solid #C9E6F0", // secondary color for the border
    position: "relative",
    aspectRatio: `${floor.width} / ${floor.height}`, // keeps correct ratio
    backgroundColor: "#C9E6F0",
  };

  const cells = [];
  for (let row = 0; row < floor.height; row++) {
    for (let col = 0; col < floor.width; col++) {
      // Check if there's a table at this cell
      const hasTable = tables.some((t) => t.x === col && t.y === row);
      cells.push(
        <GridCell
          key={`cell-${row}-${col}`}
          x={col}
          y={row}
          hasTable={hasTable}
          onDropTable={onDropTable}
        />
      );
    }
  }

  return <div style={gridStyle}>{cells}</div>;
}
