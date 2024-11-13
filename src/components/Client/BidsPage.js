import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "./Spinner";
import ConfirmDeleteModal from "./ConfirmBidDeleteModal";
import EditBidModal from "./EditBidModal";

const capitalizeFirstLetter = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const Bids = () => {
  const [bids, setBids] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const token = localStorage.getItem("StocksUsertoken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);

        // Fetch bids
        const bidsResponse = await axios.get(
          `http://13.61.104.53:5000/api/var/client/bids/${decodedToken.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const fetchedBids = bidsResponse.data.bids;
        setBids(fetchedBids);

        // Fetch stock data
        const instrumentIdentifiers = fetchedBids.map(
          (bid) => bid.instrumentIdentifier
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
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [userId, bids]); // Refetch bids when userId or bids change

  const handleDeleteClick = (bid) => {
    setSelectedBid(bid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://13.61.104.53:5000/api/var/client/bids/${selectedBid._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("StocksUsertoken")}`,
          },
        }
      );
      toast.success("Bid deleted successfully!");
      setBids((prevBids) =>
        prevBids.filter((bid) => bid._id !== selectedBid._id)
      ); // Update bids state
    } catch (error) {
      setError(error);
      toast.error("Failed to delete the bid.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditClick = (bid) => {
    setSelectedBid({
      ...bid,
      stockName: stockData[bid.instrumentIdentifier]?.name || "N/A",
      stockExchange: stockData[bid.instrumentIdentifier]?.Exchange || "N/A",
    });
    setShowEditModal(true);
  };

  const updateBid = async (updatedBid) => {
    try {
      const response = await axios.put(
        `http://13.61.104.53:5000/api/var/client/bids/${selectedBid._id}`,
        updatedBid,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("StocksUsertoken")}`,
          },
        }
      );
      toast.success("Bid updated successfully!");
      setBids((prevBids) =>
        prevBids.map((bid) =>
          bid._id === selectedBid._id ? response.data : bid
        )
      ); // Update bids state
    } catch (error) {
      setError(error);
      toast.error("Failed to update the bid.");
    } finally {
      setShowEditModal(false);
    }
  };

  if (loading) return <Spinner />;
  // if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <ToastContainer /> {/* Add the ToastContainer */}
      <table className="min-w-full bg-white table-auto border-collapse">
        <thead>
          <tr className="bg-gradient-to-b from-gray-700 to-gray-800 text-white">
            <th className="py-2 px-4">#</th>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Exchange</th>
            <th className="py-2 px-4">Buy</th>
            <th className="py-2 px-4">Sell</th>
            <th className="py-2 px-4">Bid Price</th>
            <th className="py-2 px-4">Bid Quantity</th>
            <th className="py-2 px-4">Trade Type</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Created At</th>
            <th className="py-2 px-4">Updated At</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bids.length > 0 ? (
            bids.map((bid, index) => {
              const stock = stockData[bid.instrumentIdentifier] || {};
              const tradeType = capitalizeFirstLetter(bid.tradeType);
              const backgroundColor =
                tradeType === "Sell" ? "bg-red-200" : "bg-green-200";
              const priceColor =
                tradeType === "Sell" ? "text-red-500" : "text-green-500";

              const isFulfilled = bid.status === "fulfilled";

              return (
                <tr
                  key={bid._id}
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
                  <td className={`py-2 px-4 border-b ${priceColor}`}>
                    {bid.bidPrice ? `₹${bid.bidPrice}` : "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">{bid.bidQuantity}</td>
                  <td className="py-2 px-4 border-b">{tradeType}</td>
                  <td className="py-2 px-4 border-b">
                    {capitalizeFirstLetter(bid.status)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(bid.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(bid.updatedAt).toLocaleTimeString("en-GB", {
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
                          onClick={() => handleEditClick(bid)}
                          className="bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-4 py-2 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(bid)}
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
                No bids available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {showEditModal && (
        <EditBidModal
          bid={selectedBid}
          onUpdate={updateBid}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Bids;
