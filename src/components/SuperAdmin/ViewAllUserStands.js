import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './SuperAdminNav'

const MasterAdminsTableCard = () => {
  const [masterAdmins, setMasterAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMasterAdmins = async () => {
      try {
        const token = localStorage.getItem('superAdminToken');
        const response = await axios.get('http://16.16.64.168:5000/api/var/superAdmin/getAllMasterAdmin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setMasterAdmins(response.data.masterAdmins);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMasterAdmins();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredAdmins = masterAdmins.filter(admin =>
    admin.master_admin_id.toLowerCase().includes(searchTerm) ||
    admin.master_code.toLowerCase().includes(searchTerm)
  );

  if (loading) return <div className="text-center mt-8 text-gray-700">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">Error: {error}</div>;

  return (
<>
<Navbar/>
    <div className="container mx-auto p-6 mt-16">
      <div className="mb-4 mt-8">
        <input
          type="text"
          placeholder="Search Master Admins"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="grid grid-cols-1 gap-6">
        {filteredAdmins.map((admin) => (
          <div key={admin._id} className="bg-gray-200 border border-gray-400 shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-300">
              <h2 className="text-xl font-semibold mb-4">Master Admin Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-between p-4 border-b border-gray-300 bg-gray-100">
                  <span className="font-semibold">Master ID:</span>
                  <span>{admin.master_admin_id}</span>
                </div>
                <div className="flex justify-between p-4 border-b border-gray-300 bg-gray-100">
                  <span className="font-semibold">Profit/Loss:</span>
                  <span>₹{admin.budget}</span>
                </div>
                 <div className="flex justify-between p-4 border-b border-gray-300 bg-gray-100">
                  <span className="font-semibold">Master Code:</span>
                  <span>{admin.master_code}</span>
                </div>
                <div className="flex justify-between p-4 border-b border-gray-300 bg-gray-100">
                  <span className="font-semibold">Brokerage:</span>
                  <span>₹{admin.budget}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Clients</h3>
              {admin.clients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-100 border border-gray-300">
                    <thead className="bg-gray-600 text-white">
                      <tr>
                        <th className="py-2 px-4 border-b">#</th>
                        <th className="py-2 px-4 border-b">Client ID</th>
                        <th className="py-2 px-4 border-b">Client Code</th>
                        <th className="py-2 px-4 border-b">Profit/Loss</th>
                        <th className="py-2 px-4 border-b">Brokerage</th>
                        <th className="py-2 px-4 border-b">Action</th>
                      </tr>
                    </thead>
                    <tbody className='text-center'>
                      {admin.clients.map((client, clientIndex) => (
                        <tr key={client._id} className="bg-gray-50">
                          <td className="py-2 px-4 border-b">{clientIndex + 1}</td>
                          <td className="py-2 px-4 border-b">{client.client_id}</td>
                          <td className="py-2 px-4 border-b">{client.client_code}</td>
                          <td className="py-2 px-4 border-b">₹{client.budget}</td>
                          <td className="py-2 px-4 border-b">₹{client.budget}</td>
                          <td className="py-2 px-4 border-b">
                            <Link
                              to={`/Client/View/${encodeURIComponent(client._id)}`}
                              className="bg-blue-500 text-white py-1 px-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No clients available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
</>
  );
};

export default MasterAdminsTableCard;
