import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function MasterAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!username || !password) {
      toast.error("Username and Password are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://13.61.104.53:5000/api/var/masterAdmin/masterAdminLogin",
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Store the token in local storage
        localStorage.setItem("masterAdminToken", response.data.token);
        toast.success("Login successful");
        // Navigate to the master admin dashboard
        navigate("/masteradmin/dashboard", { state: { fromLogin: true } });
      } else {
        toast.error(`Login failed: ${response.data.message}`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred";

      if (errorMessage === "Connect to Super Admin for activation") {
        // Redirect to 404 page
        navigate("/master/404");
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    }
  };

  return (
    <div>
      <nav className="bg-blue-600 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-xl font-bold">TradingApp</div>
          <ul className="flex space-x-4 text-white">
            <li>
              <Link to="/client/login" className="hover:underline">
                Client
              </Link>
            </li>
            <li>
              <Link to="/superadmin/login" className="hover:underline">
                SuperAdmin
              </Link>
            </li>
            <li>
              <Link to="/masteradmin/login" className="hover:underline">
                MasterAdmin
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Master Admin Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
          </form>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default MasterAdminLogin;
