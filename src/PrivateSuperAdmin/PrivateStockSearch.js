import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import TopNavbar from "./TopNavBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";

const StockSearch = () => {
  const navigate = useNavigate();
  const { clientId } = useParams(); // Extract clientId from URL
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchTerm.trim()) {
      setLoading(true);
      axios
        .get("http://13.51.178.27:5000/api/var/client/stocks/search", {
          params: { name: searchTerm },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("****xxx*****")}`,
          },
        })
        .then((response) => {
          if (Array.isArray(response.data) && response.data.length > 0) {
            setStocks(response.data);
            setError(""); // Clear any previous errors
          } else {
            setStocks([]);
            setError("No stocks found.");
          }
          setLoading(false);
        })
        .catch((err) => {
          setError("Error fetching stocks");
          console.error("Error searching stocks:", err);
          setLoading(false);
        });
    }
  }, [searchTerm]);

  const handleViewStock = (stock) => {
    // Navigate with both stock.InstrumentIdentifier and clientId
    navigate(`/privatetrade/${stock.InstrumentIdentifier}/${clientId}`);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-700 to-gray-800 flex flex-col">
      <TopNavbar />

      <div className="flex-grow p-2 lg:p-4">
        <div className="max-w-4xl mx-auto bg-black p-6 rounded-lg shadow-lg">
          <Autocomplete
            freeSolo
            options={[]}
            onInputChange={(event, value) => setSearchTerm(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for stocks..."
                variant="outlined"
                fullWidth
                size="small"
                className="mb-6 text-white"
                InputProps={{
                  ...params.InputProps,
                  className:
                    "bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border-2 border-gray-200 focus:border-gray-200 shadow-sm mb-4 text-gray-100",
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                InputLabelProps={{
                  className: "text-gray-200 font-medium",
                }}
              />
            )}
            noOptionsText={
              loading ? (
                <CircularProgress size={20} />
              ) : (
                error || "No results found"
              )
            }
            filterOptions={() => []}
            PaperComponent={({ children }) => (
              <div className="bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-300 rounded-lg shadow-lg">
                {children}
              </div>
            )}
          />
          {!loading && !error && stocks.length === 0 && (
            <Typography className="text-gray-200 mb-4 mt-8 text-center font-medium">
              No stocks found.
            </Typography>
          )}

          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            {stocks.length > 0 && (
              <div>
                <Typography
                  variant="body2"
                  className="text-gray-100 mb-6 font-medium"
                >
                  Search Results:
                </Typography>
                <ul className="list-none mt-3">
                  {stocks.map((stock, index) => (
                    <li
                      key={`${stock.InstrumentIdentifier}-${index}`}
                      className="flex justify-between items-center mb-4 p-4 rounded-lg shadow-sm bg-gradient-to-b from-gray-900 to-gray-700"
                    >
                      <div>
                        <Typography className="text-blue-100 text-lg font-medium">
                          {stock.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-200">
                          {stock.Exchange}
                        </Typography>
                        <Typography variant="body2" className="text-gray-200">
                          Instrument ID:{" "}
                          {stock.InstrumentIdentifier.match(
                            /(\d{2}[A-Z]{3}\d{4})/
                          )?.[0] || ""}
                        </Typography>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => handleViewStock(stock)} // Pass stock directly
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default StockSearch;
