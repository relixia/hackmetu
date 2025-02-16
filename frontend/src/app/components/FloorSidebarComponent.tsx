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
    if (usage <= 50) return "bg-green-700 hover:bg-green-600";
    if (usage <= 80) return "bg-yellow-700 hover:bg-yellow-600";
    return "bg-red-700 hover:bg-red-600";
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
    <>
      {/* 🔹 Building Title & Number - Centered */}
      <div className="text-center mb-6">
        <h1 className="text-white text-4xl font-bold tracking-wide">
          Building
        </h1>
        <h2 className="text-white text-5xl font-extrabold mt-1">
          {currentBuilding}
        </h2>
      </div>

      {/* 🔹 Navigation Buttons */}
      <div className="flex justify-between my-4">
        <button
          onClick={handlePrevBuilding}
          disabled={buildings.findIndex((b) => b.id === currentBuilding) === 0}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition"
        >
          ◀ Prev
        </button>
        <button
          onClick={handleNextBuilding}
          disabled={buildings.findIndex((b) => b.id === currentBuilding) === buildings.length - 1}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition"
        >
          Next ▶
        </button>
      </div>

      {/* 🔹 Content Loader */}
      {loading ? (
        <p className="text-gray-400 text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : floors.length === 0 ? (
        <p className="text-gray-400 text-center">No floors found.</p>
      ) : (
        <ul className="space-y-3">
          {floors
            .filter((floor) => floor.building_id === currentBuilding)
            .map((floor) => (
              <li
                key={floor.id}
                onClick={() => onSelect(floor.id, floor.width, floor.length)}
                className={`cursor-pointer text-white text-center p-3 rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md ${getCapacityColor(floor.population || 0, floor.capacity || 1)}`}
              >
                Floor {floor.number}
              </li>
            ))}
        </ul>
      )}
    </>
  );
};

export default FloorSidebarComponent;
