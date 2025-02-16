import React, { useEffect, useState } from "react";
import axios from "axios";

interface FloorPlanProps {
  floorId: number;
}

interface FloorData {
  width: number;
  length: number;
}

interface DroppedItem {
  type: "person" | "workspace";
  id: number;
  name: string;
  width: number;
  height: number;
  x_coor: number;
  y_coor: number;
}

const FloorPlan2: React.FC<FloorPlanProps> = ({ floorId }) => {
  const [cellSize, setCellSize] = useState(20);
  const [floorData, setFloorData] = useState<FloorData | null>(null);
  const [itemsInCells, setItemsInCells] = useState<(DroppedItem | null)[]>([]);

  // Fetch floor data
  useEffect(() => {
    const fetchFloorData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/fetch-floor/${floorId}`);
        const { width, length } = response.data;
        setFloorData({ width, length });
      } catch (error) {
        console.error("Error fetching floor data:", error);
      }
    };

    if (floorId) {
      fetchFloorData();
    }
  }, [floorId]);

  // Fetch workspaces and staff members and place them on the grid
  useEffect(() => {
    if (!floorData) return; // Wait for floor data before proceeding

    const fetchObjectsAndPersonnel = async () => {
      try {
        const objectsResponse = await axios.get(`http://localhost:8000/fetch-objects/?floor_id=${floorId}`);
        const objects: DroppedItem[] = objectsResponse.data;

        const staffResponse = await axios.get(`http://localhost:8000/fetch-staff-personnel/${floorId}`);
        const staffMembers = staffResponse.data;

        console.log("Fetched workspaces:", objects);
        console.log("Fetched staff members:", staffMembers);

        // Populate grid with workspaces (o_type = 5) and staff members
        const newGrid = Array(floorData.width * floorData.length).fill(null);

        // Add workspace objects to the grid
        objects.forEach((object) => {
          if (object.o_type === 5) {
            const index = object.y_coor * floorData.width + object.x_coor;
            newGrid[index] = { ...object, type: "workspace" }; // Store workspace in grid
          }
        });

        // Add staff members to the grid
        staffMembers.forEach((person: any) => {
          if (person.x_coor !== null && person.y_coor !== null) {
            const index = person.y_coor * floorData.width + person.x_coor;
            newGrid[index] = { 
              type: "person", 
              id: person.id,
              name: `${person.name} ${person.surname}`, // Full name
              width: 1,
              height: 1,
              x_coor: person.x_coor,
              y_coor: person.y_coor
            }; // Store personnel in grid
          }
        });

        setItemsInCells([...newGrid]); // Force state update
      } catch (error) {
        console.error("Error fetching objects or personnel:", error);
      }
    };

    fetchObjectsAndPersonnel();
  }, [floorId, floorData]); // Runs after floorData is available

  // Adjust cell size based on screen width
  useEffect(() => {
    if (floorData) {
      const updateSize = () => {
        const newContainerWidth = window.innerWidth * 0.6;
        const newContainerHeight = window.innerHeight * 0.8;
        const maxCellSize = Math.min(newContainerWidth / floorData.width, newContainerHeight / floorData.length);
        setCellSize(Math.floor(maxCellSize));
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, [floorData]);

  // Handle dropping a staff member only in workspace cells
  const handleDrop = async (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();

    const index = row * floorData.width + col;
    const cell = itemsInCells[index];

    if (cell?.type !== "workspace") {
      // Only allow drop in workspace cells
      console.warn("Drop not allowed here!");
      return;
    }

    const personId = e.dataTransfer.getData("personId");
    const personName = e.dataTransfer.getData("personName");

    const newItems = [...itemsInCells];

    // Add the person to the workspace grid cell
    newItems[index] = {
      type: "person",
      id: parseInt(personId),
      name: personName,
      width: 1,
      height: 1,
      x_coor: col,
      y_coor: row,
    };

    setItemsInCells(newItems);

    // Update coordinates of the staff in the backend
    try {
      await axios.post("http://localhost:8000/update-personnel-coordinates/", {
        personnel_id: parseInt(personId),
        floor_id: floorId,
        x_coor: col,
        y_coor: row,
      });
      console.log("Staff coordinates updated successfully!");
    } catch (error) {
      console.error("Failed to update coordinates:", error);
    }
  };

  // Handle delete action (remove personnel from the grid and set coordinates to null)
  const handleDelete = async (personId: number, row: number, col: number) => {
    const index = row * floorData.width + col;
    const newItems = [...itemsInCells];
  
    // Only remove the person (not the workspace) from the grid
    if (newItems[index]?.type === "person") {
      newItems[index] = null;  // Remove personnel from the grid but leave workspace
      setItemsInCells(newItems);  // Update grid with removed personnel
    }
  
    // Update the coordinates to null for this personnel in the backend
    try {
      await axios.put(`http://localhost:8000/update-personnel-coordinates-null/${personId}`);
      console.log("Personnel deleted and coordinates set to null!");
    } catch (error) {
      console.error("Failed to delete personnel:", error);
    }
  };
  

  // Handle drag over event only for workspace cells
  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();

    const index = row * floorData.width + col;
    const cell = itemsInCells[index];

    // Only allow drag over for workspace cells
    if (cell?.type === "workspace") {
      return;
    } else {
      e.preventDefault();
    }
  };

  if (!floorData) {
    return <div className="text-center text-lg font-semibold text-gray-400">Loading Floor Data...</div>;
  }

  return (
    <div className="flex justify-center items-center bg-transparent p-0">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${floorData?.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${floorData?.length}, ${cellSize}px)`,
          width: `${cellSize * (floorData?.width || 0)}px`,
          height: `${cellSize * (floorData?.length || 0)}px`,
        }}
      >
        {itemsInCells.map((item, index) => {
          const row = Math.floor(index / floorData.width);
          const col = index % floorData.width;

          return (
            <div
              key={index}
              className="border border-gray-600 flex justify-center items-center cursor-crosshair transition-all hover:bg-[#444]"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: item?.type === "person" ? "lightgray" : item?.type === "workspace" ? "lightblue" : "transparent",
                boxShadow: item ? "0px 0px 8px rgba(255, 255, 255, 0.2)" : "none",
              }}
              onDrop={(e) => handleDrop(e, row, col)}
              onDragOver={(e) => handleDragOver(e, row, col)}
            >
              {item?.type === "person" && (
                <span
                  style={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(item.id, row, col)} // Delete on click
                >
                  {item.name} {/* Display personnel name */}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlan2;
