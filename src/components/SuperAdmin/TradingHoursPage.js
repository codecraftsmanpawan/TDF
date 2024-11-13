import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./SuperAdminNav";
const TradingHoursPage = () => {
  const [tradingHours, setTradingHours] = useState([]);
  const [formData, setFormData] = useState({
    exchange: "MCX",
    startHour: 0,
    startMinute: 0,
    endHour: 0,
    endMinute: 0,
    date: "",
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchTradingHours();
  }, []);

  const fetchTradingHours = async () => {
    try {
      const response = await axios.get(
        "http://13.61.104.53:5000/api/var/trading-hours"
      );
      setTradingHours(response.data);
    } catch (error) {
      console.error("Error fetching trading hours:", error);
      toast.error("Error fetching trading hours");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const adjustStartTime = (hourChange, minuteChange) => {
    const newHour = (formData.startHour + hourChange + 24) % 24;
    const newMinute = (formData.startMinute + minuteChange + 60) % 60;
    setFormData({ ...formData, startHour: newHour, startMinute: newMinute });
  };

  const adjustEndTime = (hourChange, minuteChange) => {
    const newHour = (formData.endHour + hourChange + 24) % 24;
    const newMinute = (formData.endMinute + minuteChange + 60) % 60;
    setFormData({ ...formData, endHour: newHour, endMinute: newMinute });
  };

  const addTradingHours = async () => {
    try {
      await axios.post(
        "http://13.61.104.53:5000/api/var/trading-hours",
        formData
      );
      fetchTradingHours();
      resetForm();
      toast.success("Trading hours added successfully!");
    } catch (error) {
      console.error("Error adding trading hours:", error);
      toast.error("Error adding trading hours");
    }
  };

  const updateTradingHours = async () => {
    try {
      await axios.put(
        `http://13.61.104.53:5000/api/var/trading-hours/${editing.exchange}`,
        formData
      );
      fetchTradingHours();
      resetForm();
      setEditing(null);
      toast.success("Trading hours updated successfully!");
    } catch (error) {
      console.error("Error updating trading hours:", error);
      toast.error("Error updating trading hours");
    }
  };

  const deleteTradingHours = async (exchange) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${exchange} trading hours?`
      )
    ) {
      try {
        await axios.delete(
          `http://13.61.104.53:5000/api/var/trading-hours/${exchange}`
        );
        fetchTradingHours();
        toast.success("Trading hours deleted successfully!");
      } catch (error) {
        console.error("Error deleting trading hours:", error);
        toast.error("Error deleting trading hours");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      exchange: "MCX",
      startHour: 0,
      startMinute: 0,
      endHour: 0,
      endMinute: 0,
      date: "",
    });
  };

  const startEditing = (tradingHour) => {
    setFormData(tradingHour);
    setEditing(tradingHour);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 mt-16">
        <ToastContainer />
        <div className="bg-gray-100 p-4 mb-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? "Edit Trading Hours" : "Add Trading Hours"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="exchange" className="mb-2">
                Exchange
              </label>
              <select
                id="exchange"
                name="exchange"
                value={formData.exchange}
                onChange={handleChange}
                className="p-2 border rounded shadow"
              >
                <option value="MCX">MCX</option>
                <option value="NSE">NSE</option>
              </select>
              <label htmlFor="date" className="mt-4">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>
            <div className="flex flex-col">
              <label>Start Time</label>
              <div className="flex items-center">
                <button
                  onClick={() => adjustStartTime(1, 0)}
                  className="bg-gray-300 px-2 rounded"
                >
                  +
                </button>
                <input
                  type="text"
                  value={formData.startHour}
                  className="border p-2 rounded mx-2 w-16 text-center"
                />
                <button
                  onClick={() => adjustStartTime(-1, 0)}
                  className="bg-gray-300 px-2 rounded"
                >
                  -
                </button>
                <span className="ml-2 mr-2">:</span>
                <button
                  onClick={() => adjustStartTime(0, 1)}
                  className="bg-gray-300 px-2 rounded"
                >
                  +
                </button>
                <input
                  type="text"
                  value={formData.startMinute}
                  className="border p-2 rounded mx-2 w-16 text-center"
                />
                <button
                  onClick={() => adjustStartTime(0, -1)}
                  className="bg-gray-300 px-2 rounded"
                >
                  -
                </button>
              </div>
              <label className="mt-4">End Time</label>
              <div className="flex items-center">
                <button
                  onClick={() => adjustEndTime(1, 0)}
                  className="bg-gray-300 px-2 rounded"
                >
                  +
                </button>
                <input
                  type="text"
                  value={formData.endHour}
                  className="border p-2 rounded mx-2 w-16 text-center"
                />
                <button
                  onClick={() => adjustEndTime(-1, 0)}
                  className="bg-gray-300 px-2 rounded"
                >
                  -
                </button>
                <span className="ml-2 mr-2">:</span>
                <button
                  onClick={() => adjustEndTime(0, 1)}
                  className="bg-gray-300 px-2 rounded"
                >
                  +
                </button>
                <input
                  type="text"
                  value={formData.endMinute}
                  className="border p-2 rounded mx-2 w-16 text-center"
                />
                <button
                  onClick={() => adjustEndTime(0, -1)}
                  className="bg-gray-300 px-2 rounded"
                >
                  -
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            {editing ? (
              <button
                onClick={updateTradingHours}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Update
              </button>
            ) : (
              <button
                onClick={addTradingHours}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                Add
              </button>
            )}
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>

        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="text-center">
              <th className="px-4 py-2 border-b">Exchange</th>
              <th className="px-4 py-2 border-b">Trading Hours</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tradingHours.map((th) => {
              // Convert the date string to a Date object
              const date = new Date(th.date);

              // Format the date to 'MM/DD/YYYY'
              const formattedDate = `${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${date
                .getDate()
                .toString()
                .padStart(2, "0")}/${date.getFullYear()}`;

              // Format the start and end times to 12-hour format
              const formatTime = (hour, minute) => {
                const ampm = hour >= 12 ? "PM" : "AM";
                const formattedHour = hour % 12 || 12;
                return `${formattedHour}:${minute
                  .toString()
                  .padStart(2, "0")} ${ampm}`;
              };

              const startTime = formatTime(th.startHour, th.startMinute);
              const endTime = formatTime(th.endHour, th.endMinute);

              return (
                <tr key={th._id} className="text-center">
                  <td className="border px-4 py-2">{th.exchange}</td>
                  <td className="border">
                    <span>{startTime}</span>
                    <span className="mx-2">-</span>
                    <span>{endTime}</span>
                  </td>
                  <td className="border px-4 py-2">{formattedDate}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => startEditing(th)}
                      className="bg-yellow-500 text-white px-2 rounded mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTradingHours(th.exchange)}
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TradingHoursPage;
