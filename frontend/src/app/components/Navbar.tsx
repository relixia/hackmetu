'use client';

const Navbar = ({ setActiveComponent }) => {
  return (
    <nav className="fixed top-4 right-4 backdrop-blur-lg bg-[#1E1E1E] shadow-md p-3 rounded-full flex space-x-4 text-lg border border-gray-700">
      <button 
        onClick={() => setActiveComponent('FloorForm')} 
        className="px-4 py-2 rounded-full hover:bg-[#333] transition text-gray-300 font-bold"
      >
        Floor Form
      </button>
      <button 
        onClick={() => setActiveComponent('Data')} 
        className="px-4 py-2 rounded-full hover:bg-[#333] transition text-gray-300 font-bold"
      >
        Data
      </button>
      
      <button 
        onClick={() => setActiveComponent('Editor3D')} 
        className="px-4 py-2 rounded-full hover:bg-[#333] transition text-gray-300 font-bold"
      >
        3D Editor
      </button>
      <button 
        onClick={() => setActiveComponent('360 View')} 
        className="px-4 py-2 rounded-full hover:bg-[#333] transition text-gray-300 font-bold"
      >
        360 View
      </button>
      <button 
        onClick={() => setActiveComponent('Floorplan')} 
        className="px-4 py-2 rounded-full hover:bg-[#333] transition text-gray-300 font-bold"
      >
        Floorplan
      </button>

      
      <button 
        onClick={() => setActiveComponent('Staff')} 
        className="px-4 py-2 rounded-full hover:bg-[#333] transition text-gray-300 font-bold"
      >
        Staff
      </button>

      <button 
        onClick={() => setActiveComponent('Dashboard')} 
        className="px-4 py-2 rounded-full hover:bg-[#333] transition text-gray-300 font-bold"
      >
        Dashboard
      </button>
    </nav>
  );
};

export default Navbar;
