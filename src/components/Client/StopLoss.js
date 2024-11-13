import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaMinus, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";

/**
 * StopLossScreen Component
 * - Fetches stock data and trading hours based on the selected instrument.
 * - Displays stock information and integrates the BuySellPage component for stop-loss operations.
 */
const StopLossScreen = () => {
  const { instrumentId } = useParams();
  const [stockData, setStockData] = useState(null);
  const [tradingHours, setTradingHours] = useState(null); // New state for trading hours
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  /**
   * Toggles the sidebar visibility.
   */
  const toggleView = () => {
    setIsToggled(!isToggled);
  };

  /**
   * Fetches stock data and trading hours from the API.
   * Implements polling every 10 seconds to refresh data.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("StocksUsertoken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Decode token to get client ID if needed
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id; // Not used in this component but may be needed

        // Fetch stock data
        const stockResponse = await axios.get(
          `http://13.61.104.53:5000/api/var/client/stocks/${instrumentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStockData(stockResponse.data);

        // Fetch trading hours based on exchange
        const exchange = stockResponse.data.Exchange;
        const tradingHoursResponse = await axios.get(
          `http://13.61.104.53:5000/api/var/trading-hours/${exchange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTradingHours(tradingHoursResponse.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message || "Error fetching stock or trading data"
        );
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling every 10 seconds if real-time updates are needed
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000); // 10,000 ms = 10 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [instrumentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const {
    Exchange = "N/A",
    InstrumentIdentifier = "N/A",
    BuyPrice = 0,
    SellPrice = 0,
    name = "N/A",
    QuotationLot = 0,
    tradeId = "",
  } = stockData || {};

  const isMCX = Exchange.toUpperCase() === "MCX";
  const isSpecialInstrument = ["CRUDEOIL", "COPPER", "NATURALGAS"].includes(
    name.toUpperCase()
  );

  return (
    <>
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <TopNavbar toggleSidebar={toggleView} />
        <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
      </div>

      {/* Page Content */}
      <div className="pt-16 bg-gray-100 min-h-screen">
        <div className="p-4">
          {/* Stock Information Section */}
          <div className="flex flex-col items-center text-center shadow-lg p-4 bg-white rounded-lg">
            <p className="text-2xl font-semibold text-blue-900">{name}</p>
            <div className="flex items-center">
              <p className="text-lg font-medium text-gray-600 mr-4">
                Exchange: {Exchange}
              </p>
              <p className="text-lg font-medium text-gray-600">
                Lot Size: {QuotationLot}
              </p>
            </div>
          </div>

          {/* StopLoss Section */}
          {tradingHours ? (
            <BuySellPage
              buyPrice={BuyPrice}
              sellPrice={SellPrice}
              lotSize={QuotationLot}
              instrumentId={instrumentId}
              tradeId={tradeId}
              exchange={Exchange}
              isMCX={isMCX}
              isSpecialInstrument={isSpecialInstrument}
              tradingHours={tradingHours} // Pass trading hours as prop
              actionType="stoploss" // Specify action type
            />
          ) : (
            <p className="text-center text-red-500">
              Unable to load trading hours.
            </p>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md">
        <BottomNav />
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

/**
 * BuySellPage Component
 * - Handles buy/sell/stop-loss operations based on user interactions.
 * - Validates trading time against fetched trading hours.
 * - Submits trade data to the API.
 */
const BuySellPage = ({
  buyPrice,
  sellPrice,
  lotSize,
  instrumentId,
  tradeId,
  exchange,
  isMCX,
  isSpecialInstrument,
  tradingHours, // Receive trading hours as prop
  actionType, // "buy", "sell", or "stoploss"
}) => {
  const [quantity, setQuantity] = useState(0);
  const [inputPrice, setInputPrice] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button

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
   * Determines the action based on input price relative to buy/sell prices.
   * @returns {string} - "BUY", "SELL", or "Invalid"
   */
  const determineButtonAction = () => {
    const price = parseFloat(inputPrice);
    if (actionType === "stoploss") {
      // Define logic specific to stop-loss if needed
      // For example, setting stop-loss sell if price <= sellPrice
      if (price <= sellPrice) {
        return "SELL";
      } else if (price >= buyPrice) {
        return "BUY";
      } else {
        return "Invalid";
      }
    }
    // Add additional action types if necessary
    return "Invalid";
  };

  /**
   * Handles increasing the quantity based on the selected percentage.
   * @param {number} percentage - Percentage to increase
   */
  const handlePercentageClick = (percentage) => {
    const calculatedQuantity = (lotSize * percentage) / 100;
    setQuantity((prevQuantity) =>
      (parseFloat(prevQuantity) + calculatedQuantity).toFixed(2)
    );
    setError("");
  };

  /**
   * Handles decreasing the quantity based on the selected percentage.
   * Ensures the quantity doesn't go below zero.
   * @param {number} percentage - Percentage to decrease
   */
  const handleDecreasePercentageClick = (percentage) => {
    const calculatedQuantity = (lotSize * percentage) / 100;
    setQuantity((prevQuantity) =>
      Math.max(0, (parseFloat(prevQuantity) - calculatedQuantity).toFixed(2))
    );
    setError("");
  };

  /**
   * Handles manual quantity input change.
   * @param {object} e - Event object
   */
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value ? parseFloat(value) : 0);
  };

  /**
   * Handles manual input price change.
   * @param {object} e - Event object
   */
  const handleInputPriceChange = (e) => {
    const value = e.target.value;
    setInputPrice(value);
  };

  /**
   * Handles the stop-loss submission.
   * Validates trading time and submits data to the API.
   */
  const handleStopLossSubmit = async () => {
    setIsSubmitting(true); // Set isSubmitting to true

    const action = determineButtonAction().toLowerCase();
    let price;
    if (action === "buy") {
      price = buyPrice;
    } else if (action === "sell") {
      price = sellPrice;
    } else {
      toast.error("Invalid price");
      setIsSubmitting(false); // Reset isSubmitting
      return;
    }

    if (quantity <= 0 || isNaN(quantity)) {
      toast.error("Invalid quantity");
      setIsSubmitting(false); // Reset isSubmitting
      return;
    }

    // Get current date and time in India timezone
    const indiaTimeString = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = new Date(indiaTimeString);
    const currentDay = currentTime.getDay(); // 0 = Sunday, 6 = Saturday

    // Block trades on weekends
    if (currentDay === 0 || currentDay === 7) {
      toast.error("Trading is not allowed on Saturdays and Sundays.");
      setIsSubmitting(false); // Reset isSubmitting
      return;
    }

    const { startHour, startMinute, endHour, endMinute } = tradingHours;

    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(currentTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Check if the current time is within the allowed trading window
    if (currentTime < startTime || currentTime > endTime) {
      toast.error(
        `Trading on ${exchange.toUpperCase()} is only allowed between ${formatTime(
          startHour,
          startMinute
        )} and ${formatTime(endHour, endMinute)}.`
      );
      setIsSubmitting(false); // Reset isSubmitting
      return;
    }

    const token = localStorage.getItem("StocksUsertoken");
    if (!token) {
      toast.error("Authentication token not found.");
      setIsSubmitting(false); // Reset isSubmitting
      return;
    }

    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;

    // Calculate stoplossPercentage and make it negative for sell actions
    let stoplossPercentage = (quantity / lotSize) * 100;
    if (action === "sell") {
      stoplossPercentage = -Math.abs(stoplossPercentage);
    }

    try {
      const response = await axios.post(
        "http://13.61.104.53:5000/api/var/client/add/stoploss",
        {
          userId: userId,
          instrumentIdentifier: instrumentId,
          stopPrice: inputPrice,
          quantity: quantity,
          stoplossPercentage: stoplossPercentage.toFixed(2),
          tradeType: action,
          exchange: exchange,
          tradeId: tradeId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("StopLoss submitted successfully!");
      // Clear form or handle success here
      setQuantity(0);
      setInputPrice("");
    } catch (error) {
      console.error("StopLoss Error:", error);
      const errorMessage =
        error.response?.data?.message || "Cannot Commit Stoploss";
      const remainingBuy = error.response?.data?.remainingBuy || 0;
      const remainingSell = error.response?.data?.remainingSell || 0;

      const adjustedRemainingBuy = (remainingBuy / 100) * lotSize;
      const adjustedRemainingSell = (remainingSell / 100) * lotSize;

      const completeErrorMessage = `${errorMessage}\nRemaining Buy: ${adjustedRemainingBuy}\nRemaining Sell: ${adjustedRemainingSell}`;

      toast.error(completeErrorMessage);
    } finally {
      setIsSubmitting(false); // Reset isSubmitting after API call
    }
  };

  const buttonAction = determineButtonAction();

  return (
    <div className="flex justify-center mt-3 items-center h-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between mb-2">
          <p className="text-lg font-medium text-green-600">
            Buy Price: ₹{buyPrice}
          </p>
          <p className="text-lg font-medium text-red-600">
            Sell Price: ₹{sellPrice}
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Quantity</span>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="number"
              className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
              placeholder="Quantity"
              value={quantity}
              onChange={handleQuantityChange}
              readOnly
            />
          </div>

          {/* Percentage Buttons */}
          <div className="flex justify-around mb-4 gap-2">
            {isMCX && isSpecialInstrument && (
              <>
                <button
                  className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                  onClick={() => handleDecreasePercentageClick(50)}
                >
                  <FaMinus className="text-white" />
                </button>
                <span>50%</span>
                <button
                  className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                  onClick={() => handlePercentageClick(50)}
                >
                  <FaPlus className="text-white" />
                </button>
              </>
            )}

            {!isMCX && (
              <>
                <button
                  className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                  onClick={() => handleDecreasePercentageClick(25)}
                >
                  <FaMinus className="text-white" />
                </button>
                <span>25%</span>
                <button
                  className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                  onClick={() => handlePercentageClick(25)}
                >
                  <FaPlus className="text-white" />
                </button>

                <button
                  className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                  onClick={() => handleDecreasePercentageClick(50)}
                >
                  <FaMinus className="text-white" />
                </button>
                <span>50%</span>
                <button
                  className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                  onClick={() => handlePercentageClick(50)}
                >
                  <FaPlus className="text-white" />
                </button>
              </>
            )}

            {/* Only one 100% button displayed here */}
            <button
              className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
              onClick={() => handleDecreasePercentageClick(100)}
            >
              <FaMinus className="text-white" />
            </button>
            <span>100%</span>
            <button
              className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
              onClick={() => handlePercentageClick(100)}
            >
              <FaPlus className="text-white" />
            </button>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-gray-600">StopLoss Price</span>
            <span className="text-gray-600">INR</span>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="number"
              className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
              placeholder="Enter Price"
              value={inputPrice}
              onChange={handleInputPriceChange}
            />
          </div>

          <button
            className={`mt-4 w-full py-3 rounded-lg ${
              buttonAction === "BUY"
                ? "bg-green-500 text-white"
                : buttonAction === "SELL"
                ? "bg-red-500 text-white"
                : "bg-gray-400 text-white"
            }`}
            onClick={handleStopLossSubmit}
            disabled={isSubmitting || buttonAction === "Invalid"}
          >
            {isSubmitting
              ? "Processing..."
              : buttonAction === "BUY"
              ? "BUY"
              : buttonAction === "SELL"
              ? "SELL"
              : "Invalid Price"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StopLossScreen;
