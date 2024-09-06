import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './SuperAdminNav'

const MasterAdminDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({
    username: '',
    budget: '',
    mcx_brokerage_type: '',
    mcx_brokerage: '',
    share_brokerage: '',
  });
  const [currentBudget, setCurrentBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('superAdminToken');
        const config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `http://localhost:5000/api/var/superAdmin/getMasterAdmin/${id}`,
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        };

        const response = await axios.request(config);
        const masterAdmin = response.data.masterAdmin;
        setData({
          username: masterAdmin.username,
          budget: masterAdmin.budget,
          mcx_brokerage_type: masterAdmin.mcx_brokerage_type,
          mcx_brokerage: masterAdmin.mcx_brokerage,
          share_brokerage: masterAdmin.share_brokerage,
        });
        setCurrentBudget(masterAdmin.budget); // Set current budget
      } catch (error) {
        setError(error);
        toast.error('Error fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateMasterAdminInfo = () => {
    const errors = {};

    // Validate MCX Brokerage Type
    if (!data.mcx_brokerage_type) {
      errors.mcx_brokerage_type = 'Please select MCX brokerage type.';
    }

    // Validate MCX Brokerage
    if (!data.mcx_brokerage || isNaN(data.mcx_brokerage) || parseFloat(data.mcx_brokerage) < 0) {
      errors.mcx_brokerage = 'Please enter a valid MCX brokerage amount.';
    }

    // Validate Share Brokerage
    if (!data.share_brokerage || isNaN(data.share_brokerage) || parseFloat(data.share_brokerage) < 0) {
      errors.share_brokerage = 'Please enter a valid share brokerage amount.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBudgetUpdate = () => {
    const errors = {};

    // Validate adjustment amount
    if (!adjustmentAmount || isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
      errors.adjustmentAmount = 'Please enter a valid amount.';
    }

    // Validate adjustment type
    if (!adjustmentType) {
      errors.adjustmentType = 'Please select an adjustment type.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMasterAdminInfoUpdate = async () => {
    if (validateMasterAdminInfo()) {
      try {
        const token = localStorage.getItem('superAdminToken');
        const config = {
          method: 'put',
          url: `http://localhost:5000/api/var/superAdmin/update-masterAdmin/${id}`,
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: data,
        };

        await axios.request(config);
        toast.success('Master Admin information updated successfully!');
        setFormErrors({});
      } catch (error) {
        toast.error('Error updating Master Admin information.');
      }
    }
  };

  const handleBudgetUpdate = async () => {
    if (validateBudgetUpdate()) {
      let updatedBudget = parseFloat(currentBudget);
      const amount = parseFloat(adjustmentAmount);

      if (adjustmentType === 'add') {
        updatedBudget += amount;
      } else if (adjustmentType === 'subtract') {
        // Check if the subtraction would result in a negative value
        if (updatedBudget - amount < 0) {
          setFormErrors({ adjustmentAmount: 'Insufficient budget for this subtraction.' });
          return;
        }
        updatedBudget -= amount;
      }

      try {
        const token = localStorage.getItem('superAdminToken');
        const config = {
          method: 'put',
          url: `http://localhost:5000/api/var/superAdmin/update-masterAdmin/${id}`,
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: {
            budget: updatedBudget.toFixed(2),
          },
        };

        await axios.request(config);
        setCurrentBudget(updatedBudget.toFixed(2)); // Update current budget
        toast.success('Budget updated successfully!');
        setAdjustmentType('');
        setAdjustmentAmount('');
        setFormErrors({});
      } catch (error) {
        toast.error('Error updating budget.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>Error: {error.message}</p>;

  return (
<>
 <Navbar />
    <div   className="items-center justify-center " style={{ 
    padding: '20px', 
    maxWidth: '1200px', 
    margin: '100px auto 0 auto', 
    backgroundColor: '#f9f9f9', 
    borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
  }}>
   <h2 
  style={{ 
    marginBottom: '30px',
    fontWeight: 'bold', 
    textAlign: 'center', 
    fontSize: '24px' 
  }}
>
  Update Master Admin Details
</h2>

      {data && (
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Master Admin Information Card */}
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '24px' }}>
Master Admin Information
</h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}><strong>Username:</strong></label>
              <input 
                type="text" 
                name="username" 
                value={data.username} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} readOnly
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}><strong>MCX Brokerage Type:</strong></label>
              <div>
                <input 
                  type="radio" 
                  name="mcx_brokerage_type" 
                  value="per_sauda" 
                  checked={data.mcx_brokerage_type === 'per_sauda'} 
                  onChange={handleChange} 
                  style={{ marginRight: '10px', transform: 'scale(1.5)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '16px' }}>Per Sauda</span>
                <input 
                  type="radio" 
                  name="mcx_brokerage_type" 
                  value="per_crore" 
                  checked={data.mcx_brokerage_type === 'per_crore'} 
                  onChange={handleChange} 
                  style={{ marginLeft: '20px', marginRight: '10px', transform: 'scale(1.5)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '16px' }}>Per Crore</span>
              </div>
              {formErrors.mcx_brokerage_type && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.mcx_brokerage_type}</p>}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}><strong>MCX Brokerage:</strong></label>
              <input 
                type="text" 
                name="mcx_brokerage" 
                value={data.mcx_brokerage} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              {formErrors.mcx_brokerage && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.mcx_brokerage}</p>}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}><strong>Share Brokerage:</strong></label>
              <input 
                type="text" 
                name="share_brokerage" 
                value={data.share_brokerage} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              {formErrors.share_brokerage && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.share_brokerage}</p>}
            </div>
            <button 
              type="button" 
              onClick={handleMasterAdminInfoUpdate} 
              style={{ backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              Update Master Admin Information
            </button>
          </div>

          {/* Update Budget Card */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
 <h2 style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '24px' }}>
  Update Budget
</h2>

  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '5px' }}><strong>Current Budget:</strong></label>
    <input 
      type="text" 
      value={`₹${currentBudget}`} 
      readOnly
      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f0f0f0' }}
    />
  </div>
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '5px' }}><strong>Adjustment Type:</strong></label>
    <div>
      <input 
        type="radio" 
        id="add" 
        name="adjustmentType" 
        value="add" 
        checked={adjustmentType === 'add'} 
        onChange={(e) => setAdjustmentType(e.target.value)} 
        style={{ marginRight: '10px', transform: 'scale(1.5)', cursor: 'pointer' }}
      />
      <label htmlFor="add" style={{ fontSize: '16px' }}>Add Budget</label>
      <input 
        type="radio" 
        id="subtract" 
        name="adjustmentType" 
        value="subtract" 
        checked={adjustmentType === 'subtract'} 
        onChange={(e) => setAdjustmentType(e.target.value)} 
        style={{ marginLeft: '20px', marginRight: '10px', transform: 'scale(1.5)', cursor: 'pointer' }}
      />
      <label htmlFor="subtract" style={{ fontSize: '16px' }}>Remove Budget</label>
    </div>
    {formErrors.adjustmentType && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.adjustmentType}</p>}
  </div>
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '5px' }}><strong>Adjustment Amount:</strong></label>
    <input 
      type="number" 
      value={adjustmentAmount} 
      onChange={(e) => setAdjustmentAmount(e.target.value)} 
      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} 
    />
    {formErrors.adjustmentAmount && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.adjustmentAmount}</p>}
  </div>
  <div style={{ marginBottom: '15px' }}>
    <h3 style={{ marginBottom: '10px' }}>Updated Budget:</h3>
<p style={{ fontSize: '16px' }}>
  {adjustmentAmount && adjustmentType ? (
    `₹${(
      (Number(currentBudget) + (adjustmentType === 'add' ? parseFloat(adjustmentAmount) : -parseFloat(adjustmentAmount)))
    ).toFixed(2)}`
  ) : (
    'Please enter adjustment details to see the updated budget.'
  )}
</p>


    {adjustmentType === 'subtract' && (currentBudget - parseFloat(adjustmentAmount) < 0) && (
      <p style={{ color: 'red' }}>Insufficient budget for this subtraction.</p>
    )}
  </div>
  <button 
    type="button" 
    onClick={handleBudgetUpdate} 
    style={{ backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
  >
    Update Budget
  </button>
</div>

        </div>
      )}
      <ToastContainer />
    </div>
</>
  );
};

export default MasterAdminDetails;
