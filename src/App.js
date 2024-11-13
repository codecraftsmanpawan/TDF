import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientDashboard from "./components/Client/ClientDashboard";
import ClientLogin from "./components/Client/ClientLogin";
import MasterAdminDashboard from "./components/MasterAdmin/MasterAdminDashboard";
import AddClientId from "./components/MasterAdmin/AddClientId";
import MasterAdminLogin from "./components/MasterAdmin/MasterAdminLogin";
import MasterAdminUpdate from "./components/MasterAdmin/MasterAdminUpdate";
import UpdateMasterId from "./components/SuperAdmin/UpdateMasterId";
import MasterAdminView from "./components/SuperAdmin/MasterAdminView";
import MasterAdminClintView from "./components/MasterAdmin/MasterAdminView";
import MasteradminPassword from "./components/MasterAdmin/MasterAdminPassword";
import Profile from "./components/MasterAdmin/Profile";
import WeeklyPnl from "./components/MasterAdmin/WeeklyPnl";
import BlockPage from "./components/MasterAdmin/404";
import AddMasterId from "./components/SuperAdmin/AddMasterId";
import SuperAdminDashboard from "./components/SuperAdmin/SuperAdminDashboard";
import SuperAdminLogin from "./components/SuperAdmin/SuperAdminLogin";
import SuperAdminMangeStocks from "./components/SuperAdmin/SuperAdminMangeStocks";
import QuantityLimit from "./components/SuperAdmin/QuantityLimit";
import MangeQuantityLimit from "./components/SuperAdmin/MangeQuantityLimit";
import ViewAllUserStands from "./components/SuperAdmin/ViewAllUserStands";
import AddNotification from "./components/SuperAdmin/AddNotification";
import ClientView from "./components/SuperAdmin/ClientView";
import TradingHours from "./components/SuperAdmin/TradingHoursPage";
import ClientSearch from "./components/Client/Search";
import ClientPortfolio from "./components/Client/Portfolio";
import Chart from "./components/Client/Chart";
import StocksDetails from "./components/Client/StocksDetails";
import Trade from "./components/Client/Trade";
import Bit from "./components/Client/Bid";
import Stoploss from "./components/Client/StopLoss";
import SelectTrade from "./components/Client/SelectTrade";
import TradeDetail from "./components/Client/TradeDetail";
import TradeAction from "./components/Client/TradeAction";
import History from "./components/Client/Histrory";
import ClientPasswordChange from "./components/Client/PasswordChange";
import WishlistSetoffPage from "./components/Client/WishlistSetoffPage";
import NotificationList from "./components/Client/NotificationList";
import PrivateAdminLogin from "./PrivateSuperAdmin/PrivateAdminLogin";
import PrivateSuperAdmin from "./PrivateSuperAdmin";
import PrivateAdminDashboard from "./PrivateSuperAdmin/PrivateAdminDashboard";
import PrivateClientDetils from "./PrivateSuperAdmin/PrivateClientDetils";
import PrivateStockSearch from "./PrivateSuperAdmin/PrivateStockSearch";
import PrivateTrade from "./PrivateSuperAdmin/PrivateTrade";
import PrivateRoute from "./PrivateSuperAdmin";

function App() {
  const isAuthenticated = true;
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/client/login" />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/masteradmin/login" element={<MasterAdminLogin />} />
        <Route
          path="/masteradmin/dashboard"
          element={<MasterAdminDashboard />}
        />
        <Route path="/masteradmin/AddClient" element={<AddClientId />} />
        <Route path="/masteradmin/weeklypnl" element={<WeeklyPnl />} />
        <Route path="/edit-master-client/:id" element={<MasterAdminUpdate />} />
        <Route
          path="/view-master-client/:id"
          element={<MasterAdminClintView />}
        />
        <Route path="/masteradmin/password" element={<MasteradminPassword />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/AddMasterId" element={<AddMasterId />} />
        <Route
          path="/superadmin/UpdateMaster/:id"
          element={<UpdateMasterId />}
        />
        <Route
          path="/superadmin/MasterAdminView/:masterCode"
          element={<MasterAdminView />}
        />
        <Route
          path="/superadmin/ManageStocks"
          element={<SuperAdminMangeStocks />}
        />
        <Route
          path="/Quantity/Limit/:instrumentIdentifier/:stockName/:stockClose"
          element={<QuantityLimit />}
        />
        <Route path="/Mange/Quantity/Limit" element={<MangeQuantityLimit />} />
        <Route path="/View/AllUser/Stands" element={<ViewAllUserStands />} />
        <Route path="/Client/View/:id" element={<ClientView />} />
        <Route path="/tradingHours" element={<TradingHours />} />
        <Route path="/master/Profile" element={<Profile />} />
        <Route path="/master/404" element={<BlockPage />} />
        <Route path="/Add/Notification" element={<AddNotification />} />
        <Route path="/search" element={<ClientSearch />} />
        <Route path="/portfolio" element={<ClientPortfolio />} />
        <Route path="/chart" element={<Chart />} />
        <Route
          path="/StocksDetails/:instrumentId"
          element={<StocksDetails />}
        />
        <Route path="/trade/:instrumentId" element={<Trade />} />
        <Route path="/bid/:instrumentId" element={<Bit />} />
        <Route path="/stoploss/:instrumentId" element={<Stoploss />} />
        <Route path="/selectTrade" element={<SelectTrade />} />
        <Route
          path="/trade/detail/:instrumentIdentifier"
          element={<TradeDetail />}
        />
        <Route
          path="/trade/:action/:instrumentIdentifier"
          element={<TradeAction />}
        />
        <Route path="/history" element={<History />} />
        <Route
          path="/client/Password/Change"
          element={<ClientPasswordChange />}
        />
        <Route path="/wishlist-setoff" element={<WishlistSetoffPage />} />
        <Route path="/notification" element={<NotificationList />} />

        <Route path="/privateLogin" element={<PrivateAdminLogin />} />

        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/privateDashboard" element={<PrivateAdminDashboard />} />
          <Route
            path="/privateClientDetils/:id"
            element={<PrivateClientDetils />}
          />
          <Route
            path="/privateStockSearch/:clientId"
            element={<PrivateStockSearch />}
          />
          <Route
            path="/privatetrade/:instrumentId/:clientId"
            element={<PrivateTrade />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
