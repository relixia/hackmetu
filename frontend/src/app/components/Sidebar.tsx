"use client";

import React, { CSSProperties } from "react";

interface SidebarProps {
  style?: CSSProperties;
  onSelectObject: (objectName: string) => void;
}

export default function Sidebar({ style, onSelectObject }: SidebarProps) {
  return (
    <div style={{ ...style }}>
      <h2 style={{ color: "#FBF8EF" }}>Sidebar</h2>
      <p style={{ color: "#C9E6F0" }}>
        Select an object to place on the floor:
      </p>
      <button
        onClick={() => onSelectObject("chair")}
        style={{
          backgroundColor: "#F96E2A",
          color: "#FBF8EF",
          padding: "0.5rem 1rem",
          border: "none",
          cursor: "pointer",
          marginRight: "0.5rem",
        }}
      >
        Chair
      </button>
      <button
        onClick={() => onSelectObject("table")}
        style={{
          backgroundColor: "#F96E2A",
          color: "#FBF8EF",
          padding: "0.5rem 1rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        Table
      </button>
    </div>
  );
}
