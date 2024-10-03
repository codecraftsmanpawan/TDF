import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './SuperAdminNav';
const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Fetch notifications on component load
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://16.16.64.168:5000/api/var/superAdmin/notifications');
            setNotifications(response.data);
        } catch (error) {
            toast.error('Error fetching notifications');
        }
    };

    // Add or update a notification
    const handleSaveNotification = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing notification
                await axios.put(`http://16.16.64.168:5000/api/var/superAdmin/notifications/${editingId}`, { title, message });
                toast.success('Notification updated successfully');
                setEditingId(null);
            } else {
                // Add new notification
                await axios.post('http://16.16.64.168:5000/api/var/superAdmin/notifications', { title, message });
                toast.success('Notification created successfully');
            }
            setTitle('');
            setMessage('');
            fetchNotifications();
        } catch (error) {
            toast.error('Error saving notification');
        }
    };

    // Delete notification
    const handleDeleteNotification = async (id) => {
        try {
            await axios.delete(`http://16.16.64.168:5000/api/var/superAdmin/notifications/${id}`);
            toast.success('Notification deleted successfully');
            fetchNotifications();
        } catch (error) {
            toast.error('Error deleting notification');
        }
    };

    // Set editing state for updating notification
    const handleEditNotification = (notification) => {
        setEditingId(notification._id);
        setTitle(notification.title);
        setMessage(notification.message);
    };

    return (
   <>
   <Navbar/>
        <div className="container mx-auto p-6 mt-16">
            <ToastContainer /> {/* Toast container for notifications */}
            <h1 className="text-2xl font-bold mb-6"> Add Notification</h1>

            {/* Add/Edit Notification Form */}
            <form onSubmit={handleSaveNotification} className="mb-6">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter title"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter message"
                        required
                    ></textarea>
                </div>

                <div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {editingId ? 'Update Notification' : 'Add Notification'}
                    </button>
                </div>
            </form>

            {/* Notification List */}
            <div className="bg-white shadow-md rounded">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Message</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map((notification) => (
                            <tr key={notification._id} className="bg-gray-100 text-center">
                                <td className="border px-4 py-2">{notification.title}</td>
                                <td className="border px-4 py-2">{notification.message}</td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => handleEditNotification(notification)}
                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNotification(notification._id)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
   </>
    );
};

export default NotificationPage;
