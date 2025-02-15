import React, { useState, useEffect } from "react";
import axios from "axios";

interface Floor {
  id: number;
  name: string;
  number: number;
  population: number;
  capacity: number;
  building_id: number;
  width: number;
  length: number;
}

interface Building {
  id: number;
  name: string;
}

interface FloorSidebarProps {
  onSelect: (id: number, width: number, length: number) => void;
}

const FloorSidebarComponent: React.FC<FloorSidebarProps> = ({ onSelect }) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [currentBuilding, setCurrentBuilding] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildingsAndFloors = async () => {
      try {
        const buildingsResponse = await axios.get("http://localhost:8000/fetch-buildings");
        setBuildings(buildingsResponse.data);

        if (buildingsResponse.data.length > 0) {
          setCurrentBuilding(buildingsResponse.data[0].id);
          const floorsResponse = await axios.get("http://localhost:8000/fetch-floors");
          setFloors(floorsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load buildings and floors.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingsAndFloors();
  }, []);

  const getCapacityColor = (population: number, capacity: number) => {
    const usage = (population / capacity) * 100;
    if (usage <= 50) return "bg-green-500";
    if (usage <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleNextBuilding = () => {
    const currentIndex = buildings.findIndex((b) => b.id === currentBuilding);
    if (currentIndex < buildings.length - 1) {
      setCurrentBuilding(buildings[currentIndex + 1].id);
    }
  };

  const handlePrevBuilding = () => {
    const currentIndex = buildings.findIndex((b) => b.id === currentBuilding);
    if (currentIndex > 0) {
      setCurrentBuilding(buildings[currentIndex - 1].id);
    }
  };

  return (
    <div className="bg-[#896f22] backdrop-blur-md shadow-lg p-4 rounded-2xl w-56">
      <h2 className="text-white text-lg font-semibold text-center mb-4">Floors</h2>
      <div className="text-center text-white font-bold text-md mb-3">
        Building ID: {currentBuilding}
      </div>

      <div className="flex justify-between mb-4">
        <button
          onClick={handlePrevBuilding}
          disabled={buildings.findIndex((b) => b.id === currentBuilding) === 0}
          className="bg-gray-300 text-black px-3 py-1 rounded-lg disabled:opacity-50"
        >
          ◀ Prev
        </button>
        <button
          onClick={handleNextBuilding}
          disabled={buildings.findIndex((b) => b.id === currentBuilding) === buildings.length - 1}
          className="bg-gray-300 text-black px-3 py-1 rounded-lg disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>

      {loading ? (
        <p className="text-white text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : floors.length === 0 ? (
        <p className="text-white text-center">No floors found.</p>
      ) : (
        <ul className="space-y-2">
          {floors
            .filter((floor) => floor.building_id === currentBuilding)
            .map((floor) => (
              <li
                key={floor.id}
                onClick={() => onSelect(floor.id, floor.width, floor.length)}
                className={`cursor-pointer text-white text-center p-3 rounded-lg transition duration-300 ${getCapacityColor(floor.population || 0, floor.capacity || 1)}`}
              >
                Floor {floor.number} ({floor.population || 0}/{floor.capacity || 1})
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default FloorSidebarComponent;
