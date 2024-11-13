import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./MasterAdminNav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const getTokenAndDecode = () => {
    const token = localStorage.getItem("masterAdminToken");
    if (!token) {
      throw new Error("Token not found");
    }
    const decoded = jwtDecode(token);
    return { token, masterAdminId: decoded.id };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { token, masterAdminId } = getTokenAndDecode();

      const data = JSON.stringify({
        oldPassword,
        newPassword,
      });

      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `http://13.61.104.53:5000/api/var/masterAdmin/change-password/${masterAdminId}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: data,
      };

      const response = await axios.request(config);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Change Password
          </h2>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="oldPassword"
            >
              Old Password
            </label>
            <input
              type="password"
              id="oldPassword"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="newPassword"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Change Password
          </button>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default ChangePassword;
