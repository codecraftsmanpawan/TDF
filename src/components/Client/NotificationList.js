// src/components/NotificationList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  const toggleSidebar = () => {
    setIsToggled(!isToggled);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://13.61.104.53:5000/api/var/Wishlist/notifications"
        );
        setNotifications(response.data);
      } catch (error) {
        setError("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) return <Spinner />; // Show spinner while loading
  // if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <TopNavbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isToggled} closeSidebar={toggleSidebar} />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto my-10 grid grid-cols-1 gap-4">
          <h2 className="text-lg font-bold mb-2 p-4">Notifications</h2>
          {notifications.map((notification, index) => (
            <div
              key={notification._id}
              className="bg-white p-5 rounded-lg shadow border"
            >
              <h3 className="font-semibold">
                {index + 1}. {notification.title}
              </h3>
              <p>{notification.message}</p>
              <small className="text-gray-500">
                {new Date(notification.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default NotificationList;
