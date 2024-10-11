import React, { useState } from "react";

const BuySellPage = () => {
  const [isBuy, setIsBuy] = useState(true);

  const handleTabChange = (tab) => {
    setIsBuy(tab === "buy");
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-around mb-6">
          <button
            className={`flex-1 text-center py-2 ${isBuy ? "border-b-2 border-green-500" : "border-b-2 border-transparent"} `}
            onClick={() => handleTabChange("buy")}
          >
            <span className={`text-lg font-semibold ${isBuy ? "text-green-500" : "text-gray-500"}`}>BUY</span>
          </button>
          <button
            className={`flex-1 text-center py-2 ${!isBuy ? "border-b-2 border-red-500" : "border-b-2 border-transparent"} `}
            onClick={() => handleTabChange("sell")}
          >
            <span className={`text-lg font-semibold ${!isBuy ? "text-red-500" : "text-gray-500"}`}>SELL</span>
          </button>
        </div>

        <div>
         


          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Total</span>
            <span className="text-gray-600">INR</span>
          </div>
          <input
            type="text"
            className="border rounded-lg py-2 px-4 w-full text-lg font-semibold text-blue-900"
           
            
          />

          <div className="flex justify-between mt-4">
            <div className="flex space-x-14">
              <button className="text-blue-900">25%</button>
              <button className="text-blue-900">50%</button>
              <button className="text-blue-900">75%</button>
              <button className="text-blue-900">100%</button>
            </div>
          </div>

          <button
            className={`w-full py-3 mt-6 rounded-lg ${isBuy ? "bg-green-500 text-white" : "bg-red-500 text-white"} text-lg font-semibold`}
          >
            {isBuy ? "BUY" : "SELL"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuySellPage;
