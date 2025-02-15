import { useState } from 'react';
import axios from 'axios';  // Import axios to handle API requests

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

  // Handle floor count change
  const handleFloorCountChange = (value: number) => {
    setFloorCount(value);
    setFloors(Array.from({ length: value }, () => ({ length: defaultDimensions.length, width: defaultDimensions.width })));
  };

  // Handle floor dimension changes
  const handleFloorChange = (index: number, field: 'length' | 'width', value: number | '') => {
    const updatedFloors = [...floors];
    updatedFloors[index][field] = value;
    setFloors(updatedFloors);
  };

  // Handle toggle for same/different dimensions
  const toggleSameDimensions = () => {
    setSameDimensions(!sameDimensions);
    if (!sameDimensions) {
      setFloors(floors.map(() => ({ length: defaultDimensions.length, width: defaultDimensions.width })));
    }
  };

  // Handle default dimension change when all floors are the same
  const handleDefaultDimensionChange = (field: 'length' | 'width', value: number | '') => {
    setDefaultDimensions((prev) => {
      const updatedDimensions = { ...prev, [field]: value };
      if (sameDimensions) {
        setFloors(floors.map(() => ({ ...updatedDimensions })));
      }
      return updatedDimensions;
    });
  };

  // Calculate total square meters
  const calculateTotalSquareMeters = () => {
    const total = floors.reduce((sum, floor) => sum + (floor.length && floor.width ? floor.length * floor.width : 0), 0);
    setTotalSquareMeters(total);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send floor data and totalSquareMeters to the backend
      const response = await axios.post('http://localhost:8000/create-floor', { floors, totalSquareMeters });
      console.log('Building saved:', response.data);
      onSubmit(floors, totalSquareMeters);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🏢 Bina Bilgileri</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kat Sayısı</label>
            <input
              type="number"
              value={floorCount}
              onChange={(e) => handleFloorCountChange(Number(e.target.value) || '')}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Örn: 5"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sameDimensions}
              onChange={toggleSameDimensions}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Tüm katlar aynı mı?</label>
          </div>

          {sameDimensions ? (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tüm Katlar İçin Ölçüler</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Uzunluk (m)</label>
                  <input
                    type="number"
                    value={defaultDimensions.length}
                    onChange={(e) => handleDefaultDimensionChange('length', Number(e.target.value) || '')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Örn: 20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Genişlik (m)</label>
                  <input
                    type="number"
                    value={defaultDimensions.width}
                    onChange={(e) => handleDefaultDimensionChange('width', Number(e.target.value) || '')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Örn: 25"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            floors.map((floor, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Kat {index + 1}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Uzunluk (m)</label>
                    <input
                      type="number"
                      value={floor.length}
                      onChange={(e) => handleFloorChange(index, 'length', Number(e.target.value) || '')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Örn: 20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Genişlik (m)</label>
                    <input
                      type="number"
                      value={floor.width}
                      onChange={(e) => handleFloorChange(index, 'width', Number(e.target.value) || '')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Örn: 25"
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
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Metrekareyi Hesapla
          </button>

          {totalSquareMeters !== null && (
            <p className="text-center text-md font-semibold text-gray-800 mt-3">
              Toplam <span className="text-blue-600">{totalSquareMeters} m²</span> alanınız var.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Kaydet & Devam Et
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloorForm;
