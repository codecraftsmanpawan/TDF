import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import Sidebar from './SideBar';
import Spinner from './Spinner';

// Helper function to format the date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// StockCard Component
const StockCard = ({ serial, name, expiry, buy, sell, high, low, instrumentIdentifier }) => {
    const navigate = useNavigate();
    const [prevBuy, setPrevBuy] = useState(buy);
    const [prevSell, setPrevSell] = useState(sell);
    const [buyBlinkClass, setBuyBlinkClass] = useState('');
    const [sellBlinkClass, setSellBlinkClass] = useState('');

    const handleClick = () => {
        navigate(`/StocksDetails/${instrumentIdentifier}`);
    };

    useEffect(() => {
        // Check if buy price changed
        if (buy > prevBuy) {
            setBuyBlinkClass('blink-green');
        } else if (buy < prevBuy) {
            setBuyBlinkClass('blink-red');
        }

        // Check if sell price changed
        if (sell > prevSell) {
            setSellBlinkClass('blink-green');
        } else if (sell < prevSell) {
            setSellBlinkClass('blink-red');
        }

        const timeoutId = setTimeout(() => {
            setBuyBlinkClass('');
            setSellBlinkClass('');
        }, 1000);

        // Update previous prices
        setPrevBuy(buy);
        setPrevSell(sell);

        return () => clearTimeout(timeoutId);
    }, [buy, sell, prevBuy, prevSell]);

    const buyTextColor = buyBlinkClass ? 'text-white' : 'text-green-500';
    const sellTextColor = sellBlinkClass ? 'text-white' : 'text-red-500';

    return (
        <div
            className="grid grid-cols-3 gap-4 py-2 border-b cursor-pointer hover:bg-gray-100"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter') handleClick(); }}
        >
            <div className="col-span-1">
                <h3 className="font-medium text-gray-800">{name}</h3>
                <p className="text-yellow-500 text-sm">Exp {expiry}</p>
            </div>
            <div className="col-span-1 text-center">
                <p className={`${buyTextColor} ${buyBlinkClass}`}>{buy}</p>
                <p className="text-gray-500 text-sm">H {high}</p>
            </div>
            <div className="col-span-1 text-right">
                <p className={`${sellTextColor} ${sellBlinkClass}`}>{sell}</p>
                <p className="text-gray-500 text-sm">L {low}</p>
            </div>
        </div>
    );
};

// ClientDashboard Component
const ClientDashboard = () => {
    const [isToggled, setIsToggled] = useState(false);
    const [wishlistStocks, setWishlistStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExchange, setSelectedExchange] = useState('All');
     const navigate = useNavigate();
    // New state variables for filter popup
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState('serial'); 

    // Reference to the popup for accessibility
    const popupRef = useRef(null);

    const toggleView = () => {
        setIsToggled(!isToggled);
    };

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleExchangeChange = (event) => {
        setSelectedExchange(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleCloseFilter = (e) => {
        if (e.target.id === 'filter-overlay') {
            setIsFilterOpen(false);
        }
    };

    // Handle Esc key to close the filter popup and prevent background scrolling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsFilterOpen(false);
            }
        };

        if (isFilterOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent background scrolling when modal is open
            document.body.style.overflow = 'hidden';
            // Optional: Focus on the modal for accessibility
            if (popupRef.current) {
                popupRef.current.focus();
            }
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isFilterOpen]);

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
                setWishlistStocks([]); // Empty wishlist
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
                    // console.error(`Failed to fetch stock data for instrumentIdentifier: ${item.instrumentIdentifier}`);
                    return null;
                }
            }).filter(item => item !== null);

            setWishlistStocks(combinedData);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 1000); 

        return () => clearInterval(intervalId);
    }, []);

    // Sorting and Filtering with useMemo for performance optimization
    const sortedData = useMemo(() => {
        return [...wishlistStocks].sort((a, b) => {
            if (sortOption === 'a-z') {
                return a.name.localeCompare(b.name);
            } else if (sortOption === 'date') {
                return new Date(a.expiry) - new Date(b.expiry);
            } else if (sortOption === 'serial') {
                // Ensure serial is treated as a number
                const serialA = Number(a.serial);
                const serialB = Number(b.serial);
                return serialA - serialB; 
            } else {
                return 0; 
            }
        });
    }, [wishlistStocks, sortOption]);

    const filteredData = useMemo(() => {
        return sortedData.filter(item => {
            const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesExchange = selectedExchange === 'All' || item.exchange === selectedExchange;
            return matchesSearchTerm && matchesExchange;
        });
    }, [sortedData, searchTerm, selectedExchange]);

    if (loading) return <Spinner />; 
    // if (error) return <div className="text-red-500 text-center mt-4">{error.message}</div>; 

    return (
        <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
            <TopNavbar toggleSidebar={toggleView} />
            <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
            
            {/* Filter Popup */}
            {isFilterOpen && (
                <div
                    id="filter-overlay"
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50 mt-16"
                    onClick={handleCloseFilter}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="filter-popup-title"
                >
                    <div
                        className="bg-white w-64 h-1/2 p-6 shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto"
                        ref={popupRef}
                        tabIndex="-1"
                    >
                        <h2 id="filter-popup-title" className="text-lg font-semibold mb-4">Sort Options</h2>
                        <div className="flex flex-col space-y-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="serial"
                                    checked={sortOption === 'serial'}
                                    onChange={handleSortChange}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                              <span className="ml-2">Default</span>
<span
  className="ml-2 cursor-pointer text-blue-500 hover:underline"
  onClick={() => navigate('/wishlist-setoff')}
>
  Set
</span>

                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="a-z"
                                    checked={sortOption === 'a-z'}
                                    onChange={handleSortChange}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">Sort by A to Z</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="date"
                                    checked={sortOption === 'date'}
                                    onChange={handleSortChange}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">Summary</span>
                            </label>
                        </div>
                        <button
                            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            onClick={() => setIsFilterOpen(false)}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
            
            <main className="flex-grow bg-gray-50">
                <div className="w-full max-w-md mx-auto bg-white text-gray-800 rounded-4xl shadow-lg ">
                    {/* Search Bar */}
                    <div className="w-full bg-gradient-to-br from-blue-500 to-blue-700 pt-8 pb-6 px-4 text-white">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-white bg-opacity-20 rounded-full border-2 border-transparent focus:border-white focus:border-opacity-50 focus:outline-none px-3 py-2 text-sm placeholder-white placeholder-opacity-50"
                            placeholder="Search..."
                            aria-label="Search stocks"
                        />
                    </div>

                    {/* Exchange Filters and Filter Button */}
                    <div className="flex justify-center my-4 space-x-10 px-4">
                        {['All', 'MCX', 'NSE'].map(exchange => (
                            <label className="inline-flex items-center" key={exchange}>
                                <input
                                    type="radio"
                                    value={exchange}
                                    checked={selectedExchange === exchange}
                                    onChange={handleExchangeChange}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-gray-700">{exchange}</span>
                            </label>
                        ))}
                        <div 
                            className="flex items-center cursor-pointer"
                            onClick={toggleFilter}
                            aria-label="Open filter options"
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => { if (e.key === 'Enter') toggleFilter(); }}
                        >
                            <FontAwesomeIcon icon={faFilter} className="text-blue-600 mr-2" />
                            <span className="text-blue-600">Filter</span>
                        </div>
                    </div>

                    {/* Stock List */}
                    <div className="px-6 py-5">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-8 text-center text-sm font-semibold text-gray-500 border-b pb-4 sticky top-0 bg-white z-10">
                            <div className="text-left font-bold">SCRIPTS</div>
                            <div className="font-bold">BUY</div>
                            <div className="font-bold ml-10">SELL</div>
                        </div>

                        {/* Stock Cards */}
                        <div className="max-h-80 overflow-y-auto">
                            {wishlistStocks.length === 0 ? (
                                <p className="text-center text-gray-500">Your wishlist is empty.</p>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <StockCard
                                        key={item.instrumentIdentifier} 
                                        serial={item.serial} 
                                        name={item.name}
                                        expiry={formatDate(item.expiry)}
                                        buy={item.BuyPrice}
                                        sell={item.SellPrice}
                                        high={item.High}
                                        low={item.Low}
                                        instrumentIdentifier={item.instrumentIdentifier}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No stocks found matching your criteria.</p>
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
