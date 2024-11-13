import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrected import
import { FaMinus, FaPlus } from "react-icons/fa";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * InstrumentDetails Component
 * - Fetches instrument data, stock details, trading hours, and blocked stocks.
 * - Handles buy/sell operations with dynamic trading hours validation.
 */
const InstrumentDetails = () => {
  const { instrumentIdentifier } = useParams();
  const navigate = useNavigate();

  // State Management
  const [isToggled, setIsToggled] = useState(false);
  const [instrumentData, setInstrumentData] = useState(null);
  const [stockDetails, setStockDetails] = useState(null);
  const [blockedStocks, setBlockedStocks] = useState([]);
  const [tradingHours, setTradingHours] = useState(null);
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [maxAllowedAmount, setMaxAllowedAmount] = useState(Infinity);
  const [netbanQuantity, setNetbanQuantity] = useState(30); // Assuming this is a fixed value

  /**
   * Toggles the sidebar visibility.
   */
  const toggleView = () => setIsToggled(!isToggled);

  /**
   * Retrieves the JWT token from localStorage.
   * @returns {string|null} - The JWT token or null if not found.
   */
  const getToken = () => localStorage.getItem("StocksUsertoken");

  /**
   * Decodes the JWT token to extract the user ID.
   * @returns {string|null} - The user ID or null if not found.
   */
  const getUserIdFromToken = () => {
    const token = getToken();
    return token ? jwtDecode(token).id : null;
  };

  /**
   * Fetches blocked stocks and determines the maximum allowed amount for the current stock.
   * @param {string} instrumentIdentifier - The instrument identifier.
   */
  const fetchBlockedStocks = async (instrumentIdentifier) => {
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    const blockedStocksConfig = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://13.61.104.53:5000/api/var/Wishlist/blockstocks",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
        setMaxAllowedAmount(currentStockBlocked.quantity || netbanQuantity);
      } else {
        console.log(`Current stock '${symbol}' blocked status: Not blocked`);
        setMaxAllowedAmount(Infinity);
      }
    } catch (error) {
      setError("Failed to fetch blocked stocks.");
      console.error("Error fetching blocked stocks:", error);
    }
  };

  /**
   * Fetches instrument data, stock details, and trading hours.
   */
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

      try {
        // Fetch instrument data
        const instrumentResponse = await axios.get(
          `http://13.61.104.53:5000/api/var/client/instrument/${instrumentIdentifier}/trades/?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInstrumentData(instrumentResponse.data);

        if (instrumentResponse.data.trades.length > 0) {
          setIsBuy(instrumentResponse.data.trades[0].action === "buy");
        }

        const initialQuantity = instrumentResponse.data.trades.reduce(
          (acc, trade) => acc + (trade.action === "buy" ? trade.quantity : 0),
          0
        );
        setAvailableQuantity(initialQuantity);
      } catch (err) {
        setError("Failed to fetch instrument data.");
        console.error("Error fetching instrument data:", err);
      }
    };

    const fetchStockDetails = async () => {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      try {
        const stockResponse = await axios.get(
          `http://13.61.104.53:5000/api/var/client/stocks/${instrumentIdentifier}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStockDetails(stockResponse.data);

        // After fetching stock details, fetch trading hours
        const exchange = stockResponse.data.Exchange;
        if (exchange) {
          fetchTradingHours(exchange);
        }
      } catch (error) {
        setError("Failed to fetch stock details.");
        console.error("Error fetching stock details:", error);
      }
    };

    const fetchTradingHours = async (exchange) => {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      try {
        const tradingHoursResponse = await axios.get(
          `http://13.61.104.53:5000/api/var/trading-hours/${exchange}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTradingHours(tradingHoursResponse.data);
      } catch (error) {
        setError("Failed to fetch trading hours.");
        console.error("Error fetching trading hours:", error);
      }
    };

    fetchData();
    fetchStockDetails();
    fetchBlockedStocks(instrumentIdentifier);
  }, [instrumentIdentifier]);

  /**
   * Handles switching between Buy and Sell tabs.
   * Resets the amount and clears any errors.
   * @param {string} action - "buy" or "sell"
   */
  const handleTabChange = (action) => {
    setIsBuy(action === "buy");
    setAmount("");
    setError(null);
    setAvailableQuantity(stockDetails?.QuotationLot || 0);
  };

  /**
   * Handles percentage-based adjustments to the trade amount.
   * @param {number} percentage - The percentage to adjust (e.g., 0.25 for 25%)
   * @param {string} action - "add" or "subtract"
   */
  const handlePercentageChange = (percentage, action) => {
    const lotSize = stockDetails?.QuotationLot;
    if (!lotSize) {
      setError("Lot size not found.");
      return;
    }

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
    setError(null);
  };

  /**
   * Formats time from 24-hour to 12-hour AM/PM format.
   * @param {number} hour - Hour in 24-hour format
   * @param {number} minute - Minute
   * @returns {string} - Formatted time string
   */
  const formatTime = (hour, minute) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    return `${formattedHour}:${formattedMinute} ${ampm}`;
  };

  /**
   * Handles the trade submission.
   * Validates trading time and submits trade data to the API.
   */
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

    // Validate if the trade exceeds blocked stock limits
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
    const indiaTimeString = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = new Date(indiaTimeString);
    const currentDay = currentTime.getDay();

    // No trading on Saturday (6) or Sunday (0)
    if (currentDay === 0 || currentDay === 6) {
      return toast.error("Trading is not allowed on Saturdays and Sundays.");
    }

    // Validate trading hours
    if (tradingHours) {
      const { startHour, startMinute, endHour, endMinute } = tradingHours;

      const startTime = new Date(currentTime);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(currentTime);
      endTime.setHours(endHour, endMinute, 0, 0);

      if (currentTime < startTime || currentTime > endTime) {
        return toast.error(
          `Trading on ${stockDetails?.Exchange.toUpperCase()} is only allowed between ${formatTime(
            startHour,
            startMinute
          )} and ${formatTime(endHour, endMinute)}.`
        );
      }
    } else {
      // If trading hours are not available, prevent trading
      return toast.error(
        "Trading hours not available. Please try again later."
      );
    }

    // Validate that amount is greater than zero
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
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
      await axios.post("http://13.61.104.53:5000/api/var/client/trades", data, {
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

      const adjustedRemainingBuy = ((remainingBuy / 100) * lotSize).toFixed(2);
      const adjustedRemainingSell = ((remainingSell / 100) * lotSize).toFixed(
        2
      );

      // Format the error message for display in the toast
      const completeErrorMessage = `Error: ${errorMessage}\nRemaining Buy: ${adjustedRemainingBuy} units\nRemaining Sell: ${adjustedRemainingSell} units`;

      // Display the full error in the toast and setError state
      setError(completeErrorMessage);
      toast.error(completeErrorMessage);
    }
  };

  /**
   * Determines if the exchange is MCX and if the instrument is special.
   */
  const isMCX = stockDetails?.Exchange.toUpperCase() === "MCX";
  const isSpecialInstrument = ["CRUDEOIL", "COPPER", "NATURALGAS"].includes(
    stockDetails?.name.toUpperCase()
  );

  // Show loading spinner if data is not yet fetched
  if (!instrumentData || !stockDetails || !tradingHours) return <Spinner />;

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
                  {/* 25% Button */}
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

                  {/* 50% Button */}
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

              {/* Show 50% and 100% buttons for MCX and Special Instruments */}
              {isMCX && isSpecialInstrument && (
                <>
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
              {/* 100% Button (Always displayed) */}
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
