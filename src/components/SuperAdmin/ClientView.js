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

// Helper function to capitalize first letter of a string
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const ClientCard = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [trades, setTrades] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});
  const [tradeHistory, setTradeHistory] = useState([]);
  const [error, setError] = useState(null); // Added error state

  // Added state for the trade summary
  const [nseTrades, setNseTrades] = useState([]);
  const [mcxTrades, setMcxTrades] = useState([]);
  const [totalBrokerage, setTotalBrokerage] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalNSEAmount, setTotalNSEAmount] = useState(0);
  const [totalMCXAmount, setTotalMCXAmount] = useState(0);
  const [brokeragePerNSECrore, setBrokeragePerNSECrore] = useState(0);
  const [brokeragePerMCX, setBrokeragePerMCX] = useState(0);

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
        setError('Error fetching client data.');
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
        const tradesData = response.data.trades || [];
        setTrades(tradesData);
        setNseTrades(tradesData.filter(trade => trade.exchange === 'NSE'));
        setMcxTrades(tradesData.filter(trade => trade.exchange === 'MCX'));
        // Fetch real-time data for each trade
        tradesData.forEach(trade => {
          fetchRealTimeData(trade.instrumentIdentifier);
        });
      } catch (error) {
        setError('Error fetching trades data.');
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
        setError('Error fetching real-time data.');
        console.error('Error fetching real-time data:', err);
      }
    };

    const fetchTradeHistory = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`http://localhost:5000/api/var/client/trades/client/brokerage/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setTradeHistory(response.data || []);
      
        setTotalBrokerage(response.data.totalBrokerage || 0);
        setTotalAmount(response.data.totalAmount || 0);
        setTotalNSEAmount(response.data.totalNSEAmount || 0);
        setTotalMCXAmount(response.data.totalMCXAmount || 0);
        setBrokeragePerNSECrore(response.data.brokeragePerNSECrore || 0);
        setBrokeragePerMCX(response.data.brokeragePerMCX || 0);
      } catch (error) {
        setError('Error fetching trade history.');
        console.error('Error fetching trade history:', error);
      }
    };

    if (id) {
      fetchClientData();
      fetchTradesData();
      fetchTradeHistory();
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
        setError('Error deleting trade.');
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
        <div className="mt-16 p-4">
          <h2 className="text-xl font-semibold mb-4">Trades</h2>
          <div className="overflow-x-auto">
              <table className="min-w-full bg-white table-auto border-collapse mb-6">
              <thead>
              <tr className="bg-blue-500 text-white">
                   <th className="p-2">#</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Opposite Price</th>
                  <th className="p-2">Profit/Loss</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody className='text-center'>
           {trades.length ? trades.map((trade, index) => {
  const oppositeActionPrice = getOppositeActionPrice(trade, realTimeData);
  const { value: profitLossValue, color: profitLossColor, percentage } = calculateProfitLoss(trade.price, oppositeActionPrice, trade.action);

  return (
    <tr key={trade._id} className="border-b">
      <td className="p-2">{index + 1}</td>
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
}) : (
  <tr>
    <td colSpan="9" className="p-2 text-center">No trades available</td>
  </tr>
)}

              </tbody>
            </table>
          </div>
        </div>

        {/* Trade History */}
        <div className="mt-16 p-4">
          <h1 className="text-3xl font-semibold mb-6 text-blue-600">Trade History</h1>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="overflow-x-auto mt-4">
            {/* Display Client Brokerage Info */}
            {/* <div className="mb-6 p-4 bg-blue-100 rounded-lg">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Client Brokerage</h2>
              <p><strong>Share Brokerage:</strong> {client.share_brokerage}</p>
              <p><strong>MCX Brokerage Type:</strong> {client.mcx_brokerage_type}</p>
              <p><strong>MCX Brokerage:</strong> ₹{client.mcx_brokerage}</p>
            </div> */}

            {/* Summary */}
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Summary</h3>
              <p><strong>Total Brokerage:</strong> ₹{totalBrokerage}</p>
              <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
            </div>

            {/* NSE Trades Table */}
            <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-6">NSE Trades</h2>
            <div className="overflow-x-auto mb-2 mt-8">
              <table className="min-w-full bg-white table-auto border-collapse mb-6">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Exchange</th>
                    <th className="py-2 px-4">Trade Type</th>
                    <th className="py-2 px-4">Quantity</th>
                    <th className="py-2 px-4">Price</th>
                    <th className="py-2 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {nseTrades.map((trade, index) => (
                    <tr key={trade._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} text-center`}>
                      <td className="py-2 px-4 border-b">{index + 1}</td>
                      <td className="py-2 px-4 border-b">{trade.name}</td>
                      <td className="py-2 px-4 border-b">{trade.exchange}</td>
                      <td className="py-2 px-4 border-b">{capitalizeFirstLetter(trade.tradeType)}</td>
                      <td className="py-2 px-4 border-b">{trade.quantity}</td>
                      <td className="py-2 px-4 border-b">₹{trade.price}</td>
                      <td className="py-2 px-4 border-b">{new Date(trade.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xl font-semibold mb-4">Total NSE Amount: ₹{totalNSEAmount}</p>
            <p className="text-xl font-semibold mb-4">Total NSE Brokerage: ₹{brokeragePerNSECrore}</p>

            {/* MCX Trades Table */}
            <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-6 mb-8">MCX Trades</h2>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Exchange</th>
                    <th className="py-2 px-4">Trade Type</th>
                    <th className="py-2 px-4">Quantity</th>
                    <th className="py-2 px-4">Price</th>
                    <th className="py-2 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mcxTrades.map((trade, index) => (
                    <tr key={trade._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} text-center`}>
                      <td className="py-2 px-4 border-b">{index + 1}</td>
                      <td className="py-2 px-4 border-b">{trade.name}</td>
                      <td className="py-2 px-4 border-b">{trade.exchange}</td>
                      <td className="py-2 px-4 border-b">{capitalizeFirstLetter(trade.tradeType)}</td>
                      <td className="py-2 px-4 border-b">{trade.quantity}</td>
                      <td className="py-2 px-4 border-b">₹{trade.price}</td>
                      <td className="py-2 px-4 border-b">{new Date(trade.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xl font-semibold mb-4">Total MCX Amount: ₹{totalMCXAmount}</p>
            <p className="text-xl font-semibold mb-4">Total MCX Brokerage: ₹{brokeragePerMCX}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientCard;
