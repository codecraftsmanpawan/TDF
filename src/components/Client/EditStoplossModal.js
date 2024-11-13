import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const EditStoplossModal = ({ stoploss, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    stopPrice: "",
    quantity: "",
    tradeType: "buy",
    exchange: "",
    name: "",
  });

  // Set form data when stoploss prop is available
  useEffect(() => {
    if (stoploss) {
      setFormData({
        stopPrice: stoploss.stopPrice,
        quantity: stoploss.quantity,
        tradeType: stoploss.tradeType || "buy",
        exchange: stoploss.stockExchange || "",
        name: stoploss.stockName || "",
      });
    }
  }, [stoploss]);

  // Handle input changes for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Adjust quantity by a given percentage
  const handlePercentageChange = (percentage) => {
    setFormData((prevData) => ({
      ...prevData,
      quantity: Math.max(
        0,
        (parseFloat(prevData.quantity) || 0) * (1 + percentage)
      ).toFixed(2),
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  // Get percentage options based on exchange and stock name
  const getPercentageOptions = () => {
    const isSpecialInstrument = ["CRUDEOIL", "COPPER", "NATURALGAS"].includes(
      formData.name.toUpperCase()
    );

    if (formData.exchange === "MCX") {
      return isSpecialInstrument ? [0.5, 1.0] : [1.0];
    } else if (formData.exchange === "NSE") {
      return [0.25, 0.5, 1.0];
    }
    return [];
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-96 h-100 flex flex-col justify-between"
      >
        <h2 className="text-lg font-semibold text-center">Edit Stoploss</h2>
        <div className="flex-grow">
          <div className="mb-4">
            <label className="block">Stoploss Price:</label>
            <input
              type="number"
              name="stopPrice"
              value={formData.stopPrice}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
              required
              readOnly
            />
          </div>

          {/* Adjust Quantity by Percentage */}
          {/* {getPercentageOptions().length > 0 && (
            <div className="flex justify-around mb-4 gap-2">
              {getPercentageOptions().map((percentage) => (
                <React.Fragment key={percentage}>
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-blue-900 bg-red-600 p-1 rounded-full"
                    onClick={() => handlePercentageChange(-percentage)}
                  >
                    <FaMinus className="text-white" />
                  </button>
                  <span>{percentage * 100}%</span>
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-blue-900 bg-green-600 p-1 rounded-full"
                    onClick={() => handlePercentageChange(percentage)}
                  >
                    <FaPlus className="text-white" />
                  </button>
                </React.Fragment>
              ))}
            </div>
          )} */}
          {/* 
          <div className="mb-4">
            <label className="block">Trade Type:</label>
            <select
              name="tradeType"
              value={formData.tradeType}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
              required
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div> */}
        </div>
        <div className="mt-4 flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Update
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStoplossModal;
