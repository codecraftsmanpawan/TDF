import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";
// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function TradeChart() {
  const [chartData, setChartData] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [isToggled, setIsToggled] = useState(false);
  const toggleView = () => {
    setIsToggled(!isToggled);
  };
  useEffect(() => {
    const getToken = () => localStorage.getItem("StocksUsertoken");

    const fetchUserId = () => {
      const token = getToken();
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.id);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `http://13.51.178.27:5000/api/var/client/trades/chart/${userId}`
          );
          setChartData(response.data.chartData);
        } catch (error) {
          console.error("Error fetching chart data:", error);
        }
      }
    };

    fetchChartData();
  }, [userId]);

  // Generate a continuous date range
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Process chart data
  const processData = () => {
    if (chartData.length === 0) return { labels: [], datasets: [] };

    // Find the date range
    const allDates = chartData.map((entry) => entry.date);
    const startDate = Math.min(
      ...allDates.map((date) => new Date(date).getTime())
    );
    const endDate = Math.max(
      ...allDates.map((date) => new Date(date).getTime())
    );
    const dateRange = generateDateRange(startDate, endDate);

    // Prepare data with missing dates filled
    const dataMap = {};
    chartData.forEach((entry) => {
      dataMap[entry.date] = {
        totalQuantity: entry.totalQuantity,
        totalPrice: entry.totalPrice,
      };
    });

    const labels = dateRange;
    const totalQuantityData = dateRange.map(
      (date) => dataMap[date]?.totalQuantity || 0
    );
    const totalPriceData = dateRange.map(
      (date) => dataMap[date]?.totalPrice || 0
    );

    return {
      labels,
      datasets: [
        {
          label: "Total Quantity",
          data: totalQuantityData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 1,
        },
        {
          label: "Total Price",
          data: totalPriceData,
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderWidth: 1,
        },
      ],
    };
  };

  const data = processData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount",
        },
      },
    },
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation */}
      <TopNavbar toggleSidebar={toggleView} />
      <Sidebar isOpen={isToggled} closeSidebar={toggleView} />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <div className="w-full h-full">
          {data.labels.length > 0 ? (
            <Line data={data} options={options} className="w-full h-full" />
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default TradeChart;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {jwtDecode} from 'jwt-decode'; // Corrected import statement

// const TradeProfile = () => {
//     const [clientDetails, setClientDetails] = useState(null);
//     const [trades, setTrades] = useState([]);

//     useEffect(() => {
//         const token = localStorage.getItem('StocksUsertoken');
//         if (!token) {
//             console.log("No token found");
//             return;
//         }

//         const decoded = jwtDecode(token);
//         const userId = decoded.id;

//         // Fetch Client Details
//         const fetchClientDetails = async () => {
//             const config = {
//                 method: 'get',
//                 url: `http://13.51.178.27:5000/api/var/client/${userId}`,
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             };

//             try {
//                 const { data } = await axios.request(config);
//                 setClientDetails(data.clientDetails);
//             } catch (error) {
//                 console.error('Error fetching client details:', error);
//             }
//         };

//         // Fetch Trades
//         const fetchTrades = async () => {
//             const config = {
//                 method: 'get',
//                 url: `http://13.51.178.27:5000/api/var/client/trades/mcx/${userId}`,
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             };

//             try {
//                 const { data } = await axios.request(config);
//                 setTrades(data.trades);
//             } catch (error) {
//                 console.error('Error fetching trades:', error);
//             }
//         };

//         fetchClientDetails();
//         fetchTrades();
//     }, []);

//     return (
//         <div className="container mx-auto px-4 py-5">
//             {clientDetails && (
//                 <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg mb-6">
//                     <h2 className="text-2xl font-bold mb-4">Client Profile</h2>
//                     <div className="grid grid-cols-2 gap-4">
//                         <p>Client Code: <span className="font-semibold">{clientDetails.clientCode}</span></p>
//                         <p>Share Brokerage: <span className="font-semibold">{clientDetails.shareBrokerage}%</span></p>
//                         <p>MCX Brokerage Type: <span className="font-semibold">{clientDetails.mcxBrokerageType}</span></p>
//                         <p>MCX Brokerage: <span className="font-semibold">{clientDetails.mcxBrokerage}</span></p>
//                         <p>Username: <span className="font-semibold">{clientDetails.username}</span></p>
//                     </div>
//                 </div>
//             )}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {trades.map((trade, index) => (
//                     <div key={index} className="bg-blue-500 text-white p-4 rounded-lg shadow">
//                         <h3 className="text-lg font-semibold mb-2">Instrument: {trade.instrumentIdentifier}</h3>
//                         <ul className="list-disc pl-5 space-y-1">
//                             <li>Total Buy Quantity: {trade.totalBuyQuantity}</li>
//                             <li>Total Sell Quantity: {trade.totalSellQuantity}</li>
//                             <li>Quotation Lot: {trade.QuotationLot}</li>
//                             <li>Total Buy Lots: {trade.totalBuyLots}</li>
//                             <li>Total Sell Lots: {trade.totalSellLots}</li>
//                             <li>Sauda Count: {trade.saudaCount}</li>
//                         </ul>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default TradeProfile;
