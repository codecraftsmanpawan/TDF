import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './MasterAdminNav';

const UpdatePage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState('add');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem('masterAdminToken');

        const response = await axios.get(`http://16.16.64.168:5000/api/var/masterAdmin/getClient/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setClient(response.data.client);
      } catch (error) {
        setError('An error occurred while fetching client data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  const handleBrokerageTypeChange = (e) => {
    setClient(prevClient => ({
      ...prevClient,
      mcx_brokerage_type: e.target.value
    }));
  };

  const handleAdjustmentTypeChange = (e) => {
    setAdjustmentType(e.target.value);
  };

  const updateClientInfo = async () => {
    if (!client) return; // Ensure client is not null

    try {
      const token = localStorage.getItem('masterAdminToken');

      const response = await axios.put(`http://16.16.64.168:5000/api/var/masterAdmin/update-client/${id}`, {
        mcx_brokerage_type: client.mcx_brokerage_type,
        mcx_brokerage: client.mcx_brokerage,
        share_brokerage: client.share_brokerage
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Client information updated successfully!');
      } else {
        toast.error(response.data.message || 'An error occurred while updating client information.');
      }
    } catch (error) {
      console.error('Error updating client information:', error);
      toast.error('An error occurred while updating client information.');
    }
  };

  const updateavailableBudgetInfo = async () => {
    if (!client) return; // Ensure client is not null

    try {
      const token = localStorage.getItem('masterAdminToken');
      const adjustment = parseFloat(adjustmentAmount);

      let updatedavailableBudget;
      if (adjustmentType === 'add') {
        updatedavailableBudget = parseFloat(client.availableBudget) + adjustment;
      } else if (adjustmentType === 'subtract') {
        updatedavailableBudget = parseFloat(client.availableBudget) - adjustment;
        if (updatedavailableBudget < 0) {
          toast.error('availableBudget values cannot be negative.');
          return;
        }
      }

      const response = await axios.put(`http://16.16.64.168:5000/api/var/masterAdmin/update-client/${id}`, {
        availableBudget: updatedavailableBudget
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('availableBudget information updated successfully!');
        setClient(prevClient => ({
          ...prevClient,
          availableBudget: updatedavailableBudget
        }));
      } else {
        toast.error(response.data.message || 'An error occurred while updating availableBudget information.');
      }
    } catch (error) {
      console.error('Error updating availableBudget information:', error);
      toast.error('An error occurred while updating availableBudget information.');
    }
  };

  // Use default values if client is null
  const currentavailableBudget = client ? parseFloat(client.availableBudget) : 0;
  const calculatedavailableBudget = adjustmentType === 'add'
    ? currentavailableBudget + parseFloat(adjustmentAmount)
    : adjustmentType === 'subtract'
    ? currentavailableBudget - parseFloat(adjustmentAmount)
    : currentavailableBudget;

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100 mt-16">
        <h2 className="mb-4 mt-4 font-bold text-2xl">Client Information Update</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {/* Card 1 */}
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full sm:w-96">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Client Code:</label>
              <p className="border border-gray-300 p-2 rounded">{client?.client_code}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">MCX Brokerage Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mcx_brokerage_type"
                    value="per_crore"
                    checked={client?.mcx_brokerage_type === 'per_crore'}
                    onChange={handleBrokerageTypeChange}
                    className="mr-2"
                  />
                  Per Crore
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mcx_brokerage_type"
                    value="per_sauda"
                    checked={client?.mcx_brokerage_type === 'per_sauda'}
                    onChange={handleBrokerageTypeChange}
                    className="mr-2"
                  />
                  Per Sauda
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">MCX Brokerage:</label>
              <input
                type="number"
                value={client?.mcx_brokerage || ''}
                onChange={(e) => setClient(prevClient => ({
                  ...prevClient,
                  mcx_brokerage: e.target.value
                }))}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Share Brokerage:</label>
              <input
                type="number"
                value={client?.share_brokerage || ''}
                onChange={(e) => setClient(prevClient => ({
                  ...prevClient,
                  share_brokerage: e.target.value
                }))}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
            <button
              onClick={updateClientInfo}
              className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
            >
              Update Client Info
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full sm:w-96">
            <h2 className="text-xl font-semibold mb-4">Budget Information</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Update Budget:</label>
              <input
                type="number"
                value={currentavailableBudget}
                readOnly
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="adjustment_type"
                    value="add"
                    checked={adjustmentType === 'add'}
                    onChange={handleAdjustmentTypeChange}
                    className="mr-2"
                  />
                  Add Budget
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="adjustment_type"
                    value="subtract"
                    checked={adjustmentType === 'subtract'}
                    onChange={handleAdjustmentTypeChange}
                    className="mr-2"
                  />
                  Remove Budget
                </label>
              </div>
              <input
                type="number"
                placeholder="Enter Amount"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <p className={`text-lg font-semibold ${calculatedavailableBudget < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                Calculated Budget: ₹{calculatedavailableBudget.toFixed(2)}
              </p>
            </div>
            <button
              onClick={updateavailableBudgetInfo}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Update Budget
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default UpdatePage;
