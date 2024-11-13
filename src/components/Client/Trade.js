import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Corrected import
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";
import { FaMinus, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * TradeScreen Component
 * - Fetches stock data and trading hours based on the selected instrument.
 * - Displays stock information and integrates the BuySellPage component.
 */
const TradeScreen = () => {
  const { instrumentId } = useParams();
  const [isToggled, setIsToggled] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [tradingHours, setTradingHours] = useState(null); // State for trading hours
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // State for button disabled status

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

        // Decode token to get client ID
        const decodedToken = jwtDecode(token);
        setClientId(decodedToken.id);

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

    // Set up polling every 10 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000); // 10,000 ms = 10 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [instrumentId]);

  /**
   * Renders a loading spinner while data is being fetched.
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spinner />
      </div>
    );
  }

  /**
   * Renders an error message if data fetching fails.
   */
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Destructure necessary fields from stock data
  const {
    Exchange = "N/A",
    InstrumentIdentifier = "N/A",
    BuyPrice = 0,
    SellPrice = 0,
    name = "N/A",
    QuotationLot = 0,
  } = stockData || {};

  return (
    <>
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-700 to-gray-800 shadow-md">
        <TopNavbar toggleSidebar={toggleView} />
        <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
      </div>

      {/* Page Content */}
      <div className="pt-16 bg-gradient-to-b from-gray-700 to-gray-800 min-h-screen">
        <div className="p-4">
          {/* Stock Information Section */}
          <div className="flex flex-col items-center mb-6 text-center shadow-lg p-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg">
            <p className="text-2xl font-semibold mb-4 text-gray-100">{name}</p>
            <div className="flex items-center">
              <p className="text-lg font-medium text-gray-100 mr-4">
                Exchange: {Exchange}
              </p>
              <p className="text-lg font-medium text-gray-100">
                Lot Size: {QuotationLot}
              </p>
            </div>
          </div>

          {/* Buy/Sell Section */}
          {tradingHours ? (
            <BuySellPage
              buyPrice={BuyPrice}
              sellPrice={SellPrice}
              lotSize={QuotationLot}
              exchange={Exchange}
              instrumentIdentifier={InstrumentIdentifier}
              name={name}
              clientId={clientId}
              tradingHours={tradingHours} // Passing trading hours as props
              isSubmitting={isSubmitting} // Passing isSubmitting to BuySellPage
              setIsSubmitting={setIsSubmitting} // Passing setIsSubmitting to handle submit state
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

      {/* Toast Container for Notifications */}
      <ToastContainer />
    </>
  );
};

/**
 * BuySellPage Component
 * - Handles buy/sell operations based on user interactions.
 * - Validates trading time against fetched trading hours.
 * - Submits trade data to the API.
 */
const BuySellPage = ({
  buyPrice,
  sellPrice,
  lotSize,
  exchange,
  instrumentIdentifier,
  name,
  clientId,
  tradingHours, // Receive trading hours as props
  isSubmitting, // Receive isSubmitting prop
  setIsSubmitting, // Receive setIsSubmitting prop
}) => {
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  /**
   * Handles switching between Buy and Sell tabs.
   * Resets the amount when switching.
   * @param {string} tab - "buy" or "sell"
   */
  const handleTabChange = (tab) => {
    setIsBuy(tab === "buy");
    setAmount(0);
    setError("");
  };

  /**
   * Increases the amount based on the selected percentage.
   * @param {number} percentage - Percentage to increase
   */
  const handlePercentageClick = (percentage) => {
    const calculatedAmount = (lotSize * percentage) / 100;
    setAmount((prevAmount) =>
      (parseFloat(prevAmount) + calculatedAmount).toFixed(2)
    );
    setError("");
  };

  /**
   * Decreases the amount based on the selected percentage.
   * Ensures the amount doesn't go below zero.
   * @param {number} percentage - Percentage to decrease
   */
  const handleDecreasePercentageClick = (percentage) => {
    const calculatedAmount = (lotSize * percentage) / 100;
    setAmount((prevAmount) =>
      Math.max(0, (parseFloat(prevAmount) - calculatedAmount).toFixed(2))
    );
    setError("");
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
   * Validates trading time and submits data to the API.
   */
  const handleTrade = async () => {
    setIsSubmitting(true); // Set isSubmitting to true before API call

    const tradeType = isBuy ? "buy" : "sell";

    // Get current time in India timezone
    const indiaTimeString = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = new Date(indiaTimeString);
    const currentDay = currentTime.getDay();

    // Check if current day is Saturday or Sunday
    if (currentDay === 0 || currentDay === 6) {
      toast.error("Trading is not allowed on Saturdays and Sundays.");
      setIsSubmitting(false); // Reset isSubmitting
      return;
    }

    const { startHour, startMinute, endHour, endMinute } = tradingHours;

    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(currentTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Check if current time is within trading hours
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

    // Validate that amount is greater than zero
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero.");
      setIsSubmitting(false); // Reset isSubmitting
      return;
    }

    const calculatedTradePercentage = (parseFloat(amount) / lotSize) * 100;

    const data = {
      _id: clientId,
      instrumentIdentifier,
      name,
      exchange,
      trade_type: tradeType,
      quantity: parseFloat(amount),
      tradePercentage:
        tradeType === "sell"
          ? -calculatedTradePercentage
          : calculatedTradePercentage,
      price: isBuy ? buyPrice : sellPrice,
    };

    try {
      const response = await axios.post(
        "http://13.61.104.53:5000/api/var/client/trades",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("StocksUsertoken")}`,
          },
        }
      );

      console.log("Trade Response:", response.data);
      toast.success("Trade successful!");
      setAmount(0); // Reset amount after successful trade
    } catch (err) {
      console.error("Trade Error:", err);
      const errorMessage = err.response?.data?.message || "Cannot commit trade";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false); // Reset isSubmitting after API call
    }
  };

  // Determine if the exchange is MCX and if the instrument is special
  const isMCX = exchange.toUpperCase() === "MCX";
  const isSpecialInstrument = ["CRUDEOIL", "COPPER", "NATURALGAS"].includes(
    name.toUpperCase()
  );

  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-around mb-4">
          <button
            className={`flex-1 text-center py-2 ${
              isBuy
                ? "border-b-4 border-green-500"
                : "border-b-4 border-transparent"
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
          <button
            className={`flex-1 text-center py-2 ${
              !isBuy
                ? "border-b-4 border-red-500"
                : "border-b-4 border-transparent"
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
        </div>

        <div className="text-center mb-4">
          <p className="text-lg font-medium text-gray-600">
            {isBuy ? `Buy Price: ₹${buyPrice}` : `Sell Price: ₹${sellPrice}`}
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Quantity</span>
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

          <button
            className={`w-full py-3 mt-6 rounded-lg ${
              isBuy ? "bg-green-500 text-white" : "bg-red-500 text-white"
            } text-lg font-semibold`}
            onClick={handleTrade}
            disabled={isSubmitting} // Disable button if submitting
          >
            {isSubmitting ? "Processing..." : isBuy ? "BUY" : "SELL"}{" "}
            {/* Display loading text when submitting */}
          </button>

          {error && (
            <div className="mt-4 text-red-500 text-center">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeScreen;
