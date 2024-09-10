import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './SuperAdminNav';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Link} from 'react-router-dom'

const StockTable = () => {
  const [stockData, setStockData] = useState([]);
  const [blockedStocks, setBlockedStocks] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const config = {
        method: 'get',
        url: 'http://16.16.64.168:5000/api/var/superAdmin/api/stocks',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.request(config);
      setStockData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedStocks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const config = {
        method: 'get',
        url: 'http://16.16.64.168:5000/api/var/superAdmin/api/blockStocks',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.request(config);
      setBlockedStocks(response.data.stocks); // Adjusted to use response.data.stocks
    } catch (error) {
      console.error('Error fetching blocked stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchStockData();
    fetchBlockedStocks();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const filtered = stockData
      .map(stock => ({
        ...stock,
        isBlocked: blockedStocks.some(blockedStock => blockedStock.symbol === stock.InstrumentIdentifier)
      }))
      .filter(stock => {
        const symbol = stock.symbol ? stock.symbol.toLowerCase() : '';
        const identifier = stock.InstrumentIdentifier ? stock.InstrumentIdentifier.toLowerCase() : '';
        const term = searchTerm.toLowerCase();

        return symbol.includes(term) || identifier.includes(term);
      })
      .sort((a, b) => {
        // Sort blocked stocks to the top
        if (a.isBlocked && !b.isBlocked) return -1;
        if (!a.isBlocked && b.isBlocked) return 1;
        return 0; // Maintain current order if both are blocked or both are active
      });

    setFilteredData(filtered);
  }, [searchTerm, stockData, blockedStocks]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const openModal = (stock) => {
    setSelectedStock(stock);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedStock(null);
  };

  const handleConfirmBlock = async () => {
    if (!selectedStock) return;
    try {
      const token = localStorage.getItem('superAdminToken');
      const data = {
        symbol: selectedStock.InstrumentIdentifier,
        exchange: selectedStock.Exchange
      };

      const config = {
        method: 'post',
        url: 'http://16.16.64.168:5000/api/var/superAdmin/api/blockStock',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        data: JSON.stringify(data)
      };

      const response = await axios.request(config);
      console.log('Block stock added:', response.data);
      toast.success(`Block stock added: ${selectedStock.InstrumentIdentifier}`);
      fetchBlockedStocks();
    } catch (error) {
      console.error('Error adding block stock:', error);
      toast.error('Failed to add block stock');
    } finally {
      closeModal();
    }
  };

  const handleDeleteBlock = async (stock) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const symbol = stock.InstrumentIdentifier;

      const config = {
        method: 'delete',
        url: `http://16.16.64.168:5000/api/var/superAdmin/api/blockStock/${symbol}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.request(config);
      console.log('Block stock removed:', response.data);
      toast.success(`Block stock removed: ${symbol}`);
      fetchBlockedStocks(); // Refresh the list of blocked stocks
    } catch (error) {
      console.error('Error removing block stock:', error);
      toast.error('Failed to remove block stock');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-16 p-4 bg-gray-50 rounded-lg shadow-lg">
        <div className="mb-4 mt-8">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by Symbol or Identifier..."
            className="min-w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-4 border-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <thead>
              <tr className="bg-blue-700 text-white uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">S.No</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Exchange</th>
                <th className="py-3 px-6 text-left">Buy Price</th>
                <th className="py-3 px-6 text-left">Sell Price</th>
                <th className="py-3 px-6 text-left">High</th>
                <th className="py-3 px-6 text-left">Low</th>
                <th className="py-3 px-6 text-left">Close</th>
                <th className="py-3 px-6 text-left">Expiry</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Action</th>
                <th className="py-3 px-6 text-left">Quantity Limit</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((stock, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left text-gray-800">{index + 1}</td>
                    <td className="py-3 px-6 text-left whitespace-nowrap font-semibold text-gray-800">{stock.name || 'N/A'}</td>
                    <td className="py-3 px-6 text-left text-gray-700">{stock.Exchange || 'N/A'}</td>
                    <td className="py-3 px-6 text-left text-gray-700">{stock.BuyPrice || 'N/A'}</td>
                    <td className="py-3 px-6 text-left text-gray-700">{stock.SellPrice || 'N/A'}</td>
                    <td className="py-3 px-6 text-left text-gray-700">{stock.High || 'N/A'}</td>
                    <td className="py-3 px-6 text-left text-gray-700">{stock.Low || 'N/A'}</td>
                    <td className="py-3 px-6 text-left text-gray-700">{stock.Close || 'N/A'}</td>
                    <td className="py-3 px-6 text-left text-gray-700">
                      {new Date(stock.expiry).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                   <td 
  className={`py-3 px-6 text-left text-gray-700 ${
    stock.isBlocked ? 'bg-red-100' : 'bg-green-100'
  } font-bold uppercase`}
>
  {stock.isBlocked ? 'Blocked' : 'Active'}
</td>

                  <td className="py-3 px-6 text-left">
  {stock.isBlocked ? (
    <button
      onClick={() => handleDeleteBlock(stock)}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Unblock
    </button>
  ) : (
    <button
      onClick={() => openModal(stock)}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Block
    </button>
  )}
</td>
<td className="py-3 px-6 text-left">
 <Link
  to={`/Quantity/Limit/${encodeURIComponent(stock.InstrumentIdentifier)}/${encodeURIComponent(stock.name)}`}
  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
>
  Set 
</Link>

</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="py-3 px-6 text-center text-gray-700">
                    No stocks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Block Stock Modal */}
        {modalIsOpen && selectedStock && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold mb-4">Block Stock</h3>
              <p>Are you sure you want to block this stock?</p>
              <p className="font-bold text-lg">{selectedStock.InstrumentIdentifier}</p>
              <div className="mt-4">
                <button
                  onClick={handleConfirmBlock}
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                  Confirm
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </>
  );
};

export default StockTable;
