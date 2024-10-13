import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopNavbar from "../PrivateSuperAdmin/TopNavBar";
import { API_BASE_URL } from "../axiosConfig";

const PrivateAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the token from local storage
    const token = localStorage.getItem("****xxx*****");

    if (!token) {
      // If no token found, redirect to login
      console.log("No token found, redirecting to login...");
      navigate("/privateLogin");
    } else {
      // Axios configuration with the token
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${API_BASE_URL}/api/var/privateAdmin/clients`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Making the API call
      axios
        .request(config)
        .then((response) => {
          setData(response.data.data); // Save data from the response
        })
        .catch((error) => {
          console.error("Error fetching data", error);
          setError("Failed to fetch data.");
          if (error.response && error.response.status === 401) {
            // If token is invalid or expired, redirect to login
            console.log("Token is invalid or expired, redirecting to login...");
            localStorage.removeItem("****xxx*****"); // Clear invalid token
            navigate("/privateLogin");
          }
        });
    }
  }, [navigate]);

  // Loading or error states
  if (!data && !error) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Handle "View Trade" action
  const handleViewTrade = (clientId) => {
    navigate(`/privateClientDetils/${clientId}`);
  };
  const handleAddTrade = (clientId) => {
    navigate(`/privateStockSearch/${clientId}`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-black">
      <TopNavbar />

      {/* Content Area */}
      <div className="container mx-auto p-6">
        {/* <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Private Admin Dashboard
        </h1> */}

        {/* Data Table */}
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="py-2 px-4 text-left">S/N</th>
                  <th className="py-2 px-4 text-left">Client ID</th>
                  <th className="py-2 px-4 text-left">Client Code</th>
                  <th className="py-2 px-4 text-left">Master Admin Code</th>
                  {/* <th className="py-2 px-4 text-left">Budget</th>
                  <th className="py-2 px-4 text-left">Available Budget</th>
                  <th className="py-2 px-4 text-left">Share Brokerage</th> */}
                  <th className="py-2 px-4 text-left">Current Profit/Loss</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Created At</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    {/* Serial Number */}
                    <td className="py-2 px-4">{index + 1}</td>
                    {/* Client Details */}
                    <td className="py-2 px-4">{item.client_id}</td>
                    <td className="py-2 px-4">{item.client_code}</td>
                    <td className="py-2 px-4">
                      {item.master_admin_id.master_code}
                    </td>
                    {/* <td className="py-2 px-4">{item.budget}</td>
                    <td className="py-2 px-4">{item.availableBudget}</td>
                    <td className="py-2 px-4">{item.share_brokerage}</td> */}
                    <td className="py-2 px-4">{item.currentProfitLoss}</td>
                    <td className="py-2 px-4 uppercase">{item.status}</td>
                    <td className="py-2 px-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    {/* Actions Column with View Trade button */}
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleViewTrade(item._id)}
                        className="text-white bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded mr-2"
                      >
                        View Trade
                      </button>
                      <button
                        onClick={() => handleAddTrade(item._id)}
                        className="text-white bg-green-500 hover:bg-green-700 font-bold py-2 px-4 rounded"
                      >
                        Add Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-100">No data available.</p>
        )}
      </div>
    </div>
  );
};

export default PrivateAdminDashboard;
