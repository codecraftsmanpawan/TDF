import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from './MasterAdminNav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddClientForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    budget: '',
    status: 'active',
    clientCode: '',
    mcxBrokerageType: '',
    mcxBrokerage: '',
    shareBrokerage: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateCredentials = () => {
    const randomUsername = `user${Math.floor(Math.random() * 10000)}`;
    const randomPassword = Math.random().toString(36).slice(-8);

    setFormData({
      ...formData,
      username: randomUsername,
      password: randomPassword
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('masterAdminToken');
    if (!token) {
        toast.error('Authentication token is missing. Please log in again.');
        return;
    }

    const config = {
        method: 'post',
        url: 'http://localhost:5000/api/var/masterAdmin/add-client',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: JSON.stringify(formData),
        maxBodyLength: Infinity
    };

    try {
        const response = await axios.request(config);
        console.log('Response Config:', response.config);  // Log the entire response config

        if (response.data.success) {
            toast.success('Client added successfully!');
            setFormData({
                username: '',
                password: '',
                budget: '',
                status: 'active',
                clientCode: '',
                mcxBrokerageType: '',
                mcxBrokerage: '',
                shareBrokerage: ''
            });
        } else {
            // Handle specific error messages
            const errorMessage = response.data.message;
            if (errorMessage === "Client code already exists") {
                toast.error('Client code already exists.');
            } else if (errorMessage === "Insufficient budget") {
                toast.error('Insufficient budget.');
            } else {
                toast.error(errorMessage || 'Error adding client. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        if (error.response) {
            // Handle server errors
            toast.error(error.response.data.message || 'Error adding client. Please try again.');
        } else if (error.request) {
            // Handle network errors
            toast.error('Network error. Please check your connection and try again.');
        } else {
            // Handle other errors
            toast.error('An unexpected error occurred. Please try again.');
        }
    }
};


  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 mt-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Add Client</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form fields go here */}
            <div className="mb-4 relative">
              <label className="block text-gray-700 font-medium mb-2">Username</label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                  required
                />
                <button
                  type="button"
                  onClick={generateCredentials}
                  className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="mb-4 relative">
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <div className="flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Client Code</label>
              <input
                type="text"
                name="clientCode"
                value={formData.clientCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter client code"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Budget</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter budget"
                required
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 font-medium mb-2">MCX Brokerage Type</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mcxBrokerageType"
                    value="per_crore"
                    checked={formData.mcxBrokerageType === 'per_crore'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Per Crore
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mcxBrokerageType"
                    value="per_sauda"
                    checked={formData.mcxBrokerageType === 'per_sauda'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Per Sauda
                </label>
              </div>
            </div>
<br/>
            {formData.mcxBrokerageType && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">MCX Brokerage</label>
                <input
                  type="number"
                  name="mcxBrokerage"
                  value={formData.mcxBrokerage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter MCX brokerage"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Share Brokerage (Per Crore)</label>
              <input
                type="number"
                name="shareBrokerage"
                value={formData.shareBrokerage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter share brokerage"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 mt-4"
          >
            Add Client
          </button>
        </form>
        <ToastContainer />
      </div>
    </>
  );
};

export default AddClientForm;
