import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import TopNav from './TopNavbar';
import BottomNav from './BottomNav';
import Sidebar from './SideBar';
import Spinner from './Spinner';  

const TradeHistory = () => {
  const [tradeData, setTradeData] = useState(null);
  const [mcxTradesWithLotSize, setMcxTradesWithLotSize] = useState([]);
  const [error, setError] = useState(null);
  const [isToggled, setIsToggled] = useState(false);
    const toggleView = () => {
        setIsToggled(!isToggled);
    };
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // Retrieve the token from local storage
        const token = localStorage.getItem('StocksUsertoken');
        if (!token) {
          throw new Error('No token found');
        }

        // Decode the token to get clientId
        const decodedToken = jwtDecode(token);
        const clientId = decodedToken.id;

        // Fetch trade data
        const config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `http://16.16.64.168:5000/api/var/client/trades/client/brokerage/${clientId}`,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        };
        const response = await axios.request(config);
        setTradeData(response.data);

        // Fetch the QuotationLot for MCX trades
        const updatedMcxTrades = await Promise.all(response.data.mcxTrades.map(async (trade) => {
          try {
            const lotConfig = {
              method: 'get',
              maxBodyLength: Infinity,
              url: `http://16.16.64.168:5000/api/var/client/stocks/${trade.instrumentIdentifier}`,
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            };
            const lotResponse = await axios.request(lotConfig);
            const quotationLot = lotResponse.data.QuotationLot || 1; 
            return {
              ...trade,
              quantity: trade.quantity / quotationLot, 
              quotationLot,
            };
          } catch (err) {
           
            return trade; 
          }
        }));

        setMcxTradesWithLotSize(updatedMcxTrades);
      } catch (err) {
        setError('Error fetching trade history');
        console.error(err);
      }
    };

    fetchTrades();
  }, []);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  if (!tradeData) {
    return  <Spinner />;
  }

  const { client, nseTrades, totalNSEAmount, brokeragePerMCX, totalMCXAmount, brokeragePerNSECrore, totalBrokerage, totalAmount } = tradeData;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation */}
      <TopNav toggleSidebar={toggleView} />
      <Sidebar isOpen={isToggled} closeSidebar={toggleView} />

      <main className="flex-1 overflow-y-auto p-6 mb-16">
        <h1 className="text-3xl font-semibold mb-6 text-blue-600">Trade History</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="overflow-x-auto mt-4">
          {/* Display Client Brokerage Info */}
          <div className="mb-6 p-4 bg-blue-100 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Client Brokerage</h2>
            <p><strong>Share Brokerage:</strong> ₹{client.share_brokerage}</p>
           <p><strong>MCX Brokerage Type:</strong> {client.mcx_brokerage_type === 'per_crore' ? 'Per Crore' : client.mcx_brokerage_type === 'per_sauda' ? 'Per Sauda' : client.mcx_brokerage_type}</p>

            <p><strong>MCX Brokerage:</strong> ₹{client.mcx_brokerage}</p>
          </div>

          <p className="text-xl font-semibold mb-4 mt-4">Total Brokerage: ₹{totalBrokerage}</p>
          <p className="text-xl font-semibold mb-4">Total NSE Brokerage: ₹{brokeragePerNSECrore}</p>
          <p className="text-xl font-semibold mb-4">Total MCX Brokerage: ₹{brokeragePerMCX}</p>

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
                  <th className="py-2 px-4">Trade Quantity</th>
                  <th className="py-2 px-4">Investment Price/Share</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Update At</th>
                </tr>
              </thead>
              <tbody>
                {nseTrades.map((trade, index) => (
                  <tr key={trade._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} text-center`}>
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">{trade.name}</td>
                    <td className="py-2 px-4 border-b">{trade.exchange}</td>
                    <td className="py-2 px-4 border-b">{capitalizeFirstLetter(trade.tradeType)}</td>
                    <td className="py-2 px-4 border-b">{trade.quantity} Share</td>
                    <td className="py-2 px-4 border-b">₹{trade.price}</td>
                    <td className="py-2 px-4 border-b">{new Date(trade.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</td>
                    <td className="py-2 px-4 border-b">{new Date(trade.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                  <th className="py-2 px-4">Trade Quantity</th>
                  <th className="py-2 px-4">Investment Price/Share</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Update At</th>
                </tr>
              </thead>
              <tbody>
                {mcxTradesWithLotSize.map((trade, index) => (
                  <tr key={trade._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} text-center`}>
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">{trade.name}</td>
                    <td className="py-2 px-4 border-b">{trade.exchange}</td>
                    <td className="py-2 px-4 border-b">{capitalizeFirstLetter(trade.tradeType)}</td>
                    <td className="py-2 px-4 border-b">{trade.quantity} Lot</td>
                    <td className="py-2 px-4 border-b">₹{trade.price}</td>
                    <td className="py-2 px-4 border-b">{new Date(trade.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</td>
                    <td className="py-2 px-4 border-b">{new Date(trade.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default TradeHistory;
