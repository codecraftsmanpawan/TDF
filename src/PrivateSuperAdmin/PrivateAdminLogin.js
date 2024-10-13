import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../axiosConfig";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Function to send OTP
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/var/privateAdmin/login`
      );
      setOtpSent(true);
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/var/privateAdmin/verify-otp`,
        { otp }
      );
      setVerified(true);
      setMessage(response.data.message);
      // Store the JWT token securely
      localStorage.setItem("****xxx*****", response.data.token);

      // After successful verification, navigate to the dashboard
      navigate("/privateDashboard");
    } catch (error) {
      console.error(error);
      setMessage("Error verifying OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-700 to-black">
      <div className="bg-gradient-to-b from-gray-400 to-black-400 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
          Send OTP
        </h2>

        {/* If OTP is verified, show success message */}
        {verified ? (
          <p className="text-green-500 text-center">
            OTP verified successfully! You're logged in.
          </p>
        ) : (
          <div>
            {/* If OTP is not sent yet, show send OTP button */}
            {!otpSent ? (
              <button
                className="bg-gradient-to-b from-gray-700 to-black text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <span>Sending...</span> : <span>Send OTP</span>}
              </button>
            ) : (
              <div>
                {/* After OTP is sent, show OTP input field */}
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Enter OTP:
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter OTP"
                />

                {/* Verify OTP button */}
                <button
                  className="mt-4 bg-gradient-to-b from-gray-700 to-black text-white text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition duration-300"
                  onClick={handleVerifyOtp}
                >
                  Verify OTP
                </button>
              </div>
            )}
          </div>
        )}

        {/* Display message */}
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
