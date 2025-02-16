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
  x_coor: number;
  y_coor: number;
}

const PersonnelMenu: React.FC<PersonnelMenuProps> = ({ cellSize }) => {
    const [personnel, setPersonnel] = useState<PersonnelData[]>([]);
  
    useEffect(() => {
      const fetchPersonnel = async () => {
        try {
            const response = await axios.get("http://localhost:8000/fetch-unplaced-users");
          const filteredPersonnel = response.data.filter((person: PersonnelData) => 
            person.x_coor === null && person.y_coor === null // Filter out those with coordinates
          );
          setPersonnel(filteredPersonnel);
        } catch (error) {
          console.error("Error fetching personnel data:", error);
        }
      };
  
      fetchPersonnel();
    }, []);  // This ensures fetch runs only once on mount
  
    const handleDragStart = (e: React.DragEvent, person: PersonnelData) => {
      e.dataTransfer.setData("personId", person.id.toString());
      e.dataTransfer.setData("personName", `${person.id}`);  // We now send the ID instead of the name
    };
  
    const getGenderColor = (gender: number) => {
      return gender === 1 ? "blue" : "pink"; // Blue for male, pink for female
    };
  
    return (
      <div className="flex flex-col items-center gap-2 p-2 border bg-gray-100">
        <h3 className="text-lg font-semibold">Personnel Menu</h3>
        <div className="grid gap-2 overflow-y-auto max-h-[80vh]">
          {personnel.map((person) => (
            <div
              key={person.id}
              className="border flex items-center justify-center gap-4 cursor-pointer"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: getGenderColor(person.gender), // Color based on gender
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, person)}
            >
              <span
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {person.id} {/* Show the ID instead of the initials */}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default PersonnelMenu; // Ensure this export is present