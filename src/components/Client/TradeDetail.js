import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';

function TradeDetailPage() {
  const { instrumentIdentifier } = useParams();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('StocksUsertoken');

  const getUserIdFromToken = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.id; 
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = getToken();
        const userId = getUserIdFromToken(token);

        if (!userId) {
          throw new Error('User ID could not be extracted from the token.');
        }

        const response = await axios.get(`http://localhost:5000/api/var/client/trades/details/${instrumentIdentifier}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            userId: userId
          }
        });
        setTrades(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [instrumentIdentifier]);

  if (loading) return <p className="text-center text-blue-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
<>
  <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white shadow-md">
    <TopNavbar />
  </div>
  <div className="pt-16 pb-16 bg-blue-50">
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Trade Detail Page</h1>
      {trades.length === 0 ? (
        <p className="text-center text-gray-500">No trades found for this instrument identifier.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-blue-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-blue-500 text-white border-b">
                <th className="py-3 px-4 text-left capitalize">Serial No.</th>
                <th className="py-3 px-4 text-left capitalize">Name</th>
                <th className="py-3 px-4 text-left capitalize">Exchange</th>
                <th className="py-3 px-4 text-left capitalize">Trade Type</th>
                <th className="py-3 px-4 text-left capitalize">Quantity</th>
                <th className="py-3 px-4 text-left capitalize">Price</th>
                <th className="py-3 px-4 text-left capitalize">Status</th>
                <th className="py-3 px-4 text-left capitalize">Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, index) => (
                <tr key={trade._id} className="border-b hover:bg-blue-100">
                  <td className="py-3 px-4 capitalize">{index + 1}</td>
                  <td className="py-3 px-4 capitalize">{trade.name}</td>
                  <td className="py-3 px-4 capitalize">{trade.exchange}</td>
                  <td className="py-3 px-4 capitalize">{trade.tradeType}</td>
                  <td className="py-3 px-4 capitalize">{trade.quantity}</td>
                  <td className="py-3 px-4 capitalize">{trade.price}</td>
                  <td className="py-3 px-4 capitalize">{trade.status}</td>
                  <td className="py-3 px-4 capitalize">{new Date(trade.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-500 text-white shadow-md">
    <BottomNav />
  </div>
</>

  );
}

export default TradeDetailPage;
