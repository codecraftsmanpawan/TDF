import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

// Utility function to capitalize the first letter of each word
const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

const Stoploss = () => {
    const [stoplosses, setStoplosses] = useState([]);
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchStoplosses = async () => {
            try {
                const token = localStorage.getItem('StocksUsertoken');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    setUserId(decodedToken.id);
                }

                if (!userId) return;

                // Fetch stoplosses
                const stoplossResponse = await axios.get(`http://localhost:5000/api/var/client/stoploss/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStoplosses(stoplossResponse.data.stoplosses);

                // Fetch stock data
                const instrumentIdentifiers = stoplossResponse.data.stoplosses.map(stoploss => stoploss.instrumentIdentifier);
                const stockPromises = instrumentIdentifiers.map(id =>
                    axios.get(`http://localhost:5000/api/var/client/stocks/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                );
                const stockResponses = await Promise.all(stockPromises);

                const stockDataMap = stockResponses.reduce((acc, response) => {
                    const stock = response.data;
                    acc[stock.InstrumentIdentifier] = stock;
                    return acc;
                }, {});

                setStockData(stockDataMap);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoplosses();
    }, [userId]);

    if (loading) return <p>Loading...</p>;
  
    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white table-auto border-collapse">
                <thead>
                    <tr className="bg-blue-500 text-white">
                        <th className="py-2 px-4">#</th>
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Exchange</th>
                        <th className="py-2 px-4">Buy</th>
                        <th className="py-2 px-4">Sell</th>
                        <th className="py-2 px-4">Stoploss Price</th>
                        <th className="py-2 px-4">Quantity</th>
                        <th className="py-2 px-4">Trade Type</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Created At</th>
                        <th className="py-2 px-4">Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {stoplosses.length > 0 ? (
                        stoplosses.map((stoploss, index) => {
                            const stock = stockData[stoploss.instrumentIdentifier] || {};
                            const tradeType = capitalizeFirstLetter(stoploss.tradeType);
                            const backgroundColor = tradeType === 'Sell' ? 'bg-red-200' : 'bg-green-200';
        

                            return (
                                <tr key={stoploss._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-100'} ${backgroundColor} text-center`}>
                                    <td className="py-2 px-4 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 border-b">{stock.name || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{stock.Exchange || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{stock.BuyPrice ? `₹${stock.BuyPrice}` : 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{stock.SellPrice ? `₹${stock.SellPrice}` : 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{stoploss.stopPrice}</td>
                                    <td className="py-2 px-4 border-b">{stoploss.quantity}</td>
                                    <td className="py-2 px-4 border-b">{tradeType}</td>
                                    <td className="py-2 px-4 border-b">{capitalizeFirstLetter(stoploss.status)}</td>
                                    <td className="py-2 px-4 border-b">
                                        {new Date(stoploss.createdAt).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                        }).replace(',', ' at')}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {new Date(stoploss.updatedAt).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                        }).replace(',', ' at')}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="12" className="text-center py-4">No stoploss orders available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Stoploss;
