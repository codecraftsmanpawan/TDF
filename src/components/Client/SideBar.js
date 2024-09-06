import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLock, faSignOutAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

const SideBar = ({ isOpen, closeSidebar }) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        // Clear authentication state (example: remove token from localStorage)
        localStorage.removeItem('token');
        // Redirect to the login page
        navigate('/client/login');
    };
    
    return (
        <div className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="absolute top-0 left-0 w-64 bg-white h-full shadow-lg transform transition-transform ease-in-out duration-300">
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">TradingApp</h2>
                    <button onClick={closeSidebar} className="text-gray-600 hover:text-gray-800">
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>
                <ul className="py-4 px-6 mt-5">
                    <li className="mb-6">
                        <Link href="#" className="flex items-center text-gray-700 hover:text-blue-500">
                            <FontAwesomeIcon icon={faHistory} className="mr-2" />
                            Transaction History
                        </Link>
                    </li>
                    <li className="mb-6">
                        <Link href="#" className="flex items-center text-gray-700 hover:text-blue-500">
                            <FontAwesomeIcon icon={faLock} className="mr-2" />
                            Password Change
                        </Link>
                    </li>
                    <li className="mt-auto mb-6"> {/* This will push the "Password Change" option to the bottom */}
                        <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-blue-500">
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SideBar;
