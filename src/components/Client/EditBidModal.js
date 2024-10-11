import React, { useState, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa'; // Make sure to import the icons

const EditBidModal = ({ bid, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({ bidPrice: '', bidQuantity: '', tradeType: 'buy' });

    useEffect(() => {
        if (bid) {
            setFormData({
                bidPrice: bid.bidPrice,
                bidQuantity: bid.bidQuantity,
                tradeType: bid.tradeType
            });
        }
    }, [bid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handlePercentageChange = (percentage) => {
        setFormData(prevData => ({
            ...prevData,
            bidQuantity: (prevData.bidQuantity * (1 + percentage)).toFixed(2) // Update bid quantity based on percentage
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96 h-100 flex flex-col justify-between">
                <h2 className="text-lg font-semibold text-center">Edit Bid</h2>
                <div className="flex-grow">
                    <div className="mb-4">
                        <label htmlFor="bidPrice" className="block">Bid Price:</label>
                        <input
                            type="number"
                            id="bidPrice"
                            name="bidPrice"
                            value={formData.bidPrice}
                            onChange={handleChange}
                            className="border border-gray-300 p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="bidQuantity" className="block">Bid Quantity:</label>
                        <input
                            type="number"
                            id="bidQuantity"
                            name="bidQuantity"
                            value={formData.bidQuantity}
                            onChange={handleChange}
                            className="border border-gray-300 p-2 rounded w-full"
                            required
                        />
                    </div>
                    {/* Adjust Quantity by Percentage */}
                    <div className="flex justify-around mb-4 gap-2">
                        { [0.25, 0.5, 1.0].map(percentage => (
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
                        )) }
                    </div>
                    <div className="mb-4">
                        <label htmlFor="tradeType" className="block">Trade Type:</label>
                        <select
                            id="tradeType"
                            name="tradeType"
                            value={formData.tradeType}
                            onChange={handleChange}
                            className="border border-gray-300 p-2 rounded w-full"
                            required
                        >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-between">
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Update</button>
                    <button type="button" onClick={onCancel} className="bg-gray-300 py-2 px-4 rounded">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditBidModal;
