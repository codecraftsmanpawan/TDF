import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Spinner from "./Spinner";
import EditStoplossModal from "./EditStoplossModal";
import DeleteStoplossConfirmationModal from "./DeleteStoplossConfirmationModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const capitalizeFirstLetter = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const Stoploss = () => {
  const [stoplosses, setStoplosses] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStoploss, setSelectedStoploss] = useState(null);

  useEffect(() => {
    const fetchStoplosses = async () => {
      try {
        const token = localStorage.getItem("StocksUsertoken");
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.id);
        }

        if (!userId) return;

        setLoading(true);

        const stoplossResponse = await axios.get(
          `http://13.61.104.53:5000/api/var/client/stoploss/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStoplosses(stoplossResponse.data.stoplosses);

        const instrumentIdentifiers = stoplossResponse.data.stoplosses.map(
          (stoploss) => stoploss.instrumentIdentifier
        );
        const stockPromises = instrumentIdentifiers.map((id) =>
          axios.get(`http://13.61.104.53:5000/api/var/client/stocks/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        const stockResponses = await Promise.all(stockPromises);
        const stockDataMap = stockResponses.reduce((acc, response) => {
          const stock = response.data;
          acc[stock.InstrumentIdentifier] = stock;
          return acc;
        }, {});
        setStockData(stockDataMap);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStoplosses();
  }, [userId]);

  const handleEditClick = (stoploss) => {
    const stock = stockData[stoploss.instrumentIdentifier] || {};
    setSelectedStoploss({
      ...stoploss,
      stockName: stock.name || "N/A",
      stockExchange: stock.Exchange || "N/A",
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (stoploss) => {
    setSelectedStoploss(stoploss);
    setDeleteModalOpen(true);
  };

  const handleUpdateStoploss = async (updatedStoploss) => {
    try {
      const token = localStorage.getItem("StocksUsertoken");
      await axios.put(
        `http://13.61.104.53:5000/api/var/client/stoploss/${selectedStoploss._id}`,
        updatedStoploss,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStoplosses((prev) =>
        prev.map((s) =>
          s._id === selectedStoploss._id ? { ...s, ...updatedStoploss } : s
        )
      );
      toast.success("Stoploss updated successfully!");
      setEditModalOpen(false);
    } catch (error) {
      toast.error("Failed to update stoploss.");
    }
  };

  const handleDeleteStoploss = async () => {
    try {
      const token = localStorage.getItem("StocksUsertoken");
      await axios.delete(
        `http://13.61.104.53:5000/api/var/client/stoploss/${selectedStoploss._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStoplosses((prev) =>
        prev.filter((s) => s._id !== selectedStoploss._id)
      );
      toast.success("Stoploss deleted successfully!");
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete stoploss.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-white table-auto border-collapse">
        <thead>
          <tr className="bg-gradient-to-b from-gray-700 to-gray-800 text-white">
            <th className="py-2 px-4">#</th>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Exchange</th>
            <th className="py-2 px-4">Buy</th>
            <th className="py-2 px-4">Sell</th>
            <th className="py-2 px-4">Stoploss Price</th>
            <th className="py-2 px-4">Quantity</th>
            <th className="py-2 px-4">Trade Type</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Created At</th>
            <th className="py-2 px-4">Updated At</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stoplosses.length > 0 ? (
            stoplosses.map((stoploss, index) => {
              const stock = stockData[stoploss.instrumentIdentifier] || {};
              const tradeType = capitalizeFirstLetter(stoploss.tradeType);
              const backgroundColor =
                tradeType === "Sell" ? "bg-red-200" : "bg-green-200";
              const isFulfilled = stoploss.status === "fulfilled";
              return (
                <tr
                  key={stoploss._id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-blue-100"
                  } ${backgroundColor} text-center`}
                >
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{stock.name || "N/A"}</td>
                  <td className="py-2 px-4 border-b">
                    {stock.Exchange || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stock.BuyPrice ? `₹${stock.BuyPrice}` : "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stock.SellPrice ? `₹${stock.SellPrice}` : "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">{stoploss.stopPrice}</td>
                  <td className="py-2 px-4 border-b">{stoploss.quantity}</td>
                  <td className="py-2 px-4 border-b">{tradeType}</td>
                  <td className="py-2 px-4 border-b">
                    {capitalizeFirstLetter(stoploss.status)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(stoploss.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(stoploss.updatedAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {!isFulfilled && (
                      <>
                        <button
                          onClick={() => handleEditClick(stoploss)}
                          className="bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-4 py-2 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(stoploss)}
                          className="bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 rounded px-4 py-2 transition ml-2"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="12" className="text-center py-4">
                No stoploss orders available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isEditModalOpen && (
        <EditStoplossModal
          stoploss={selectedStoploss}
          onUpdate={handleUpdateStoploss}
          onCancel={() => setEditModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteStoplossConfirmationModal
          onConfirm={handleDeleteStoploss}
          onCancel={() => setDeleteModalOpen(false)}
          stoploss={selectedStoploss}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default Stoploss;
