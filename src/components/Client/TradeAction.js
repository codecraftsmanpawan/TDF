import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode
import { FaMinus, FaPlus } from 'react-icons/fa'; 
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';

const InstrumentDetails = () => {
  const { instrumentIdentifier } = useParams();
  const [instrumentData, setInstrumentData] = useState(null);
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [stockDetails, setStockDetails] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);
const navigate = useNavigate();

  const getToken = () => {
    return localStorage.getItem('StocksUsertoken'); 
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
        setError('Authentication token not found.');
        return;
      }

      const userId = getUserIdFromToken(); // Get user ID from token
      if (!userId) {
        setError('User ID not found in token.');
        return;
      }

      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `http://16.16.64.168:5000/api/var/client/instrument/${instrumentIdentifier}/trades/?userId=${userId}`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.request(config);
        setInstrumentData(response.data);

        if (response.data.trades.length > 0) {
          const firstTradeAction = response.data.trades[0].action;
          setIsBuy(firstTradeAction === "buy");
        }

        // Set available quantity based on action
        const initialQuantity = response.data.trades.reduce((acc, trade) => {
          return trade.action === "buy" ? acc + trade.quantity : acc;
        }, 0);

        setAvailableQuantity(initialQuantity);
      } catch (err) {
        setError('Failed to fetch instrument data.');
      }
    };

    const fetchStockDetails = async () => {
      const token = getToken();
      if (!token) {
        setError('Authentication token not found.');
        return;
      }

      const stockConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `http://16.16.64.168:5000/api/var/client/stocks/${instrumentIdentifier}`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      try {
        const stockResponse = await axios.request(stockConfig);
        setStockDetails(stockResponse.data);
      } catch (error) {
        setError('Failed to fetch stock details.');
      }
    };

    fetchData();
    fetchStockDetails();
  }, [instrumentIdentifier]);

  const handleTabChange = (action) => {
    setIsBuy(action === "buy");
    setAvailableQuantity(action === "buy" ? instrumentData?.netBuyQuantity || 0 : instrumentData?.netSellQuantity || 0);
  };

  const handlePercentageChange = (percentage) => {
    if (availableQuantity > 0) {
      const newAmount = (availableQuantity * percentage).toFixed(2);
      setAmount(newAmount);
    }
  };

  const handleTrade = async () => {
    const token = getToken();
    if (!token) {
      setError('Authentication token not found.');
      return;
    }

    const userId = getUserIdFromToken(); 
    if (!userId) {
      setError('User ID not found in token.');
      return;
    }

    const data = {
      _id: userId, // Use the decoded user ID
      instrumentIdentifier: instrumentIdentifier,
      name: stockDetails?.name,
      exchange: stockDetails?.Exchange,
      trade_type: isBuy ? "buy" : "sell",
      quantity: parseFloat(amount),
      price: isBuy ? stockDetails?.BuyPrice : stockDetails?.SellPrice
    };
    console.log(data);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://16.16.64.168:5000/api/var/client/trades', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: data
    };

    try {
      await axios.request(config);
    //   alert('Trade successfully submitted!');
     navigate('/portfolio');
    } catch (err) {
      setError('Failed to submit trade.');
    }
  };

  if (!instrumentData || !stockDetails) {
    return <div>Loading...</div>;
  }

  const { netBuyQuantity, netSellQuantity } = instrumentData;
  const { Exchange, QuotationLot, SellPrice, BuyPrice, name } = stockDetails;

  return (
    <>
      <TopNavbar />
      <main className="flex-1">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">

            {/* Stock Information Section */}
            <div className="flex flex-col items-center mb-6 text-center shadow-lg p-6 bg-white rounded-lg">
              <p className="text-2xl font-semibold mb-4 text-blue-900">{name}</p>
              <div className="flex items-center">
                <p className="text-lg font-medium text-gray-600 mr-4">Exchange: {Exchange}</p>
                <p className="text-lg font-medium text-gray-600">Lot Size: {QuotationLot}</p>
              </div>
            </div>

            <div className="flex justify-around mb-4">
              {/* Only show Buy button if isBuy is true */}
              {isBuy && (
                <button
                  className={`flex-1 text-center py-2 border-b-4 ${isBuy ? "border-green-500" : "border-transparent"}`}
                  onClick={() => handleTabChange("buy")}
                >
                  <span className={`text-xl font-bold ${isBuy ? "text-green-500" : "text-gray-500"}`}>BUY</span>
                </button>
              )}

              {/* Only show Sell button if isBuy is false */}
              {!isBuy && (
                <button
                  className={`flex-1 text-center py-2 border-b-4 ${!isBuy ? "border-red-500" : "border-transparent"}`}
                  onClick={() => handleTabChange("sell")}
                >
                  <span className={`text-xl font-bold ${!isBuy ? "text-red-500" : "text-gray-500"}`}>SELL</span>
                </button>
              )}
            </div>

            {isBuy ? (
              <div className="text-center mb-4">
                <p className="text-lg font-medium text-gray-600">Buy Price: ₹{BuyPrice}</p>
              </div>
            ) : (
              <div className="text-center mb-4">
                <p className="text-lg font-medium text-gray-600">Sell Price: ₹{SellPrice}</p>
              </div>
            )}

            {/* Conditionally display Net Quantities */}
            <div className="text-center mb-4">
              {netBuyQuantity !== 0 && (
                <p className="text-lg font-medium text-gray-600">Net Buy Quantity: {netBuyQuantity}</p>
              )}
              {netSellQuantity !== 0 && (
                <p className="text-lg font-medium text-gray-600">Net Sell Quantity: {netSellQuantity}</p>
              )}
            </div>

            {/* Trade Quantity Input */}
            <div className="flex items-center mb-4">
              <input
                type="text"
                className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900 mx-2 text-center"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Adjust Quantity by Percentage */}
            <div className="flex justify-around mb-4 gap-2">
              <button
                className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                onClick={() => handlePercentageChange(0.25)}
              >
                             <FaMinus className="text-white" />
                 </button>
                 <span>25%</span>
                 <button
                   className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                   onClick={() => handlePercentageChange(0.25)}
                 >
                   <FaPlus className="text-white" />
                 </button>

                 <button
                   className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                   onClick={() => handlePercentageChange(0.50)}
                 >
                   <FaMinus className="text-white" />
                 </button>
                 <span>50%</span>
                 <button
                   className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                   onClick={() => handlePercentageChange(0.50)}
                 >
                   <FaPlus className="text-white" />
                 </button>

                 <button
                   className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                   onClick={() => handlePercentageChange(1.0)}
                 >
                   <FaMinus className="text-white" />
                 </button>
                 <span>100%</span>
                 <button
                   className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                   onClick={() => handlePercentageChange(1.0)}
                 >
                   <FaPlus className="text-white" />
                 </button>
               </div>

               {/* Submit Trade */}
               <button
                 className={`w-full py-3 mt-6 rounded-lg ${isBuy ? "bg-green-500 text-white" : "bg-red-500 text-white"} text-lg font-semibold`}
                 onClick={handleTrade}
               >
                 {isBuy ? "BUY" : "SELL"}
               </button>
             </div>
           </div>
         </main>
         <BottomNav />
       </>
     );
   };

   export default InstrumentDetails;

