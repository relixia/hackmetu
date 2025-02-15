"use client";

import React from "react";
import { useDrag } from "react-dnd";

const ITEM_TYPE = "CHAIR";

export default function ChairDragItem() {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPE,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef}
      style={{
        width: "60px",
        height: "60px",
        backgroundColor: "#F96E2A", // Accent color
        color: "#FBF8EF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "grab",
        opacity: isDragging ? 0.5 : 1,
        marginTop: "1rem",
      }}
    >
      Chair
    </div>
  );
}
