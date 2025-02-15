"use client";

import React from "react";
import { useDrop } from "react-dnd";

const ITEM_TYPE = "CHAIR";

interface GridCellProps {
  x: number;
  y: number;
  hasTable: boolean;
  onDropTable: (x: number, y: number) => void;
}

export default function GridCell({ x, y, hasTable, onDropTable }: GridCellProps) {
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: () => onDropTable(x, y),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [x, y, onDropTable]
  );

  // Just show a small square or circle if hasTable == true
  return (
    <div
      ref={dropRef}
      style={{
        border: "1px dashed #78B3CE",
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: isOver ? "#F96E2A33" : "transparent",
      }}
    >
      {hasTable && (
        <div
          style={{
            backgroundColor: "#F96E2A",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            position: "absolute",
            top: "20%",
            left: "20%",
          }}
        />
      )}
    </div>
  );
}
