import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock, FaDollarSign, FaCode, FaPercentage, FaTags, FaEye, FaEyeSlash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid'; // To generate unique username
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Navbar from './SuperAdminNav';

const AddMasterAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('active');
  const [masterCode, setMasterCode] = useState('');
  const [mcxBrokerageType, setMcxBrokerageType] = useState('');
  const [mcxBrokerage, setMcxBrokerage] = useState('');
  const [shareBrokerage, setShareBrokerage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const token = localStorage.getItem('superAdminToken');

    const data = {
      username,
      password,
      budget: parseFloat(budget),
      status,
      master_code: masterCode,
      mcx_brokerage_type: mcxBrokerageType,
      mcx_brokerage: mcxBrokerageType ? parseFloat(mcxBrokerage) : null,
      share_brokerage: parseFloat(shareBrokerage)
    };

    try {
      const response = await axios.post(
        'http://16.16.64.168:5000/api/var/superAdmin/add-masterAdmin',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Master Admin added successfully!');
      // Clear form fields here
      setUsername('');
      setPassword('');
      setBudget('');
      setMasterCode('');
      setMcxBrokerageType('');
      setMcxBrokerage('');
      setShareBrokerage('');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateCredentials = () => {
    // Auto-generate username and password
    setUsername(`Master_${uuidv4().slice(0, 8)}`);
    setPassword(Math.random().toString(36).slice(-8));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 mt-8">
        <div className="p-6 max-w-4xl w-full bg-white shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Add Master Admin</h1>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-4">
              <div className="col-span-6 sm:col-span-3">
                <label className="flex items-center space-x-2 font-semibold mb-1">
                  <FaUser className="text-gray-600" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <button
                  type="button"
                  onClick={generateCredentials}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Auto Generate
                </button>
              </div>

              <div className="col-span-6 sm:col-span-3 relative mb-3">
                <label className="flex items-center space-x-2 font-semibold mb-1">
                  <FaLock className="text-gray-600" />
                  <span>Password</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="flex items-center space-x-2 font-semibold mb-1">
                  <FaDollarSign className="text-gray-600" />
                  <span>Budget</span>
                </label>
                <input
                  type="number"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="flex items-center space-x-2 font-semibold mb-1">
                  <FaCode className="text-gray-600" />
                  <span>Master Code</span>
                </label>
                <input
                  type="text"
                  placeholder="Master Code"
                  value={masterCode}
                  onChange={(e) => setMasterCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="col-span-6 mt-3">
                <label className="flex items-center space-x-2 font-semibold mb-4">
                  <FaPercentage className="text-gray-600" />
                  <span>MCX Brokerage Type</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="per_crore"
                      checked={mcxBrokerageType === 'per_crore'}
                      onChange={(e) => setMcxBrokerageType(e.target.value)}
                      className="form-radio"
                    />
                    <span>Per Crore</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="per_sauda"
                      checked={mcxBrokerageType === 'per_sauda'}
                      onChange={(e) => setMcxBrokerageType(e.target.value)}
                      className="form-radio"
                    />
                    <span>Per Sauda</span>
                  </label>
                </div>
              </div>

              {mcxBrokerageType && (
                <div className="col-span-6 sm:col-span-3 mt-3">
                  <label className="flex items-center space-x-2 font-semibold mb-1">
                    <FaTags className="text-gray-600" />
                    <span>MCX Brokerage</span>
                  </label>
                  <input
                    type="number"
                    placeholder="MCX Brokerage"
                    value={mcxBrokerage}
                    onChange={(e) => setMcxBrokerage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              )}

              <div className="col-span-6 sm:col-span-3 mt-3">
                <label className="flex items-center space-x-2 font-semibold mb-1">
                  <FaTags className="text-gray-600" />
                  <span>Share Brokerage (Per Crore)</span>
                </label>
                <input
                  type="number"
                  placeholder="Share Brokerage"
                  value={shareBrokerage}
                  onChange={(e) => setShareBrokerage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <button
                type="submit"
                className="col-span-6 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>

          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
      </div>
    </>
  );
};

export default AddMasterAdmin;
