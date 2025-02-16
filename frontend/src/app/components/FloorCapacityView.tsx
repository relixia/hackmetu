"use client";
import React from "react";

// Adjust this interface to match your actual FloorData shape:
interface FloorData {
  id: number;
  name: string;
  area: number;
  occupantCount: number;
  capacity: number;
  tableCoordinates?: { x: number; z: number }[];
  users?: string[];
}

export default function FloorCapacityView({ floors }: { floors: FloorData[] }) {
  const getFloorColor = (floor: FloorData) => {
    const ratio = floor.occupantCount / floor.capacity;
    if (ratio < 0.5) return "rgba(0, 255, 0, 0.8)";
    if (ratio < 0.8) return "rgba(255, 255, 0, 0.8)";
    return "rgba(255, 0, 0, 0.8)";
  };

  return (
    <div style={styles.capacityViewContainer}>
      <h2 style={styles.sectionTitle}>2D Capacity View</h2>
      <div style={styles.capacityBoxes}>
        {floors.map((floor) => {
          const color = getFloorColor(floor);
          return (
            <div
              key={floor.id}
              style={{
                ...styles.capacityBox,
                backgroundColor: color,
              }}
            >
              {floor.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  capacityViewContainer: {
    marginTop: "1rem",
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    marginBottom: "0.5rem",
    fontWeight: "bold",
  },
  capacityBoxes: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  capacityBox: {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: "bold",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
