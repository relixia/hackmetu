import React, { useState, useEffect } from "react";

interface Floor {
  id: number;
  name: string;
  population: number; // Number of people on this floor
  capacity: number; // Maximum capacity of this floor
}

interface FloorSidebarProps {
  onSelect: (id: number) => void;
}

const FloorSidebarComponent: React.FC<FloorSidebarProps> = ({ onSelect }) => {
  const [floors, setFloors] = useState<Floor[]>([]);

  useEffect(() => {
    // Simulate fetching floors from a database
    setTimeout(() => {
      setFloors([
        { id: 1, name: "Floor 1", population: 20, capacity: 50 },
        { id: 2, name: "Floor 2", population: 45, capacity: 60 },
        { id: 3, name: "Floor 3", population: 70, capacity: 80 },
        { id: 4, name: "Floor 4", population: 90, capacity: 100 },
      ]);
    }, 1000);
  }, []);

  // Function to determine button color based on population/capacity ratio
  const getCapacityColor = (population: number, capacity: number) => {
    const usage = (population / capacity) * 100;
    if (usage <= 50) return "bg-green-500"; // Low usage (Safe)
    if (usage <= 80) return "bg-yellow-500"; // Medium usage (Warning)
    return "bg-red-500"; // High usage (Full)
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 backdrop-blur-md shadow-lg p-4 rounded-2xl w-44">
      <h2 className="text-white text-lg font-semibold text-center mb-4">Floors</h2>
      <ul className="space-y-2">
        {floors.map((floor) => (
          <li
            key={floor.id}
            onClick={() => onSelect(floor.id)}
            className={`cursor-pointer text-white text-center p-3 rounded-lg transition duration-300 ${getCapacityColor(floor.population, floor.capacity)}`}
          >
            {floor.name} ({floor.population}/{floor.capacity})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FloorSidebarComponent;
