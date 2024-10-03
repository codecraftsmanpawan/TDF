import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faGavel, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import Spinner from './Spinner'; 
const StockDetailPage = () => {
    const { instrumentId } = useParams();
    const navigate = useNavigate();
    const [stockDetails, setStockDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isToggled, setIsToggled] = useState(false);
    const toggleView = () => {
        setIsToggled(!isToggled);
    };
    // Function to fetch stock details
    const fetchStockDetails = async () => {
        try {
            const response = await axios.get(`http://16.16.64.168:5000/api/var/client/stocks/${instrumentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('StocksUsertoken')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching stock details:', error);
            setError('Error fetching stock details');
            return null;
        }
    };

    // Initial fetch and setup polling
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            const initialData = await fetchStockDetails();
            if (initialData) {
                setStockDetails(initialData);
                setError('');
            }
            setLoading(false);
        };

        initializeData();

        // Set up interval for periodic updates
        const intervalId = setInterval(async () => {
            const updatedData = await fetchStockDetails();
            if (updatedData) {
                setStockDetails(updatedData);
            }
        }, 1000); // Update every second

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [instrumentId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
               <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-center">
                    <p>{error}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const {
        name = 'N/A',
        Exchange = 'N/A',
        PriceChange, 
        PriceChangePercentage,  
        LastTradePrice = 0,
        BuyPrice = 0,
        SellPrice = 0,
        QuotationLot = 0,
        expiry = '',
        High = 0,
        Low = 0,
        Open = 0,
        Close = 0,
    } = stockDetails || {};

    const formattedExpiryDate = expiry ? new Date(expiry).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) : 'N/A';

    return (
        <div className="p-6 max-w-lg mx-auto bg-blue-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    className="text-blue-500"
                    onClick={() => navigate(-1)} 
                >
                    &larr; Back
                </button>
                <h1 className="text-lg font-semibold text-blue-700">{name}</h1>
                <button className="text-gray-500">•••</button>
            </div>
            
            {/* Stock Overview */}
            <div className="mb-4 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-lg font-bold text-blue-700">
                            {name.slice(0, 2)}
                        </div>
                        <div className="ml-4">
                            <p className="font-semibold text-blue-700">{name}</p>
                            <p className="text-gray-500 text-sm">{Exchange}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`font-semibold ${PriceChangePercentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {PriceChangePercentage.toFixed(2)}%
                        </p>
                        <p className="text-lg font-bold">₹{LastTradePrice.toFixed(2)}</p>
                    </div>
                </div>
                {/* Trade Button */}
                <div className="mt-6 flex justify-center space-x-4">
                    <button 
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-300 ease-in-out flex items-center space-x-2"
                        onClick={() => navigate(`/trade/${instrumentId}`)}
                    >
                        <FontAwesomeIcon icon={faChartLine} />
                        <span>Trade</span>
                    </button>
                    <button 
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition duration-300 ease-in-out flex items-center space-x-2"
                        onClick={() => navigate(`/bid/${instrumentId}`)}
                    >
                        <FontAwesomeIcon icon={faGavel} />
                        <span>Bid</span>
                    </button>
                    <button 
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-300 ease-in-out flex items-center space-x-2"
                        onClick={() => navigate(`/stoploss/${instrumentId}`)}
                    >
                        <FontAwesomeIcon icon={faShieldAlt} />
                        <span>Stop loss</span>
                    </button>
                </div>
            </div>

            {/* Stock Details */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">Opening Price</p>
                    <p className="font-semibold">₹{Open.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">Closing Price</p>
                    <p className="font-semibold">₹{Close.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">Buy Price</p>
                    <p className="font-semibold text-green-500">₹{BuyPrice.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">Sell Price</p>
                    <p className="font-semibold text-red-500">₹{SellPrice.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">High</p>
                    <p className="font-semibold text-green-500">₹{High.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">Low</p>
                    <p className="font-semibold text-red-500">₹{Low.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">Lot Size</p>
                    <p className="font-semibold">{QuotationLot}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-gray-500">Expiry Date</p>
                    <p className="font-semibold">{formattedExpiryDate}</p>
                </div>
            </div>
        </div>
    );
};

export default StockDetailPage;
