import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import Navbar from "./SuperAdminNav";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, item }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-4">Are you sure you want to delete {item.name}?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// DataTable Component
const DataTable = () => {
  const [data, setData] = useState([]);
  const [overallLimitData, setOverallLimitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = localStorage.getItem("superAdminToken");
        if (!storedToken) {
          throw new Error("No token found");
        }

        // Fetch items data
        const itemsResponse = await axios.get(
          "http://13.51.178.27:5000/api/var/superAdmin/items",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setData(itemsResponse.data);

        // Fetch overall limit data
        const overallLimitResponse = await axios.get(
          "http://13.51.178.27:5000/api/var/superAdmin/overall-limit",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
        setOverallLimitData(overallLimitResponse.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAction = (item) => {
    console.log(`Action clicked for item: ${item.symbol}`);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const storedToken = localStorage.getItem("superAdminToken");
      if (!storedToken) {
        throw new Error("No token found");
      }

      await axios.delete(
        `http://13.51.178.27:5000/api/var/superAdmin/items/${itemToDelete.symbol}`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      setData(data.filter((item) => item.symbol !== itemToDelete.symbol));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>;

  return (
    <>
      <Navbar />
      <div className="flex flex-wrap justify-center min-h-screen bg-gray-100 p-4 mt-16 gap-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-4xl mt-8">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold">
              All Quantity Limit Set Stocks
            </h1>
          </div>
          <div className="p-4">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-3 px-6 border-b border-gray-200 text-left">
                    #
                  </th>
                  <th className="py-3 px-6 border-b border-gray-200 text-left">
                    Symbol
                  </th>
                  <th className="py-3 px-6 border-b border-gray-200 text-left">
                    Limit
                  </th>
                  <th className="py-3 px-6 border-b border-gray-200 text-left">
                    Lot Size
                  </th>
                  <th className="py-3 px-6 border-b border-gray-200 text-left">
                    Created At
                  </th>
                  <th className="py-3 px-6 border-b border-gray-200 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.symbol}>
                    <td className="py-3 px-6 border-b border-gray-200">
                      {index + 1}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-200">
                      {item.name}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-200">
                      {item.limit}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-200">
                      {item.lotSize}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-200">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-200">
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {overallLimitData && (
          <div className="bg-white shadow-md rounded-lg p-4 max-w-md w-full mt-8">
            <h1 className="text-2xl font-bold mb-4">Overall Limit Details</h1>
            <p>
              <strong>Current Overall Limit:</strong>{" "}
              {overallLimitData.overallLimit}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(overallLimitData.updatedAt).toLocaleString()}
            </p>
          </div>
        )}

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          item={itemToDelete}
        />
      </div>
    </>
  );
};

export default DataTable;
