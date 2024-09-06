import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faWallet } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 

const TopNavbar = ({ toggleSidebar }) => {
    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBudget = async () => {
        try {
            // Retrieve the token from local storage
            const token = localStorage.getItem('StocksUsertoken');
            if (!token) throw new Error('No token found');

            // Decode the token to get the user ID
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id; 

            // Fetch the budget using the user ID
            const response = await axios.get(`http://localhost:5000/api/var/client/clients/${userId}/availableBudget`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setBudget(response.data.totalProfitLossAmount);
        } catch (err) {
            setError('Failed to fetch budget');
            // console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudget(); 
        
        const intervalId = setInterval(() => {
            fetchBudget(); 
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return (
        <div className="bg-blue-500 w-full py-4 px-6 flex justify-between items-center border-b-2 border-blue-700">
            <button onClick={toggleSidebar} className="text-white hover:text-blue-100">
                <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
            <div className="flex items-center text-lg font-semibold text-white">
                <FontAwesomeIcon icon={faWallet} className="text-white mr-2" />
                {loading ? (
                    <span>Loading...</span>
                ) : error ? (
                    <span className="text-red-500">{error}</span>
                ) : (
                    <span>₹{budget}</span>
                )}
            </div>
        </div>
    );
};

export default TopNavbar;
