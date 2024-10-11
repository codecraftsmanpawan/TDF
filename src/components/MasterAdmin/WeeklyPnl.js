import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./MasterAdminNav";

const WeeklyPnLPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the token from local storage
    const token = localStorage.getItem("masterAdminToken");

    if (token) {
      // Decode the token to get the master admin ID
      const decodedToken = jwtDecode(token);
      const masterAdminId = decodedToken.id;

      // Axios config with token from local storage
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://13.51.178.27:5000/api/var/pnl/master-admin/${masterAdminId}/weekly-pnl`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch the data
      axios
        .request(config)
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          setError(error);
        });
    } else {
      setError("No token found in local storage");
    }
  }, []);

  if (error) {
    return <div className="text-red-500">{error.message || error}</div>;
  }

  if (!data) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 bg-white text-blue-900 mt-16">
        <h1 className="text-2xl font-bold mb-4 border-b-2 border-blue-900">
          Weekly PnL
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.data.weeklyPnL.map((pnlItem, index) => (
            <div
              key={index}
              className="border border-blue-900 p-4 rounded shadow-md"
            >
              <h2 className="font-bold text-blue-700">{pnlItem.day}</h2>
              <p className="text-blue-900">PnL: ₹{pnlItem.pnl}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mt-8 text-blue-900">Client Data</h2>
        <div className="mt-4 text-blue-900">
          <p>
            <strong>All Clients Total Amount:</strong> ₹
            {data.data.AllClientTotalAmount}
          </p>
          <p>
            <strong>All Clients Total Brokerage:</strong> ₹
            {data.data.AllClientTotalBrokerage}
          </p>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full mt-4 bg-white border-collapse text-blue-900">
            <thead className="bg-blue-200">
              <tr>
                <th className="border p-2">Client Code</th>
                <th className="border p-2">Username</th>
                <th className="border p-2">Total Amount</th>
                <th className="border p-2">Total Brokerage</th>
              </tr>
            </thead>
            <tbody>
              {data.data.clientData.map((client, index) => (
                <tr key={index} className="text-center bg-blue-50">
                  <td className="border p-2">{client.client_code}</td>
                  <td className="border p-2">{client.username}</td>
                  <td className="border p-2">₹{client.totalAmount}</td>
                  <td className="border p-2">₹{client.totalBrokerage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default WeeklyPnLPage;
