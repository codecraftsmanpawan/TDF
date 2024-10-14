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
  const [maxAllowedAmount, setMaxAllowedAmount] = useState(Infinity);
  const [netbanQuantity, setnetbanQuantity] = useState(30);

  const toggleView = () => setIsToggled(!isToggled);

  const getToken = () => localStorage.getItem("StocksUsertoken");

  const getUserIdFromToken = () => {
    const token = getToken();
    return token ? jwtDecode(token).id : null;
  };

  useEffect(() => {
    fetchBlockedStocks(instrumentIdentifier);
  }, [instrumentIdentifier]);

  const fetchBlockedStocks = async (instrumentIdentifier) => {
    const blockedStocksConfig = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://13.51.178.27:5000/api/var/Wishlist/blockstocks",
      headers: {},
    };

    try {
      const response = await axios.request(blockedStocksConfig);
      setBlockedStocks(response.data);

      if (!instrumentIdentifier) {
        return;
      }

      const symbol = instrumentIdentifier.split("_")[1];

      // Check if the current stock is in blocked stocks
      const currentStockBlocked = response.data.find(
        (stock) => stock.symbol === symbol
      );

      if (currentStockBlocked) {
        console.log(`Current stock '${symbol}' blocked status: Blocked`);
        setMaxAllowedAmount(netbanQuantity);
      } else {
        console.log(`Current stock '${symbol}' blocked status: Not blocked`);
        setMaxAllowedAmount(Infinity);
      }
    } catch (error) {
      setError("Failed to fetch blocked stocks.");
      console.error("Error fetching blocked stocks:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return setError("Authentication token not found.");

      const userId = getUserIdFromToken();
      if (!userId) return setError("User ID not found in token.");

      try {
        const response = await axios.get(
          `http://13.51.178.27:5000/api/var/client/instrument/${instrumentIdentifier}/trades/?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInstrumentData(response.data);

        if (response.data.trades.length > 0) {
          setIsBuy(response.data.trades[0].action === "buy");
        }

        const initialQuantity = response.data.trades.reduce(
          (acc, trade) => acc + (trade.action === "buy" ? trade.quantity : 0),
          0
        );
        setAvailableQuantity(initialQuantity);
      } catch (err) {
        setError("Failed to fetch instrument data.");
      }
    };

    const fetchStockDetails = async () => {
      const token = getToken();
      if (!token) return setError("Authentication token not found.");

      try {
        const stockResponse = await axios.get(
          `http://13.51.178.27:5000/api/var/client/stocks/${instrumentIdentifier}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStockDetails(stockResponse.data);
      } catch (error) {
        setError("Failed to fetch stock details.");
      }
    };

    fetchData();
    fetchStockDetails();
    fetchBlockedStocks();
  }, [instrumentIdentifier]);

  const handleTabChange = (action) => {
    setIsBuy(action === "buy");
    setAvailableQuantity(stockDetails?.QuotationLot || 0);
  };

  const handlePercentageChange = (percentage, action) => {
    const lotSize = stockDetails?.QuotationLot;
    if (!lotSize) return setError("Lot size not found.");

    const adjustmentAmount = lotSize * percentage;
    const currentAmount = parseFloat(amount) || 0;
    let newAmount =
      action === "add"
        ? currentAmount + adjustmentAmount
        : currentAmount - adjustmentAmount;

    if (newAmount < 0) {
      toast.error("Cannot have a negative quantity.");
      newAmount = 0;
    } else if (newAmount > maxAllowedAmount) {
      toast.error(
        `Cannot exceed the maximum allowed amount of ${maxAllowedAmount}.`
      );
      newAmount = maxAllowedAmount;
    }

    setAmount(newAmount.toFixed(0));
  };
  const handleTrade = async () => {
    const token = getToken();
    if (!token) return setError("Authentication token not found.");

    const userId = getUserIdFromToken();
    if (!userId) return setError("User ID not found in token.");

    const blockedStock = blockedStocks.find(
      (stock) => stock.symbol === stockDetails?.name
    );
    if (blockedStock && parseFloat(amount) > blockedStock.quantity) {
      return toast.error(
        `Trade limit exceeded. Max quantity available is ${blockedStock.quantity}`
      );
    }

    const lotSize = stockDetails?.QuotationLot;
    const calculatedTradePercentage = (parseFloat(amount) / lotSize) * 100;

    // Get current time in India/Kolkata timezone
    const indiaTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = new Date(indiaTime);

    // Get the current day of the week (0 = Sunday, 6 = Saturday)
    const currentDay = currentTime.getDay();

    // No trading on Saturday (6) or Sunday (0)
    if (currentDay === 0 || currentDay === 6) {
      return toast.error("Trading is not allowed on Saturdays and Sundays.");
    }

    let startHour, startMinute, endHour, endMinute;

    // Set trading hours based on the exchange
    if (stockDetails?.Exchange.toUpperCase() === "NSE") {
      // NSE trading hours (9:15 AM to 3:30 PM)
      startHour = 9;
      startMinute = 15;
      endHour = 15;
      endMinute = 30;
    } else if (stockDetails?.Exchange.toUpperCase() === "MCX") {
      // MCX trading hours (9:15 AM to 11:30 PM)
      startHour = 9;
      startMinute = 15;
      endHour = 23;
      endMinute = 30;
    }

    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(currentTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Check if the current time is outside of trading hours
    if (currentTime < startTime || currentTime > endTime) {
      return toast.error(
        `Trading on ${stockDetails?.Exchange.toUpperCase()} is only allowed between ${startHour}:${
          startMinute < 10 ? "0" + startMinute : startMinute
        } AM and ${endHour}:${endMinute < 10 ? "0" + endMinute : endMinute} PM.`
      );
    }

    const data = {
      _id: userId,
      instrumentIdentifier,
      name: stockDetails?.name,
      exchange: stockDetails?.Exchange,
      trade_type: isBuy ? "buy" : "sell",
      quantity: parseFloat(amount),
      tradePercentage: isBuy
        ? calculatedTradePercentage
        : -calculatedTradePercentage,
      price: isBuy ? stockDetails?.BuyPrice : stockDetails?.SellPrice,
    };

    try {
      await axios.post("http://13.51.178.27:5000/api/var/client/trades", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(
        `Trade successful! Trade Percentage: ${data.tradePercentage.toFixed(
          2
        )}%`
      );
      navigate("/portfolio");
    } catch (error) {
      console.error("Error making trade:", error);

      const errorMessage =
        error.response?.data?.message || "Error making trade";
      const remainingBuy = error.response?.data?.remainingBuy || 0;
      const remainingSell = error.response?.data?.remainingSell || 0;

      const adjustedRemainingBuy = (remainingBuy / 100) * lotSize;
      const adjustedRemainingSell = (remainingSell / 100) * lotSize;

      // Format the error message for display in the toast
      const completeErrorMessage = `
Error: ${errorMessage}
Remaining Buy: ${adjustedRemainingBuy} units
Remaining Sell: ${adjustedRemainingSell} units
`;

      // Display the full error in the toast and setError state
      setError(completeErrorMessage);
    }
  };

  // const handleTrade = async () => {
  //   const token = getToken();
  //   if (!token) return setError("Authentication token not found.");

  //   const userId = getUserIdFromToken();
  //   if (!userId) return setError("User ID not found in token.");

  //   const blockedStock = blockedStocks.find(
  //     (stock) => stock.symbol === stockDetails?.name
  //   );
  //   if (blockedStock && parseFloat(amount) > blockedStock.quantity) {
  //     return setError(
  //       `Trade limit exceeded. Max quantity available is ${blockedStock.quantity}`
  //     );
  //   }

  //   const currentTime = new Date(
  //     new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  //   );

  //   const exchangeTimes = {
  //     NSE: { start: [9, 15], end: [15, 30] },
  //     MCX: { start: [9, 0], end: [23, 30] },
  //   };

  //   const exchange = stockDetails?.Exchange.toUpperCase();
  //   if (!exchangeTimes[exchange]) return setError("Unsupported exchange");

  //   const [startHour, startMinute] = exchangeTimes[exchange].start;
  //   const [endHour, endMinute] = exchangeTimes[exchange].end;

  //   const startTime = new Date(currentTime).setHours(
  //     startHour,
  //     startMinute,
  //     0,
  //     0
  //   );
  //   const endTime = new Date(currentTime).setHours(endHour, endMinute, 0, 0);

  //   if (currentTime < startTime || currentTime > endTime) {
  //     return toast.error(
  //       `Trading on ${exchange} is only allowed between ${startHour}:${
  //         startMinute < 10 ? "0" + startMinute : startMinute
  //       } AM and ${endHour}:${endMinute < 10 ? "0" + endMinute : endMinute} PM.`
  //     );
  //   }

  //   const data = {
  //     _id: userId,
  //     instrumentIdentifier,
  //     name: stockDetails?.name,
  //     exchange: stockDetails?.Exchange,
  //     trade_type: isBuy ? "buy" : "sell",
  //     quantity: parseFloat(amount),
  //     price: isBuy ? stockDetails?.BuyPrice : stockDetails?.SellPrice,
  //   };

  //   try {
  //     await axios.post("http://13.51.178.27:5000/api/var/client/trades", data, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     toast.success("Trade successful!");
  //     navigate("/portfolio");
  //   } catch (err) {
  //     console.error("Error making trade:", err);
  //     setError("Failed to submit trade.");
  //   }
  // };

  if (!instrumentData || !stockDetails) return <Spinner />;

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
                type="number"
                className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
                value={amount}
                onChange={(e) => {
                  const newAmount = parseFloat(e.target.value) || 0;

                  if (newAmount > maxAllowedAmount) {
                    alert(`The maximum allowed amount is ${maxAllowedAmount}`);
                    setAmount(maxAllowedAmount.toString());
                  } else {
                    setAmount(newAmount.toString());
                  }
                }}
                max={maxAllowedAmount}
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
