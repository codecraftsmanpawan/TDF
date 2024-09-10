import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faGavel, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import Sidebar from './SideBar';

const StockSelector = () => {
    const [options, setOptions] = useState([]); 
    const [isToggled, setIsToggled] = useState(false);
    const [selectedInstrument, setSelectedInstrument] = useState('');
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const toggleView = () => {
        setIsToggled(!isToggled);
    };
    // Function to get token and decode it
    const getDecodedToken = () => {
        const token = localStorage.getItem('StocksUsertoken');  
        if (token) {
            try {
                const decoded = jwtDecode(token);
                return decoded;
            } catch (error) {
                console.error('Error decoding token', error);
                return null;
            }
        }
        return null;
    };

    // Get user ID from decoded token
    const user = getDecodedToken();
    const userId = user ? user.id : null;

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://16.16.64.168:5000/api/var/client/wishlist/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('StocksUsertoken')}`, // Use token from local storage
                    },
                });
                setOptions(response.data.items);
            } catch (error) {
                setError('Error fetching options');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchOptions();
        }
    }, [userId]);

    useEffect(() => {
        if (selectedInstrument) {
            const fetchStockData = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`http://16.16.64.168:5000/api/var/client/stocks/${selectedInstrument}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('StocksUsertoken')}`, // Use token from local storage
                        },
                    });
                    setStockData(response.data);
                } catch (error) {
                    setError('Error fetching stock data');
                } finally {
                    setLoading(false);
                }
            };

            fetchStockData();
        }
    }, [selectedInstrument]);

    const handleChange = (event) => {
        setSelectedInstrument(event.target.value);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-blue-100">
                <div className="w-16 h-16 border-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-blue-100">
                <div className="text-red-500 text-center">
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
          <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <TopNavbar toggleSidebar={toggleView} />
            <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
            <div className="p-6 max-w-2xl mx-auto bg-blue-50 min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-blue-700">Select Stock</h1>
                    <button 
                        className="text-gray-500 hover:text-blue-700 transition"
                        onClick={() => navigate(-1)}
                    >
                        &larr; Back
                    </button>
                </div>
                
                {/* Dropdown to select stock */}
                <div className="relative mb-6 ">
                    <select
                        value={selectedInstrument}
                        onChange={handleChange}
                        className="block w-full p-2  bg-white border border-blue-300 rounded-lg shadow-md  focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="" disabled>Select a stock</option>
                        {options.map((item) => (
                            <option key={item._id} value={item.instrumentIdentifier}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-center space-x-4">
                    <button 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300 ease-in-out flex items-center space-x-2"
                        onClick={() => navigate(`/trade/${selectedInstrument}`)}
                    >
                        <FontAwesomeIcon icon={faChartLine} />
                        <span>Trade</span>
                    </button>
                    <button 
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition duration-300 ease-in-out flex items-center space-x-2"
                        onClick={() => navigate(`/bid/${selectedInstrument}`)}
                    >
                        <FontAwesomeIcon icon={faGavel} />
                        <span>Bid</span>
                    </button>
                    <button 
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-300 ease-in-out flex items-center space-x-2"
                        onClick={() => navigate(`/stoploss/${selectedInstrument}`)}
                    >
                        <FontAwesomeIcon icon={faShieldAlt} />
                        <span>Stop Loss</span>
                    </button>
                </div>

                {/* Display stock details */}
                {stockData && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-blue-600">Opening Price</p>
                            <p className="font-semibold">₹{stockData.Open?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-blue-600">Closing Price</p>
                            <p className="font-semibold">₹{stockData.Close?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-green-500">Buy Price</p>
                            <p className="font-semibold">₹{stockData.BuyPrice?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-red-500">Sell Price</p>
                            <p className="font-semibold">₹{stockData.SellPrice?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-green-500">High</p>
                            <p className="font-semibold">₹{stockData.High?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-red-500">Low</p>
                            <p className="font-semibold">₹{stockData.Low?.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-blue-600">Lot Size</p>
                            <p className="font-semibold">{stockData.QuotationLot}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <p className="text-blue-600">Expiry Date</p>
                            <p className="font-semibold">{new Date(stockData.ExpiryDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>
            <BottomNav />
             </div>
        </>
    );
};

export default StockSelector;
