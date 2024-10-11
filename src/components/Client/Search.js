import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faEye } from "@fortawesome/free-solid-svg-icons";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const StockSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [blockedStocks, setBlockedStocks] = useState([]); // Blocked stocks state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isToggled, setIsToggled] = useState(false);

  // Fetch blocked stocks
  useEffect(() => {
    const fetchBlockedStocks = async () => {
      try {
        const response = await axios.get(
          "http://13.51.178.27:5000/api/var/Wishlist/blockstocks"
        );
        setBlockedStocks(response.data.map((stock) => stock.symbol));
      } catch (error) {
        console.error("Error fetching blocked stocks:", error);
      }
    };

    fetchBlockedStocks();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("StocksUsertoken");

      if (!token) {
        setError("Token is missing");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        if (!userId) {
          setError("User ID is missing in the token");
          return;
        }

        const wishlistResponse = await axios.get(
          `http://13.51.178.27:5000/api/var/client/wishlist/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (wishlistResponse.data.items) {
          setWishlist(wishlistResponse.data.items);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setWishlist([]);
        } else {
          setError("Error fetching wishlist data");
        }
      }
    };

    fetchWishlist();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setLoading(true);
      axios
        .get("http://13.51.178.27:5000/api/var/client/stocks/search", {
          params: { name: searchTerm },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("StocksUsertoken")}`,
          },
        })
        .then((response) => {
          const filteredStocks = response.data.filter(
            (stock) => !blockedStocks.includes(stock.name)
          );
          setStocks(filteredStocks);
          setError(filteredStocks.length === 0 ? "No stocks found." : "");
          setLoading(false);
        })
        .catch((err) => {
          setError("Error fetching stocks");
          console.error("Error searching stocks:", err);
          setLoading(false);
        });
    }
  }, [searchTerm, blockedStocks]);

  const toggleView = () => {
    setIsToggled((prev) => !prev);
  };

  const handleAddToWishlist = async (stock) => {
    const token = localStorage.getItem("StocksUsertoken");

    if (!token) {
      toast.error("User is not authenticated");
      return;
    }

    const { id: userId } = jwtDecode(token);

    try {
      const response = await axios.post(
        "http://13.51.178.27:5000/api/var/client/wishlist/add",
        {
          userId,
          item: {
            product: stock.product,
            exchange: stock.Exchange,
            instrumentIdentifier: stock.InstrumentIdentifier,
            name: stock.name,
            date: new Date().toISOString(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || `Added ${stock.name} to wishlist`);
      setWishlist((prevWishlist) => [...prevWishlist, stock]);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error adding stock to wishlist"
      );
      // console.error('Error adding stock to wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = (itemId) => {
    const token = localStorage.getItem("StocksUsertoken");

    if (!token) {
      toast.error("Token is missing");
      return;
    }

    const { id: userId } = jwtDecode(token);

    axios
      .delete(
        `http://13.51.178.27:5000/api/var/client/wishlist/remove/${userId}/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message || "Removed from wishlist");
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.InstrumentIdentifier !== itemId)
        );
      })
      .catch((error) => {
        console.error("Error removing stock from wishlist:", error);
        toast.error(
          error.response?.data?.message || "Error removing stock from wishlist"
        );
      });
  };

  const handleViewStock = (stock) => {
    navigate(`/StocksDetails/${stock.InstrumentIdentifier}`);
  };

  const isInWishlist = (instrumentIdentifier) => {
    return wishlist.some(
      (item) => item.instrumentIdentifier === instrumentIdentifier
    );
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-gray-700 to-gray-800 to-gray-800 flex flex-col">
      <TopNavbar toggleSidebar={toggleView} />
      <Sidebar isOpen={isToggled} closeSidebar={toggleView} />

      <div className="flex-grow p-2 lg:p-4">
        <div className="max-w-4xl mx-auto bg-black to-gray-800 p-6 rounded-lg shadow-lg">
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
                      className={`flex justify-between items-center mb-4 p-4 rounded-lg shadow-sm ${
                        isInWishlist(stock.InstrumentIdentifier)
                          ? "bg-gradient-to-b from-gray-700 to-gray-900"
                          : "bg-gradient-to-b from-gray-900 to-gray-700"
                      }`}
                    >
                      <div>
                        <Typography className="text-blue-100 text-lg font-medium">
                          {stock.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-200">
                          {stock.Exchange}
                        </Typography>
                        <Typography variant="body2" className="text-gray-200">
                          {stock.InstrumentIdentifier.match(
                            /(\d{2}[A-Z]{3}\d{4})/
                          )?.[0] || ""}
                        </Typography>
                      </div>
                      <div className="flex items-center space-x-3">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewStock(stock)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </IconButton>
                        <IconButton
                          className={`flex items-center hover:text-red-600 ${
                            isInWishlist(stock.InstrumentIdentifier)
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                          onClick={() =>
                            isInWishlist(stock.InstrumentIdentifier)
                              ? handleRemoveFromWishlist(
                                  stock.InstrumentIdentifier
                                )
                              : handleAddToWishlist(stock)
                          }
                        >
                          {isInWishlist(stock.InstrumentIdentifier) ? (
                            <>
                              <FontAwesomeIcon
                                icon={faMinus}
                                className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600 p-1 text-white"
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPlus}
                                className="flex items-center justify-center w-4 h-4 rounded-full bg-green-600 p-1 text-white"
                              />
                            </>
                          )}
                        </IconButton>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
      <ToastContainer />
    </div>
  );
};

export default StockSearch;
