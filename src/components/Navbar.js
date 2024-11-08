import { useState, useEffect } from "react";
import RecetteList from "./RecetteList"

function NavbarSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fonction pour gérer le clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarOpen && !event.target.closest(".sidebar")) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed z-20 inset-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out bg-gray-800 w-64 sidebar`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-gray-900 text-white">
            <h2 className="text-2xl font-semibold">Sidebar</h2>
          </div>
          <nav className="flex-grow px-4 py-6 space-y-2">
            <a href="#" className="block px-4 py-2 rounded-md text-white hover:bg-gray-700">
              Acceuil
            </a>
            <a href="#" className="block px-4 py-2 rounded-md text-white hover:bg-gray-700">
          recettes
            </a>
            <a href="#" className="block px-4 py-2 rounded-md text-white hover:bg-gray-700">
          Prevision
            </a>
            <a href="#" className="block px-4 py-2 rounded-md text-white hover:bg-gray-700">
              Consolidation
            </a>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white-200 p-4 text-black flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-black hover:text-gray-400 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Consolidation des recettes fiscales  </h1>
          </div>
          <div className="space-x-4">
          
            <a href="#" className="text-black hover:text-green-200">
              deconnexion
            </a>
          </div>
        </nav>

        {/* Content */}
        <main className="p-6 flex-1 bg-gray-200">
          <h2 className="text-3xl font-bold"></h2>
          <p className="mt-4 text-lg"></p>
          <RecetteList/>
        </main>
      </div>
    </div>
  );
}

export default NavbarSidebar;
