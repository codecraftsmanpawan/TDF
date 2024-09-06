import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from './MasterAdminNav'

const colors = [
  'bg-yellow-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-red-200',
  'bg-teal-200',
  'bg-indigo-200',
  'bg-gray-200',
  'bg-orange-200',
];

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      const token = localStorage.getItem('masterAdminToken');
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `http://localhost:5000/api/var/masterAdmin/getClient/${id}`,
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      };

      try {
        const response = await axios.request(config);
        setClient(response.data.client);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchClientData();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!client) return <div>Loading...</div>;

  const clientDetails = [
    { title: 'Client ID', value: client.client_id },
    { title: 'Client Code', value: client.client_code },
    { title: 'Budget', value: client.budget },
    { title: 'Available Budget', value: client.availableBudget },
    { title: 'Share Brokerage', value: client.share_brokerage },
    { title: 'MCX Brokerage Type', value: client.mcx_brokerage_type },
    { title: 'MCX Brokerage', value: client.mcx_brokerage },
    { title: 'Username', value: client.username },
    { title: 'Status', value: client.status },
    { title: 'Created At', value: new Date(client.createdAt).toLocaleString() },
    { title: 'Updated At', value: new Date(client.updatedAt).toLocaleString() },
  ];

  return (
<>
<Navbar/>

    <div className="p-4 mt-16">
          <div className="flex flex-col items-center p-4 bg-gray-100 mt-10">
        <h2 className="mb-4 mt-4 font-bold text-2xl">Client Information</h2>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clientDetails.map((detail, index) => (
          <div
            key={detail.title}
            className={`shadow-md rounded-lg p-4 ${colors[index % colors.length]}`}
          >
            <h2 className="text-lg font-bold mb-2">{detail.title}</h2>
            <p>{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
</>
  );
};

export default ClientDetails;
