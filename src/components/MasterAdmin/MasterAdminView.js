import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "./MasterAdminNav";
import { jwtDecode } from "jwt-decode";

const colors = [
  "bg-yellow-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-pink-200",
  "bg-purple-200",
  "bg-red-200",
  "bg-teal-200",
  "bg-indigo-200",
  "bg-gray-200",
  "bg-orange-200",
];

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tradeData, setTradeData] = useState(null);
  const [error, setError] = useState(null);
  const [mcxTradesWithLotSize, setMcxTradesWithLotSize] = useState([]);
  const [nseTrades, setNseTrades] = useState([]);

  useEffect(() => {
    const fetchClientData = async () => {
      const token = localStorage.getItem("masterAdminToken");
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://13.61.104.53:5000/api/var/masterAdmin/getClient/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.request(config);
        setClient(response.data.client);
        fetchTradeData(response.data.client.client_id);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchTradeData = async (clientId) => {
      const token = localStorage.getItem("masterAdminToken");
      const decodedToken = jwtDecode(token);

      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://13.61.104.53:5000/api/var/client/trades/client/brokerage/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.request(config);
        const {
          nseTrades,
          mcxTrades,
          totalBrokerage,
          brokeragePerNSECrore,
          brokeragePerMCX,
        } = response.data;
        setTradeData(response.data);
        setNseTrades(nseTrades);
        setMcxTradesWithLotSize(await processMcxTrades(mcxTrades, token));
        setTradeData({
          ...response.data,
          totalBrokerage,
          brokeragePerNSECrore,
          brokeragePerMCX,
        });
      } catch (err) {
        setError("Error fetching trade history");
        console.error(err);
      }
    };

    const processMcxTrades = async (mcxTrades, token) => {
      return await Promise.all(
        mcxTrades.map(async (trade) => {
          try {
            const lotConfig = {
              method: "get",
              maxBodyLength: Infinity,
              url: `http://13.61.104.53:5000/api/var/client/stocks/${trade.instrumentIdentifier}`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            };
            const lotResponse = await axios.request(lotConfig);
            const quotationLot = lotResponse.data.QuotationLot || 1;
            return {
              ...trade,
              quantity: trade.quantity / quotationLot,
              quotationLot,
            };
          } catch (err) {
            return trade;
          }
        })
      );
    };

    fetchClientData();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!client || !tradeData) return <div>Loading...</div>;

  const clientDetails = [
    { title: "Username", value: client?.username || "N/A" },
    { title: "Client Code", value: client?.client_code || "N/A" },
    { title: "Budget", value: client?.budget || "N/A" },
    { title: "Share Brokerage", value: client?.share_brokerage || "N/A" },
    {
      title: "MCX Brokerage Type",
      value:
        client?.mcx_brokerage_type === "per_crore"
          ? "Per Crore"
          : client?.mcx_brokerage_type === "per_sauda"
          ? "Per Sauda"
          : client?.mcx_brokerage_type || "N/A",
    },
    { title: "MCX Brokerage", value: client?.mcx_brokerage || "N/A" },
    { title: "Status", value: client?.status?.toUpperCase() || "N/A" },
    {
      title: "Created At",
      value: client?.createdAt
        ? new Date(client.createdAt).toLocaleString()
        : "N/A",
    },
  ];

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <>
      <Navbar />

      <div className="p-4 mt-16">
        <div className="flex flex-col items-center p-4 bg-gray-100 mt-10">
          <h2 className="mb-4 mt-4 font-bold text-2xl">Client Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clientDetails.map((detail, index) => (
            <div
              key={detail.title}
              className={`shadow-md rounded-lg p-4 ${
                colors[index % colors.length]
              }`}
            >
              <h2 className="text-lg font-bold mb-2">{detail.title}</h2>
              <p>{detail.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Trade History
          </h2>
          <div className="overflow-x-auto mt-4">
            <div className="flex flex-wrap justify-around">
              <div className="flex flex-col items-left bg-white p-4 m-2 rounded-lg shadow-lg w-80">
                <h4 className="text-2xl font-bold">Client Brokerage</h4>
                <p className="text-xl font-semibold mb-4 mt-4">
                  Total Brokerage: ₹
                  {parseFloat(tradeData.totalBrokerage).toFixed(2)}
                </p>
                <p className="text-xl font-semibold mb-4">
                  Total NSE Brokerage: ₹
                  {parseFloat(tradeData.brokeragePerNSECrore).toFixed(2)}
                </p>
                <p className="text-xl font-semibold mb-4">
                  Total MCX Brokerage: ₹
                  {parseFloat(tradeData.brokeragePerMCX).toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col items-left bg-white p-4 m-2 rounded-lg shadow-lg w-80">
                <h4 className="text-2xl font-bold mb-2">My Brokerage</h4>
                <p className="text-xl font-semibold mb-4 mt-4">
                  Total Brokerage: ₹
                  {parseFloat(tradeData.finalMasterBrokerage).toFixed(2)}
                </p>
                <p className="text-xl font-semibold mb-4">
                  Total NSE Brokerage: ₹
                  {parseFloat(tradeData.finalMasterNSEBrokerage).toFixed(2)}
                </p>
                <p className="text-xl font-semibold mb-4">
                  Total MCX Brokerage: ₹
                  {parseFloat(tradeData.finalMasterMCXBrokerage).toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col items-left bg-white p-4 m-2 rounded-lg shadow-lg w-80">
                <h4 className="text-2xl font-bold mb-2">Super Brokerage</h4>
                <p className="text-xl font-semibold mb-4 mt-4">
                  Total Brokerage: ₹
                  {(
                    parseFloat(tradeData.totalBrokerage) -
                    parseFloat(tradeData.finalMasterBrokerage)
                  ).toFixed(2)}
                </p>
                <p className="text-xl font-semibold mb-4">
                  Total NSE Brokerage: ₹
                  {(
                    parseFloat(tradeData.brokeragePerNSECrore) -
                    parseFloat(tradeData.finalMasterNSEBrokerage)
                  ).toFixed(2)}
                </p>
                <p className="text-xl font-semibold mb-4">
                  Total MCX Brokerage: ₹
                  {(
                    parseFloat(tradeData.brokeragePerMCX) -
                    parseFloat(tradeData.finalMasterMCXBrokerage)
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* NSE Trades Table */}
            <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-6">
              NSE Trades
            </h2>
            <div className="overflow-x-auto mb-2 mt8">
              <table className="min-w-full bg-white table-auto border-collapse mb-6">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Exchange</th>
                    <th className="py-2 px-4">Trade Type</th>
                    <th className="py-2 px-4">Trade Quantity</th>
                    <th className="py-2 px-4">Investment Price/Share</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Update At</th>
                  </tr>
                </thead>
                <tbody>
                  {nseTrades.map((trade, index) => (
                    <tr
                      key={trade._id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-blue-50"
                      } text-center`}
                    >
                      <td className="py-2 px-4 border-b">{index + 1}</td>
                      <td className="py-2 px-4 border-b">{trade.name}</td>
                      <td className="py-2 px-4 border-b">{trade.exchange}</td>
                      <td className="py-2 px-4 border-b">
                        {capitalizeFirstLetter(trade.tradeType)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {trade.quantity} Share
                      </td>
                      <td className="py-2 px-4 border-b">₹{trade.price}</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(trade.date).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          hour12: true,
                        })}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(trade.updatedAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          hour12: true,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MCX Trades Table */}
            <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-6 mb-8">
              MCX Trades
            </h2>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Exchange</th>
                    <th className="py-2 px-4">Trade Type</th>
                    <th className="py-2 px-4">Trade Quantity</th>
                    <th className="py-2 px-4">Investment Price/Share</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Update At</th>
                  </tr>
                </thead>
                <tbody>
                  {mcxTradesWithLotSize.map((trade, index) => (
                    <tr
                      key={trade._id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-blue-50"
                      } text-center`}
                    >
                      <td className="py-2 px-4 border-b">{index + 1}</td>
                      <td className="py-2 px-4 border-b">{trade.name}</td>
                      <td className="py-2 px-4 border-b">{trade.exchange}</td>
                      <td className="py-2 px-4 border-b">
                        {capitalizeFirstLetter(trade.tradeType)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {trade.quantity} Lot
                      </td>
                      <td className="py-2 px-4 border-b">₹{trade.price}</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(trade.date).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          hour12: true,
                        })}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(trade.updatedAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          hour12: true,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientDetails;
