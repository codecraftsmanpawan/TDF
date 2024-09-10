import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Navbar from './MasterAdminNav'

const MasterAdminDetails = () => {
  const [masterAdmin, setMasterAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve token from local storage
        const token = localStorage.getItem('masterAdminToken');
        if (!token) throw new Error('No token found');

        // Decode the token to get the masterAdmin ID
        const decodedToken = jwtDecode(token);
        const masterAdminId = decodedToken.id; // Adjust according to your token structure

        // Fetch data using the masterAdmin ID
        const response = await axios.get(`http://localhost:5000/api/var/masterAdmin/masteradmin/${masterAdminId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setMasterAdmin(response.data.masterAdmin);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-4 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  // Determine the brokerage type label
  const brokerageTypeLabel = masterAdmin.mcx_brokerage_type === 'per_crore'
    ? 'Per Crore'
    : masterAdmin.mcx_brokerage_type === 'per_sauda'
    ? 'Per Sauda'
    : 'Unknown';

  return (
<>
<Navbar/>
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-20">
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold">
          {masterAdmin.username.charAt(0)}
        </div>
        <div className="ml-4">
          <h1 className="text-3xl font-semibold">{masterAdmin.username}</h1>
          <p className="text-gray-500">Master Admin ID: {masterAdmin.master_admin_id}</p>
        </div>
      </div>
      <div className="mb-6 border-t border-gray-200 pt-4">
        <h2 className="text-2xl font-semibold mb-2">General Information</h2>
        {masterAdmin.status === 'active' && (
          <button className="bg-green-400 text-white px-4 py-2 rounded-md shadow-md ">
            Active Status
          </button>
        )}
        <p className="text-gray-700 mt-4"><strong>Master Code:</strong> {masterAdmin.master_code}</p>
        <p className="text-gray-700 mt-2"><strong>MCX Brokerage Type:</strong> {brokerageTypeLabel}</p>
        <p className="text-gray-700 mt-2"><strong>MCX Brokerage:</strong> {masterAdmin.mcx_brokerage}%</p>
        <p className="text-gray-700 mt-2"><strong>Share Brokerage:</strong> {masterAdmin.share_brokerage}%</p>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <h2 className="text-2xl font-semibold mb-2">Budget Information</h2>
        <p className="text-gray-700"><strong>Budget:</strong> ₹{masterAdmin.budget}</p>
        <p className="text-gray-700"><strong>Available Budget:</strong> ₹{masterAdmin.availableBudget}</p>
        <p className="text-gray-700"><strong>Allotted Budget:</strong> ₹{masterAdmin.allotedBudget}</p>
      </div>
    </div>
</>
  );
};

export default MasterAdminDetails;
