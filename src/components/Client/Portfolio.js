import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";
import Bids from "./BidsPage";
import Stoploss from "./StoplossPage";

const StockPortfolio = () => {
  const [trades, setTrades] = useState([]);
  const [bids, setBids] = useState([]);
  const [stoplosses, setStoplosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState({});
  const [activeTab, setActiveTab] = useState("trades");
  const navigate = useNavigate();
  const [responseData, setResponseData] = useState(null);
  const [totalProfitLoss, setTotalProfitLoss] = useState("0.00");
  const [isToggled, setIsToggled] = useState(false);

  const toggleView = () => {
    setIsToggled(!isToggled);
  };

  const getToken = () => localStorage.getItem("StocksUsertoken");

  const getUserIdFromToken = () => {
    const token = getToken();
    if (token) {
      const decodedToken = jwtDecode(token);
      return decodedToken.id;
    }
    return null;
  };

  const isWithinTradePriceTimeframe = () => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const kolkataTime = new Date(utcTime + 19800000);

    const day = kolkataTime.getDay();
    const hour = kolkataTime.getHours();
    const minute = kolkataTime.getMinutes();

    if (day === 0 && (hour > 18 || (hour === 18 && minute >= 40))) return true;
    if (day === 1 && (hour < 9 || (hour === 9 && minute < 15))) return true;
    return false;
  };

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const userId = getUserIdFromToken();
        // console.log('User ID:', userId);
        if (userId) {
          const response = await axios.get(
            `http://13.51.178.27:5000/api/var/client/trades/net-quantity/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          // console.log('API Response:', response.data);
          setTrades(response.data.netQuantities);
        }
      } catch (err) {
        // console.error('Error fetching trades:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  useEffect(() => {
    if (trades.length > 0) {
      trades.forEach((trade) => {
        const instrumentIdentifier = trade.instrumentIdentifier;
        fetchRealTimeData(instrumentIdentifier);
      });
      const intervalId = setInterval(() => {
        trades.forEach((trade) => {
          const instrumentIdentifier = trade.instrumentIdentifier;
          fetchRealTimeData(instrumentIdentifier);
        });
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [trades]);

  const fetchRealTimeData = async (instrumentIdentifier) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `http://13.51.178.27:5000/api/var/client/stocks/${instrumentIdentifier}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { QuotationLot, ...rest } = response.data;

      setRealTimeData((prevData) => ({
        ...prevData,
        [instrumentIdentifier]: {
          ...rest,
          QuotationLot,
        },
      }));
    } catch (err) {
      // console.error('Error fetching real-time data:', err);
    }
  };

  const calculateProfitLoss = (
    totalInvestment,
    totalCurrentValue,
    tradeType,
    exchange,
    QuotationLot
  ) => {
    let profitLossValue;

    if (tradeType === "buy") {
      profitLossValue = totalCurrentValue - totalInvestment;
    } else if (tradeType === "sell") {
      profitLossValue = totalInvestment - totalCurrentValue;
    } else {
      return { value: "N/A", color: "text-gray-100", percentage: "N/A" };
    }

    if (exchange === "MCX") {
      profitLossValue *= QuotationLot;
    }

    return {
      value:
        profitLossValue >= 0
          ? `₹${profitLossValue.toFixed(2)}`
          : `-₹${Math.abs(profitLossValue).toFixed(2)}`,
      color: profitLossValue >= 0 ? "text-green-500" : "text-red-500",
      percentage: ((profitLossValue / totalInvestment) * 100).toFixed(2),
    };
  };

  const calculateTotalProfitLoss = () => {
    let total = 0;

    groupedTrades.forEach((tradeData) => {
      const { totalInvestment, totalCurrentValue } = tradeData;
      const { value: profitLossValue } = calculateProfitLoss(
        totalInvestment,
        totalCurrentValue,
        tradeData.tradeData.tradeType,
        tradeData.exchange,
        tradeData.QuotationLot
      );

      const numericValue = parseFloat(profitLossValue.replace(/[^\d.-]/g, ""));
      total += isNaN(numericValue) ? 0 : numericValue;
    });

    setTotalProfitLoss(
      total >= 0 ? `₹${total.toFixed(2)}` : `-₹${Math.abs(total).toFixed(2)}`
    );
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const updateProfitLoss = async () => {
        const token = getToken();
        const userId = getUserIdFromToken();

        if (!token) {
          setError("No token found");
          return;
        }

        if (!userId) {
          setError("Invalid token or user ID not found");
          return;
        }

        const profitLoss = parseFloat(totalProfitLoss.replace(/[^\d.-]/g, ""));

        const data = JSON.stringify({
          profitLoss,
        });

        const config = {
          method: "patch",
          maxBodyLength: Infinity,
          url: `http://13.51.178.27:5000/api/var/client/updateProfitLoss/${userId}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: data,
        };

        try {
          const response = await axios.request(config);
          setResponseData(response.data);
        } catch (err) {
          setError(err.message || "Something went wrong");
        }
      };

      if (trades.length > 0 && Object.keys(realTimeData).length > 0) {
        updateProfitLoss();
        calculateTotalProfitLoss();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [trades, realTimeData, totalProfitLoss]);

  useEffect(() => {
    if (trades.length > 0 && Object.keys(realTimeData).length > 0) {
      calculateTotalProfitLoss();
    }
  }, [trades, realTimeData]);

  const handleRowClick = (instrumentIdentifier) => {
    navigate(`/trade/detail/${instrumentIdentifier}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleButtonClick = (trade) => {
    const action = trade.action === "buy" ? "sell" : "buy";
    navigate(`/trade/${action}/${trade.instrumentIdentifier}`);
  };

  const groupTradesByInstrument = (trades) => {
    const groupedTrades = trades.reduce((acc, trade) => {
      const key = `${trade.instrumentIdentifier}-${trade.exchange}-${trade.action}`;
      const existing = acc[key];

      if (!existing) {
        acc[key] = {
          instrumentIdentifier: trade.instrumentIdentifier,
          exchange: trade.exchange,
          totalQuantity: 0,
          totalInvestment: 0,
          totalCurrentValue: 0,
          trades: [],
          action: trade.action,
        };
      }

      acc[key].trades.push(trade);
      acc[key].totalQuantity += trade.netQuantity;

      const stockData = realTimeData[trade.instrumentIdentifier] || {};
      const currentPrice =
        trade.action === "buy" ? stockData.BuyPrice : stockData.SellPrice;
      const displayPrice = isWithinTradePriceTimeframe()
        ? currentPrice
        : trade.averagePrice;

      acc[key].totalInvestment += displayPrice * trade.netQuantity;

      return acc;
    }, {});

    return Object.values(groupedTrades)
      .map((data) => {
        const {
          instrumentIdentifier,
          exchange,
          totalQuantity,
          totalInvestment,
          trades,
        } = data;
        const stockData = realTimeData[instrumentIdentifier] || {};
        const currentPrice =
          data.action === "buy" ? stockData.BuyPrice : stockData.SellPrice;
        const totalCurrentValue = currentPrice * totalQuantity;
        const totalProfitLoss = totalCurrentValue - totalInvestment;

        return {
          instrumentIdentifier,
          exchange,
          totalQuantity,
          totalInvestment,
          totalCurrentValue,
          totalProfitLoss,
          Close: currentPrice,
          QuotationLot: stockData.QuotationLot || 1,
          tradeData: trades[0],
        };
      })
      .filter((tradeData) => {
        return (
          tradeData.tradeData.action === "sell" ||
          (tradeData.totalQuantity > 0 && tradeData.tradeData.action === "buy")
        );
      });
  };

  const groupedTrades = groupTradesByInstrument(trades);

  if (loading) {
    return <Spinner />;
  }

  const handleNavigation = () => {
    navigate("/history");
  };

  const formatInstrumentIdentifier = (identifier) => {
    const match = identifier.match(/(\d{2}[A-Z]{3}\d{4})/);
    return match ? match[0] : identifier;
  };

  const getButtonColor = (action) => {
    return action === "sell" ? "bg-red-500" : "bg-green-500";
  };

  const formatQuantity = (quantity, exchange) => {
    return exchange === "MCX" ? `${quantity} Lot` : `${quantity} Share`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md">
        <TopNavbar toggleSidebar={toggleView} />
        <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
      </div>
      <div className="container mx-auto p-2 mt-16 bg-black">
        <h2 className="text-2xl font-bold mb-4 mt-4 text-white">
          Stock Portfolio
        </h2>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-xl font-semibold text-white">
              Total Profit/Loss: {totalProfitLoss}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-700 to-gray-800 shadow-md rounded p-4 mb-12">
          <div className="flex border-b">
            <button
              className={`py-2 px-5 ${
                activeTab === "trades"
                  ? "bg-gradient-to-b from-gray-700 to-gray-800 text-white"
                  : "bg-gray-200"
              } rounded-l`}
              onClick={() => handleTabChange("trades")}
            >
              Trades
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "bids"
                  ? "bg-gradient-to-b from-gray-700 to-gray-800 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => handleTabChange("bids")}
            >
              Bids
            </button>
            <button
              className={`py-2 px-5 ${
                activeTab === "stoploss"
                  ? "bg-gradient-to-b from-gray-700 to-gray-800 text-white"
                  : "bg-gray-200"
              } rounded-r`}
              onClick={() => handleTabChange("stoploss")}
            >
              Stoploss
            </button>
            <button
              className={`py-2 px-5 bg-gray-200 rounded-r`}
              onClick={handleNavigation}
            >
              History
            </button>
          </div>

          {activeTab === "trades" && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white table-auto">
                <thead>
                  <tr className="bg-gradient-to-b from-gray-700 to-gray-800 text-white">
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Stock</th>
                    <th className="py-2 px-4">Instrument</th>
                    <th className="py-2 px-4">Exchange</th>
                    <th className="py-2 px-4">Quantity</th>
                    <th className="py-2 px-4">Trade Type</th>
                    <th className="py-2 px-4">Trade Price</th>
                    <th className="py-2 px-4">Investment Value</th>
                    <th className="py-2 px-4">Current Value</th>
                    <th className="py-2 px-4">Profit/Loss</th>
                    <th className="py-2 px-4">Current Price</th>
                    <th className="py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedTrades.length > 0 ? (
                    groupedTrades.map((tradeData, index) => {
                      const {
                        instrumentIdentifier,
                        exchange,
                        totalQuantity,
                        totalInvestment,
                        totalCurrentValue,
                        tradeData: trade,
                        QuotationLot,
                      } = tradeData;
                      const stockData =
                        realTimeData[instrumentIdentifier] || {};
                      const currentPrice =
                        trade.action === "buy"
                          ? stockData.BuyPrice
                          : stockData.SellPrice;
                      const {
                        value: profitLossValue,
                        color: profitLossColor,
                        percentage,
                      } = calculateProfitLoss(
                        totalInvestment,
                        totalCurrentValue,
                        trade.tradeType,
                        exchange,
                        QuotationLot
                      );
                      const displayPrice = isWithinTradePriceTimeframe()
                        ? currentPrice
                        : trade.averagePrice;
                      return (
                        <tr
                          key={instrumentIdentifier}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-blue-100"
                          } text-center cursor-pointer`}
                          onClick={() => handleRowClick(instrumentIdentifier)}
                        >
                          <td className="py-2 px-4 border-b">{index + 1}</td>
                          <td className="py-2 px-4 border-b">{trade.name}</td>
                          <td className="py-2 px-4 border-b">
                            {formatInstrumentIdentifier(instrumentIdentifier)}
                          </td>
                          <td className="py-2 px-4 border-b">{exchange}</td>
                          <td className="py-2 px-4 border-b">
                            {formatQuantity(totalQuantity, exchange)}
                          </td>
                          <td
                            className="py-2 px-4 border-b"
                            style={{ textTransform: "capitalize" }}
                          >
                            {trade.tradeType}
                          </td>
                          <td className="py-2 px-4 border-b">{displayPrice}</td>{" "}
                          {/* Display the appropriate price */}
                          <td className="py-2 px-4 border-b">
                            ₹{totalInvestment.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 border-b">
                            ₹{totalCurrentValue.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <span className={profitLossColor}>
                              {profitLossValue}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            {trade.action === "buy"
                              ? `₹${stockData.BuyPrice}`
                              : `₹${stockData.SellPrice}`}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <button
                              className={`text-white font-bold py-1 px-3 rounded capitalize ${getButtonColor(
                                trade.action
                              )}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleButtonClick(trade);
                              }}
                            >
                              {trade.action}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center py-4">
                        No trades available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "bids" && <Bids bids={bids} />}
          {activeTab === "stoploss" && <Stoploss stoplosses={stoplosses} />}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default StockPortfolio;
