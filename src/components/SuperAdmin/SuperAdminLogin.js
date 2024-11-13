import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SuperAdminLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!userId || !password) {
      toast.error("User ID and Password are required");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      super_admin_id: userId,
      password: password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "http://13.61.104.53:5000/api/var/superAdmin/superAdminLogin",
        requestOptions
      );
      const result = await response.json();

      if (response.ok) {
        // Store the token in local storage
        localStorage.setItem("superAdminToken", result.token);
        toast.success("Login successful");
        // Navigate to the super admin dashboard
        navigate("/superadmin/dashboard", { state: { fromLogin: true } });
      } else {
        toast.error(`Login failed: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <>
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
            Super Admin Login
          </h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="userId">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
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
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default SuperAdminLogin;
