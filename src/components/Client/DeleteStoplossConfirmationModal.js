import React from 'react';

const DeleteStoplossConfirmationModal = ({ onConfirm, onCancel, stoploss }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-5 rounded shadow-lg">
                <h2 className="text-lg font-semibold">Confirm Delete</h2>
                <p>Are you sure you want to delete the stoploss for {stoploss?.instrumentIdentifier}?</p>
                <div className="mt-4">
                    <button 
                        onClick={onConfirm} 
                        className="bg-red-500 text-white py-2 px-4 rounded mr-2"
                    >
                        Delete
                    </button>
                    <button 
                        onClick={onCancel} 
                        className="bg-gray-300 py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteStoplossConfirmationModal;
