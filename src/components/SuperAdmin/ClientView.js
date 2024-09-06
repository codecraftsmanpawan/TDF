import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './SuperAdminNav';

// Utility function to get token
const getToken = () => localStorage.getItem('superAdminToken');

// Helper function to calculate profit/loss
const calculateProfitLoss = (currentPrice, oppositeActionPrice, tradeType) => {
  const value = tradeType === 'buy'
    ? (currentPrice - oppositeActionPrice)
    : (oppositeActionPrice - currentPrice);
  const color = value >= 0 ? 'text-green-500' : 'text-red-500';
  const percentage = oppositeActionPrice === 0 ? 0 : ((value / oppositeActionPrice) * 100).toFixed(2);
  return { value: value.toFixed(2), color, percentage };
};

// Helper function to calculate opposite action price
const getOppositeActionPrice = (trade, realTimeData) => {
  const stockData = realTimeData[trade.instrumentIdentifier] || {};
  return trade.oppositeAction === 'sell'
    ? parseFloat(stockData.SellPrice || 0)
    : trade.oppositeAction === 'buy'
      ? parseFloat(stockData.BuyPrice || 0)
      : 0;
};

const ClientCard = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [trades, setTrades] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`http://localhost:5000/api/var/superAdmin/getClientById/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        setClient(response.data.client);
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    const fetchTradesData = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`http://localhost:5000/api/var/client/trades/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        setTrades(response.data.trades);
        // Fetch real-time data for each trade
        response.data.trades.forEach(trade => {
          fetchRealTimeData(trade.instrumentIdentifier);
        });
      } catch (error) {
        console.error('Error fetching trades data:', error);
      }
    };

    const fetchRealTimeData = async (instrumentIdentifier) => {
      try {
        const token = getToken();
        const response = await axios.get(`http://localhost:5000/api/var/client/stocks/${instrumentIdentifier}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setRealTimeData(prevData => ({
          ...prevData,
          [instrumentIdentifier]: response.data
        }));
      } catch (err) {
        console.error('Error fetching real-time data:', err);
      }
    };

    if (id) {
      fetchClientData();
      fetchTradesData();
    }
  }, [id]);

  const handleDeleteTrade = async (tradeId) => {
    // Confirmation box
    const confirmed = window.confirm('Are you sure you want to delete this trade?');

    if (confirmed) {
      try {
        const token = getToken();
        await axios.delete(`http://localhost:5000/api/var/client/trades/${tradeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Update the state to remove the deleted trade
        setTrades(trades.filter(trade => trade._id !== tradeId));
      } catch (error) {
        console.error('Error deleting trade:', error);
      }
    }
  };

  if (!client) {
    return <div className="text-center mt-8">Loading client data...</div>;
  }

  if (!trades.length) {
    return <div className="text-center mt-8">Loading trades data...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="p-4 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {/* Client Details */}
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Client ID</h2>
            <p className="text-gray-700">{client.client_id}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Client Code</h2>
            <p className="text-gray-700">{client.client_code}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Budget</h2>
            <p className="text-gray-700">₹{client.budget}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Available Budget</h2>
            <p className="text-gray-700">₹{client.availableBudget}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Share Brokerage</h2>
            <p className="text-gray-700">{client.share_brokerage}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">MCX Brokerage Type</h2>
            <p className="text-gray-700">{client.mcx_brokerage_type}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">MCX Brokerage</h2>
            <p className="text-gray-700">₹{client.mcx_brokerage}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <p className="text-gray-700">{client.status}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Total Profit/Loss</h2>
            <p className="text-gray-700">555</p> {/* Placeholder value */}
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Total Brokerage</h2>
            <p className="text-gray-700">414</p> {/* Placeholder value */}
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Last Updated</h2>
            <p className="text-gray-700">{new Date(client.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Trades Data */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-4">Trades</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-lg rounded-lg">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Stock</th>
                  <th className="p-2 text-left">Action</th>
                  <th className="p-2 text-left">Quantity</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Opposite Action Price</th>
                  <th className="p-2 text-left">Profit/Loss</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(trade => {
                  const oppositeActionPrice = getOppositeActionPrice(trade, realTimeData);
                  const { value: profitLossValue, color: profitLossColor, percentage } = calculateProfitLoss(trade.price, oppositeActionPrice, trade.action);

                  return (
                    <tr key={trade._id} className="border-b">
                      <td className="p-2">{trade.name}</td>
                      <td className="p-2">{trade.action}</td>
                      <td className="p-2">{trade.quantity}</td>
                      <td className="p-2">₹{trade.price}</td>
                      <td className="p-2">₹{oppositeActionPrice || 'N/A'}</td>
                      <td className={`p-2 ${profitLossColor}`}>{profitLossValue} ({percentage}%)</td>
                      <td className="p-2">{new Date(trade.date).toLocaleDateString()}</td>
                      <td className="p-2">{trade.status}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDeleteTrade(trade._id)}
                          className="text-red-500 hover:text-red-700"
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
        </div>
      </div>
    </>
  );
};

export default ClientCard;
