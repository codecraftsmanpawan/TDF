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
import Navbar from "./SuperAdminNav";

const SuperAdminDashboard = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [superAdminData, setSuperAdminData] = useState(null);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalMasterIDs, setTotalMasterIDs] = useState(0);
  const [totalBlockedMasterIDs, setTotalBlockedMasterIDs] = useState(0);
  const [totalActiveMasterIDs, setTotalActiveMasterIDs] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [inactiveClients, setInactiveClients] = useState(0);
   const totalFundGiven = filteredAdmins.reduce((acc, admin) => acc + Number(admin.budget), 0);
  const fundAllocatedToClient = filteredAdmins.reduce((acc, admin) => acc + Number(admin.allotedBudget), 0);
  const masterAdminAvailableFund = filteredAdmins.reduce((acc, admin) => acc + Number(admin.availableBudget), 0);

  // Helper function to get token and headers
  const getHeaders = () => {
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      toast.error("No token found in localStorage");
      return null;
    }
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    return myHeaders;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myHeaders = getHeaders();
        if (!myHeaders) return;

        // Fetch Super Admin Data
        const responseSuperAdmin = await fetch(
          "http://localhost:5000/api/var/superAdmin/getSuperAdmin",
          { headers: myHeaders }
        );
        const dataSuperAdmin = await responseSuperAdmin.json();
        setSuperAdminData(dataSuperAdmin.superAdmin);
        setFilteredAdmins(dataSuperAdmin.superAdmin.master_admins);
        setLoading(false);

        // Fetch Client Data
        const responseClients = await fetch(
          "http://localhost:5000/api/var/superAdmin/getAllClients",
          { headers: myHeaders }
        );
        const dataClients = await responseClients.json();
        const clients = dataClients.clients;

        // Calculate client counts
        const totalClientsCount = clients.length;
        const activeClientsCount = clients.filter(client => client.status === 'active').length;
        const inactiveClientsCount = clients.filter(client => client.status === 'inactive').length;

        setTotalClients(totalClientsCount);
        setActiveClients(activeClientsCount);
        setInactiveClients(inactiveClientsCount);

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
    const filtered = superAdminData.master_admins.filter((admin) =>
      admin.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAdmins(filtered);
  };

  const openModal = (admin) => {
    setSelectedAdmin(admin);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const openDeleteConfirmationModal = (admin) => {
    setSelectedAdmin(admin);
    setDeleteConfirmationModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setDeleteConfirmationModalOpen(false);
  };

  const handleDelete = async (adminId) => {
    const myHeaders = getHeaders();
    if (!myHeaders) return;

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/var/superAdmin/delete-masterAdmin/${adminId}`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }

      toast.success("Admin deleted successfully");

      setSuperAdminData((prevData) => {
        const updatedAdmins = prevData.master_admins.filter(
          (admin) => admin._id !== adminId
        );
        return { ...prevData, master_admins: updatedAdmins };
      });

      setFilteredAdmins((prevFilteredAdmins) => {
        const updatedAdmins = prevFilteredAdmins.filter(
          (admin) => admin._id !== adminId
        );
        return updatedAdmins;
      });

      closeDeleteConfirmationModal();
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const myHeaders = getHeaders();
    if (!myHeaders) return;

    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      status: newStatus,
    });

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/var/superAdmin/update-masterAdmin/${selectedAdmin._id}`,
        requestOptions
      );
      const result = await response.json();
      console.log(result);

      toast.success("Status updated successfully");

      setSuperAdminData((prevData) => {
        const updatedAdmins = prevData.master_admins.map((admin) =>
          admin._id === selectedAdmin._id
            ? { ...admin, status: newStatus }
            : admin
        );
        return { ...prevData, master_admins: updatedAdmins };
      });

      setFilteredAdmins((prevFilteredAdmins) => {
        const updatedAdmins = prevFilteredAdmins.map((admin) =>
          admin._id === selectedAdmin._id
            ? { ...admin, status: newStatus }
            : admin
        );
        return updatedAdmins;
      });

      closeModal();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    if (location.state?.fromLogin) {
      toast.success("Login successful!");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (superAdminData) {
      const blockedCount = superAdminData.master_admins.filter(
        (admin) => admin.status === "blocked"
      ).length;
      const activeCount = superAdminData.master_admins.filter(
        (admin) => admin.status === "active"
      ).length;
      setTotalMasterIDs(superAdminData.master_admins.length);
      setTotalBlockedMasterIDs(blockedCount);
      setTotalActiveMasterIDs(activeCount);
    }
  }, [superAdminData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <>
      <Navbar />
      
      <div className="flex flex-col items-center bg-gray-100 min-h-screen pt-16">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-screen-xll mt-8">
          <div className="flex flex-wrap">
            {/* Total Master ID */}
            <div className="max-w-xl mx-2 ml-4 my-2 p-5 bg-blue-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <UserIcon className="w-7 h-7 text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-blue-700">
                {totalMasterIDs}
              </div>
              <div className="mt-1">Total Master ID</div>
            </div>
            {/* Total Active Master ID */}
            <div className="max-w-xs mx-2 ml-3 my-2 p-4 bg-yellow-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <UserIcon className="w-7 h-7 text-yellow-600 mb-2" />
              <div className="text-3xl font-bold text-blue-700">
                {totalActiveMasterIDs}
              </div>
              <div className="mt-1">Total Active Master ID</div>
            </div>
            {/* Total Blocked Master ID */}
            <div className="max-w-xs mx-2 ml-3 my-2 p-4 bg-red-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <BanIcon className="w-7 h-7 text-red-600 mb-2" />
              <div className="text-3xl font-bold text-red-600">
                {totalBlockedMasterIDs}
              </div>
              <div className="mt-1">Total Blocked Master Id</div>
            </div>
            {/* Total Client ID */}
            <div className="max-w-xs mx-2 ml-3 my-2 p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <UserIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">{totalClients}</div>
              <div className="mt-1">Total Client ID</div>
            </div>
            {/* Total Active Clients ID */}
            <div className="max-w-xl mx-2 ml-4 my-2 p-5 bg-purple-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <UserIcon className="w-7 h-7 text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-purple-600">{activeClients}</div>
              <div className="mt-1">Total Active Clients ID</div>
            </div>
          </div>
          <div className="flex flex-wrap">
            {/* Total Blocked Clients ID */}
            <div className="max-w-xs mx-2 ml-4 my-2 p-4 bg-yellow-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <BanIcon className="w-7 h-7 text-yellow-600 mb-2" />
              <div className="text-3xl font-bold text-yellow-600">{inactiveClients}</div>
              <div className="mt-1">Total Blocked Clients ID</div>
            </div>
            {/* Total Fund Given */}
            <div className="max-w-xs mx-2 ml-3 my-2 p-4 bg-blue-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-blue-600">₹{totalFundGiven}.00</div>
              <div className="mt-1">Total Fund Given</div>
            </div>
            {/* Master Admin Available Fund */}
            <div className="max-w-xs mx-2 ml-3 my-2 p-4 bg-red-200 rounded-lg flex flex-col items-center justify-center min-w-80 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-red-600 mb-2" />
              <div className="text-3xl font-bold text-red-600">₹{masterAdminAvailableFund}.00</div>
              <div className="mt-1">Master Admin Available Fund</div>
            </div>
            {/* Fund Allocated to Client */}
            <div className="max-w-xs mx-2 ml-4 my-2 p-4 bg-purple-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <CurrencyRupeeIcon className="w-7 h-7 text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-purple-600">₹{fundAllocatedToClient}.00</div>
              <div className="mt-1">Fund Allocated to Client</div>
            </div>
              {/* Brokerage */}
            <div className="max-w-xs mx-2 ml-3 my-2 p-4 bg-green-200 rounded-lg flex flex-col items-center justify-center min-w-60 min-h-50">
              <BanIcon className="w-7 h-7 text-green-600 mb-2" />
              <div className="text-3xl font-bold text-green-600">123</div>
              <div className="mt-1">Brokerage</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded shadow-md w-full max-w-screen-xll mt-5">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-gray-500">
              MasterAdmin List
            </h2>
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
              <DocumentDownloadIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
              <span className="text-gray-600 cursor-pointer">Export</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border border-gray-400">Sr No.</th>
                  <th className="px-4 py-2 border border-gray-400">Code</th>
                  <th className="px-4 py-2 border border-gray-400">
                    Total Budget
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    Available Budget
                  </th>
                   <th className="px-4 py-2 border border-gray-400">
                  Client Allotted Budget
                  </th>
                  <th className="px-4 py-2 border border-gray-400">Added Clients</th>
                  <th className="px-4 py-2 border border-gray-400">Status</th>
                  <th className="px-4 py-2 border border-gray-400">
                    Brokerage
                  </th>
                  <th className="px-4 py-2 border border-gray-400">
                    Create Date
                  </th>
                  <th className="px-4 py-2 border border-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((masterAdmin, index) => (
                  <tr
                    key={masterAdmin.master_admin_id}
                    className={index % 2 === 0 ? "bg-gray-100" : ""}
                  >
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      {masterAdmin.master_code}
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      ₹{masterAdmin.budget}.00
                    </td>
                       <td className="px-4 py-2 border border-gray-400 text-center">
                      ₹{masterAdmin.availableBudget}.00
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      ₹{masterAdmin.allotedBudget}.00
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      {masterAdmin.totalClients}
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      <button
                        className={`py-1 px-2 rounded-full ${
                          masterAdmin.status === "blocked"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                        onClick={() => openModal(masterAdmin)}
                      >
                        {masterAdmin.status.charAt(0).toUpperCase() +
                          masterAdmin.status.slice(1)}
                      </button>
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      {masterAdmin.mcx_brokerage}
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      {new Date(masterAdmin.createdAt).toLocaleDateString()} {new Date(masterAdmin.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 border border-gray-400 text-center">
                      <Link
                        to={`/superadmin/MasterAdminView/${encodeURIComponent(
                          masterAdmin._id
                        )}`}
                        className="bg-blue-500 text-white py-1 px-2 rounded-full"
                      >
                        View
                      </Link>
<Link
  to={`/superadmin/UpdateMaster/${encodeURIComponent(masterAdmin._id)}`}
  className="bg-yellow-500 text-white py-1 px-2 rounded-full ml-2 hover:bg-yellow-600 transition duration-200 ease-in-out"
>
  Edit
</Link>
                      <button
                        className="bg-red-500 text-white py-1 px-2 rounded-full ml-2"
                        onClick={() => openDeleteConfirmationModal(masterAdmin)}
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

        {modalOpen && selectedAdmin && (
          <StatusModal
            selectedAdmin={selectedAdmin}
            handleStatusUpdate={handleStatusUpdate}
            closeModal={closeModal}
          />
        )}

        {deleteConfirmationModalOpen && selectedAdmin && (
          <DeleteConfirmationModal
            selectedAdmin={selectedAdmin}
            handleDelete={handleDelete}
            closeDeleteConfirmationModal={closeDeleteConfirmationModal}
          />
        )}
      </div>
      <ToastContainer />
    </>
  );
};

const StatusModal = ({ selectedAdmin, handleStatusUpdate, closeModal }) => (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-8 rounded-md shadow-md relative">
      <h2 className="text-xl font-bold mb-2 mt-5">
        Are you sure you want to{" "}
        {selectedAdmin.status === "blocked" ? "activate" : "block"}{" "}
        {selectedAdmin.master_code}?
      </h2>
      <p className="mb-5 text-center">
        Do you want to change the status of this Master ID?
      </p>
      <div className="flex justify-between items-center mt-5">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
          onClick={closeModal}
        >
          No, Cancel
        </button>
        {selectedAdmin.status === "blocked" ? (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md"
            onClick={() => handleStatusUpdate("active")}
          >
            Yes, Activate
          </button>
        ) : (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={() => handleStatusUpdate("blocked")}
          >
            Yes, Block
          </button>
        )}
      </div>
      <button className="absolute top-2 right-2" onClick={closeModal}>
        <XIcon className="h-6 w-6 text-gray-500" />
      </button>
    </div>
  </div>
);

const DeleteConfirmationModal = ({
  selectedAdmin,
  handleDelete,
  closeDeleteConfirmationModal,
}) => (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-8 rounded-md shadow-md relative">
      <h2 className="text-xl font-bold mb-2 mt-5">
        Are you sure you want to delete {selectedAdmin.master_code}?
      </h2>
      <p className="mb-5 text-center">This action cannot be undone.</p>
      <div className="flex justify-between items-center mt-5">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
          onClick={closeDeleteConfirmationModal}
        >
          No, Cancel
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={() => handleDelete(selectedAdmin._id)}
        >
          Yes, Delete
        </button>
      </div>
      <button
        className="absolute top-2 right-2"
        onClick={closeDeleteConfirmationModal}
      >
        <XIcon className="h-6 w-6 text-gray-500" />
      </button>
    </div>
  </div>
);

export default SuperAdminDashboard;
