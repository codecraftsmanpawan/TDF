import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("superAdminToken");
    navigate("/superadmin/login");
  };

  return (
    <nav className="bg-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 shadow-md z-10">
      <div className="text-2xl font-bold text-gray-800">
        {" "}
        {/* Increased font size */}
        <Link to="/superadmin/dashboard">SuperAdmin Panel</Link>
      </div>
      <div className="flex items-center">
        <Link
          to="/superadmin/AddMasterId"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mr-4"
        >
          Add New MasterID
        </Link>
        <Link
          to="/View/AllUser/Stands"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mr-4"
        >
          View All
        </Link>
        <Link
          to="/superadmin/ManageStocks"
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mr-4"
        >
          Manage Stocks
        </Link>

        <Link
          to="/Add/Notification"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mr-4"
        >
          Add Notification
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
