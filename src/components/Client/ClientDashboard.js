import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import Sidebar from './SideBar';
import Spinner from './Spinner';  

// Helper function to format the date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; 
};

// StockCard component for individual stock items
const StockCard = ({ name, expiry, buy, sell, high, low, instrumentIdentifier }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/StocksDetails/${instrumentIdentifier}`);
    };

    return (
        <div
            className="grid grid-cols-3 gap-4 py-2 border-b cursor-pointer hover:bg-gray-100"
            onClick={handleClick}
        >
            <div className="col-span-1">
                <h3 className="font-medium text-gray-800">{name}</h3>
                <p className="text-yellow-500 text-sm">Exp {expiry}</p>
            </div>
            <div className="col-span-1 text-center">
                <p className="text-green-500">{buy}</p>
                <p className="text-gray-500 text-sm">H {high}</p>
            </div>
            <div className="col-span-1 text-right">
                <p className="text-red-500">{sell}</p>
                <p className="text-gray-500 text-sm">L {low}</p>
            </div>
        </div>
    );
};

const ClientDashboard = () => {
    const [isToggled, setIsToggled] = useState(false);
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExchange, setSelectedExchange] = useState('All');

    const toggleView = () => {
        setIsToggled(!isToggled);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleExchangeChange = (event) => {
        setSelectedExchange(event.target.value);
    };

    const fetchData = async () => {
        const token = localStorage.getItem('StocksUsertoken');

        if (!token) {
            setError(new Error('Token is missing'));
            setLoading(false);
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            if (!userId) {
                setError(new Error('User ID is missing in the token'));
                setLoading(false);
                return;
            }

            const wishlistResponse = await axios.get(`http://16.16.64.168:5000/api/var/client/wishlist/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!wishlistResponse.data.items || wishlistResponse.data.items.length === 0) {
                setData(null); // Empty wishlist
                setLoading(false);
                return;
            }

            const stockPromises = wishlistResponse.data.items.map(item =>
                axios.get(`http://16.16.64.168:5000/api/var/client/stocks/${item.instrumentIdentifier}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            );

            const stockResponses = await Promise.allSettled(stockPromises);

            const combinedData = wishlistResponse.data.items.map((item, index) => {
                if (stockResponses[index].status === 'fulfilled') {
                    return { ...item, ...stockResponses[index].value.data };
                } else {
                    // console.error(`Failed to fetch stock data for ${item.instrumentIdentifier}:`, stockResponses[index].reason);
                    return null; 
                }
            }).filter(item => item !== null); 

            setData({ items: combinedData });
            setLoading(false);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setData(null);
            } else {
                setError(error);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const filteredData = data?.items?.filter(item => {
        const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesExchange = selectedExchange === 'All' || item.Exchange === selectedExchange;

        return matchesSearchTerm && matchesExchange;
    });

    if (loading) return <Spinner />;  // Show spinner while loading
    // if (error) return <p className="text-center text-red-500">{error.message}</p>;

    return (
        <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
            <TopNavbar toggleSidebar={toggleView} />
            <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
            <main className="flex-grow bg-gray-50">
                <div className="w-full max-w-md mx-auto bg-white text-gray-800 rounded-4xl shadow-lg">
                    <div className="w-full bg-gradient-to-br from-blue-500 to-blue-700 pt-8 pb-6 px-4 text-white">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full text-white bg-white bg-opacity-20 rounded-full border-2 border-transparent focus:border-white focus:border-opacity-50 focus:outline-none px-3 py-1 text-sm placeholder-white placeholder-opacity-50"
                            placeholder="Search..."
                        />
                    </div>
                    <div className="flex justify-center my-4 space-x-10">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="All"
                                checked={selectedExchange === 'All'}
                                onChange={handleExchangeChange}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">ALL</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="MCX"
                                checked={selectedExchange === 'MCX'}
                                onChange={handleExchangeChange}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">MCX</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="NSE"
                                checked={selectedExchange === 'NSE'}
                                onChange={handleExchangeChange}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">NSE</span>
                        </label>
                    </div>

                    <div className="px-6 py-5">
                        <div className="grid grid-cols-3 gap-8 text-center text-sm font-semibold text-gray-500 border-b pb-4 sticky top-0 bg-white z-10">
                            <div className="text-left font-bold">SCRIPTS</div>
                            <div className="font-bold">BUY</div>
                            <div className="font-bold ml-10">SELL</div>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {data === null ? (
                                <p className="text-center text-gray-500">Empty wishlist</p>
                            ) : filteredData && filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <StockCard
                                        key={index}
                                        name={item.name}
                                        expiry={formatDate(item.expiry)}
                                        buy={item.BuyPrice}
                                        sell={item.SellPrice}
                                        high={item.High}
                                        low={item.Low}
                                        instrumentIdentifier={item.instrumentIdentifier} // Pass the instrumentIdentifier
                                    />
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No stocks found in your wishlist.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default ClientDashboard;
