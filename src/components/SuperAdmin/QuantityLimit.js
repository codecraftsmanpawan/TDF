import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './SuperAdminNav'

const StockForm = () => {
  const { instrumentIdentifier, stockName } = useParams();
  const [limit, setLimit] = useState('');
  const [lotSize, setLotSize] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('superAdminToken');

    const data = JSON.stringify({
      symbol: instrumentIdentifier,
      limit: Number(limit),
      lotSize: Number(lotSize),
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://16.16.64.168:5000/api/var/superAdmin/items',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      toast.success('Data submitted successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log(JSON.stringify(response.data));
      
      // Navigate to the next page after success
      navigate('/Mange/Quantity/Limit');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error === 'Item with this symbol already exists') {
        toast.error('Item with this symbol already exists!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error('Error submitting data!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Navbar/>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Set Quantity Limit</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="symbol">
            Symbol
          </label>
          <input
            id="symbol"
            type="text"
            value={stockName}
            onChange={() => {}}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="AAPL"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="limit">
            Limit
          </label>
          <input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="100"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lotSize">
            Lot Size
          </label>
          <input
            id="lotSize"
            type="number"
            value={lotSize}
            onChange={(e) => setLotSize(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="10"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default StockForm;
