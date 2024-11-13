import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./SuperAdminNav";

const StockForm = () => {
  const {
    instrumentIdentifier,
    stockName,
    stockClose: initialStockClose,
  } = useParams();
  const [stockClose, setStockClose] = useState(initialStockClose);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Retrieve the token from local storage
    const token = localStorage.getItem("superAdminToken");

    try {
      const response = await axios.put(
        "http://13.61.104.53:5000/api/var/superAdmin/stocks/update-close",
        {
          instrumentIdentifier,
          closePrice: stockClose,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Stock closing price updated successfully!");

        // Delay the navigation by 1 second
        setTimeout(() => {
          navigate("/superadmin/ManageStocks");
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock closing price.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Update Closing Price
        </h2>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="symbol"
          >
            Symbol
          </label>
          <input
            id="symbol"
            type="text"
            value={stockName}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="AAPL"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="stockClose"
          >
            Closing Price
          </label>
          <input
            id="stockClose"
            type="number"
            value={stockClose}
            onChange={(e) => setStockClose(e.target.value)} // Update the state with the input value
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="100"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default StockForm;
