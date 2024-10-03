import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaMinus, FaPlus } from 'react-icons/fa';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import Sidebar from './SideBar';
import Spinner from './Spinner';  


const StopLossScreen = () => {
    const { instrumentId } = useParams();
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isToggled, setIsToggled] = useState(false);
    const toggleView = () => {
        setIsToggled(!isToggled);
    };
    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const response = await axios.get(`http://16.16.64.168:5000/api/var/client/stocks/${instrumentId}`, {
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

        // Set up polling every 10 seconds
        const intervalId = setInterval(fetchStockData, 10000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [instrumentId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
               <Spinner />
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
        QuotationLot = 0,
        tradeId = '' // Ensure tradeId is included
    } = stockData || {};

    return (
        <>
            {/* Fixed Top Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <TopNavbar toggleSidebar={toggleView} />
            <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
            </div>
            
            {/* Page Content */}
            <div className="pt-14 bg-gray-100 min-h-screen">
                <div className="p-4">
                    {/* Stock Information Section */}
                    <div className="flex flex-col items-center text-center shadow-lg p-4 bg-white rounded-lg">
                        <p className="text-2xl font-semibold text-blue-900">{name}</p>
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
                        instrumentId={instrumentId} 
                        tradeId={tradeId}  // Pass tradeId as prop
                        exchange={Exchange} // Pass exchange as prop
                    />
                </div>
            </div>

            {/* Fixed Bottom Navbar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md">
                <BottomNav/>
            </div>

            {/* Toast Container */}
            <ToastContainer />
        </>
    );
};

// BuySellPage Component
const BuySellPage = ({ buyPrice, sellPrice, lotSize, instrumentId, tradeId, exchange }) => {
    const [quantity, setQuantity] = useState(0);
    const [inputPrice, setInputPrice] = useState('');

    const handlePercentageClick = (percentage) => {
        const calculatedQuantity = (lotSize * percentage) / 100;
        setQuantity(prevQuantity => (parseFloat(prevQuantity) + calculatedQuantity).toFixed(2));
    };

    const handleDecreasePercentageClick = (percentage) => {
        const calculatedQuantity = (lotSize * percentage) / 100;
        setQuantity(prevQuantity => Math.max(0, (parseFloat(prevQuantity) - calculatedQuantity).toFixed(2)));
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        setQuantity(value ? parseFloat(value) : 0);
    };

    const handleInputPriceChange = (e) => {
        const value = e.target.value;
        setInputPrice(value);
    };

    const determineButtonAction = () => {
        const price = parseFloat(inputPrice);
        if (price <= buyPrice) {
            return 'SELL';
        } else if (price >= sellPrice) {
            return 'BUY';
        } else {
            return 'Invalid';
        }
    };

    // const handleStopLossSubmit = async () => {
    //     const action = determineButtonAction().toLowerCase();
    //     const price = action === 'buy' ? buyPrice : action === 'sell' ? sellPrice : 0;

    //     if (action === 'invalid') {
    //         toast.error('Invalid price');
    //         return;
    //     }

    //     if (quantity <= 0 || isNaN(quantity)) {
    //         toast.error('Invalid quantity');
    //         return;
    //     }

    //     const token = localStorage.getItem('StocksUsertoken');
    //     const decodedToken = jwtDecode(token);
    //     const userId = decodedToken.id;

    //     try {
    //         const response = await axios.post('http://16.16.64.168:5000/api/var/client/add/stoploss', {
    //             userId: userId,
    //             instrumentIdentifier: instrumentId,
    //             stopPrice: inputPrice,
    //             quantity: quantity,
    //             tradeType: action,
    //             tradeId: tradeId  
    //         }, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });

    //         toast.success('StopLoss submitted successfully!');
    //         // Clear form or handle success here
    //         setQuantity(0);
    //         setInputPrice('');
    //     } catch (error) {
    //         console.error('Error submitting StopLoss:', error.response ? error.response.data : error.message);
    //         toast.error('Error submitting StopLoss');
    //     }
    // };

    const handleStopLossSubmit = async () => {
    const action = determineButtonAction().toLowerCase();
    const price = action === 'buy' ? buyPrice : action === 'sell' ? sellPrice : 0;

    if (action === 'invalid') {
        toast.error('Invalid price');
        return;
    }

    if (quantity <= 0 || isNaN(quantity)) {
        toast.error('Invalid quantity');
        return;
    }

    // Get current time in India/Kolkata timezone
    const indiaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const currentTime = new Date(indiaTime);

    let startHour, startMinute, endHour, endMinute;

    // Set trading hours based on the exchange
    if (exchange.toUpperCase() === 'NSE') {
        // NSE trading hours (9:15 AM to 3:30 PM)
        startHour = 9;
        startMinute = 15;
        endHour = 15;
        endMinute = 30;
    } else if (exchange.toUpperCase() === 'MCX') {
        // MCX trading hours (9:00 AM to 11:30 PM)
        startHour = 9;
        startMinute = 0;
        endHour = 23;
        endMinute = 30;
    }

    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(currentTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Check if the current time is outside of trading hours
    if (currentTime < startTime || currentTime > endTime) {
        toast.error(`Stop-loss ${exchange.toUpperCase()} is only allowed between ${startHour}:${startMinute < 10 ? '0' + startMinute : startMinute} AM and ${endHour}:${endMinute < 10 ? '0' + endMinute : endMinute} PM.`);
        return;
    }

    const token = localStorage.getItem('StocksUsertoken');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;

    try {
        const response = await axios.post('http://16.16.64.168:5000/api/var/client/add/stoploss', {
            userId: userId,
            instrumentIdentifier: instrumentId,
            stopPrice: inputPrice,
            quantity: quantity,
            tradeType: action,
            tradeId: tradeId
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        toast.success('StopLoss submitted successfully!');
        // Clear form or handle success here
        setQuantity(0);
        setInputPrice('');
    } catch (error) {
        console.error('Error submitting StopLoss:', error.response ? error.response.data : error.message);
        toast.error('Error submitting StopLoss');
    }
};

    const buttonAction = determineButtonAction();

    return (
        <div className="flex justify-center mt-3 items-center h-full">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                <div className="text-center mb-2">
                    <p className="text-lg font-medium text-gray-600">Price: ₹{buyPrice}</p>
                </div>

                <div>
                    <div className="flex justify-between mb-4">
                        <span className="text-gray-600">Quantity</span>
                    </div>
                    <div className="flex items-center mb-4">
                        <input
                            type="number"
                            className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
                            placeholder="Quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                            readOnly
                        />
                    </div>

                        <div className="flex justify-around mb-6 gap-2">
                        {exchange === 'MCX' ? (
                            <>
                                <button
                                    aria-label="Decrease 100%"
                                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                                    onClick={() => handleDecreasePercentageClick(100)}
                                >
                                    <FaMinus className="text-white" />
                                </button>
                                <span>100%</span>
                                <button
                                    aria-label="Increase 100%"
                                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                                    onClick={() => handlePercentageClick(100)}
                                >
                                    <FaPlus className="text-white" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    aria-label="Decrease 25%"
                                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                                    onClick={() => handleDecreasePercentageClick(25)}
                                >
                                    <FaMinus className="text-white" />
                                </button>
                                <span>25%</span>
                                <button
                                    aria-label="Increase 25%"
                                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                                    onClick={() => handlePercentageClick(25)}
                                >
                                    <FaPlus className="text-white" />
                                </button>

                                <button
                                    aria-label="Decrease 50%"
                                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                                    onClick={() => handleDecreasePercentageClick(50)}
                                >
                                    <FaMinus className="text-white" />
                                </button>
                                <span>50%</span>
                                <button
                                    aria-label="Increase 50%"
                                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                                    onClick={() => handlePercentageClick(50)}
                                >
                                    <FaPlus className="text-white" />
                                </button>
                                
                                <button
                                    aria-label="Decrease 100%"
                                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                                    onClick={() => handleDecreasePercentageClick(100)}
                                >
                                    <FaMinus className="text-white" />
                                </button>
                                <span>100%</span>
                                <button
                                    aria-label="Increase 100%"
                                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                                    onClick={() => handlePercentageClick(100)}
                                >
                                    <FaPlus className="text-white" />
                                </button>
                            </>
                        )}
                    </div>


                    <div className="flex justify-between mb-4">
                        <span className="text-gray-600">StopLoss Price</span>
                        <span className="text-gray-600">INR</span>
                    </div>
                    <div className="flex items-center mb-4">
                        <input
                            type="number"
                            className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
                            placeholder="Enter Price"
                            value={inputPrice}
                            onChange={handleInputPriceChange}
                        />
                    </div>

                
                    <button
                        className={`mt-4 w-full py-3 rounded-lg ${
                            buttonAction === 'BUY'
                                ? 'bg-green-500 text-white'
                                : buttonAction === 'SELL'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-400 text-white'
                        }`}
                        onClick={handleStopLossSubmit}
                        disabled={buttonAction === 'Invalid'}
                    >
                        {buttonAction === 'BUY' ? 'BUY' : buttonAction === 'SELL' ? 'SELL' : 'Invalid Price'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StopLossScreen;
