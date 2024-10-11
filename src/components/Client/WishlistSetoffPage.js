import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";
import Sidebar from "./SideBar";
import Spinner from "./Spinner";

const WishlistSetoffPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isToggled, setIsToggled] = useState(false);
  const toggleView = () => {
    setIsToggled(!isToggled);
  };
  useEffect(() => {
    const token = localStorage.getItem("StocksUsertoken");

    // Check if token exists
    if (token) {
      try {
        // Decode the token to extract userId
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
      } catch (error) {
        // console.error('Error decoding token:', error);
      }
    } else {
      // console.warn('No token found in local storage');
    }
  }, []);

  // Fetch wishlist items from API
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!userId) return;

      try {
        const config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `http://13.51.178.27:5000/api/var/Wishlist/wishlist/${userId}`,
          headers: {},
        };

        const response = await axios.request(config);
        // console.log('Fetched Wishlist:', response.data);

        // Sort items based on serial number and set state
        const sortedItems = response.data.items.sort(
          (a, b) => a.serial - b.serial
        );
        setWishlistItems(sortedItems);
      } catch (error) {
        // console.error('Error fetching wishlist data:', error);
      }
    };

    fetchWishlistItems();
  }, [userId]);

  // Function to extract the date part from instrumentIdentifier
  const extractDateFromIdentifier = (identifier) => {
    const match = identifier.match(/\d{2}[A-Z]{3}\d{4}/);
    return match ? match[0] : "";
  };

  // Handle drag-and-drop reorder
  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(wishlistItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWishlistItems(items);

    const newOrder = items.map((item) => item.instrumentIdentifier);

    try {
      await axios.post(
        `http://13.51.178.27:5000/api/var/Wishlist/wishlist/${userId}/reorder`,
        { newOrder }
      );
      // console.log('Wishlist order updated successfully');
    } catch (error) {
      // console.error('Error updating wishlist order:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <TopNavbar toggleSidebar={toggleView} />
      <div className="flex flex-grow">
        <Sidebar isOpen={isToggled} closeSidebar={toggleView} />
        <main className="flex-grow p-4">
          {/* <h2 className="text-2xl font-bold mb-4 text-center">Wishlist Setoff</h2>  */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="wishlist">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded shadow"
                >
                  {wishlistItems.map((item, index) => (
                    <Draggable
                      key={item.instrumentIdentifier}
                      draggableId={item.instrumentIdentifier}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-gradient-to-b from-gray-700 to-gray-800 shadow-md rounded p-4 mb-4 flex justify-between items-center"
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="mr-4 text-lg  text-white font-semibold">
                              {index + 1}.
                            </div>
                            <div className="flex-grow">
                              <div className="font-medium text-lg text-white">
                                {item.name}
                              </div>
                              <div className="text-gray-200">
                                ({item.exchange})
                              </div>
                            </div>
                            <div className="text-sm text-gray-300 flex flex-col items-center">
                              <FaChevronUp className="mb-1" />
                              Expiry:{" "}
                              {extractDateFromIdentifier(
                                item.instrumentIdentifier
                              )}
                              <FaChevronDown className="mt-1" />
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default WishlistSetoffPage;
