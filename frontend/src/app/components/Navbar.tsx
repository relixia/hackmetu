'use client';

const Navbar = ({ setActiveComponent }) => {
  return (
    <nav className="top-4 right-4 backdrop-blur-lg bg-[#896f22] shadow-md p-3 rounded-full flex space-x-4 text-lg">
      <button 
        onClick={() => setActiveComponent('FloorForm')} 
        className="px-4 py-2 rounded-full hover:bg-white/50 transition text-white font-bold"
      >
        Floor Form
      </button>
      <button 
        onClick={() => setActiveComponent('Floorplan')} 
        className="px-4 py-2 rounded-full hover:bg-white/50 transition text-white font-bold"
      >
        Floorplan
      </button>
      <button 
        onClick={() => setActiveComponent('Data')} 
        className="px-4 py-2 rounded-full hover:bg-white/50 transition text-white font-bold"
      >
        Data
      </button>
      <button 
        onClick={() => setActiveComponent('Staff')} 
        className="px-4 py-2 rounded-full hover:bg-white/50 transition text-white font-bold"
      >
        Staff
      </button>
    </nav>
  );
};

export default Navbar;
