import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";
import { FaMinus, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const TradeScreen = () => {
  const { instrumentId } = useParams();
  const [isToggled, setIsToggled] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState("");

  const toggleView = () => {
    setIsToggled(!isToggled);
  };
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `http://13.51.178.27:5000/api/var/client/stocks/${instrumentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "StocksUsertoken"
              )}`,
            },
          }
        );
        setStockData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching stock data");
        setLoading(false);
      }
    };

    fetchStockData();

    // Set up polling every second
    const intervalId = setInterval(() => {
      fetchStockData();
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [instrumentId]);

  useEffect(() => {
    // Decode the token and extract client_id
    const token = localStorage.getItem("StocksUsertoken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setClientId(decodedToken.id);
      } catch (e) {
        console.error("Error decoding token:", e);
        setError("Error decoding token");
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spinner />
      </div>
    );
  }

  // if (error) {
  //     return (
  //         <div className="flex justify-center items-center h-screen bg-gray-100">
  //             <div className="text-red-500 text-center">
  //                 <p>{error}</p>
  //             </div>
  //         </div>
  //     );
  // }

  const {
    Exchange = "N/A",
    InstrumentIdentifier = "N/A",
    BuyPrice = 0,
    SellPrice = 0,
    name = "N/A",
    High = 0,
    Low = 0,
    LastTradePrice = 0,
    Open = 0,
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
          <BuySellPage
            buyPrice={BuyPrice}
            sellPrice={SellPrice}
            lotSize={QuotationLot}
            exchange={Exchange}
            instrumentIdentifier={InstrumentIdentifier}
            name={name}
            clientId={clientId}
          />
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

const BuySellPage = ({
  buyPrice,
  sellPrice,
  lotSize,
  exchange,
  instrumentIdentifier,
  name,
  clientId,
}) => {
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  const handleTabChange = (tab) => {
    setIsBuy(tab === "buy");
    setAmount(0);
  };

  const handlePercentageClick = (percentage) => {
    const calculatedAmount = (lotSize * percentage) / 100;
    setAmount((prevAmount) =>
      (parseFloat(prevAmount) + calculatedAmount).toFixed(2)
    );
  };

  const handleDecreasePercentageClick = (percentage) => {
    const calculatedAmount = (lotSize * percentage) / 100;
    setAmount((prevAmount) =>
      Math.max(0, (parseFloat(prevAmount) - calculatedAmount).toFixed(2))
    );
  };

  const handleAmountChange = (change) => {
    setAmount((prevAmount) =>
      Math.max(0, (parseFloat(prevAmount) + change).toFixed(2))
    );
  };

  //   const handleTrade = async () => {
  //     const tradeType = isBuy ? "buy" : "sell";

  //     // Calculate trade percentage based on the quantity and quotation lot
  //     const calculatedTradePercentage = (parseFloat(amount) / lotSize) * 100;

  //     const data = {
  //       _id: clientId,
  //       instrumentIdentifier: instrumentIdentifier,
  //       name: name,
  //       exchange: exchange,
  //       trade_type: tradeType,
  //       quantity: parseFloat(amount),
  //       // If tradeType is "sell", make the percentage negative
  //       tradePercentage:
  //         tradeType === "sell"
  //           ? -calculatedTradePercentage
  //           : calculatedTradePercentage,
  //       price: isBuy ? buyPrice : sellPrice,
  //     };

  //     try {
  //       const response = await axios.post(
  //         "http://13.51.178.27:5000/api/var/client/trades",
  //         data,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${localStorage.getItem("StocksUsertoken")}`,
  //           },
  //         }
  //       );

  //       // Log the response to the console
  //       console.log("Trade Response:", response.data);
  //       toast.success("Trade successful!");
  //     } catch (error) {
  //       // Check if the error response has data and message
  //       const errorMessage =
  //         error.response?.data?.message || "Error making trade";
  //       const remainingBuy = error.response?.data?.remainingBuy || 0;
  //       const remainingSell = error.response?.data?.remainingSell || 0;

  //       // Calculate adjusted remaining values based on the lotSize
  //       const adjustedRemainingBuy = (remainingBuy / 100) * lotSize;
  //       const adjustedRemainingSell = (remainingSell / 100) * lotSize;

  //       // Construct the complete error message with line breaks
  //       const completeErrorMessage = `

  //   Remaining Buy: ${adjustedRemainingBuy}\n
  //   Remaining Sell: ${adjustedRemainingSell}
  // `;

  //       toast.error(completeErrorMessage);
  //     }
  //   };

  const handleTrade = async () => {
    const tradeType = isBuy ? "buy" : "sell";

    // Get current time in India/Kolkata timezone using moment-timezone for accuracy
    const indiaTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTime = new Date(indiaTime);

    // Get the current day of the week (0 = Sunday, 6 = Saturday)
    const currentDay = currentTime.getDay();

    // No trading on Saturday (6) or Sunday (0)
    if (currentDay === 0 || currentDay === 6) {
      toast.error("Trading is not allowed on Saturdays and Sundays.");
      return;
    }

    let startHour, startMinute, endHour, endMinute;

    // Set trading hours based on the exchange
    if (exchange.toUpperCase() === "NSE") {
      // NSE trading hours (9:15 AM to 3:30 PM)
      startHour = 9;
      startMinute = 15;
      endHour = 15;
      endMinute = 30;
    } else if (exchange.toUpperCase() === "MCX") {
      // MCX trading hours (9:00 AM to 11:30 PM)
      startHour = 9;
      startMinute = 0;
      endHour = 23;
      endMinute = 30;
    }

    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(currentTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Check if the current time is outside of trading hours
    if (currentTime < startTime || currentTime > endTime) {
      toast.error(
        `Trading on ${exchange.toUpperCase()} is only allowed between ${startHour}:${
          startMinute < 10 ? "0" + startMinute : startMinute
        } AM and ${endHour}:${endMinute < 10 ? "0" + endMinute : endMinute} PM.`
      );
      return;
    }

    // Calculate trade percentage based on the quantity and quotation lot
    const calculatedTradePercentage = (parseFloat(amount) / lotSize) * 100;

    const data = {
      _id: clientId,
      instrumentIdentifier: instrumentIdentifier,
      name: name,
      exchange: exchange,
      trade_type: tradeType,
      quantity: parseFloat(amount),
      // If tradeType is "sell", make the percentage negative
      tradePercentage:
        tradeType === "sell"
          ? -calculatedTradePercentage
          : calculatedTradePercentage,
      price: isBuy ? buyPrice : sellPrice,
    };

    try {
      const response = await axios.post(
        "http://13.51.178.27:5000/api/var/client/trades",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("StocksUsertoken")}`,
          },
        }
      );

      // Log the response to the console
      console.log("Trade Response:", response.data);
      toast.success("Trade successful!");
    } catch (error) {
      // Check if the error response has data and message
      const errorMessage =
        error.response?.data?.message || "Error making trade";
      const remainingBuy = error.response?.data?.remainingBuy || 0;
      const remainingSell = error.response?.data?.remainingSell || 0;

      // Calculate adjusted remaining values based on the lotSize
      const adjustedRemainingBuy = (remainingBuy / 100) * lotSize;
      const adjustedRemainingSell = (remainingSell / 100) * lotSize;

      // Construct the complete error message with line breaks
      const completeErrorMessage = `
        ${errorMessage}\n
        Remaining Buy: ${adjustedRemainingBuy}\n
        Remaining Sell: ${adjustedRemainingSell}
      `;

      toast.error(completeErrorMessage);
    }
  };

  const isMCX = exchange.toUpperCase() === "MCX";

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

          <div className="flex justify-around mb-4 gap-2">
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
          >
            {isBuy ? "BUY" : "SELL"}
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
