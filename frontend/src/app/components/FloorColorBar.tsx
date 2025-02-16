"use client";
import React from "react";

export default function FloorColorBar() {
  return (
    <div style={styles.colorBarContainer}>
      <h3 style={styles.legendTitle}>Color Legend</h3>
      <div style={styles.legendItem}>
        <span style={{ ...styles.legendColorBox, backgroundColor: "rgba(0, 255, 0, 0.6)" }} />
        <span style={styles.legendLabel}>Below 50% Capacity</span>
      </div>
      <div style={styles.legendItem}>
        <span style={{ ...styles.legendColorBox, backgroundColor: "rgba(255, 255, 0, 0.6)" }} />
        <span style={styles.legendLabel}>50% - 80% Capacity</span>
      </div>
      <div style={styles.legendItem}>
        <span style={{ ...styles.legendColorBox, backgroundColor: "rgba(255, 0, 0, 0.6)" }} />
        <span style={styles.legendLabel}>80%+ Capacity</span>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  colorBarContainer: {
    marginBottom: "1rem",
    padding: "0.5rem",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
  },
  legendTitle: {
    marginBottom: "0.5rem",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  legendColorBox: {
    display: "inline-block",
    width: "24px",
    height: "24px",
    marginRight: "0.5rem",
    border: "1px solid #fff",
  },
  legendLabel: {
    fontSize: "0.9rem",
  },
};
