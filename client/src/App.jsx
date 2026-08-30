import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CustomerDashboard from "./pages/CustomerDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import CustomerTicketDetails from "./pages/CustomerTicketDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Customer */}
        <Route
          path="/customer"
          element={<CustomerDashboard />}
        />

        <Route
          path="/customer/create-ticket"
          element={<CreateTicket />}
        />

        <Route
          path="/customer/tickets"
          element={<MyTickets />}
        />

        <Route
          path="/customer/ticket/:id"
          element={<CustomerTicketDetails />}
        />

        {/* Agent */}
        <Route
          path="/agent"
          element={<AgentDashboard />}
        />

        <Route
          path="/agent/ticket/:id"
          element={<TicketDetails />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

