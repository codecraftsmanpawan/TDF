import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaMinus, FaPlus } from "react-icons/fa";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InstrumentDetails = () => {
  const { instrumentIdentifier } = useParams();
  const [instrumentData, setInstrumentData] = useState(null);
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [stockDetails, setStockDetails] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [blockedStocks, setBlockedStocks] = useState([]);
  const navigate = useNavigate();
  const [isToggled, setIsToggled] = useState(false);

  const toggleView = () => {
    setIsToggled(!isToggled);
  };

  const getToken = () => {
    return localStorage.getItem("StocksUsertoken");
  };

  const getUserIdFromToken = () => {
    const token = getToken();
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.id;
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        setError("User ID not found in token.");
        return;
      }

      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://13.51.178.27:5000/api/var/client/instrument/${instrumentIdentifier}/trades/?userId=${userId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.request(config);
        setInstrumentData(response.data);

        if (response.data.trades.length > 0) {
          const firstTradeAction = response.data.trades[0].action;
          setIsBuy(firstTradeAction === "buy");
        }

        const initialQuantity = response.data.trades.reduce((acc, trade) => {
          return trade.action === "buy" ? acc + trade.quantity : acc;
        }, 0);

        setAvailableQuantity(initialQuantity);
      } catch (err) {
        setError("Failed to fetch instrument data.");
      }
    };

    const fetchStockDetails = async () => {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const stockConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://13.51.178.27:5000/api/var/client/stocks/${instrumentIdentifier}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const stockResponse = await axios.request(stockConfig);
        setStockDetails(stockResponse.data);
      } catch (error) {
        setError("Failed to fetch stock details.");
      }
    };

    const fetchBlockedStocks = async () => {
      const blockedStocksConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: "http://13.51.178.27:5000/api/var/Wishlist/blockstocks",
        headers: {},
      };

      try {
        const response = await axios.request(blockedStocksConfig);
        setBlockedStocks(response.data);
        console.log(response.data);
      } catch (error) {
        setError("Failed to fetch blocked stocks.");
      }
    };

    fetchData();
    fetchStockDetails();
    fetchBlockedStocks();
  }, [instrumentIdentifier]);

  const handleTabChange = (action) => {
    setIsBuy(action === "buy");
    setAvailableQuantity(
      action === "buy"
        ? stockDetails?.QuotationLot || 0
        : stockDetails?.QuotationLot || 0
    );
  };

  const handlePercentageChange = (percentage, action) => {
    if (!stockDetails?.QuotationLot) {
      setError("Lot size not found.");
      return;
    }

    const lotSize = stockDetails.QuotationLot;
    const adjustmentAmount = lotSize * percentage;

    const currentAmount = isNaN(parseFloat(amount)) ? 0 : parseFloat(amount);

    let newAmount =
      action === "add"
        ? currentAmount + adjustmentAmount
        : currentAmount - adjustmentAmount;

    if (newAmount < 0) {
      setError("Cannot have a negative quantity.");
      newAmount = 0;
    }

    setAmount(newAmount.toFixed(0));
  };

  const handleTrade = async () => {
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      setError("User ID not found in token.");
      return;
    }

    // Check blocked stocks
    const blockedStock = blockedStocks.find(
      (stock) => stock.symbol === stockDetails?.name
    );
    if (blockedStock) {
      const blockQuantity = blockedStock.quantity;
      const tradeQuantity = parseFloat(amount);

      if (tradeQuantity > blockQuantity) {
        setError(
          `Trade limit exceeded. Max quantity available is ${blockQuantity}`
        );
        return;
      }
    }

    // Get current time in India/Kolkata timezone
    const indiaTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = new Date(indiaTime);

    let startHour, startMinute, endHour, endMinute;
    const exchange = stockDetails?.Exchange.toUpperCase();
    if (exchange === "NSE") {
      startHour = 9;
      startMinute = 15;
      endHour = 15;
      endMinute = 30;
    } else if (exchange === "MCX") {
      startHour = 9;
      startMinute = 0;
      endHour = 23;
      endMinute = 30;
    } else {
      setError("Unsupported exchange");
      return;
    }

    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(currentTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (currentTime < startTime || currentTime > endTime) {
      toast.error(
        `Trading on ${exchange} is only allowed between ${startHour}:${
          startMinute < 10 ? "0" + startMinute : startMinute
        } AM and ${endHour}:${endMinute < 10 ? "0" + endMinute : endMinute} PM.`
      );
      return;
    }

    const data = {
      _id: userId,
      instrumentIdentifier: instrumentIdentifier,
      name: stockDetails?.name,
      exchange: stockDetails?.Exchange,
      trade_type: isBuy ? "buy" : "sell",
      quantity: parseFloat(amount),
      price: isBuy ? stockDetails?.BuyPrice : stockDetails?.SellPrice,
    };

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://13.51.178.27:5000/api/var/client/trades",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      await axios.request(config);
      toast.success("Trade successful!");
      navigate("/portfolio");
    } catch (err) {
      console.error("Error making trade:", err);
      setError("Failed to submit trade.");
    }
  };

  if (!instrumentData || !stockDetails) {
    return <Spinner />;
  }

  const { netBuyQuantity, netSellQuantity } = instrumentData;
  const { Exchange, QuotationLot, SellPrice, BuyPrice, name } = stockDetails;

  return (
    <>
      <TopNavbar toggleSidebar={toggleView} />
      <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
      <main className="flex-1">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
            {/* Stock Information Section */}
            <div className="flex flex-col items-center mb-6 text-center shadow-lg p-6 bg-white rounded-lg">
              <p className="text-2xl font-semibold mb-4 text-blue-900">
                {name}
              </p>
              <div className="flex items-center">
                <p className="text-lg font-medium text-gray-600 mr-4">
                  Exchange: {Exchange}
                </p>
                <p className="text-lg font-medium text-gray-600">
                  Lot Size: {QuotationLot}
                </p>
              </div>
            </div>

            <div className="flex justify-around mb-4">
              {isBuy && (
                <button
                  className={`flex-1 text-center py-2 border-b-4 ${
                    isBuy ? "border-green-500" : "border-transparent"
                  }`}
                  onClick={() => handleTabChange("buy")}
                >
                  <span
                    className={`text-xl font-bold ${
                      isBuy ? "text-green-500" : "text-gray-500"
                    }`}
                  >
                    BUY
                  </span>
                </button>
              )}

              {!isBuy && (
                <button
                  className={`flex-1 text-center py-2 border-b-4 ${
                    !isBuy ? "border-red-500" : "border-transparent"
                  }`}
                  onClick={() => handleTabChange("sell")}
                >
                  <span
                    className={`text-xl font-bold ${
                      !isBuy ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    SELL
                  </span>
                </button>
              )}
            </div>

            {isBuy ? (
              <div className="text-center mb-4">
                <p className="text-lg font-medium text-gray-600">
                  Buy Price: ₹{BuyPrice}
                </p>
              </div>
            ) : (
              <div className="text-center mb-4">
                <p className="text-lg font-medium text-gray-600">
                  Sell Price: ₹{SellPrice}
                </p>
              </div>
            )}

            <div className="text-center mb-4">
              {netBuyQuantity !== 0 && (
                <p className="text-lg font-medium text-gray-600">
                  Net Buy Quantity: {netBuyQuantity}
                </p>
              )}
              {netSellQuantity !== 0 && (
                <p className="text-lg font-medium text-gray-600">
                  Net Sell Quantity: {netSellQuantity}
                </p>
              )}
            </div>

            <div className="flex items-center mb-4">
              <input
                type="text"
                className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly
              />
            </div>

            <div className="flex justify-around mb-4 gap-2">
              {Exchange !== "MCX" && (
                <>
                  <button
                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                    onClick={() => handlePercentageChange(0.25, "subtract")}
                  >
                    <FaMinus className="text-white" />
                  </button>
                  <span>25%</span>
                  <button
                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                    onClick={() => handlePercentageChange(0.25, "add")}
                  >
                    <FaPlus className="text-white" />
                  </button>

                  <button
                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                    onClick={() => handlePercentageChange(0.5, "subtract")}
                  >
                    <FaMinus className="text-white" />
                  </button>
                  <span>50%</span>
                  <button
                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                    onClick={() => handlePercentageChange(0.5, "add")}
                  >
                    <FaPlus className="text-white" />
                  </button>
                </>
              )}

              <button
                className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                onClick={() => handlePercentageChange(1.0, "subtract")}
              >
                <FaMinus className="text-white" />
              </button>
              <span>100%</span>
              <button
                className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                onClick={() => handlePercentageChange(1.0, "add")}
              >
                <FaPlus className="text-white" />
              </button>
            </div>

            <button
              className={`w-full py-3 mt-6 rounded-lg ${
                isBuy ? "bg-green-500 text-white" : "bg-red-500 text-white"
              } text-lg font-semibold`}
              onClick={handleTrade}
            >
              {isBuy ? "BUY" : "SELL"}
            </button>
          </div>
        </div>
      </main>
      <BottomNav />
      <ToastContainer />
    </>
  );
};

export default InstrumentDetails;
