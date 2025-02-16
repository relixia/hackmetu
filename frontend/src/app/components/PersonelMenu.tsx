import React, { useEffect, useState } from "react";
import axios from "axios";

interface PersonnelMenuProps {
  cellSize: number;
}

interface PersonnelData {
  id: number;
  name: string;
  surname: string;
  email: string;
  gender: number; // 1 for male, 2 for female
  x_coor: number | null; // Nullable coordinates
  y_coor: number | null; // Nullable coordinates
}

const PersonnelMenu: React.FC<PersonnelMenuProps> = ({ cellSize }) => {
  const [personnel, setPersonnel] = useState<PersonnelData[]>([]);

  // Fetch personnel data and filter out those with non-null coordinates
  const fetchPersonnel = async () => {
    try {
      const response = await axios.get("http://localhost:8000/fetch-unplaced-users");
      // Filter out personnel with both x_coor and y_coor not null
      const filteredPersonnel = response.data.filter((person: PersonnelData) =>
        person.x_coor === null && person.y_coor === null
      );
      setPersonnel(filteredPersonnel);
    } catch (error) {
      console.error("Error fetching personnel data:", error);
    }
  };

  useEffect(() => {
    fetchPersonnel(); // Initial fetch when component mounts

    const interval = setInterval(() => {
      fetchPersonnel(); // Periodically re-fetch the data to reflect any updates
    }, 5000); // Update every 5 seconds or adjust as needed

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (e: React.DragEvent, person: PersonnelData) => {
    e.dataTransfer.setData("personId", person.id.toString());
    e.dataTransfer.setData("personName", `${person.name} ${person.surname}`); // Send full name instead of ID
  };

  const getGenderColor = (gender: number) => {
    return gender === 1 ? "blue" : "pink"; // Blue for male, pink for female
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 border bg-[#1A1A1A]">
      <h3 className="text-lg font-semibold text-white">Personnel Menu</h3>
      <div className="grid gap-4 overflow-y-auto max-h-[80vh]">
        {personnel.map((person) => (
          <div
            key={person.id}
            className="border flex items-center justify-center gap-4 cursor-pointer"
            style={{
              width: `${cellSize * 1.5}px`, // Increase size of the block
              height: `${cellSize * 1.5}px`, // Increase size of the block
              backgroundColor: getGenderColor(person.gender), // Color based on gender
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, person)}
          >
            <span
              style={{
                color: "black",
                fontWeight: "bold",
                fontSize: "16px", // Increase font size for better visibility
              }}
            >
              {person.name} {person.surname} {/* Display full name instead of ID */}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonnelMenu;
