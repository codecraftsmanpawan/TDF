import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TopNavbar from './TopNavbar';
import BottomBar from './BottomNav';
import Sidebar from './SideBar';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom'; 

const PasswordChange = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const navigate = useNavigate(); 

  const toggleView = () => {
    setIsToggled(!isToggled);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateStrongPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleLogout = () => {
    localStorage.removeItem('StocksUsertoken');
    navigate('/client/login');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('StocksUsertoken');
      if (!token) {
        toast.error('No token found');
        return;
      }

      const response = await axios.put('http://16.16.64.168:5000/api/var/client/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Password updated successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        handleLogout(); 
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error('Please check your old password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <div className="flex-1">
        <TopNavbar toggleSidebar={toggleView} />
        <Sidebar isOpen={isToggled} closeSidebar={toggleView} />

        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="oldPassword" className="block text-gray-700">Old Password</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="form-group relative">
              <label htmlFor="newPassword" className="block text-gray-700">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="form-group relative">
              <label htmlFor="confirmPassword" className="block text-gray-700">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="button"
              onClick={generateStrongPassword}
              className="w-full py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Generate Strong Password
            </button>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
            >
              {loading ? 'Checking Old Password' : 'Change Password'}
            </button>
          </form>
          <ToastContainer />
        </div>
        <BottomBar />
      </div>
    </div>
  );
};

export default PasswordChange;
