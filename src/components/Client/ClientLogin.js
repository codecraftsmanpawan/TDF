import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId || !password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }
    setError("");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      username: clientId,
      password: password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://13.61.104.53:5000/api/var/client/clientLogin", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Invalid username or password");
        } else if (response.status === 403) {
          throw new Error("Account not active. Please contact your admin.");
        } else if (!response.ok) {
          throw new Error("Login failed. Please try again.");
        }
        return response.json();
      })
      .then((result) => {
        // Assuming the API returns a token in the result
        localStorage.setItem("StocksUsertoken", result.token);
        setLoggedIn(true);
        toast.success("Login successful!");
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        toast.error(error.message);
      });
  };

  // Redirect to dashboard if logged in
  if (loggedIn) {
    return <Navigate to="/client/dashboard" />;
  }

  return (
    <>
      <ToastContainer />
      <nav className="bg-gradient-to-b from-gray-700 to-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-xl font-bold">TradingApp</div>
        </div>
      </nav>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-700 to-black">
        <div className="bg-gradient-to-b from-gray-700 to-black p-8 rounded shadow-md w-full md:max-w-md">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4 ">
              <label className="block text-gray-100 mb-2" htmlFor="clientId">
                Client ID
              </label>
              <input
                type="text"
                id="clientId"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-100 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-b from-gray-500 to-gray-700  text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
