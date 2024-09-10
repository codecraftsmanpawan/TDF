import React, { useEffect, useState } from 'react';
import Navbar from "./SuperAdminNav";
import { SearchIcon, FilterIcon, DocumentDownloadIcon, XIcon } from "@heroicons/react/outline";
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import xlsx library

const MasterAdminView = () => {
  const { masterCode } = useParams();
  const [masterAdminData, setMasterAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  // New states to store total profit/loss and brokerage
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [totalBrokerage, setTotalBrokerage] = useState(0);
  useEffect(() => {
    const token = localStorage.getItem('superAdminToken');
    const requestOptions = {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      redirect: "follow"
    };

    fetch(`http://localhost:5000/api/var/superAdmin/getMasterAdmin/${masterCode}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((result) => {
        setMasterAdminData(result.masterAdmin);
        setFilteredClients(result.masterAdmin.clients);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      });
  }, [masterCode]);

  const handleInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = masterAdminData.clients.filter(client =>
      client.client_code.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const openModal = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  // Calculate total profit/loss and brokerage whenever filteredClients changes
  useEffect(() => {
    const totalProfitLoss = filteredClients.reduce((acc, client) => acc + (client.currentProfitLoss || 0), 0);
    const totalBrokerage = filteredClients.reduce((acc, client) => acc + (client.currentBrokerage || 0), 0);
    setTotalProfitLoss(totalProfitLoss);
    setTotalBrokerage(totalBrokerage);
  }, [filteredClients]);

  const handleStatusUpdate = async (status) => {
    if (selectedClient) {
      const token = localStorage.getItem('superAdminToken');
      const data = JSON.stringify({ status });

      try {
        await axios.put(
          `http://localhost:5000/api/var/superAdmin/clients/${selectedClient._id}/status`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setFilteredClients(prevClients =>
          prevClients.map(client =>
            client._id === selectedClient._id
              ? { ...client, status }
              : client
          )
        );
        closeModal();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredClients.map(client => ({
      'Client Code': client.client_code,
      'Allotted Budget': client.budget,
      'Available Budget': client.availableBudget,
      'Share Brokerage': `${client.share_brokerage}%`,
      'MCX Brokerage Type': client.mcx_brokerage_type === 'per_crore' ? 'Per Crore' : 'Per Sauda',
      'MCX Brokerage': `${client.mcx_brokerage}%`,
      'Status': client.status === "inactive" ? "Blocked" : client.status.charAt(0).toUpperCase() + client.status.slice(1),
      'Created At': new Date(client.createdAt).toLocaleString()
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Client Information');
    
    XLSX.writeFile(wb, 'Client_Information_List.xlsx');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 flex items-center justify-center py-7 mt-12">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-screen-xll mt-0">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Master Admin Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Username</div>
              <div className="text-gray-700">{masterAdminData.username} <div
                className={`text-gray-700 px-2 py-1 rounded-full inline-block ${
                  masterAdminData.status === "active"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {masterAdminData.status.charAt(0).toUpperCase() +
                  masterAdminData.status.slice(1)}
              </div></div> 
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Master Code</div>
              <div className="text-gray-700">{masterAdminData.master_code}</div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Budget</div>
              <div className="text-gray-700">₹{masterAdminData.budget}</div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Available Budget</div>
              <div className="text-gray-700">
                ₹{masterAdminData.availableBudget}
              </div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Allotted Budget</div>
              <div className="text-gray-700">
                ₹{masterAdminData.allotedBudget}
              </div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Share Brokerage</div>
              <div className="text-gray-700">{masterAdminData.share_brokerage}%</div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">MCX Brokerage Type</div>
              <div className="text-gray-700 inline">
                {masterAdminData.mcx_brokerage_type === 'per_crore'
                  ? 'Per Crore'
                  : masterAdminData.mcx_brokerage_type === 'per_sauda'
                  ? 'Per Sauda'
                  : masterAdminData.mcx_brokerage_type}
              </div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">MCX Brokerage</div>
              <div className="text-gray-700">{masterAdminData.mcx_brokerage}%</div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Client Limit</div>
              <div className="text-gray-700">
                {masterAdminData.client_limit}
              </div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Total Clients</div>
              <div className="text-gray-700">
                {masterAdminData.clients.length}
              </div>
            </div>
           <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Total Profit/Loss</div>
              <div className="text-gray-700">₹{totalProfitLoss}</div>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="text-lg font-bold">Total Brokerage</div>
              <div className="text-gray-700">₹{totalBrokerage}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded shadow-md w-full max-w-screen-xll mt-0">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-gray-500">Client Information List</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by code..."
                className="border border-gray-400 rounded-md py-1 px-3 focus:outline-none focus:ring focus:border-blue-500"
                value={searchQuery}
                onChange={handleInputChange}
              />
              <SearchIcon className="h-5 w-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer" />
            </div>
            <FilterIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
            <span className="text-gray-500 cursor-pointer">Filter</span>
            <div
  className="flex items-center cursor-pointer"
  onClick={exportToExcel}
>
  <DocumentDownloadIcon className="h-6 w-6 text-gray-500" />
  <span className="text-gray-600 ml-2">Export</span>
</div>

          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                {/* Table Headers */}
                <th className="px-4 py-2 border border-gray-400">Sr No.</th>
                <th className="px-4 py-2 border border-gray-400">Code</th>
                <th className="px-4 py-2 border border-gray-400">Allotted Budget</th>
                <th className="px-4 py-2 border border-gray-400">Available Budget</th>
                <th className="px-4 py-2 border border-gray-400">Share Brokerage</th>
                <th className="px-4 py-2 border border-gray-400">MCX Brokerage Type</th>
                <th className="px-4 py-2 border border-gray-400">MCX Brokerage</th>
                <th className="px-4 py-2 border border-gray-400">Status</th>
                 <th className="px-4 py-2 border border-gray-400">Profit/loss</th>
                   <th className="px-4 py-2 border border-gray-400">Brokerage</th>
                <th className="px-4 py-2 border border-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={client.client_code} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border border-gray-400 text-center">{index + 1}</td>
                  <td className="px-4 py-2 border border-gray-400 text-center">{client.client_code}</td>
                  <td className="px-4 py-2 border border-gray-400 text-center">₹{client.budget}</td>
                  <td className="px-4 py-2 border border-gray-400 text-center">₹{client.availableBudget}</td>
                  <td className="px-4 py-2 border border-gray-400 text-center">{client.share_brokerage}%</td>
                  <td className="px-4 py-2 border border-gray-400 text-center">
                    {client.mcx_brokerage_type === 'per_crore'
                      ? 'Per Crore'
                      : client.mcx_brokerage_type === 'per_sauda'
                      ? 'Per Sauda'
                      : client.mcx_brokerage_type}
                  </td>
                  <td className="px-4 py-2 border border-gray-400 text-center">{client.mcx_brokerage}%</td>
                  <td className="px-4 py-2 border border-gray-400 text-center">
                    <button
                      className={`py-1 px-2 rounded-full ${
                        client.status === "inactive" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                      }`}
                      onClick={() => openModal(client)}
                    >
                      {client.status === "inactive" ? "Blocked" : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </button>
                  </td>
                   <td className="px-4 py-2 border border-gray-400 text-center">₹{client.currentProfitLoss}</td>
                    <td className="px-4 py-2 border border-gray-400 text-center">₹{client.currentbrokerage}</td>
                 <td className="px-4 py-2 border border-gray-400 text-center">
    <Link
                        to={`/Client/View/${encodeURIComponent(
                          client._id
                        )}`}
                        className="bg-blue-500 text-white py-1 px-2 rounded-full"
                      >
                        View
                      </Link>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {modalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">
        Are you sure you want to {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)} {selectedClient.client_code}?
      </h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Do you want to change the status of this Master ID?
        </h3>
      </div>
      <div className="flex space-x-4">
        {selectedClient.status === 'active' ? (
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={() => handleStatusUpdate('inactive')}
          >
            Block
          </button>
        ) : (
          <button
            className="bg-green-500 text-white py-2 px-4 rounded"
            onClick={() => handleStatusUpdate('active')}
          >
            Activate
          </button>
        )}
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded"
          onClick={closeModal}
        >
          <XIcon className="h-5 w-5 inline-block" /> Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </>
  );
};

export default MasterAdminView;
