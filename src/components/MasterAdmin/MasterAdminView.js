import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from './MasterAdminNav';
import {jwtDecode} from 'jwt-decode';

const colors = [
  'bg-yellow-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-red-200',
  'bg-teal-200',
  'bg-indigo-200',
  'bg-gray-200',
  'bg-orange-200',
];

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tradeData, setTradeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      const token = localStorage.getItem('masterAdminToken');
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `http://localhost:5000/api/var/masterAdmin/getClient/${id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      try {
        const response = await axios.request(config);
        setClient(response.data.client);
        // Fetch trade data after client data is fetched
        fetchTradeData(response.data.client.client_id);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchTradeData = async (clientId) => {
      const token = localStorage.getItem('masterAdminToken');
      const decodedToken = jwtDecode(token);

      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `http://localhost:5000/api/var/client/trades/client/brokerage/${id}`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.request(config);
        setTradeData(response.data);
      } catch (err) {
        setError('Error fetching trade history');
        console.error(err);
      }
    };

    fetchClientData();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!client || !tradeData) return <div>Loading...</div>;

  const clientDetails = [
    { title: 'Client ID', value: client.client_id },
    { title: 'Client Code', value: client.client_code },
    { title: 'Budget', value: client.budget },
    { title: 'Available Budget', value: client.availableBudget },
    { title: 'Share Brokerage', value: client.share_brokerage },
    { title: 'MCX Brokerage Type', value: client.mcx_brokerage_type },
    { title: 'MCX Brokerage', value: client.mcx_brokerage },
    { title: 'Username', value: client.username },
    { title: 'Status', value: client.status },
    { title: 'Created At', value: new Date(client.createdAt).toLocaleString() },
    { title: 'Updated At', value: new Date(client.updatedAt).toLocaleString() },
  ];

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <>
      <Navbar />

      <div className="p-4 mt-16">
        <div className="flex flex-col items-center p-4 bg-gray-100 mt-10">
          <h2 className="mb-4 mt-4 font-bold text-2xl">Client Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clientDetails.map((detail, index) => (
            <div
              key={detail.title}
              className={`shadow-md rounded-lg p-4 ${colors[index % colors.length]}`}
            >
              <h2 className="text-lg font-bold mb-2">{detail.title}</h2>
              <p>{detail.value}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-10 p-4">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Trade History</h2>
          <div className="overflow-x-auto">

            {/* Summary */}
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Summary</h3>
              <p><strong>Total Brokerage:</strong> ₹{tradeData.totalBrokerage}</p>
              <p><strong>Total Amount:</strong> ₹{tradeData.totalAmount}</p>
            </div>
            {/* NSE Trades Table */}
            <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-6">NSE Trades</h2>
            <div className="overflow-x-auto mb-2 mt8">
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
                  {tradeData.nseTrades.map((trade, index) => (
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
            <p className="text-xl font-semibold mb-4">Total NSE Amount: ₹{tradeData.totalNSEAmount}</p>
            <p className="text-xl font-semibold mb-4">Total NSE Brokerage: ₹{tradeData.brokeragePerNSECrore}</p>

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
                  {tradeData.mcxTrades.map((trade, index) => (
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
            <p className="text-xl font-semibold mb-4">Total MCX Amount: ₹{tradeData.totalMCXAmount}</p>
            <p className="text-xl font-semibold mb-4">Total MCX Brokerage: ₹{tradeData.brokeragePerMCX}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientDetails;
