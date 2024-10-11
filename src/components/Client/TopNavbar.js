import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faWallet, faBell } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const TopNavbar = ({ toggleSidebar }) => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();

  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem("StocksUsertoken");
      if (!token) throw new Error("No token found");

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const response = await axios.get(
        `http://13.51.178.27:5000/api/var/client/clients/${userId}/availableBudget`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBudget(response.data.totalProfitLossAmount);
    } catch (err) {
      setError("Failed to fetch budget");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://13.51.178.27:5000/api/var/Wishlist/notifications"
      );
      setNotifications(response.data);
    } catch (error) {
      setError("Failed to fetch notifications");
    }
  };

  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem("StocksUsertoken");
      if (!token) throw new Error("No token found");

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://13.51.178.27:5000/api/var/client/${userId}/status`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.request(config);
      setUserStatus(response.data.status);
    } catch (error) {
      setError("Failed to fetch user status");
    }
  };

  const fetchNotificationCount = () => {
    return notifications.length;
  };

  useEffect(() => {
    fetchBudget();
    fetchNotifications();
    fetchUserStatus();

    const intervalId = setInterval(() => {
      fetchUserStatus();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchBudget();
      fetchNotifications();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  if (userStatus === "inactive") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
        <div className="bg-black p-8 rounded shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Contact Admin</h2>
          <p className="text-lg text-white">
            Your account is inactive. Please contact the admin for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-700 to-black w-full py-4 px-6 flex justify-between items-center border-b-2 border-blue-700">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-blue-100 mr-4"
        >
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </button>

        <h1 className="text-2xl font-bold tracking-wide mb-1">
          <span className="text-red-500">Minus</span>
          <span className="text-green-500">Plus</span>
        </h1>
      </div>

      <div className="flex items-center text-lg font-semibold text-white">
        <FontAwesomeIcon icon={faWallet} className="text-white mr-2" />

        {/* Budget section without loading spinner */}
        {loading ? (
          <div className="flex items-center">
            <span>Loading...</span>
          </div>
        ) : error ? (
          <span className="text-red-500">00</span>
        ) : (
          <span>₹{budget.toFixed(2)}</span>
        )}

        {/* Notification Icon with Count */}
        <div
          className="relative ml-4"
          onClick={() => navigate("/notification")}
        >
          <FontAwesomeIcon
            icon={faBell}
            className="text-white text-xl cursor-pointer"
          />
          {fetchNotificationCount() > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs">
              {fetchNotificationCount()} {/* Display notification count */}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
