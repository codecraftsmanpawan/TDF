import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  CheckCircleIcon,
  UserIcon,
  BanIcon,
  SearchIcon,
  FilterIcon,
  DocumentDownloadIcon,
  XIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/outline";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import Navbar from "./MasterAdminNav";
import axios from "axios";

const MasterAdminDashboard = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [masterAdmin, setMasterAdmin] = useState(null);
  const [clientsData, setClientsData] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradeData, setTradeData] = useState({
    totalBrokerage: 0,
    brokeragePerNSECrore: 0,
    brokeragePerMCX: 0,
    nseTrades: [],
    mcxTrades: [],
  });

  const totalBudget = clientsData
    .reduce((acc, client) => acc + client.budget, 0)
    .toFixed(2);

  const totalAvailableBudget = clientsData
    .reduce((acc, client) => acc + client.availableBudget, 0)
    .toFixed(2);

  const totalProfitLoss = clientsData
    .reduce((acc, client) => acc + client.currentProfitLoss, 0)
    .toFixed(2);

  const totalBrokerage = clientsData
    .reduce((acc, client) => acc + client.currentbrokerage, 0)
    .toFixed(2);

  const totalBrokeragePerMCX = clientsData
    .reduce((acc, client) => acc + client.finalMasterBrokerage, 0)
    .toFixed(2);
  const totalBrokeragePerNSE = clientsData
    .reduce((acc, client) => acc + client.brokeragePerNSECrore, 0)
    .toFixed(2);
  const totalBrokerageDifference = (
    parseFloat(totalBrokerage) - parseFloat(totalBrokeragePerMCX)
  ).toFixed(2);
  useEffect(() => {
    const fetchMasterAdminData = async () => {
      try {
        const token = localStorage.getItem("masterAdminToken");
        if (!token) throw new Error("No token found");

        const decodedToken = jwtDecode(token);
        const masterAdminId = decodedToken.id;

        const response = await axios.get(
          `http://13.51.178.27:5000/api/var/masterAdmin/masteradmin/${masterAdminId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMasterAdmin(response.data.masterAdmin);
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchMasterAdminData();
  }, []);

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        const token = localStorage.getItem("masterAdminToken");
        if (!token) {
          toast.error("Authentication token not found");
          return;
        }

        const decodedToken = jwtDecode(token);
        const masterAdminId = decodedToken.id;

        const response = await fetch(
          `http://13.51.178.27:5000/api/var/masterAdmin/clients/${masterAdminId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (response.ok && data.success) {
          setClientsData(data.clients);
          setFilteredClients(data.clients);
        } else {
          // toast.error(data.message || "Failed to fetch clients data");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error fetching data");
      }
    };

    // Fetch initial client data
    fetchClientsData();

    // Set interval to refresh clients data every 5 seconds (5000 ms)
    const interval = setInterval(() => {
      fetchClientsData();
    }, 5000);

    // Cleanup the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs only once when component mounts

  const handleInputChange = (event) => {
    const { value } = event.target;
    setSearchQuery(value);

    const filtered = clientsData.filter((client) =>
      client.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  useEffect(() => {
    if (location.state?.fromLogin) {
      toast.success("Login successful!");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleStatusButtonClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteButtonClick = (client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedClient(null);
  };

  const updateClientStatus = async (status) => {
    const token = localStorage.getItem("masterAdminToken");
    if (!token) {
      console.error("Master admin token not found in local storage");
      return;
    }

    try {
      const response = await fetch(
        `http://13.51.178.27:5000/api/var/masterAdmin/update-client/${selectedClient._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const updatedClientsData = clientsData.map((client) =>
        client._id === selectedClient._id ? { ...client, status } : client
      );
      setClientsData(updatedClientsData);
      setFilteredClients(updatedClientsData);

      toast.success(`Status updated successfully to ${status}`);
      closeModal();
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to update client status");
    }
  };

  const deleteClient = async () => {
    const token = localStorage.getItem("masterAdminToken");

    if (!token) {
      console.error("Master admin token not found in local storage");
      return;
    }

    try {
      const response = await fetch(
        `http://13.51.178.27:5000/api/var/masterAdmin/delete-client/${selectedClient._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const updatedClientsData = clientsData.filter(
        (client) => client._id !== selectedClient._id
      );
      setClientsData(updatedClientsData);
      setFilteredClients(updatedClientsData);

      toast.success("Client deleted successfully");
      closeModal();
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to delete client");
    }
  };

  const brokerageTypeLabel =
    masterAdmin?.mcx_brokerage_type === "per_crore"
      ? "Per Crore"
      : masterAdmin?.mcx_brokerage_type === "per_sauda"
      ? "Per Sauda"
      : "Unknown";

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Loading...</div>;
  }
  const percentage =
    totalBrokerage && masterAdmin.pattiPercentage
      ? ((totalProfitLoss * masterAdmin.pattiPercentage) / 100).toFixed(2)
      : "0.0";

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center bg-gray-100 min-h-screen pt-16">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-screen-xll mt-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {masterAdmin.availableBudget}
              </div>
              <div className="mt-1">My Available Budget</div>
            </div>
            <div className="p-4 bg-yellow-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-yellow-600 mb-2" />
              <div className="text-3xl font-bold text-yellow-600">
                {masterAdmin.share_brokerage}
              </div>
              <div className="mt-1">Super Share Brokerage</div>
            </div>
            <div className="p-4 bg-red-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CheckCircleIcon className="w-7 h-7 text-red-600 mb-2" />
              <div className="text-3xl font-bold text-red-600">
                {brokerageTypeLabel}
              </div>
              <div className="mt-1">Super MCX Brokerage Type</div>
            </div>
            <div className="p-4 bg-red-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-red-600 mb-2" />
              <div className="text-3xl font-bold text-red-600">
                {masterAdmin.mcx_brokerage}
              </div>
              <div className="mt-1">Super MCX Brokerage</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow-md w-full max-w-screen-xll mt-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <UserIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {clientsData.length}
              </div>
              <div className="mt-1">Total Client ID</div>
            </div>
            {/* <div className="p-4 bg-yellow-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <UserIcon className="w-7 h-7 text-yellow-600 mb-2" />
              <div className="text-3xl font-bold text-yellow-600">
                {
                  clientsData.filter((client) => client.status === "active")
                    .length
                }
              </div>
              <div className="mt-1">Total Active Client ID</div>
            </div> */}
            {/* <div className="p-4 bg-red-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <UserIcon className="w-7 h-7 text-red-600 mb-2" />
              <div className="text-3xl font-bold text-red-600">
                {
                  clientsData.filter((client) => client.status === "inactive")
                    .length
                }
              </div>
              <div className="mt-1">Total Blocked Client ID</div>
            </div> */}
            <div className="p-4 bg-red-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-red-600 mb-2" />
              <div className="text-3xl font-bold text-red-600">
                {totalBudget}
              </div>
              <div className="mt-1">Total Fund Allocated</div>
            </div>
            <div className="p-4 bg-blue-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-blue-600 mb-2" />
              <div
                className={`text-3xl font-bold ${
                  parseFloat(totalProfitLoss) < 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(-1 * parseFloat(totalProfitLoss)).toFixed(2)}{" "}
                {parseFloat(totalProfitLoss) < 0 ? " Profit" : " Loss"}
              </div>

              <div className="mt-1">Total Profit/Loss</div>
            </div>
            <div className="p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {percentage}
              </div>
              <div className="mt-1">
                {masterAdmin?.pattiPercentage}% Patti Master Admin
              </div>
            </div>
            <div className="p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {(totalProfitLoss - percentage).toFixed(2)}
              </div>
              <div className="mt-1">
                {100 - (masterAdmin?.pattiPercentage || 0)}% Patti Super Admin
              </div>
            </div>

            <div className="p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {totalBrokerage}
              </div>
              <div className="mt-1">Total Brokerage</div>
            </div>
            <div className="p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {totalBrokeragePerMCX}
              </div>
              <div className="mt-1">My Brokerage</div>
            </div>
            <div className="p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {totalBrokerageDifference}
              </div>
              <div className="mt-1">Super Brokerage</div>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white p-8 rounded shadow-md w-full max-w-screen-xll mt-5">
          <div className="flex justify-between items-center mb-10 mr-4 ml-0">
            <h2 className="text-2xl font-bold text-gray-500">Client List</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by username..."
                  className="border border-gray-400 rounded-md py-1 px-3 focus:outline-none focus:ring focus:border-blue-500"
                  value={searchQuery}
                  onChange={handleInputChange}
                />
                <SearchIcon className="h-5 w-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer" />
              </div>
              {/* <FilterIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
              <span className="text-gray-500 cursor-pointer">Filter</span> */}
              <DocumentDownloadIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
              <span className="text-gray-600 cursor-pointer">Export</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border border-gray-400">Sr No.</th>
                  <th className="px-4 py-2 border border-gray-400">
                    Client Code
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    Total Budget
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    Total Profit/Loss
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    Total Brokerage
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    My Brokerage
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    Super Brokerage
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    Create Date
                  </th>
                  <th className="px-4 py-2 border border-gray-400">Status</th>
                  <th className="px-4 py-2 border border-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {filteredClients.map((client, index) => (
                  <tr
                    key={client._id}
                    className={index % 2 === 0 ? "bg-gray-100" : ""}
                  >
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-400">
                      {client.client_code}
                    </td>
                    <td className="px-4 py-2 border border-gray-400">
                      {client.availableBudget}
                    </td>
                    <td
                      className={`px-4 py-2 border border-gray-400 ${
                        client.currentProfitLoss < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {client.currentProfitLoss}
                    </td>
                    <td className="px-4 py-2 border border-gray-400">
                      {client.currentbrokerage}
                    </td>
                    <td className="px-4 py-2 border border-gray-400">
                      {client.finalMasterBrokerage}
                    </td>
                    <td className="px-4 py-2 border border-gray-400">
                      {(
                        Number(client.currentbrokerage) -
                        Number(client.finalMasterBrokerage)
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-2 border border-gray-400">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      <button
                        className={`py-1 px-2 rounded-full ${
                          client.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                        onClick={() => handleStatusButtonClick(client)}
                      >
                        {client.status === "inactive"
                          ? "Blocked"
                          : client.status.charAt(0).toUpperCase() +
                            client.status.slice(1)}
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      <Link
                        to={`/view-master-client/${client._id}`}
                        className="bg-blue-500 text-white py-1 px-2 rounded-full"
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-master-client/${client._id}`}
                        className="bg-yellow-500 text-white py-1 px-2 rounded-full ml-2 inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        className="bg-red-500 text-white py-1 px-2 rounded-full ml-2"
                        onClick={() => handleDeleteButtonClick(client)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />

      {isDeleteModalOpen && selectedClient && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-md shadow-md relative">
            <h2 className="text-xl font-bold mb-2 mt-5">
              Are you sure you want to delete {selectedClient.client_code}?
            </h2>
            <p className="mb-5 text-center">This action cannot be undone.</p>
            <div className="flex justify-between items-center mt-5">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={closeModal}
              >
                No, Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={deleteClient}
              >
                Yes, Delete
              </button>
            </div>
            <button className="absolute top-2 right-2" onClick={closeModal}>
              <XIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedClient && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-md shadow-md relative">
            <h2 className="text-xl font-bold mb-2 mt-5">
              Are you sure you want to{" "}
              {selectedClient.status === "active" ? "block" : "activate"}{" "}
              {selectedClient.client_code}?
            </h2>
            <p className="mb-5 text-center">
              Do you want to change the status of this client?
            </p>
            <div className="flex justify-between items-center mt-5">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={closeModal}
              >
                No, Cancel
              </button>
              {selectedClient.status === "active" ? (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                  onClick={() => updateClientStatus("inactive")}
                >
                  Yes, Block
                </button>
              ) : (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={() => updateClientStatus("active")}
                >
                  Yes, Activate
                </button>
              )}
            </div>
            <button className="absolute top-2 right-2" onClick={closeModal}>
              <XIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MasterAdminDashboard;
