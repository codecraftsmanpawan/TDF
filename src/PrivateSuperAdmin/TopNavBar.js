import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const TopNavBar = () => {
  const [sessionTime, setSessionTime] = useState(10 * 60);
  const navigate = useNavigate();

  // Function to log out the user
  const logout = () => {
    localStorage.removeItem("sessionEnd");
    navigate("/privateLogin");
  };

  // Function to reset session timer on activity (reset the session end time)
  const resetSessionTimer = () => {
    const newSessionEnd = dayjs().add(10, "minute").toISOString();
    localStorage.setItem("sessionEnd", newSessionEnd);
    setSessionTime(10 * 60);
  };

  // Handle session timeout and restore session on refresh
  useEffect(() => {
    const checkSession = () => {
      const storedSessionEnd = localStorage.getItem("sessionEnd");

      if (storedSessionEnd) {
        const remainingTime = dayjs(storedSessionEnd).diff(dayjs(), "seconds");
        if (remainingTime > 0) {
          setSessionTime(remainingTime);
        } else {
          logout();
        }
      }
    };  

    // Restore session time on page load
    checkSession();

    // Set interval to check the session time every second
    const interval = setInterval(() => {
      setSessionTime((prev) => {
        if (prev <= 0) {
          logout();
          clearInterval(interval); // Stop the interval when logged out
          return 0;
        }
        return prev - 1; // Decrement session time every second
      });
    }, 1000);

    // Attach event listeners to detect user activity (mouse movement or key press)
    window.addEventListener("mousemove", resetSessionTimer);
    window.addEventListener("keypress", resetSessionTimer);

    // Cleanup on component unmount
    return () => {
      clearInterval(interval); // Clean up the interval
      window.removeEventListener("mousemove", resetSessionTimer);
      window.removeEventListener("keypress", resetSessionTimer);
    };
  }, []);

  // Format time remaining (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white shadow-md">
      <div>
        <span className="text-lg">Session Time: {formatTime(sessionTime)}</span>
      </div>
      <div>
        {/* Logout Button */}
        <button
          onClick={logout}
          className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TopNavBar;
