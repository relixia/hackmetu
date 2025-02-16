import { useState } from 'react';
import axios from 'axios';

interface Floor {
  length: number | '';
  width: number | '';
}

interface FloorFormProps {
  onSubmit: (floors: Floor[], totalSquareMeters: number | null) => void;
}

const FloorForm: React.FC<FloorFormProps> = ({ onSubmit }) => {
  const [floorCount, setFloorCount] = useState<number | ''>('');
  const [floors, setFloors] = useState<Floor[]>([]);
  const [totalSquareMeters, setTotalSquareMeters] = useState<number | null>(null);
  const [sameDimensions, setSameDimensions] = useState<boolean>(true);
  const [defaultDimensions, setDefaultDimensions] = useState<{ length: number | ''; width: number | '' }>({ length: '', width: '' });

  const handleFloorCountChange = (value: number) => {
    setFloorCount(value);
    setFloors(Array.from({ length: value }, () => ({ length: defaultDimensions.length, width: defaultDimensions.width })));
  };

  const handleFloorChange = (index: number, field: 'length' | 'width', value: number | '') => {
    const updatedFloors = [...floors];
    updatedFloors[index][field] = value;
    setFloors(updatedFloors);
  };

  const toggleSameDimensions = () => {
    setSameDimensions(!sameDimensions);
    if (!sameDimensions) {
      setFloors(floors.map(() => ({ length: defaultDimensions.length, width: defaultDimensions.width })));
    }
  };

  const handleDefaultDimensionChange = (field: 'length' | 'width', value: number | '') => {
    setDefaultDimensions((prev) => {
      const updatedDimensions = { ...prev, [field]: value };
      if (sameDimensions) {
        setFloors(floors.map(() => ({ ...updatedDimensions })));
      }
      return updatedDimensions;
    });
  };

  const calculateTotalSquareMeters = () => {
    const total = floors.reduce((sum, floor) => sum + (floor.length && floor.width ? floor.length * floor.width : 0), 0);
    setTotalSquareMeters(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/create-floor', { floors, totalSquareMeters });
      console.log('Building saved:', response.data);
      onSubmit(floors, totalSquareMeters);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <div className="bg-[#1E1E1E] shadow-lg rounded-xl p-8 w-full max-w-2xl border border-gray-700">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">🏢 Building Information</h2>
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="block text-lg font-semibold text-gray-300 mb-2">Number of Floors</label>
            <input
              type="number"
              value={floorCount}
              onChange={(e) => handleFloorCountChange(Number(e.target.value) || '')}
              className="w-full p-4 text-lg bg-[#2B2B2B] text-white border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="e.g., 5"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={sameDimensions}
              onChange={toggleSameDimensions}
              className="w-6 h-6 bg-gray-800 border-gray-500 rounded"
            />
            <label className="text-lg font-semibold text-gray-300">All floors have the same dimensions?</label>
          </div>

          {sameDimensions ? (
            <div className="p-6 border border-gray-600 rounded-lg bg-[#2B2B2B]">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Dimensions for All Floors</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">Length (m)</label>
                  <input
                    type="number"
                    value={defaultDimensions.length}
                    onChange={(e) => handleDefaultDimensionChange('length', Number(e.target.value) || '')}
                    className="w-full p-4 text-lg bg-[#1E1E1E] text-white border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="e.g., 20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">Width (m)</label>
                  <input
                    type="number"
                    value={defaultDimensions.width}
                    onChange={(e) => handleDefaultDimensionChange('width', Number(e.target.value) || '')}
                    className="w-full p-4 text-lg bg-[#1E1E1E] text-white border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="e.g., 25"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            floors.map((floor, index) => (
              <div key={index} className="p-6 border border-gray-600 rounded-lg bg-[#2B2B2B]">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Floor {index + 1}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-md font-medium text-gray-300 mb-2">Length (m)</label>
                    <input
                      type="number"
                      value={floor.length}
                      onChange={(e) => handleFloorChange(index, 'length', Number(e.target.value) || '')}
                      className="w-full p-4 text-lg bg-[#1E1E1E] text-white border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-300 mb-2">Width (m)</label>
                    <input
                      type="number"
                      value={floor.width}
                      onChange={(e) => handleFloorChange(index, 'width', Number(e.target.value) || '')}
                      className="w-full p-4 text-lg bg-[#1E1E1E] text-white border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="e.g., 25"
                      required
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={calculateTotalSquareMeters}
            className="w-full text-xl bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition"
          >
            Calculate Square Meters
          </button>

          {totalSquareMeters !== null && (
            <p className="text-center text-xl font-semibold text-gray-300 mt-4">
              Total <span className="text-blue-400">{totalSquareMeters} m²</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full text-xl bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloorForm;
