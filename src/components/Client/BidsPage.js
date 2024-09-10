import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

const Bids = () => {
    const [bids, setBids] = useState([]);
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const token = localStorage.getItem('StocksUsertoken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.id);

                // Fetch bids
                const bidsResponse = await axios.get(`http://16.16.64.168:5000/api/var/client/bids/${decodedToken.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const fetchedBids = bidsResponse.data.bids;
                setBids(fetchedBids);

                // Fetch stock data
                const instrumentIdentifiers = fetchedBids.map(bid => bid.instrumentIdentifier);
                const stockPromises = instrumentIdentifiers.map(id =>
                    axios.get(`http://16.16.64.168:5000/api/var/client/stocks/${id}`, {
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

        if (userId === null) {
            fetchBids();
        }
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error fetching data: {error.message}</p>;

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
                        <th className="py-2 px-4">Bid Price</th>
                        <th className="py-2 px-4">Bid Quantity</th>
                        <th className="py-2 px-4">Trade Type</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Created At</th>
                        <th className="py-2 px-4">Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {bids.length > 0 ? (
                        bids.map((bid, index) => {
                            const stock = stockData[bid.instrumentIdentifier] || {};
                            const tradeType = capitalizeFirstLetter(bid.tradeType);
                            const backgroundColor = tradeType === 'Sell' ? 'bg-red-200' : 'bg-green-200';
                            const priceToDisplay = tradeType === 'Sell' ? bid.bidPrice : bid.bidPrice;
                            const priceColor = tradeType === 'Sell' ? 'text-red-500' : 'text-green-500';
                            
                            return (
                                <tr key={bid._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-100'} ${backgroundColor} text-center`}>
                                    <td className="py-2 px-4 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 border-b">{stock.name || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{stock.Exchange || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{stock.BuyPrice ? `₹${stock.BuyPrice}` : 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{stock.SellPrice ? `₹${stock.SellPrice}` : 'N/A'}</td>
                                    <td className={`py-2 px-4 border-b ${priceColor}`}>{priceToDisplay ? `₹${priceToDisplay}` : 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">{bid.bidQuantity}</td>
                                    <td className="py-2 px-4 border-b">{tradeType}</td>
                                    <td className="py-2 px-4 border-b">{capitalizeFirstLetter(bid.status)}</td>
                                  <td className="py-2 px-4 border-b">
  {new Date(bid.createdAt).toLocaleString('en-GB', {
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
  {new Date(bid.updatedAt).toLocaleString('en-GB', {
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
                            <td colSpan="12" className="text-center py-4">No bids available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Bids;
