import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import default import
import { useNavigate } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import Bids from './BidsPage';
import Stoploss from './StoplossPage';

const StockPortfolio = () => {
    const [trades, setTrades] = useState([]);
    const [bids, setBids] = useState([]);
    const [stoplosses, setStoplosses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [realTimeData, setRealTimeData] = useState({});
    const [activeTab, setActiveTab] = useState('trades');
    const navigate = useNavigate();
    const [responseData, setResponseData] = useState(null);
    const [overallProfitLoss, setOverallProfitLoss] = useState('0.00');

    const getToken = () => localStorage.getItem('StocksUsertoken');

    const getUserIdFromToken = () => {
        const token = getToken();
        if (token) {
            const decodedToken = jwtDecode(token);
            return decodedToken.id;
        }
        return null;
    };

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const userId = getUserIdFromToken();
                if (userId) {
                    const response = await axios.get(`http://localhost:5000/api/var/client/trades/net-quantity/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`
                        }
                    });
                    setTrades(response.data.netQuantities);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
    }, []);

    useEffect(() => {
        if (trades.length > 0) {
            trades.forEach((trade) => {
                const instrumentIdentifier = trade.instrumentIdentifier;
                fetchRealTimeData(instrumentIdentifier);
            });
            const intervalId = setInterval(() => {
                trades.forEach((trade) => {
                    const instrumentIdentifier = trade.instrumentIdentifier;
                    fetchRealTimeData(instrumentIdentifier);
                });
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [trades]);

    const fetchRealTimeData = async (instrumentIdentifier) => {
        try {
            const token = getToken();
            const response = await axios.get(`http://localhost:5000/api/var/client/stocks/${instrumentIdentifier}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRealTimeData((prevData) => ({
                ...prevData,
                [instrumentIdentifier]: response.data
            }));
        } catch (err) {
            console.error('Error fetching real-time data:', err);
        }
    };

    const calculateProfitLoss = (tradePrice, lastTradePrice, tradeType) => {
        if (!lastTradePrice) return { value: 'N/A', color: 'text-gray-500', percentage: 'N/A' };
        const profitLoss = (lastTradePrice - tradePrice) * (tradeType === 'buy' ? 1 : -1);
        const percentage = ((profitLoss / tradePrice) * 100).toFixed(2);
        return {
            value: profitLoss.toFixed(2),
            color: profitLoss >= 0 ? 'text-green-500' : 'text-red-500',
            percentage: percentage
        };
    };

    const calculateOverallProfitLoss = () => {
        const result = trades.reduce((acc, trade) => {
            const stockData = realTimeData[trade.instrumentIdentifier] || {};
            const lastTradePrice = stockData.LastTradePrice || 0;
            const { value: profitLossValue } = calculateProfitLoss(trade.price, lastTradePrice, trade.action);
            return acc + parseFloat(profitLossValue) || 0;
        }, 0).toFixed(2);

        return result;
    };

useEffect(() => {
    const intervalId = setInterval(() => {
        const updateProfitLoss = async () => {
            // console.log("Updating profit/loss..."); // Debugging line

            const token = getToken(); // Get token from localStorage
            const userId = getUserIdFromToken(); // Decode token to get userId

            if (!token) {
                setError("No token found");
                // console.log("No token found"); 
                return;
            }

            if (!userId) {
                setError("Invalid token or user ID not found");
                // console.log("Invalid token or user ID not found"); 
                return;
            }

            // Ensure profitLoss is a number
            const profitLoss = parseFloat(overallProfitLoss);
            // console.log("Calculated Profit/Loss:", profitLoss);

            const data = JSON.stringify({
                profitLoss
            });

            const config = {
                method: 'patch',
                maxBodyLength: Infinity,
                url: `http://localhost:5000/api/var/client/updateProfitLoss/${userId}`, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: data
            };

          

            try {
                const response = await axios.request(config);
                // console.log("API Response:", response.data); // Debugging line
                setResponseData(response.data);
            } catch (err) {
               
                setError(err.message || "Something went wrong");
            }
        };

        if (trades.length > 0 && Object.keys(realTimeData).length > 0) {
            updateProfitLoss();
        }
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Clear interval on component unmount
}, [trades, realTimeData, overallProfitLoss]); // Dependencies to trigger the effect

    useEffect(() => {
        if (trades.length > 0 && Object.keys(realTimeData).length > 0) {
            const profitLoss = calculateOverallProfitLoss();
            setOverallProfitLoss(profitLoss);
        }
    }, [trades, realTimeData]); // Update when trades or realTimeData change

    const handleRowClick = (instrumentIdentifier) => {
        navigate(`/trade/detail/${instrumentIdentifier}`);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleButtonClick = (trade) => {
        const action = trade.action === 'buy' ? 'sell' : 'buy';
        navigate(`/trade/${action}/${trade.instrumentIdentifier}`);
    };

    const groupTradesByInstrument = (trades) => {
        const groupedTrades = trades.reduce((acc, trade) => {
            const key = `${trade.instrumentIdentifier}-${trade.exchange}-${trade.action}`;
            const existing = acc[key];

            if (!existing) {
                acc[key] = {
                    instrumentIdentifier: trade.instrumentIdentifier,
                    exchange: trade.exchange,
                    totalQuantity: 0,
                    totalInvestment: 0,
                    totalCurrentValue: 0,
                    trades: [],
                    action: trade.action
                };
            }

            acc[key].trades.push(trade);
            acc[key].totalQuantity += trade.netQuantity;
            acc[key].totalInvestment += trade.price * trade.netQuantity;

            return acc;
        }, {});

        return Object.values(groupedTrades).map((data) => {
            const { instrumentIdentifier, exchange, totalQuantity, totalInvestment, trades } = data;
            const stockData = realTimeData[instrumentIdentifier] || {};
            const lastTradePrice = stockData.LastTradePrice || 0;
            const totalCurrentValue = lastTradePrice * totalQuantity;
            const totalProfitLoss = totalCurrentValue - totalInvestment;

            return {
                instrumentIdentifier,
                exchange,
                totalQuantity,
                totalInvestment,
                totalCurrentValue,
                totalProfitLoss,
                lastTradePrice,
                tradeData: trades[0]
            };
        }).filter(tradeData => {
            return tradeData.tradeData.action === 'sell' || 
                (tradeData.totalQuantity > 0 && tradeData.tradeData.action === 'buy');
        });
    };

    const formatInstrumentIdentifier = (identifier) => {
        const match = identifier.match(/(\d{2}[A-Z]{3}\d{4})/);
        return match ? match[0] : identifier;
    };

    const getButtonColor = (action) => {
        return action === 'buy' ? 'bg-red-500' : 'bg-green-500';
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // if (error) {
    //     return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
    // }

    const groupedTrades = groupTradesByInstrument(trades);

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <TopNavbar />
            </div>
            <div className="container mx-auto p-2 mt-16">
                <h2 className="text-2xl font-bold mb-4 mt-4">Stock Portfolio</h2>

                <div className="mb-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-xl font-semibold">Overall Profit/Loss: ₹{overallProfitLoss}</span>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded p-4 mb-12">
                    <div className="flex border-b">
                        <button 
                            className={`py-2 px-8 ${activeTab === 'trades' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-l`} 
                            onClick={() => handleTabChange('trades')}
                        >
                            Trades
                        </button>
                        <button 
                            className={`py-2 px-8 ${activeTab === 'bids' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} 
                            onClick={() => handleTabChange('bids')}
                        >
                            Bids
                        </button>
                        <button 
                            className={`py-2 px-8 ${activeTab === 'stoploss' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-r`} 
                            onClick={() => handleTabChange('stoploss')}
                        >
                            Stoploss
                        </button>
                    </div>

                    {activeTab === 'trades' && (
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full bg-white table-auto">
                                <thead>
                                    <tr className="bg-blue-500 text-white">
                                        <th className="py-2 px-4">#</th>
                                        <th className="py-2 px-4">Stock</th>
                                        <th className="py-2 px-4">Instrument</th>
                                        <th className="py-2 px-4">Exchange</th>
                                        <th className="py-2 px-4">Quantity</th>
                                        <th className="py-2 px-4">Action</th>
                                        <th className="py-2 px-4">Investment Value</th>
                                        <th className="py-2 px-4">Current Value</th>
                                        <th className="py-2 px-4">Profit/Loss</th>
                                        <th className="py-2 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedTrades.length > 0 ? (
                                        groupedTrades.map((tradeData, index) => {
                                            const { instrumentIdentifier, exchange, totalQuantity, totalInvestment, totalCurrentValue, lastTradePrice, tradeData: trade } = tradeData;
                                            const { value: profitLossValue, color: profitLossColor, percentage } = calculateProfitLoss(totalInvestment / totalQuantity, lastTradePrice, trade.action);

                                            return (
                                                <tr 
                                                    key={instrumentIdentifier} 
                                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-100'} text-center cursor-pointer`}
                                                    onClick={() => handleRowClick(instrumentIdentifier)}
                                                >
                                                    <td className="py-2 px-4 border-b">{index + 1}</td>
                                                    <td className="py-2 px-4 border-b">{trade.name}</td>
                                                    <td className="py-2 px-4 border-b">{formatInstrumentIdentifier(instrumentIdentifier)}</td>
                                                    <td className="py-2 px-4 border-b">{exchange}</td>
                                                    <td className="py-2 px-4 border-b">{totalQuantity}</td>
                                                    <td className="py-2 px-4 border-b" style={{ textTransform: 'capitalize' }}>{trade.action}</td>
                                                    <td className="py-2 px-4 border-b">₹{totalInvestment.toFixed(2)}</td>
                                                    <td className="py-2 px-4 border-b">₹{totalCurrentValue.toFixed(2)}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className={profitLossColor}>{profitLossValue} ({percentage}%)</span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <button
                                                            className={`text-white font-bold py-1 px-3 rounded ${getButtonColor(trade.action)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); 
                                                                handleButtonClick(trade);
                                                            }}
                                                        >
                                                            {trade.action === 'buy' ? 'Sell' : 'Buy'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="text-center py-4">No trades available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'bids' && <Bids bids={bids} />} 
                    {activeTab === 'stoploss' && <Stoploss stoplosses={stoplosses} />} 
                </div>
            </div>
            <BottomNav />
        </>
    );
};

export default StockPortfolio;
