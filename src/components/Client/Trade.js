import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import { FaMinus, FaPlus } from 'react-icons/fa';

const TradeScreen = () => {
    const { instrumentId } = useParams();
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [clientId, setClientId] = useState('');

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/var/client/stocks/${instrumentId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('StocksUsertoken')}`,
                    },
                });
                setStockData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching stock data:', error);
                setError('Error fetching stock data');
                setLoading(false);
            }
        };

        fetchStockData();

        // Set up polling every second
        const intervalId = setInterval(() => {
            fetchStockData();
        }, 1000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [instrumentId]);

    useEffect(() => {
        // Decode the token and extract client_id
        const token = localStorage.getItem('StocksUsertoken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setClientId(decodedToken.id); 
            } catch (e) {
                console.error('Error decoding token:', e);
                setError('Error decoding token');
            }
        }
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="w-16 h-16 border-4 border-blue-500 border-solid rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-red-500 text-center">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const {
        Exchange = 'N/A',
        InstrumentIdentifier = 'N/A',
        BuyPrice = 0,
        SellPrice = 0,
        name = 'N/A',
        High = 0,
        Low = 0,
        LastTradePrice = 0,
        Open = 0,
        QuotationLot = 0,
    } = stockData || {};

    return (
        <>
            {/* Fixed Top Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <TopNavbar />
            </div>
            
            {/* Page Content */}
            <div className="pt-16 bg-gray-100 min-h-screen">
                <div className="p-4">
                    {/* Stock Information Section */}
                    <div className="flex flex-col items-center mb-6 text-center shadow-lg p-6 bg-white rounded-lg">
                        <p className="text-2xl font-semibold mb-4 text-blue-900">{name}</p>
                        <div className="flex items-center">
                            <p className="text-lg font-medium text-gray-600 mr-4">Exchange: {Exchange}</p>
                            <p className="text-lg font-medium text-gray-600">Lot Size: {QuotationLot}</p>
                        </div>
                    </div>

                    {/* Buy/Sell Section */}
                    <BuySellPage 
                        buyPrice={BuyPrice} 
                        sellPrice={SellPrice} 
                        lotSize={QuotationLot} 
                        exchange={Exchange}
                        instrumentIdentifier={InstrumentIdentifier} 
                        name={name}
                        clientId={clientId} 
                    />
                </div>
            </div>

            {/* Fixed Bottom Navbar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md">
                <BottomNav />
            </div>
        </>
    );
};

const BuySellPage = ({ buyPrice, sellPrice, lotSize, exchange, instrumentIdentifier, name, clientId }) => {
    const [isBuy, setIsBuy] = useState(true);
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState('');

    const handleTabChange = (tab) => {
        setIsBuy(tab === "buy");
        setAmount(0);
    };

    const handlePercentageClick = (percentage) => {
        const calculatedAmount = (lotSize * percentage) / 100;
        setAmount((prevAmount) => (parseFloat(prevAmount) + calculatedAmount).toFixed(2)); 
    };

    const handleDecreasePercentageClick = (percentage) => {
        const calculatedAmount = (lotSize * percentage) / 100;
        setAmount((prevAmount) => Math.max(0, (parseFloat(prevAmount) - calculatedAmount).toFixed(2))); 
    };

    const handleAmountChange = (change) => {
        setAmount((prevAmount) => Math.max(0, (parseFloat(prevAmount) + change).toFixed(2))); 
    };

    const handleTrade = async () => {
        const tradeType = isBuy ? 'buy' : 'sell';
        const data = {
            _id: clientId, 
            instrumentIdentifier: instrumentIdentifier,
            name: name,
            exchange: exchange,
            trade_type: tradeType,
            quantity: parseFloat(amount),
            price: isBuy ? buyPrice : sellPrice
        };

        try {
            const response = await axios.post('http://localhost:5000/api/var/client/trades', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('StocksUsertoken')}`,
                }
            });
            console.log('Trade successful:', response.data);
            // Optionally, you might want to show a success message or handle the response data
        } catch (error) {
            console.error('Error making trade:', error);
            setError('Error making trade');
        }
    };

    const isMCX = exchange.toUpperCase() === 'MCX';

    return (
        <div className="flex justify-center items-center h-full">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-around mb-4">
                    <button
                        className={`flex-1 text-center py-2 ${isBuy ? "border-b-4 border-green-500" : "border-b-4 border-transparent"}`}
                        onClick={() => handleTabChange("buy")}
                    >
                        <span className={`text-xl font-bold ${isBuy ? "text-green-500" : "text-gray-500"}`}>BUY</span>
                    </button>
                    <button
                        className={`flex-1 text-center py-2 ${!isBuy ? "border-b-4 border-red-500" : "border-b-4 border-transparent"}`}
                        onClick={() => handleTabChange("sell")}
                    >
                        <span className={`text-xl font-bold ${!isBuy ? "text-red-500" : "text-gray-500"}`}>SELL</span>
                    </button>
                </div>

                <div className="text-center mb-4">
                    <p className="text-lg font-medium text-gray-600">
                        {isBuy ? `Buy Price: ₹${buyPrice}` : `Sell Price: ₹${sellPrice}`}
                    </p>
                </div>

                <div>
                    <div className="flex justify-between mb-4">
                        <span className="text-gray-600">Quantity</span>
                    </div>
                    <div className="flex items-center mb-4">
                        <input
                            type="text"
                            className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-around mb-4 gap-2">
                        {!isMCX && (
                            <>
                                <button
                                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                                    onClick={() => handleDecreasePercentageClick(25)}
                                >
                                    <FaMinus className="text-white" />
                                </button>
                                <span>25%</span>
                                <button
                                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                                    onClick={() => handlePercentageClick(25)}
                                >
                                    <FaPlus className="text-white" />
                                </button>

                                <button
                                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                                    onClick={() => handleDecreasePercentageClick(50)}
                                >
                                    <FaMinus className="text-white" />
                                </button>
                                <span>50%</span>
                                <button
                                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                                    onClick={() => handlePercentageClick(50)}
                                >
                                    <FaPlus className="text-white" />
                                </button>
                            </>
                        )}

                        <button
                            className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                            onClick={() => handleDecreasePercentageClick(100)}
                        >
                            <FaMinus className="text-white" />
                        </button>
                        <span>100%</span>
                        <button
                            className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                            onClick={() => handlePercentageClick(100)}
                        >
                            <FaPlus className="text-white" />
                        </button>
                    </div>

                    <button
                        className={`w-full py-3 mt-6 rounded-lg ${isBuy ? "bg-green-500 text-white" : "bg-red-500 text-white"} text-lg font-semibold`}
                        onClick={handleTrade}
                    >
                        {isBuy ? "BUY" : "SELL"}
                    </button>

                    {error && (
                        <div className="mt-4 text-red-500 text-center">
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TradeScreen;
