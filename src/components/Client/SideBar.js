import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLock, faSignOutAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const SideBar = ({ isOpen, closeSidebar }) => {
    const navigate = useNavigate();

    // Function to handle navigation and close the sidebar
    const handleNavigation = (path) => {
        navigate(path);
        closeSidebar(); // Close the sidebar after navigating
    };

    const handleLogout = () => {
        localStorage.removeItem('StocksUsertoken');
        navigate('/client/login');
    };

    return (
        <div className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="absolute top-0 left-0 w-64 bg-white h-full shadow-lg transform transition-transform ease-in-out duration-300">
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                   <h1 className="text-2xl font-bold tracking-wide mb-1">
                   <span className="text-red-400">Minus</span><span className="text-green-400">Plus</span>
                   </h1>
                    <button onClick={closeSidebar} className="text-gray-600 hover:text-gray-800">
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>
                <ul className="py-4 px-6 mt-5">
                       <li className="mb-6">
                        <button 
                            onClick={() => handleNavigation('/wishlist-setoff')} 
                            className="flex items-center text-gray-700 hover:text-blue-500 w-full text-left"
                        >
                            <FontAwesomeIcon icon={faHistory} className="mr-2" />
                          Wishlist Setoff
                        </button>
                    </li>
                    <li className="mb-6">
                        <button 
                            onClick={() => handleNavigation('/history')} 
                            className="flex items-center text-gray-700 hover:text-blue-500 w-full text-left"
                        >
                            <FontAwesomeIcon icon={faHistory} className="mr-2" />
                            History & Brokerage
                        </button>
                    </li>
                    <li className="mb-6">
                        <button 
                            onClick={() => handleNavigation('/client/Password/Change')} 
                            className="flex items-center text-gray-700 hover:text-blue-500 w-full text-left"
                        >
                            <FontAwesomeIcon icon={faLock} className="mr-2" />
                            Password Change
                        </button>
                    </li>
                    <li className="mt-auto mb-6"> 
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
